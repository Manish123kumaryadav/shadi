import { Op } from 'sequelize';
import { User, Profile, Photo, ProfileView, Subscription } from '../models/index.js';
import { formatProfile } from '../utils.js';

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

export async function getMyProfile(req, res) {
  const profile = await Profile.findOne({
    where: { userId: req.user.id },
    include: [User, Photo],
  });

  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  return res.json(formatProfile(profile));
}

export async function updateMyProfile(req, res) {
  const profile = await Profile.findOne({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const userFields = {};
  if (req.body.fullName) userFields.fullName = req.body.fullName;
  if (req.body.dob) userFields.dob = req.body.dob;
  if (req.body.gender) userFields.gender = req.body.gender;
  if (req.body.lookingFor) userFields.lookingFor = req.body.lookingFor;

  await req.user.update(userFields);

  await profile.update({
    religion: req.body.religion,
    caste: req.body.caste,
    motherTongue: req.body.motherTongue,
    location: req.body.location,
    education: req.body.education,
    occupation: req.body.occupation,
    height: req.body.height,
    bio: req.body.bio,
    interests: Array.isArray(req.body.interests)
      ? req.body.interests
      : String(req.body.interests || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
  });

  const updated = await Profile.findByPk(profile.id, { include: [User, Photo] });
  return res.json(formatProfile(updated));
}

export async function uploadProfilePhoto(req, res) {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id },
      include: [User, Photo],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    if (req.params.id && String(profile.id) !== String(req.params.id)) {
      return res.status(403).json({ message: 'You can upload photos only for your own profile' });
    }

    const photo = req.files?.photo;
    if (!photo?.buffer) {
      return res.status(400).json({ message: 'Please select a profile photo' });
    }

    if (!photo.contentType?.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    const url = `data:${photo.contentType};base64,${photo.buffer.toString('base64')}`;

    await Photo.update({ isPrimary: false }, { where: { profileId: profile.id } });
    await Photo.create({
      profileId: profile.id,
      url,
      isPrimary: true,
    });

    const updated = await Profile.findByPk(profile.id, { include: [User, Photo] });
    return res.status(201).json(formatProfile(updated));
  } catch (error) {
    console.error('Upload profile photo failed:', error);
    if (/Data too long/i.test(error.message || '')) {
      return res.status(400).json({
        message: 'Photo column is too small. Run the Photos.url MEDIUMTEXT query from QUICK_START.md.',
      });
    }
    return res.status(500).json({ message: 'Could not upload profile photo' });
  }
}

export async function deleteProfilePhoto(req, res) {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id },
      include: [User, Photo],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    if (req.params.id && String(profile.id) !== String(req.params.id)) {
      return res.status(403).json({ message: 'You can delete photos only for your own profile' });
    }

    const photo = await Photo.findOne({
      where: {
        id: req.params.photoId,
        profileId: profile.id,
      },
    });

    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    const wasPrimary = Boolean(photo.isPrimary);
    await photo.destroy();

    if (wasPrimary) {
      const nextPhoto = await Photo.findOne({
        where: { profileId: profile.id },
        order: [['createdAt', 'DESC']],
      });
      if (nextPhoto) await nextPhoto.update({ isPrimary: true });
    }

    const updated = await Profile.findByPk(profile.id, { include: [User, Photo] });
    return res.json(formatProfile(updated));
  } catch (error) {
    console.error('Delete profile photo failed:', error);
    return res.status(500).json({ message: 'Could not delete profile photo' });
  }
}

export async function getProfileById(req, res) {
  try {
    const profile = await Profile.findByPk(req.params.id, {
      include: [{ model: User, include: [activeSubscriptionInclude()] }, Photo],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (profile.userId !== req.user.id) {
      try {
        await ProfileView.findOrCreate({
          where: { viewerId: req.user.id, viewedUserId: profile.userId },
        });
      } catch (viewError) {
        console.warn('Could not record profile view:', viewError.message);
      }
    }

    return res.json(formatProfile(profile));
  } catch (error) {
    console.error('Get profile failed:', error);
    return res.status(500).json({ message: 'Could not load profile' });
  }
}

export async function getProfiles(req, res) {
  const where = {};
  if (req.query.location) where.location = { [Op.like]: `%${req.query.location}%` };
  if (req.query.religion) where.religion = req.query.religion;

  const profiles = await Profile.findAll({
    where,
    include: [
      {
        model: User,
        where: {
          id: { [Op.ne]: req.user.id },
          gender: req.user.lookingFor,
        },
      },
      Photo,
    ],
    order: [['updatedAt', 'DESC']],
  });

  return res.json(profiles.map(formatProfile));
}
