import jwt from "jsonwebtoken";
import { ConversationMember, User } from "../models/index.js";
import { markUserOffline, markUserOnline } from "../services/presence.js";

async function isConversationMember(conversationId, userId) {
  const member = await ConversationMember.findOne({
    where: { conversationId, userId },
  });

  return Boolean(member);
}

async function canSignalCall(conversationId, fromUserId, toUserId) {
  if (!conversationId || !toUserId || Number(fromUserId) === Number(toUserId))
    return false;

  const [fromMember, toMember] = await Promise.all([
    isConversationMember(conversationId, fromUserId),
    isConversationMember(conversationId, toUserId),
  ]);

  return fromMember && toMember;
}

export function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      const user = await User.findByPk(payload.id);
      if (!user) return next(new Error("Invalid session"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid session"));
    }
  });

  io.on("connection", (socket) => {
    markUserOnline(socket.user.id);
    socket.join(`user:${socket.user.id}`);

    socket.on("conversation:join", async (conversationId) => {
      const member = await ConversationMember.findOne({
        where: { conversationId, userId: socket.user.id },
      });

      if (member) socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "call:offer",
      async ({ conversationId, toUserId, callId, offer }) => {
        if (!(await canSignalCall(conversationId, socket.user.id, toUserId)))
          return;

        io.to(`user:${toUserId}`).emit("call:incoming", {
          callId,
          conversationId,
          fromUserId: socket.user.id,
          fromName: socket.user.fullName,
          offer,
        });
      },
    );

    socket.on(
      "call:answer",
      async ({ conversationId, toUserId, callId, answer }) => {
        if (!(await canSignalCall(conversationId, socket.user.id, toUserId)))
          return;

        io.to(`user:${toUserId}`).emit("call:answer", {
          callId,
          conversationId,
          fromUserId: socket.user.id,
          answer,
        });
      },
    );

    socket.on(
      "call:ice-candidate",
      async ({ conversationId, toUserId, callId, candidate }) => {
        if (!(await canSignalCall(conversationId, socket.user.id, toUserId)))
          return;

        io.to(`user:${toUserId}`).emit("call:ice-candidate", {
          callId,
          conversationId,
          fromUserId: socket.user.id,
          candidate,
        });
      },
    );

    socket.on("call:reject", async ({ conversationId, toUserId, callId }) => {
      if (!(await canSignalCall(conversationId, socket.user.id, toUserId)))
        return;

      io.to(`user:${toUserId}`).emit("call:rejected", {
        callId,
        conversationId,
        fromUserId: socket.user.id,
      });
    });

    socket.on("call:end", async ({ conversationId, toUserId, callId }) => {
      if (!(await canSignalCall(conversationId, socket.user.id, toUserId)))
        return;

      io.to(`user:${toUserId}`).emit("call:ended", {
        callId,
        conversationId,
        fromUserId: socket.user.id,
      });
    });

    socket.on("disconnect", () => {
      markUserOffline(socket.user.id);
    });

    socket.on("message:deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? {
                ...item,
                text: "This message was deleted",
                deletedForEveryone: true,
              }
            : item,
        ),
      );
    });

    socket.on("message:reaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId ? { ...item, reactions } : item,
        ),
      );
    });
  });
}
