import type { ConversationRow, MessageRow } from '@/features/chat/types';

export function conversationName(conversation: ConversationRow, currentUserId: number): string {
    if (conversation.displayName?.trim()) {
        return conversation.displayName;
    }

    const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
    const others = currentUserId > 0
        ? participants.filter((participant) => participant?.user?.id !== currentUserId)
        : participants;
    const participantNames = others.map((participant) => participant.user?.name).filter(Boolean);

    if (conversation.type === 'group') {
        return conversation.subject || participantNames.join(', ') || 'Group conversation';
    }

    return participantNames[0] || conversation.subject || 'Conversation';
}

export function conversationInitial(conversation: ConversationRow, currentUserId: number): string {
    if (conversation.avatarInitials?.trim()) {
        return conversation.avatarInitials;
    }

    return conversationName(conversation, currentUserId).charAt(0).toUpperCase();
}

export function conversationStatus(conversation: ConversationRow, currentUserId: number): string {
    const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
    const others = currentUserId > 0
        ? participants.filter((participant) => participant?.user?.id !== currentUserId)
        : participants;

    if (conversation.type === 'group') {
        return `${participants.length} member${participants.length === 1 ? '' : 's'}`;
    }

    if (others[0]?.user?.isOnline) return 'Online';

    const lastSeenAt = others[0]?.user?.lastSeenAt;
    if (!lastSeenAt) return '';

    const diff = Date.now() - new Date(lastSeenAt).getTime();
    if (diff < 300000) return 'Online';

    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Last seen ${mins}m ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Last seen ${hours}h ago`;

    return `Last seen ${new Date(lastSeenAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

export function isConversationOnline(conversation: ConversationRow, currentUserId: number): boolean {
    return conversationStatus(conversation, currentUserId) === 'Online';
}

export function messagePreview(message: MessageRow | null): string {
    if (!message) return 'No messages yet';
    if (message.attachmentsCount > 1) return `${message.attachmentsCount} photos`;
    if (message.attachmentsCount === 1 && !message.body) return 'Photo';
    if (message.attachmentsCount === 1 && message.body) return message.body;

    return message.body || '';
}
