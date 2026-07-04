import {
  Activity,
  Database,
  Eye,
  Heart,
  Image,
  MessageSquare,
  ShieldCheck,
  UserRoundCog,
  Users,
} from 'lucide-react';

export const adminSections = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'roles', label: 'Roles', icon: ShieldCheck },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'profiles', label: 'Profiles', icon: UserRoundCog },
  { key: 'photos', label: 'Photos', icon: Image },
  { key: 'likes', label: 'Likes', icon: Heart },
  { key: 'profileviews', label: 'Profile Views', icon: Eye },
  { key: 'conversations', label: 'Conversations', icon: Activity },
  { key: 'conversationmembers', label: 'Conversation Members', icon: Database },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
];

export function getAdminSection(key) {
  return adminSections.find((section) => section.key === key) || adminSections[0];
}
