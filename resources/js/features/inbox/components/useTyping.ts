import { useCallback, useEffect, useRef, useState } from 'react';

type TypingUser = { id: number; name: string };

export function useTyping(conversationId: number | null, currentUserId: number) {
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const lastSentRef = useRef(0);
    const pollRef = useRef<ReturnType<typeof setInterval>>();

    // Poll for other users typing every 3 seconds
    useEffect(() => {
        if (!conversationId) { setTypingUsers([]); return; }

        const poll = () => {
            fetch(`/inbox/${conversationId}/typing`)
                .then((r) => r.json())
                .then((data) => {
                    const others = (data.typing || []).filter((u: TypingUser) => u.id !== currentUserId);
                    setTypingUsers(others);
                })
                .catch(() => {});
        };

        poll();
        pollRef.current = setInterval(poll, 3000);
        return () => { clearInterval(pollRef.current); setTypingUsers([]); };
    }, [conversationId, currentUserId]);

    // Send typing signal (debounced to every 3 seconds)
    const sendTyping = useCallback(() => {
        if (!conversationId) return;
        const now = Date.now();
        if (now - lastSentRef.current < 3000) return;
        lastSentRef.current = now;
        fetch(`/inbox/${conversationId}/typing`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
        }).catch(() => {});
    }, [conversationId]);

    return { typingUsers, sendTyping };
}
