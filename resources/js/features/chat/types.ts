export type ParticipantUser = {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string | null;
    lastSeenAt?: string | null;
    isOnline?: boolean;
};

export type ConversationParticipant = {
    id: number;
    user: ParticipantUser;
    lastReadAt: string | null;
    archivedAt: string | null;
};

export type ConversationRow = {
    id: number;
    type: 'direct' | 'group';
    subject: string | null;
    category: string | null;
    displayName: string;
    avatarInitials: string;
    participants: ConversationParticipant[];
    participantsCount?: number;
    onlineCount?: number;
    lastMessage: MessageRow | null;
    lastMessageAt: string | null;
    unreadCount: number;
    archivedAt: string | null;
    createdAt: string;
};

export type MessageAttachmentRow = {
    id: number;
    originalFilename: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string | null;
    thumbnailUrl: string | null;
    createdAt: string;
};

export type MessageReplyPreview = {
    id: number;
    body: string | null;
    userId: number;
    userName: string | null;
    attachmentsCount: number;
};

export type MessageForwardedFrom = {
    id: number;
    body: string | null;
    userId: number;
    userName: string | null;
};

export type MessageRow = {
    id: number;
    body: string | null;
    isEdited: boolean;
    isForwarded: boolean;
    forwardedFromMessageId: number | null;
    forwardedFrom: MessageForwardedFrom | null;
    userId: number;
    userName: string | null;
    user?: { id: number; name: string };
    readBy: number[];
    replyTo: MessageReplyPreview | null;
    attachments: MessageAttachmentRow[];
    attachmentsCount: number;
    createdAt: string;
    updatedAt: string;
};

export type ChatUserOption = {
    id: number;
    name: string;
    email: string;
};
