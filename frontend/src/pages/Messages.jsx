import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MoreVertical,
  Paperclip,
  Phone,
  PhoneCall,
  PhoneOff,
  Reply,
  Send,
  Smile,
  Video,
  X,
} from "lucide-react";
import { messageService, socketService } from "../services/api";
import "./Messages.css";
import EmojiPicker from "emoji-picker-react";
const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const Messages = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [callState, setCallState] = useState("idle");
  const [callInfo, setCallInfo] = useState(null);
  const [callError, setCallError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const remoteAudioRef = useRef(null);
  const ringRef = useRef({ audioContext: null, oscillator: null, timer: null });
  const messageInputRef = useRef(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [selectedActionMessage, setSelectedActionMessage] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const messageRefs = useRef({});
  const formatTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentUser = () => JSON.parse(localStorage.getItem("user") || "{}");
  const quickReactions = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

  const normalizeIncomingMessage = (message, userId) => ({
    id: message.id,
    text: message.text,
    sender: message.senderId === userId ? "me" : "other",
    senderId: message.senderId,
    timestamp: message.timestamp,
    forwarded: message.forwarded,
    reactions: message.reactions || [],
    replyTo: message.replyTo
      ? {
          ...message.replyTo,
          sender: message.replyTo.senderId === userId ? "me" : "other",
        }
      : null,
    deletedForEveryone: message.deletedForEveryone || false,
  });

  const stopLocalStream = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  };

  const stopRingTone = () => {
    if (ringRef.current.timer) {
      clearInterval(ringRef.current.timer);
    }

    ringRef.current.oscillator?.stop();
    ringRef.current.audioContext?.close();
    ringRef.current = { audioContext: null, oscillator: null, timer: null };
  };

  const startRingTone = async () => {
    if (ringRef.current.audioContext) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      await audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 720;
      gain.gain.value = 0;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();

      const pulse = () => {
        const now = audioContext.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.35);
        gain.gain.linearRampToValueAtTime(0, now + 0.45);
      };

      pulse();
      ringRef.current = {
        audioContext,
        oscillator,
        timer: window.setInterval(pulse, 1400),
      };
    } catch {
      stopRingTone();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessageText((prev) => prev + emojiData.emoji);
  };
  const resetCall = () => {
    peerRef.current?.close();
    peerRef.current = null;
    pendingCandidatesRef.current = [];
    stopLocalStream();
    stopRingTone();

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setCallState("idle");
    setCallInfo(null);
  };

  const endCall = (notifyPeer = true) => {
    const socket = socketService.getSocket();

    if (notifyPeer && callInfo?.conversationId && callInfo?.peerUserId) {
      socket?.emit("call:end", {
        conversationId: callInfo.conversationId,
        toUserId: callInfo.peerUserId,
        callId: callInfo.callId,
      });
    }

    resetCall();
  };

  const createPeer = (conversationId, peerUserId, callId) => {
    const socket = socketService.connect();
    const peer = new RTCPeerConnection(rtcConfig);

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket?.emit("call:ice-candidate", {
        conversationId,
        toUserId: peerUserId,
        callId,
        candidate: event.candidate,
      });
    };

    peer.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
      stopRingTone();
      setCallState("connected");
    };

    peer.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(peer.connectionState)) {
        resetCall();
      }
    };

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peerRef.current = peer;
    return peer;
  };

  const scrollToMessage = (id) => {
  messageRefs.current[id]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  setHighlightedMessageId(id);

  setTimeout(() => {
    setHighlightedMessageId(null);
  }, 2000);
};

const handleReply = (message) => {
  setReplyMessage(message);
  setSelectedActionMessage(null);
  setTimeout(() => messageInputRef.current?.focus(), 0);
};

const handleDeleteForEveryone = async (message) => {
  await messageService.deleteForEveryone(message.id);

  setMessages((prev) =>
    prev.map((item) =>
      item.id === message.id
        ? { ...item, text: "This message was deleted", deletedForEveryone: true }
        : item
    )
  );

  setSelectedActionMessage(null);
};

const handleForward = async (message) => {
  await messageService.sendMessage(
    selectedConversation.id,
    message.text,
    null,
    message.id
  );

  setSelectedActionMessage(null);
};

const handleReaction = async (message, emoji) => {
  const response = await messageService.reactMessage(message.id, emoji);

  setMessages((prev) =>
    prev.map((item) =>
      item.id === message.id
        ? { ...item, reactions: response.data.reactions }
        : item
    )
  );

  setSelectedActionMessage(null);
};
  const loadMessages = async (conversation) => {
    setSelectedConversation(conversation);
    const response = await messageService.getMessages(conversation.id);
    setMessages(response.data);

    const socket = socketService.connect();
    socket?.emit("conversation:join", conversation.id);
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const response = await messageService.getConversations();
        setConversations(response.data);

        const target =
          response.data.find(
            (item) => item.id === location.state?.conversationId,
          ) || response.data[0];
        if (target) await loadMessages(target);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [location.state?.conversationId]);

  useEffect(() => {
    const socket = socketService.connect();
    if (!socket) return undefined;

    const onNewMessage = (message) => {
      const userId = currentUser().id;
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, normalizeIncomingMessage(message, userId)];
      });
    };

    const onMessageDeleted = ({ messageId }) => {
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
    };

    const onMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId ? { ...item, reactions } : item,
        ),
      );
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("message:reaction", onMessageReaction);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("message:reaction", onMessageReaction);
    };
  }, []);

  useEffect(() => {
    const socket = socketService.connect();
    if (!socket) return undefined;

    const addRemoteCandidate = async (candidate) => {
      if (!candidate) return;

      if (!peerRef.current?.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const onIncomingCall = ({
      callId,
      conversationId,
      fromUserId,
      fromName,
      offer,
    }) => {
      if (callState !== "idle") {
        socket.emit("call:reject", {
          conversationId,
          toUserId: fromUserId,
          callId,
        });
        return;
      }

      setCallError("");
      setCallState("incoming");
      setCallInfo({
        callId,
        conversationId,
        peerUserId: fromUserId,
        peerName: fromName || "Partner",
        offer,
      });
      startRingTone();
    };

    const onCallAnswer = async ({ callId, answer }) => {
      if (callInfo?.callId !== callId || !peerRef.current) return;

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      stopRingTone();
      setCallState("connected");
    };

    const onIceCandidate = async ({ callId, candidate }) => {
      if (callInfo?.callId && callInfo.callId !== callId) return;
      await addRemoteCandidate(candidate);
    };

    const onRejected = ({ callId }) => {
      if (callInfo?.callId !== callId) return;
      setCallError("Call declined");
      resetCall();
    };

    const onEnded = ({ callId }) => {
      if (callInfo?.callId !== callId) return;
      resetCall();
    };

    socket.on("call:incoming", onIncomingCall);
    socket.on("call:answer", onCallAnswer);
    socket.on("call:ice-candidate", onIceCandidate);
    socket.on("call:rejected", onRejected);
    socket.on("call:ended", onEnded);

    return () => {
      socket.off("call:incoming", onIncomingCall);
      socket.off("call:answer", onCallAnswer);
      socket.off("call:ice-candidate", onIceCandidate);
      socket.off("call:rejected", onRejected);
      socket.off("call:ended", onEnded);
    };
  }, [callInfo, callState]);

  useEffect(() => () => resetCall(), []);

  const startAudioCall = async () => {
    if (!selectedConversation?.userId || callState !== "idle") return;

    try {
      setCallError("");
      const socket = socketService.connect();
      const callId = `${Date.now()}-${currentUser().id || "me"}`;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;

      const nextCallInfo = {
        callId,
        conversationId: selectedConversation.id,
        peerUserId: selectedConversation.userId,
        peerName: selectedConversation.name,
      };

      setCallInfo(nextCallInfo);
      setCallState("calling");
      startRingTone();

      const peer = createPeer(
        selectedConversation.id,
        selectedConversation.userId,
        callId,
      );
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket?.emit("call:offer", {
        conversationId: selectedConversation.id,
        toUserId: selectedConversation.userId,
        callId,
        offer,
      });
    } catch {
      setCallError("Microphone permission is required for audio call");
      resetCall();
    }
  };

  const acceptAudioCall = async () => {
    if (!callInfo?.offer) return;

    try {
      setCallError("");
      const socket = socketService.connect();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;
      stopRingTone();

      const peer = createPeer(
        callInfo.conversationId,
        callInfo.peerUserId,
        callInfo.callId,
      );
      await peer.setRemoteDescription(
        new RTCSessionDescription(callInfo.offer),
      );

      for (const candidate of pendingCandidatesRef.current) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current = [];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket?.emit("call:answer", {
        conversationId: callInfo.conversationId,
        toUserId: callInfo.peerUserId,
        callId: callInfo.callId,
        answer,
      });

      setCallState("connected");
      stopRingTone();
    } catch {
      setCallError("Could not start microphone");
      endCall(true);
    }
  };

  const rejectAudioCall = () => {
    const socket = socketService.getSocket();

    if (callInfo) {
      socket?.emit("call:reject", {
        conversationId: callInfo.conversationId,
        toUserId: callInfo.peerUserId,
        callId: callInfo.callId,
      });
    }

    resetCall();
  };

  const handleSendMessage = async () => {
  if (!messageText.trim()) return;
  if (!selectedConversation) return;

  await messageService.sendMessage(
    selectedConversation.id,
    messageText,
    replyMessage?.id || null
  );

  setMessageText("");
  setReplyMessage(null);
};

  const handleSelectConversation = async (conversation) => {
    await loadMessages(conversation);
  };

  return (
    <div className="messages-container">
      <div className="messages-wrapper">
        {/* Conversations List */}
        <div className="conversations-list">
          <div className="conversations-header">
            <h2>Messages</h2>
            <button className="new-message-btn">+</button>
          </div>

          <div className="search-box">
            <input type="text" placeholder="Search conversations..." />
          </div>

          <div className="conversations">
            {isLoading && (
              <p className="text-muted">Loading conversations...</p>
            )}
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? "active" : ""}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <img src={conversation.avatar} alt={conversation.name} />
                  {conversation.online && (
                    <div className="online-indicator"></div>
                  )}
                </div>

                <div className="conversation-info">
                  <h4>{conversation.name}</h4>
                  <p>{conversation.lastMessage}</p>
                  <span className="timestamp">
                    {formatTime(conversation.timestamp)}
                  </span>
                </div>

                {conversation.unread > 0 && (
                  <div className="unread-badge">{conversation.unread}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                  />
                  <div>
                    <h3>{selectedConversation.name}</h3>
                    <p>
                      {selectedConversation.online ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button
                    className="icon-btn"
                    onClick={startAudioCall}
                    disabled={callState !== "idle"}
                    title="Start audio call"
                  >
                    <Phone size={20} />
                  </button>
                  <button className="icon-btn" title="Video call">
                    <Video size={20} />
                  </button>
                  <button className="icon-btn" title="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {callState !== "idle" && callInfo && (
                <div className={`call-panel ${callState}`}>
                  <audio ref={remoteAudioRef} autoPlay />
                  <div>
                    <p className="call-label">
                      {callState === "incoming"
                        ? "Incoming audio call"
                        : callState === "calling"
                          ? "Calling"
                          : "Audio call"}
                    </p>
                    <h4>{callInfo.peerName}</h4>
                  </div>

                  <div className="call-controls">
                    {callState === "incoming" && (
                      <button
                        className="call-btn accept"
                        onClick={acceptAudioCall}
                        title="Accept call"
                      >
                        <PhoneCall size={20} />
                      </button>
                    )}
                    <button
                      className="call-btn end"
                      onClick={
                        callState === "incoming"
                          ? rejectAudioCall
                          : () => endCall(true)
                      }
                      title={
                        callState === "incoming" ? "Decline call" : "End call"
                      }
                    >
                      <PhoneOff size={20} />
                    </button>
                  </div>
                </div>
              )}

              {callError && <div className="call-error">{callError}</div>}

              {/* Messages */}
            <div className="messages-list">
  {messages.map((message) => (
   <div
  key={message.id}
  ref={(el) => (messageRefs.current[message.id] = el)}
  className={`message ${message.sender} ${
    highlightedMessageId === message.id ? "highlight-message" : ""
  }`}
  onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
  onTouchEnd={(e) => {
    if (touchStartX === null || message.deletedForEveryone) return;

    const diff = e.changedTouches[0].clientX - touchStartX;

    if (diff > 70) {
      handleReply(message);
    }

    setTouchStartX(null);
  }}
>
  <div className="message-content">
    {!message.deletedForEveryone && (
      <button
        type="button"
        className="message-menu-btn"
        title="Message options"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedActionMessage(
            selectedActionMessage?.id === message.id ? null : message
          );
        }}
      >
        <MoreVertical size={16} />
      </button>
    )}

    {message.forwarded && (
      <div className="forwarded-label">Forwarded</div>
    )}

    {message.replyTo && (
      <button
        type="button"
        className="reply-box"
        onClick={() => scrollToMessage(message.replyTo.id)}
      >
        <span className="reply-line"></span>

        <span className="reply-body">
          <span className="reply-name">
            {message.replyTo.sender === "me"
              ? "You"
              : message.replyTo.senderName || selectedConversation.name}
          </span>

          <span className="reply-text">{message.replyTo.text}</span>
        </span>
      </button>
    )}

    <p className={message.deletedForEveryone ? "deleted-text" : ""}>
      {message.text}
    </p>

    {message.reactions?.length > 0 && (
      <div className="message-reactions">
        {message.reactions.map((reaction, index) => (
          <span key={`${reaction.userId || index}-${index}`}>
            {reaction.emoji}
          </span>
        ))}
      </div>
    )}

    <div className="message-footer">
      <button
        type="button"
        className="quick-reply-btn"
        title="Reply"
        onClick={() => handleReply(message)}
        disabled={message.deletedForEveryone}
      >
        <Reply size={14} />
      </button>
      <span className="message-time">{formatTime(message.timestamp)}</span>
    </div>

    {selectedActionMessage?.id === message.id && (
      <div className="message-action-menu">
        <button type="button" onClick={() => handleReply(message)}>Reply</button>
        <button type="button" onClick={() => handleForward(message)}>Forward</button>

        <div className="reaction-row">
          {quickReactions.map((emoji) => (
            <button type="button" key={emoji} onClick={() => handleReaction(message, emoji)}>
              {emoji}
            </button>
          ))}
        </div>

        {message.sender === "me" && (
          <button type="button" onClick={() => handleDeleteForEveryone(message)}>
            Delete for everyone
          </button>
        )}
      </div>
    )}
  </div>
</div>
  ))}
</div>
  {replyMessage && (
                  <div className="reply-preview-box">
                    <div className="reply-preview-accent"></div>
                    <div className="reply-preview-content">
                      <strong>
                        Replying to{" "}
                        {replyMessage.sender === "me"
                          ? "your message"
                          : selectedConversation.name}
                      </strong>
                      <p>{replyMessage.text}</p>
                    </div>

                    <button
                      type="button"
                      title="Cancel reply"
                      onClick={() => setReplyMessage(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              {/* Message Input */}
              <div className="message-input-area">
              
                <button type="button" className="input-icon-btn">
                  <Paperclip size={20} />
                </button>

                <input
                  ref={messageInputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />

                <div className="emoji-wrapper">
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile size={20} />
                  </button>

                  {showEmojiPicker && (
                    <div className="emoji-picker">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        lazyLoadEmojis
                        width={320}
                        height={380}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
