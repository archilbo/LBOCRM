import { MessageSquare, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ConversationRow, MessageRow } from '@/features/chat/types';

type Props = {
    conversation: ConversationRow | null;
    messages: MessageRow[];
    loading: boolean;
    messageBody: string;
    onMessageBodyChange: (body: string) => void;
    onSend: () => void;
};

export function MessageThread({ conversation, messages, loading, messageBody, onMessageBodyChange, onSend }: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!conversation) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                    <MessageSquare size={40} className="mx-auto text-[var(--crm-muted)]" />
                    <p className="mt-3 text-sm text-[var(--crm-text-muted)]">Select a conversation</p>
                </div>
            </div>
        );
    }

    const userId = (window as any).userId;
    const parts = Array.isArray(conversation.participants) ? conversation.participants : [];
    const otherName = parts.filter((p) => p?.user?.name !== 'You').map((p) => p?.user?.name).filter(Boolean).join(', ');

    return (
        <>
            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] px-4 py-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                    {(() => { const o = parts.find((x) => x?.user?.name !== 'You'); return o?.user?.name?.charAt(0)?.toUpperCase() || '?'; })()}
                </div>
                <div>
                    <p className="text-sm font-semibold text-[var(--crm-text)]">{otherName || conversation.subject || 'Conversation'}</p>
                    {conversation.subject ? <p className="text-xs text-[var(--crm-text-muted)]">{conversation.subject}</p> : null}
                </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {loading ? <p className="text-center text-xs text-[var(--crm-text-muted)]">Loading...</p> : null}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-3 py-2 ${msg.userId === userId ? 'bg-[var(--crm-gold)] text-black' : 'border border-[var(--crm-border)] bg-[var(--crm-surface-2)]'}`}>
                            <p className="text-xs font-semibold opacity-70">{msg.userName}</p>
                            <p className="mt-0.5 text-sm">{msg.body}</p>
                            <p className="mt-0.5 text-right text-[10px] opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-[var(--crm-border)] p-3">
                <input value={messageBody} onChange={(e) => onMessageBodyChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                    placeholder="Type a message..." className="crm-command-input h-10 flex-1 px-3 text-sm" />
                <button type="button" onClick={onSend} disabled={!messageBody.trim()}
                    className="flex size-10 items-center justify-center rounded-xl bg-[var(--crm-gold)] text-black disabled:opacity-40">
                    <Send size={16} />
                </button>
            </div>
        </>
    );
}
