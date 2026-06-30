export type ConversationRow = {
    id: number;
    type: 'direct' | 'group';
    subject: string | null;
    participants: { id: number; user: { id: number; name: string }; lastReadAt: string | null }[];
    lastMessage: { id: number; body: string; createdAt: string; user: { id: number; name: string } } | null;
    lastMessageAt: string | null;
    unreadCount: number;
    createdAt: string;
};

export type MessageRow = {
    id: number;
    body: string;
    isEdited: boolean;
    userId: number;
    userName: string;
    readBy: number[];
    createdAt: string;
};

export type ChatUserOption = {
    id: number;
    name: string;
    email: string;
};
