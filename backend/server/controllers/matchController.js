import { Op } from 'sequelize';
import { User, Profile, Photo, Like, ProfileView, Subscription } from '../models/index.js';
import { formatProfile } from '../utils.js';
import { sendProfileLikeEmail } from '../services/email.js';

const FREE_LIKE_LIMIT = 5;

function activeSubscriptionInclude() {
  return {
    model: Subscription,
    required: false,
    where: {
      status: 'active',
      endsAt: { [Op.gte]: new Date() },
    },
  };
}

function formatUserProfile(user) {
  if (!user?.Profile) return null;
  user.Profile.User = user;
  return formatProfile(user.Profile);
}

async function hasActivePremium(userId) {
  const subscription = await Subscription.findOne({
    where: {
      userId,
      status: 'active',
      endsAt: { [Op.gte]: new Date() },
    },
  });

  return Boolean(subscription);
}

function ageToDobRange(ageMin, ageMax) {
  if (!ageMin && !ageMax) return undefined;

  const now = new Date();
  const youngest = new Date(now.getFullYear() - Number(ageMin || 18), now.getMonth(), now.getDate());
  const oldest = new Date(now.getFullYear() - Number(ageMax || 70) - 1, now.getMonth(), now.getDate() + 1);
  return { [Op.between]: [oldest, youngest] };
}

export async function getMatches(req, res) {
  const profileWhere = {};
  const dobRange = ageToDobRange(req.query.ageMin, req.query.ageMax);

  if (req.query.location) profileWhere.location = { [Op.like]: `%${req.query.location}%` };
  if (req.query.religion) profileWhere.religion = req.query.religion;

  const profiles = await Profile.findAll({
    where: profileWhere,
    include: [
      {
        model: User,
        include: [activeSubscriptionInclude()],
        where: {
          id: { [Op.ne]: req.user.id },
          gender: req.user.lookingFor,
          ...(req.query.compatible === 'true' ? {
            lookingFor: req.user.gender,
          } : {}),
          ...(dobRange ? { dob: dobRange } : {}),
        },
      },
      Photo,
    ],
    order: [['updatedAt', 'DESC']],
    limit: Number(req.query.limit || 500),
  });

  res.json(profiles
    .map(formatProfile)
    .sort((a, b) => Number(b.isPremium) - Number(a.isPremium)));
}

export async function likeProfile(req, res) {
  const profile = await Profile.findByPk(req.params.profileId, { include: [User] });
  if (!profile || profile.userId === req.user.id) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  const existingLike = await Like.findOne({
    where: { fromUserId: req.user.id, toUserId: profile.userId },
  });
  const shouldNotify = existingLike?.status !== 'liked';
  const isPremium = await hasActivePremium(req.user.id);

  if (!isPremium && existingLike?.status !== 'liked') {
    const likedCount = await Like.count({
      where: { fromUserId: req.user.id, status: 'liked' },
    });

    if (likedCount >= FREE_LIKE_LIMIT) {
      return res.status(403).json({
        message: `Free members can like up to ${FREE_LIKE_LIMIT} profiles. Upgrade to Premium for unlimited likes.`,
        code: 'LIKE_LIMIT_REACHED',
        limit: FREE_LIKE_LIMIT,
      });
    }
  }

  await Like.upsert({
    fromUserId: req.user.id,
    toUserId: profile.userId,
    status: 'liked',
  });

  if (shouldNotify) {
    try {
      const likerProfile = await Profile.findOne({ where: { userId: req.user.id } });
      await sendProfileLikeEmail({
        to: profile.User?.email,
        recipientName: profile.User?.fullName,
        likerName: req.user.fullName,
        likerProfileId: likerProfile?.id,
      });
    } catch (emailError) {
      console.warn('Could not send profile like email:', {
        code: emailError.code,
        command: emailError.command,
        message: emailError.message,
      });
    }
  }

  const mutual = await Like.findOne({
    where: {
      fromUserId: profile.userId,
      toUserId: req.user.id,
      status: 'liked',
    },
  });

  res.json({ liked: true, mutual: Boolean(mutual) });
}

export async function unlikeProfile(req, res) {
  const profile = await Profile.findByPk(req.params.profileId);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  await Like.destroy({ where: { fromUserId: req.user.id, toUserId: profile.userId } });
  res.json({ liked: false });
}

export async function passProfile(req, res) {
  const profile = await Profile.findByPk(req.params.profileId);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  await Like.upsert({
    fromUserId: req.user.id,
    toUserId: profile.userId,
    status: 'passed',
  });

  res.json({ passed: true });
}

export async function getLikes(req, res) {
  const likes = await Like.findAll({
    where: { toUserId: req.user.id, status: 'liked' },
    include: [
      {
        model: User,
        as: 'FromUser',
        include: [{ model: Profile, include: [Photo] }, activeSubscriptionInclude()],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  res.json(likes
    .map((like) => formatUserProfile(like.FromUser))
    .filter(Boolean)
    .sort((a, b) => Number(b.isPremium) - Number(a.isPremium)));
}

export async function getLikedProfiles(req, res) {
  const likes = await Like.findAll({
    where: { fromUserId: req.user.id, status: 'liked' },
    include: [
      {
        model: User,
        as: 'ToUser',
        include: [{ model: Profile, include: [Photo] }, activeSubscriptionInclude()],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  res.json(likes
    .map((like) => formatUserProfile(like.ToUser))
    .filter(Boolean)
    .sort((a, b) => Number(b.isPremium) - Number(a.isPremium)));
}

export async function getViews(req, res) {
  let views = [];

  try {
    views = await ProfileView.findAll({
      where: { viewedUserId: req.user.id },
      include: [
        {
          model: User,
          as: 'Viewer',
          include: [{ model: Profile, include: [Photo] }, activeSubscriptionInclude()],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });
  } catch (error) {
    console.warn('Could not load profile views:', error.message);
    return res.json([]);
  }

  res.json(views
    .map((view) => formatUserProfile(view.Viewer))
    .filter(Boolean)
    .sort((a, b) => Number(b.isPremium) - Number(a.isPremium)));
}
