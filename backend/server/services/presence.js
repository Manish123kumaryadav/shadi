const onlineUsers = new Map();

export function markUserOnline(userId) {
  const key = String(userId);
  onlineUsers.set(key, (onlineUsers.get(key) || 0) + 1);
}

export function markUserOffline(userId) {
  const key = String(userId);
  const nextCount = (onlineUsers.get(key) || 1) - 1;

  if (nextCount <= 0) {
    onlineUsers.delete(key);
    return;
  }

  onlineUsers.set(key, nextCount);
}

export function isUserOnline(userId) {
  return onlineUsers.has(String(userId));
}
