import { Op } from 'sequelize';
import { User, Profile, Photo, Like, ProfileView } from '../models/index.js';
import { formatProfile } from '../utils.js';

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

  res.json(profiles.map(formatProfile));
}

export async function likeProfile(req, res) {
  const profile = await Profile.findByPk(req.params.profileId);
  if (!profile || profile.userId === req.user.id) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  await Like.upsert({
    fromUserId: req.user.id,
    toUserId: profile.userId,
    status: 'liked',
  });

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
        include: [{ model: Profile, include: [Photo] }],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  res.json(likes
    .map((like) => like.FromUser?.Profile)
    .filter(Boolean)
    .map(formatProfile));
}

export async function getLikedProfiles(req, res) {
  const likes = await Like.findAll({
    where: { fromUserId: req.user.id, status: 'liked' },
    include: [
      {
        model: User,
        as: 'ToUser',
        include: [{ model: Profile, include: [Photo] }],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  res.json(likes
    .map((like) => like.ToUser?.Profile)
    .filter(Boolean)
    .map(formatProfile));
}

export async function getViews(req, res) {
  const views = await ProfileView.findAll({
    where: { viewedUserId: req.user.id },
    include: [
      {
        model: User,
        as: 'Viewer',
        include: [{ model: Profile, include: [Photo] }],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  res.json(views
    .map((view) => view.Viewer?.Profile)
    .filter(Boolean)
    .map(formatProfile));
}
