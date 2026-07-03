import { echo } from '@laravel/echo-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type TypingUser = { id: number; name: string };

export function useTyping(conversationId: number | null, currentUserId: number, currentUserName: string) {
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
    const lastSentRef = useRef(0);

    useEffect(() => {
        if (!conversationId) {
            setTypingUsers([]);
            return;
        }

        const channel = echo().private(`conversation.${conversationId}`);

        const handler = (payload: any) => {

            const userId = Number(payload?.user?.id);
            if (!userId || userId === currentUserId) return;

            const user = {
                id: userId,
                name: payload?.user?.name || 'User',
            };

            setTypingUsers((prev) => {
                const without = prev.filter((item) => item.id !== user.id);
                return [...without, user];
            });

            if (timersRef.current[user.id]) {
                clearTimeout(timersRef.current[user.id]);
            }

            timersRef.current[user.id] = setTimeout(() => {
                setTypingUsers((prev) => prev.filter((item) => item.id !== user.id));
                delete timersRef.current[user.id];
            }, 2200);
        };

        const allEventsHandler = (event: string, payload: any) => {
            const normalizedEvent = event.replace(/^\./, '');
            if (normalizedEvent === 'client-typing') handler(payload);
        };

        channel.error((error: any) => console.error('[chat] typing subscription error', conversationId, error));
        channel.listenForWhisper('typing', handler);
        channel.listenToAll(allEventsHandler);

        return () => {
            channel.stopListeningForWhisper('typing', handler);
            channel.stopListeningToAll(allEventsHandler);
            Object.values(timersRef.current).forEach(clearTimeout);
            timersRef.current = {};
            setTypingUsers([]);
        };
    }, [conversationId, currentUserId]);

    const sendTyping = useCallback(() => {
        if (!conversationId || !currentUserId) return;

        const now = Date.now();
        if (now - lastSentRef.current < 700) return;
        lastSentRef.current = now;


        echo().private(`conversation.${conversationId}`).whisper('typing', {
            user: {
                id: currentUserId,
                name: currentUserName || 'User',
            },
        });
    }, [conversationId, currentUserId, currentUserName]);

    return { typingUsers, sendTyping };
}
