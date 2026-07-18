import {
  Conversation,
  ConversationMember,
  Like,
  Message,
  Photo,
  Profile,
  ProfileView,
  PremiumPlan,
  Role,
  Subscription,
  User,
  Payment,
  SupportTicket,
} from '../models/index.js';

const tableRegistry = {
  roles: Role,
  users: User,
  profiles: Profile,
  photos: Photo,
  likes: Like,
  profileviews: ProfileView,
  premiumplans: PremiumPlan,
  subscriptions: Subscription,
  payments: Payment,
  supporttickets: SupportTicket,
  conversations: Conversation,
  conversationmembers: ConversationMember,
  messages: Message,
};

const sectionRegistry = {
  roles: { table: 'roles', label: 'Roles', description: 'Admin and user role records' },
  users: { table: 'users', label: 'Users', description: 'Registered member accounts' },
  profiles: { table: 'profiles', label: 'Profiles', description: 'Member profile details' },
  photos: { table: 'photos', label: 'Photos', description: 'Profile photo records' },
  likes: { table: 'likes', label: 'Likes', description: 'Like and pass transactions' },
  profileviews: { table: 'profileviews', label: 'Profile Views', description: 'Profile view transactions' },
  premiumplans: { table: 'premiumplans', label: 'Premium Plans', description: 'Premium plan catalogue' },
  subscriptions: { table: 'subscriptions', label: 'Subscriptions', description: 'User premium subscription records' },
  payments: { table: 'payments', label: 'Payments', description: 'Premium payment transactions' },
  supporttickets: { table: 'supporttickets', label: 'Support Tickets', description: 'Premium support requests' },
  conversations: { table: 'conversations', label: 'Conversations', description: 'Chat conversation records' },
  conversationmembers: { table: 'conversationmembers', label: 'Conversation Members', description: 'Conversation participant records' },
  messages: { table: 'messages', label: 'Messages', description: 'Chat messages' },
};

const hiddenFields = new Set(['passwordHash', 'otpCode']);
const protectedTables = new Set(['roles', 'users']);

function sanitizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => !hiddenFields.has(key))
  );
}

function toCsv(rows) {
  if (!rows.length) return '';

  const columns = Object.keys(rows[0]);
  const escapeCell = (value) => {
    if (value === null || value === undefined) return '';
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => escapeCell(row[column])).join(',')),
  ].join('\n');
}

async function getTableRows(tableName, limit = 200) {
  const model = tableRegistry[tableName];
  if (!model) return null;

  const rows = await model.findAll({
    raw: true,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return rows.map(sanitizeRow);
}

export async function getAdminReport(req, res) {
  const [
    users,
    verifiedUsers,
    profiles,
    photos,
    likes,
    passes,
    profileViews,
    conversations,
    messages,
    recentUsers,
    recentMessages,
    recentLikes,
    recentViews,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { verified: true } }),
    Profile.count(),
    Photo.count(),
    Like.count({ where: { status: 'liked' } }),
    Like.count({ where: { status: 'passed' } }),
    ProfileView.count(),
    Conversation.count(),
    Message.count(),
    User.findAll({
      raw: true,
      limit: 8,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'fullName', 'email', 'mobile', 'gender', 'verified', 'createdAt'],
    }),
    Message.findAll({
      raw: true,
      limit: 8,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'conversationId', 'senderId', 'body', 'createdAt'],
    }),
    Like.findAll({
      raw: true,
      limit: 8,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'fromUserId', 'toUserId', 'status', 'createdAt'],
    }),
    ProfileView.findAll({
      raw: true,
      limit: 8,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'viewerId', 'viewedUserId', 'createdAt'],
    }),
  ]);

  const tableCounts = await Promise.all(
    Object.entries(tableRegistry).map(async ([name, model]) => ({
      name,
      count: await model.count(),
    }))
  );

  res.json({
    metrics: {
      users,
      verifiedUsers,
      profiles,
      photos,
      likes,
      passes,
      profileViews,
      conversations,
      messages,
      verificationRate: users ? Math.round((verifiedUsers / users) * 100) : 0,
    },
    tableCounts,
    recentActivity: [
      ...recentUsers.map((item) => ({
        type: 'User',
        label: `${item.fullName} registered`,
        detail: item.email,
        createdAt: item.createdAt,
      })),
      ...recentMessages.map((item) => ({
        type: 'Message',
        label: `Message #${item.id}`,
        detail: item.body,
        createdAt: item.createdAt,
      })),
      ...recentLikes.map((item) => ({
        type: 'Like',
        label: `User ${item.fromUserId} ${item.status} user ${item.toUserId}`,
        detail: `Like #${item.id}`,
        createdAt: item.createdAt,
      })),
      ...recentViews.map((item) => ({
        type: 'View',
        label: `User ${item.viewerId} viewed user ${item.viewedUserId}`,
        detail: `View #${item.id}`,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 16),
  });
}

export async function getAdminTable(req, res) {
  const rows = await getTableRows(req.params.tableName, Number(req.query.limit || 200));

  if (!rows) return res.status(404).json({ message: 'Table not found' });

  res.json({
    table: req.params.tableName,
    columns: rows[0] ? Object.keys(rows[0]) : [],
    rows,
  });
}

export async function getAdminSection(req, res) {
  const section = sectionRegistry[req.params.sectionName];
  if (!section) return res.status(404).json({ message: 'Admin section not found' });

  const limit = Number(req.query.limit || 500);
  const rows = await getTableRows(section.table, limit);
  const model = tableRegistry[section.table];
  const count = await model.count();

  res.json({
    section: req.params.sectionName,
    table: section.table,
    label: section.label,
    description: section.description,
    protected: protectedTables.has(section.table),
    count,
    columns: rows?.[0] ? Object.keys(rows[0]) : [],
    rows: rows || [],
  });
}

export async function downloadAdminTable(req, res) {
  const rows = await getTableRows(req.params.tableName, 5000);

  if (!rows) return res.status(404).json({ message: 'Table not found' });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.tableName}-report.csv"`);
  res.send(toCsv(rows));
}

export async function deleteAdminTableRow(req, res) {
  const model = tableRegistry[req.params.tableName];

  if (!model) return res.status(404).json({ message: 'Table not found' });
  if (protectedTables.has(req.params.tableName)) {
    return res.status(400).json({ message: 'This table is protected from maintenance delete' });
  }

  const deleted = await model.destroy({ where: { id: req.params.id } });

  if (!deleted) return res.status(404).json({ message: 'Row not found' });

  return res.json({ message: 'Row deleted' });
}

export function isKnownAdminTable(tableName) {
  return Boolean(tableRegistry[tableName]);
}
