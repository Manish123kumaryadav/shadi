import sequelize from '../config/database.js';
import Role from './Role.js';
import User from './User.js';
import Profile from './Profile.js';
import Photo from './Photo.js';
import Like from './Like.js';
import ProfileView from './ProfileView.js';
import Conversation from './Conversation.js';
import ConversationMember from './ConversationMember.js';
import Message from './Message.js';
import PremiumPlan from './PremiumPlan.js';
import Subscription from './Subscription.js';
import Payment from './Payment.js';
import SupportTicket from './SupportTicket.js';

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

User.hasOne(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });

Profile.hasMany(Photo, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Photo.belongsTo(Profile, { foreignKey: 'profileId' });

User.hasMany(Like, { as: 'GivenLikes', foreignKey: 'fromUserId' });
User.hasMany(Like, { as: 'ReceivedLikes', foreignKey: 'toUserId' });
Like.belongsTo(User, { as: 'FromUser', foreignKey: 'fromUserId' });
Like.belongsTo(User, { as: 'ToUser', foreignKey: 'toUserId' });

User.hasMany(ProfileView, { as: 'ViewedProfiles', foreignKey: 'viewerId' });
User.hasMany(ProfileView, { as: 'ProfileViewers', foreignKey: 'viewedUserId' });
ProfileView.belongsTo(User, { as: 'Viewer', foreignKey: 'viewerId' });
ProfileView.belongsTo(User, { as: 'ViewedUser', foreignKey: 'viewedUserId' });

Conversation.belongsToMany(User, {
  through: ConversationMember,
  foreignKey: 'conversationId',
  otherKey: 'userId',
  as: 'Members',
});
User.belongsToMany(Conversation, {
  through: ConversationMember,
  foreignKey: 'userId',
  otherKey: 'conversationId',
  as: 'Conversations',
});

Conversation.hasMany(Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
ConversationMember.belongsTo(User, { foreignKey: 'userId' });
ConversationMember.belongsTo(Conversation, { foreignKey: 'conversationId' });
Message.belongsTo(Message, {
  as: 'ReplyTo',
  foreignKey: 'replyToMessageId',
});
Message.belongsTo(Message, {
  as: "ForwardedFrom",
  foreignKey: "forwardedFromMessageId",
});

PremiumPlan.hasMany(Subscription, { foreignKey: 'planId' });
Subscription.belongsTo(PremiumPlan, { foreignKey: 'planId' });
User.hasMany(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

PremiumPlan.hasMany(Payment, { foreignKey: 'planId' });
Payment.belongsTo(PremiumPlan, { foreignKey: 'planId' });
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId' });

User.hasMany(SupportTicket, { foreignKey: 'userId' });
SupportTicket.belongsTo(User, { foreignKey: 'userId' });

export {
  sequelize,
  Role,
  User,
  Profile,
  Photo,
  Like,
  ProfileView,
  Conversation,
  ConversationMember,
  Message,
  PremiumPlan,
  Subscription,
  Payment,
  SupportTicket,
};

export default sequelize;
