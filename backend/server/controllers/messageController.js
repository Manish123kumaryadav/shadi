import { Op } from "sequelize";
import {
  User,
  Profile,
  Photo,
  Conversation,
  ConversationMember,
  Message,
} from "../models/index.js";
import { sendOfflineMessageEmail } from "../services/email.js";
import { isUserOnline } from "../services/presence.js";

async function getConversationForUsers(userId, otherUserId) {
  const memberships = await ConversationMember.findAll({
    where: { userId: { [Op.in]: [userId, otherUserId] } },
  });

  const counts = memberships.reduce((acc, item) => {
    acc[item.conversationId] = (acc[item.conversationId] || 0) + 1;
    return acc;
  }, {});

  const existingId = Object.keys(counts).find((id) => counts[id] === 2);
  if (existingId) return Conversation.findByPk(existingId);

  const conversation = await Conversation.create();
  await ConversationMember.bulkCreate([
    { conversationId: conversation.id, userId },
    { conversationId: conversation.id, userId: otherUserId },
  ]);

  return conversation;
}

function formatConversation(conversation, currentUserId) {
  const otherMember = conversation.Members?.find(
    (member) => member.id !== currentUserId,
  );
  const profile = otherMember?.Profile;
  const primaryPhoto =
    profile?.Photos?.find((photo) => photo.isPrimary) || profile?.Photos?.[0];
  const lastMessage = conversation.Messages?.[0];

  return {
    id: conversation.id,
    userId: otherMember?.id,
    name: otherMember?.fullName || "Member",
    avatar:
      primaryPhoto?.url ||
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&w=100",
    online: otherMember ? isUserOnline(otherMember.id) : false,
    lastMessage: lastMessage?.body || "Start the conversation",
    timestamp: lastMessage?.createdAt || conversation.updatedAt,
    unread: 0,
  };
}

export async function startConversation(req, res) {
  const profile = await Profile.findByPk(req.params.profileId);
  if (!profile || profile.userId === req.user.id) {
    return res.status(404).json({ message: "Profile not found" });
  }

  const conversation = await getConversationForUsers(
    req.user.id,
    profile.userId,
  );
  return res.status(201).json({ id: conversation.id });
}

export async function getConversations(req, res) {
  const conversations = await Conversation.findAll({
    include: [
      {
        model: User,
        as: "Members",
        through: { attributes: [] },
        include: [{ model: Profile, include: [Photo] }],
      },
      {
        model: Message,
        limit: 1,
        separate: true,
        order: [["createdAt", "DESC"]],
      },
    ],
    order: [["updatedAt", "DESC"]],
  });

  const mine = conversations.filter((conversation) =>
    conversation.Members?.some((member) => member.id === req.user.id),
  );

  res.json(
    mine.map((conversation) => formatConversation(conversation, req.user.id)),
  );
}

export async function getMessages(req, res) {
  const member = await ConversationMember.findOne({
    where: { conversationId: req.params.conversationId, userId: req.user.id },
  });

  if (!member)
    return res.status(404).json({ message: "Conversation not found" });

  const messages = await Message.findAll({
    where: { conversationId: req.params.conversationId },
    include: [
      { model: User, as: "Sender" },
      {
        model: Message,
        as: "ReplyTo",
        include: [{ model: User, as: "Sender" }],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  res.json(
    messages.map((message) => ({
      id: message.id,
      text: message.body,
      sender: message.senderId === req.user.id ? "me" : "other",
      senderId: message.senderId,
      timestamp: message.createdAt,

      replyTo: message.ReplyTo
        ? {
            id: message.ReplyTo.id,
            text: message.ReplyTo.body,
            senderId: message.ReplyTo.senderId,
            sender: message.ReplyTo.senderId === req.user.id ? "me" : "other",
            senderName: message.ReplyTo.Sender?.fullName || "Member",
          }
        : null,
    })),
  );
}

export async function sendMessage(req, res) {
  const member = await ConversationMember.findOne({
    where: { conversationId: req.params.conversationId, userId: req.user.id },
  });

  if (!member)
    return res.status(404).json({ message: "Conversation not found" });
  if (!req.body.message?.trim())
    return res.status(400).json({ message: "Message is required" });

  const replyToMessageId = req.body.replyToMessageId || null;

  let replyToMessage = null;

  if (replyToMessageId) {
    replyToMessage = await Message.findOne({
      where: {
        id: replyToMessageId,
        conversationId: req.params.conversationId,
      },
    });

    if (!replyToMessage) {
      return res.status(400).json({ message: "Reply message not found" });
    }
  }

  const message = await Message.create({
    conversationId: req.params.conversationId,
    senderId: req.user.id,
    body: req.body.message.trim(),
    replyToMessageId,
  });

  await Conversation.update(
    { updatedAt: new Date() },
    { where: { id: req.params.conversationId }, silent: false },
  );

  const payload = {
    id: message.id,
    conversationId: Number(req.params.conversationId),
    text: message.body,
    senderId: req.user.id,
    timestamp: message.createdAt,
    replyTo: replyToMessage
      ? {
          id: replyToMessage.id,
          text: replyToMessage.body,
          senderId: replyToMessage.senderId,
          sender: replyToMessage.senderId === req.user.id ? "me" : "other",
        }
      : null,
  };

  req.app
    .get("io")
    ?.to(`conversation:${req.params.conversationId}`)
    .emit("message:new", payload);

  const recipientMember = await ConversationMember.findOne({
    where: {
      conversationId: req.params.conversationId,
      userId: { [Op.ne]: req.user.id },
    },
    include: [User],
  });

  if (recipientMember?.User && !isUserOnline(recipientMember.User.id)) {
    sendOfflineMessageEmail({
      to: recipientMember.User.email,
      recipientName: recipientMember.User.fullName,
      senderName: req.user.fullName,
      message: message.body,
    }).catch((error) => {
      console.error("Offline email notification failed:", error.message);
    });
  }

  res.status(201).json(payload);
}
