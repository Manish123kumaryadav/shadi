import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { multipartForm } from '../middleware/multipart.js';
import {
  getMe,
  login,
  register,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';
import {
  getMyProfile,
  getProfileById,
  getProfiles,
  updateMyProfile,
} from '../controllers/profileController.js';
import {
  getLikes,
  getLikedProfiles,
  getMatches,
  getViews,
  likeProfile,
  passProfile,
  unlikeProfile,
} from '../controllers/matchController.js';
import {
  deleteMessageForEveryone,
  getConversations,
  getMessages,
  reactMessage,
  sendMessage,
  startConversation,
} from '../controllers/messageController.js';
import {
  deleteAdminTableRow,
  downloadAdminTable,
  getAdminReport,
  getAdminSection,
  getAdminTable,
} from '../controllers/adminController.js';
import {
  getMyPremium,
  getPremiumPlans,
  startPremiumCheckout,
  verifyPremiumPayment,
} from '../controllers/premiumController.js';

const router = express.Router();

function adminRequired(req, res, next) {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (req.user.roleId === 1 || adminEmails.includes(req.user.email.toLowerCase())) {
    return next();
  }

  return res.status(403).json({ message: 'Admin access required' });
}

router.post('/auth/register', multipartForm, register);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/login', login);
router.get('/auth/me', authRequired, getMe);

router.get('/profiles/me', authRequired, getMyProfile);
router.put('/profiles/me', authRequired, updateMyProfile);
router.get('/profiles/:id', authRequired, getProfileById);
router.get('/profiles', authRequired, getProfiles);

router.get('/matches', authRequired, getMatches);
router.post('/matches/:profileId/like', authRequired, likeProfile);
router.post('/matches/:profileId/unlike', authRequired, unlikeProfile);
router.post('/matches/:profileId/pass', authRequired, passProfile);
router.get('/matches/likes', authRequired, getLikes);
router.get('/matches/liked', authRequired, getLikedProfiles);
router.get('/matches/views', authRequired, getViews);

router.get('/premium/plans', authRequired, getPremiumPlans);
router.get('/premium/me', authRequired, getMyPremium);
router.post('/premium/checkout', authRequired, startPremiumCheckout);
router.post('/premium/verify', authRequired, verifyPremiumPayment);

router.post('/messages/start/:profileId', authRequired, startConversation);
router.get('/messages/conversations', authRequired, getConversations);
router.get('/messages/conversations/:conversationId', authRequired, getMessages);
router.post('/messages/conversations/:conversationId', authRequired, sendMessage);


router.delete("/messages/:messageId/everyone", authRequired, deleteMessageForEveryone);
router.post("/messages/:messageId/react", authRequired, reactMessage);
router.get('/admin/report', authRequired, adminRequired, getAdminReport);
router.get('/admin/sections/:sectionName', authRequired, adminRequired, getAdminSection);
router.get('/admin/tables/:tableName', authRequired, adminRequired, getAdminTable);
router.get('/admin/tables/:tableName/download', authRequired, adminRequired, downloadAdminTable);
router.delete('/admin/tables/:tableName/:id', authRequired, adminRequired, deleteAdminTableRow);

export default router;
