import crypto from 'crypto';
import { Op } from 'sequelize';
import { Payment, PremiumPlan, Subscription, SupportTicket } from '../models/index.js';

const defaultPlans = [
  {
    key: 'premium_monthly',
    name: 'Premium Plan',
    description: 'Unlock all connection insights and premium discovery tools.',
    priceInr: 499,
    durationDays: 30,
    features: [
      'See full profiles of everyone who liked you',
      'See who viewed your profile',
      'Unlimited likes and quick connect actions',
      'Unlimited messaging after match; free members get 5 messages',
      'Priority profile visibility in suggestions',
      'Premium badge on your profile',
      'Priority support for account help',
    ],
    isActive: true,
    sortOrder: 1,
  },
];

function formatPlan(plan) {
  return {
    id: plan.id,
    key: plan.key,
    name: plan.name,
    description: plan.description,
    priceInr: plan.priceInr,
    durationDays: plan.durationDays,
    features: Array.isArray(plan.features) ? plan.features : [],
  };
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + Number(days || 30));
  return nextDate;
}

async function activateSubscription({ userId, plan, payment, provider, providerOrderId, providerPaymentId }) {
  const now = new Date();
  const subscription = await Subscription.create({
    userId,
    planId: plan.id,
    status: 'active',
    startsAt: now,
    endsAt: addDays(now, plan.durationDays),
    provider,
    providerOrderId,
    providerPaymentId,
  });

  if (payment) {
    await payment.update({
      subscriptionId: subscription.id,
      status: 'paid',
      providerPaymentId,
    });
  }

  return subscription;
}

function hasRazorpayKeys() {
  return Boolean(process.env.RAZORPAY_KEY_ID && (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_API_KEY));
}

function getRazorpaySecret() {
  return process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_API_KEY;
}

async function ensurePremiumReady() {
  await PremiumPlan.sync();
  await Subscription.sync();
  await Payment.sync();
  await SupportTicket.sync();

  await PremiumPlan.bulkCreate(defaultPlans, {
    updateOnDuplicate: ['name', 'description', 'priceInr', 'durationDays', 'features', 'isActive', 'sortOrder'],
  });
}

async function createRazorpayOrder({ plan, userId }) {
  const receipt = `prem_${Date.now().toString(36)}_${userId}`.slice(0, 40);
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${getRazorpaySecret()}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: plan.priceInr * 100,
      currency: 'INR',
      receipt,
      notes: {
        userId: String(userId),
        planId: String(plan.id),
        planKey: plan.key,
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.description || 'Could not create payment order');
  }

  return payload;
}

export async function getPremiumPlans(req, res) {
  await ensurePremiumReady();
  const plans = await PremiumPlan.findAll({
    where: { isActive: true, key: 'premium_monthly' },
    order: [['sortOrder', 'ASC'], ['priceInr', 'ASC']],
  });

  return res.json(plans.map(formatPlan));
}

export async function getMyPremium(req, res) {
  await ensurePremiumReady();
  const subscription = await Subscription.findOne({
    where: {
      userId: req.user.id,
      status: 'active',
      endsAt: { [Op.gte]: new Date() },
    },
    include: [PremiumPlan],
    order: [['endsAt', 'DESC']],
  });

  return res.json({
    isPremium: Boolean(subscription),
    subscription: subscription ? {
      id: subscription.id,
      status: subscription.status,
      startsAt: subscription.startsAt,
      endsAt: subscription.endsAt,
      plan: formatPlan(subscription.PremiumPlan),
    } : null,
  });
}

export async function startPremiumCheckout(req, res) {
  try {
    await ensurePremiumReady();
    const plan = await PremiumPlan.findOne({
      where: { id: req.body.planId, isActive: true, key: 'premium_monthly' },
    });

    if (!plan) return res.status(404).json({ message: 'Premium plan not found' });

    if (!hasRazorpayKeys()) {
      const payment = await Payment.create({
        userId: req.user.id,
        planId: plan.id,
        amountInr: plan.priceInr,
        status: 'paid',
        provider: 'demo',
        providerOrderId: `demo_order_${Date.now()}`,
        providerPaymentId: `demo_pay_${Date.now()}`,
      });
      const subscription = await activateSubscription({
        userId: req.user.id,
        plan,
        payment,
        provider: 'demo',
        providerOrderId: payment.providerOrderId,
        providerPaymentId: payment.providerPaymentId,
      });

      return res.json({
        provider: 'demo',
        message: 'Premium activated in demo mode. Add Razorpay keys for live payments.',
        subscription,
      });
    }

    const order = await createRazorpayOrder({ plan, userId: req.user.id });
    const payment = await Payment.create({
      userId: req.user.id,
      planId: plan.id,
      amountInr: plan.priceInr,
      status: 'created',
      provider: 'razorpay',
      providerOrderId: order.id,
      metadata: order,
    });

    return res.json({
      provider: 'razorpay',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'ShaadiMatch Premium',
      description: plan.name,
      paymentId: payment.id,
      prefill: {
        name: req.user.fullName,
        email: req.user.email,
        contact: req.user.mobile,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not start premium checkout' });
  }
}

export async function verifyPremiumPayment(req, res) {
  try {
    await ensurePremiumReady();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const payment = await Payment.findOne({
      where: {
        userId: req.user.id,
        provider: 'razorpay',
        providerOrderId: razorpay_order_id,
        status: 'created',
      },
      include: [PremiumPlan],
    });

    if (!payment) return res.status(404).json({ message: 'Payment order not found' });

    const generatedSignature = crypto
      .createHmac('sha256', getRazorpaySecret())
      .update(`${payment.providerOrderId}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await payment.update({ status: 'failed', providerPaymentId: razorpay_payment_id, providerSignature: razorpay_signature });
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    await payment.update({
      providerPaymentId: razorpay_payment_id,
      providerSignature: razorpay_signature,
    });

    const subscription = await activateSubscription({
      userId: req.user.id,
      plan: payment.PremiumPlan,
      payment,
      provider: 'razorpay',
      providerOrderId: payment.providerOrderId,
      providerPaymentId: razorpay_payment_id,
    });

    return res.json({ message: 'Premium activated', subscription });
  } catch (error) {
    return res.status(500).json({ message: 'Could not verify payment' });
  }
}

export async function createPremiumSupportTicket(req, res) {
  try {
    await ensurePremiumReady();
    const subscription = await Subscription.findOne({
      where: {
        userId: req.user.id,
        status: 'active',
        endsAt: { [Op.gte]: new Date() },
      },
    });

    if (!subscription) {
      return res.status(403).json({ message: 'Priority support is available for Premium members.' });
    }

    const ticket = await SupportTicket.create({
      userId: req.user.id,
      subject: req.body.subject || 'Premium support request',
      message: req.body.message || 'Please contact me for Premium support.',
      priority: 'premium',
      status: 'open',
    });

    return res.status(201).json({
      message: 'Priority support request created.',
      ticket,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create support request' });
  }
}
