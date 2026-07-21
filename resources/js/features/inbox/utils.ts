import type { ConversationRow, MessageRow } from '@/features/chat/types';

const AVATAR_TONES = [
  { bg: 'bg-amber-900/40', text: 'text-amber-300', ring: 'ring-amber-700/30' },
  { bg: 'bg-emerald-900/40', text: 'text-emerald-300', ring: 'ring-emerald-700/30' },
  { bg: 'bg-blue-900/40', text: 'text-blue-300', ring: 'ring-blue-700/30' },
  { bg: 'bg-violet-900/40', text: 'text-violet-300', ring: 'ring-violet-700/30' },
  { bg: 'bg-rose-900/40', text: 'text-rose-300', ring: 'ring-rose-700/30' },
  { bg: 'bg-cyan-900/40', text: 'text-cyan-300', ring: 'ring-cyan-700/30' },
  { bg: 'bg-slate-700/50', text: 'text-slate-200', ring: 'ring-slate-600/30' },
  { bg: 'bg-orange-900/40', text: 'text-orange-300', ring: 'ring-orange-700/30' },
  { bg: 'bg-pink-900/40', text: 'text-pink-300', ring: 'ring-pink-700/30' },
  { bg: 'bg-teal-900/40', text: 'text-teal-300', ring: 'ring-teal-700/30' },
];

export function getAvatarTone(seed: string | number): { bg: string; text: string; ring: string } {
  const num = typeof seed === 'string' ? seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : seed;
  return AVATAR_TONES[num % AVATAR_TONES.length];
}

const CATEGORY_META: Record<string, { label: string; icon: string; tone: { bg: string; text: string } }> = {
  developers:    { label: 'Developers',  icon: 'Code2',          tone: { bg: 'bg-blue-900/30',  text: 'text-blue-300' } },
  finance:       { label: 'Finance',     icon: 'BadgeDollarSign', tone: { bg: 'bg-emerald-900/30', text: 'text-emerald-300' } },
  architects:    { label: 'Architects',  icon: 'Building2',       tone: { bg: 'bg-violet-900/30', text: 'text-violet-300' } },
  managers:      { label: 'Managers',    icon: 'Shield',          tone: { bg: 'bg-amber-900/30',  text: 'text-amber-300' } },
  'site team':   { label: 'Site team',   icon: 'HardHat',         tone: { bg: 'bg-orange-900/30', text: 'text-orange-300' } },
  documents:     { label: 'Documents',   icon: 'FileText',        tone: { bg: 'bg-cyan-900/30',   text: 'text-cyan-300' } },
  contracts:     { label: 'Contracts',   icon: 'ScrollText',      tone: { bg: 'bg-rose-900/30',   text: 'text-rose-300' } },
  clients:       { label: 'Clients',     icon: 'UserRound',       tone: { bg: 'bg-teal-900/30',   text: 'text-teal-300' } },
  general:       { label: 'General',     icon: 'MessageCircle',   tone: { bg: 'bg-slate-700/40',  text: 'text-slate-200' } },
};

export function getCategoryMeta(category: string | null | undefined): { label: string; icon: string; tone: { bg: string; text: string } } {
  if (!category) return CATEGORY_META.general;
  const key = category.toLowerCase();
  return CATEGORY_META[key] || { label: category, icon: 'Hash', tone: { bg: 'bg-slate-700/40', text: 'text-slate-200' } };
}

function safeParticipants(conv: ConversationRow): ConversationRow['participants'] {
  return Array.isArray(conv.participants) ? conv.participants : [];
}

export function getConversationDisplayName(conv: ConversationRow, currentUserId: number): string {
  if (conv.type === 'group') return conv.displayName || conv.subject || 'Group';
  const others = safeParticipants(conv).filter((p) => p?.user?.id !== currentUserId);
  return others.map((p) => p?.user?.name).filter(Boolean).join(', ') || conv.displayName || 'Conversation';
}

export function getConversationInitials(conv: ConversationRow, currentUserId: number): string {
  if (conv.type === 'group') {
    const name = conv.displayName || conv.subject || 'G';
    return name.split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join('') || 'G';
  }
  const others = safeParticipants(conv).filter((p) => p?.user?.id !== currentUserId);
  const name = others.map((p) => p?.user?.name).filter(Boolean).join(' ') || '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join('') || '?';
}

export function getLastMessagePreview(conv: ConversationRow, currentUserId: number): string {
  const lm = conv.lastMessage;
  if (!lm) return 'No messages yet';
  const ac = lm.attachmentsCount ?? 0;
  let preview = '';
  if (ac > 1) preview = `${ac} photos`;
  else if (ac === 1 && !lm.body) preview = 'Photo';
  else if (ac === 1 && lm.body) preview = lm.body;
  else preview = lm.body || '';
  if (lm.isForwarded) preview = `Forwarded: ${preview}`;
  if (lm.userId === currentUserId) preview = `You: ${preview}`;
  else if (conv.type === 'group' && lm.userName) preview = `${lm.userName}: ${preview}`;
  return preview;
}

export function formatConversationTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function highlightSearchMatch(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!query || !text) return null;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return null;
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length),
  };
}

export function groupMessagesByDateAndSender(messages: MessageRow[]): { label: string; messageIds: number[] }[] {
  const dates: { label: string; messageIds: number[] }[] = [];
  let lastLabel = '';
  for (const msg of messages) {
    const label = dateSeparator(msg.createdAt);
    if (label !== lastLabel) {
      dates.push({ label, messageIds: [msg.id] });
      lastLabel = label;
    } else {
      dates[dates.length - 1].messageIds.push(msg.id);
    }
  }
  return dates;
}

function dateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function isGroupConversation(conv: ConversationRow): boolean {
  return conv.type === 'group';
}

export const CATEGORY_OPTIONS = [
  { id: 'general', label: 'General' },
  { id: 'developers', label: 'Developers' },
  { id: 'finance', label: 'Finance' },
  { id: 'architects', label: 'Architects' },
  { id: 'managers', label: 'Managers' },
  { id: 'site team', label: 'Site team' },
  { id: 'documents', label: 'Documents' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'clients', label: 'Clients' },
  { id: 'custom', label: 'Custom category' },
];
