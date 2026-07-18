import { Op } from "sequelize";
import {
  User,
  Profile,
  Photo,
  Conversation,
  ConversationMember,
  Message,
  Subscription,
} from "../models/index.js";
import { sendOfflineMessageEmail } from "../services/email.js";
import { isUserOnline } from "../services/presence.js";

const FREE_MESSAGE_LIMIT = 5;

async function hasActivePremium(userId) {
  try {
    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: "active",
        endsAt: { [Op.gte]: new Date() },
      },
    });

    return Boolean(subscription);
  } catch (error) {
    console.warn("Could not check premium message access:", error.message);
    return false;
  }
}

async function getSentMessageCount(userId) {
  return Message.count({
    where: {
      senderId: userId,
      deletedForEveryone: false,
    },
  });
}

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

  if (!member) return res.status(404).json({ message: "Conversation not found" });

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

  res.json(messages.map((message) => ({
    id: message.id,
    text: message.deletedForEveryone ? "This message was deleted" : message.body,
    sender: message.senderId === req.user.id ? "me" : "other",
    senderId: message.senderId,
    timestamp: message.createdAt,
    deletedForEveryone: message.deletedForEveryone,
    forwarded: Boolean(message.forwardedFromMessageId),
    reactions: message.reactions || [],
    replyTo: message.ReplyTo
      ? {
          id: message.ReplyTo.id,
          text: message.ReplyTo.deletedForEveryone
            ? "This message was deleted"
            : message.ReplyTo.body,
          senderId: message.ReplyTo.senderId,
          sender: message.ReplyTo.senderId === req.user.id ? "me" : "other",
          senderName: message.ReplyTo.Sender?.fullName || "Member",
        }
      : null,
  })));
}
export async function sendMessage(req, res) {
  const member = await ConversationMember.findOne({
    where: { conversationId: req.params.conversationId, userId: req.user.id },
  });

  if (!member) return res.status(404).json({ message: "Conversation not found" });
  if (!req.body.message?.trim()) return res.status(400).json({ message: "Message is required" });

  const isPremium = await hasActivePremium(req.user.id);

  if (!isPremium) {
    const sentCount = await getSentMessageCount(req.user.id);

    if (sentCount >= FREE_MESSAGE_LIMIT) {
      return res.status(403).json({
        message: `Free members can send up to ${FREE_MESSAGE_LIMIT} messages. Upgrade to Premium for unlimited messaging.`,
        code: "MESSAGE_LIMIT_REACHED",
        limit: FREE_MESSAGE_LIMIT,
      });
    }
  }

  let replyToMessage = null;

  if (req.body.replyToMessageId) {
    replyToMessage = await Message.findOne({
      where: {
        id: req.body.replyToMessageId,
        conversationId: req.params.conversationId,
      },
      include: [{ model: User, as: "Sender" }],
    });

    if (!replyToMessage) {
      return res.status(400).json({ message: "Reply message not found" });
    }
  }

  const message = await Message.create({
    conversationId: req.params.conversationId,
    senderId: req.user.id,
    body: req.body.message.trim(),
    replyToMessageId: req.body.replyToMessageId || null,
    forwardedFromMessageId: req.body.forwardedFromMessageId || null,
  });

  await Conversation.update(
    { updatedAt: new Date() },
    { where: { id: req.params.conversationId }, silent: false }
  );

  const payload = {
    id: message.id,
    conversationId: Number(req.params.conversationId),
    text: message.body,
    senderId: req.user.id,
    timestamp: message.createdAt,
    forwarded: Boolean(message.forwardedFromMessageId),
    reactions: [],
    replyTo: replyToMessage
      ? {
          id: replyToMessage.id,
          text: replyToMessage.deletedForEveryone
            ? "This message was deleted"
            : replyToMessage.body,
          senderId: replyToMessage.senderId,
          sender: replyToMessage.senderId === req.user.id ? "me" : "other",
          senderName: replyToMessage.Sender?.fullName || "Member",
        }
      : null,
  };

  req.app.get("io")?.to(`conversation:${req.params.conversationId}`).emit("message:new", payload);

  res.status(201).json(payload);
}

export async function deleteMessageForEveryone(req, res) {
  const message = await Message.findByPk(req.params.messageId);

  if (!message) return res.status(404).json({ message: "Message not found" });
  if (message.senderId !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await message.update({
    body: "",
    deletedForEveryone: true,
  });

  req.app.get("io")?.to(`conversation:${message.conversationId}`).emit("message:deleted", {
    messageId: message.id,
  });

  res.json({ success: true });
}

export async function reactMessage(req, res) {
  const { emoji } = req.body;
  const message = await Message.findByPk(req.params.messageId);

  if (!message) return res.status(404).json({ message: "Message not found" });

  let reactions = message.reactions || [];
  reactions = reactions.filter((item) => item.userId !== req.user.id);

  if (emoji) {
    reactions.push({
      userId: req.user.id,
      emoji,
    });
  }

  await message.update({ reactions });

  req.app.get("io")?.to(`conversation:${message.conversationId}`).emit("message:reaction", {
    messageId: message.id,
    reactions,
  });

  res.json({ success: true, reactions });
}
