import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Profile, Photo } from '../models/index.js';
import { formatProfile, inferGenderFromLookingFor } from '../utils.js';

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
}

export async function register(req, res) {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      gender,
      lookingFor,
      dob,
      religion,
      caste,
      motherTongue,
    } = req.body;

    if (!fullName || !email || !mobile || !password || !dob) {
      return res.status(400).json({ message: 'Name, email, mobile, password and DOB are required' });
    }

    const normalizedLookingFor = lookingFor || gender || 'female';
    const normalizedGender = lookingFor ? gender : inferGenderFromLookingFor(normalizedLookingFor);
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      mobile: mobile.replace(/\D/g, ''),
      passwordHash,
      gender: normalizedGender,
      lookingFor: normalizedLookingFor,
      dob,
      roleId: 2,
    });

    const profile = await Profile.create({
      userId: user.id,
      religion,
      caste,
      motherTongue,
      location: '',
      bio: '',
      interests: [],
    });

    await Photo.create({
      profileId: profile.id,
      isPrimary: true,
      url: normalizedGender === 'male'
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=400'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=400',
    });

    const savedProfile = await Profile.findByPk(profile.id, {
      include: [User, Photo],
    });

    return res.status(201).json({
      message: 'Registration successful. Please login with your mobile number.',
      user: { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile },
      profile: formatProfile(savedProfile),
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email or mobile already registered' });
    }

    return res.status(500).json({ message: 'Registration failed' });
  }
}

export async function sendOtp(req, res) {
  try {
    const mobile = String(req.body.mobile || '').replace(/\D/g, '');
    const user = await User.findOne({ where: { mobile } });

    if (!user) {
      return res.status(404).json({ message: 'Mobile number is not registered' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await user.update({
      otpCode: otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return res.json({
      message: 'OTP sent to registered mobile number',
      devOtp: otp,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not send OTP' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const mobile = String(req.body.mobile || '').replace(/\D/g, '');
    const otp = String(req.body.otp || '').trim();
    const user = await User.findOne({ where: { mobile } });

    if (!user || !user.otpCode || user.otpCode !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (!user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now()) {
      return res.status(401).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    await user.update({
      verified: true,
      otpCode: null,
      otpExpiresAt: null,
      lastSeenAt: new Date(),
    });

    return res.json({
      token: signToken(user),
      user: { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    return res.status(500).json({ message: 'OTP verification failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email?.toLowerCase() } });

    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await user.update({ lastSeenAt: new Date() });

    return res.json({
      token: signToken(user),
      user: { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
}

export async function getMe(req, res) {
  const profile = await Profile.findOne({
    where: { userId: req.user.id },
    include: [User, Photo],
  });

  res.json({
    user: { id: req.user.id, fullName: req.user.fullName, email: req.user.email, mobile: req.user.mobile },
    profile: profile ? formatProfile(profile) : null,
  });
}
