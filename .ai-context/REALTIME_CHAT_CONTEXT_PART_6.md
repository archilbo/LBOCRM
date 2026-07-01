[replyTo, setReplyTo] = useState<MessageRow | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState<{ images: { url: string; originalFilename: string }[]; index: number } | null>(null);
    const [forwardMsg, setForwardMsg] = useState<MessageRow | null>(null);
    const [editingMsg, setEditingMsg] = useState<MessageRow | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
    const [groupSubject, setGroupSubject] = useState(conversation.subject || '');
    const [addUserId, setAddUserId] = useState('');
    const [availableUsers, setAvailableUsers] = useState<{ id: number; name: string }[]>([]);
    const [infoPanelOpen, setInfoPanelOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [searchIndex, setSearchIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { typingUsers, sendTyping } = useTyping(conversation?.id ?? null, currentUserId);

    useEffect(() => {
        if (messages.length > 0) {
            const lastId = messages[messages.length - 1].id;
            if (lastId !== prevLastId.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            prevLastId.current = lastId;
        }
    }, [messages]);

    useEffect(() => {
        if (!searchQuery) { setSearchResults([]); setSearchIndex(0); return; }
        const q = searchQuery.toLowerCase();
        const ids = messages.filter((m) => (m.body || '').toLowerCase().includes(q) || (m.userName || '').toLowerCase().includes(q) || (m.replyTo?.body || '').toLowerCase().includes(q)).map((m) => m.id);
        setSearchResults(ids);
        setSearchIndex(0);
    }, [searchQuery, messages]);

    useEffect(() => {
        if (searchResults.length > 0 && searchIndex < searchResults.length) {
            const el = document.getElementById(`msg-${searchResults[searchIndex]}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [searchResults, searchIndex]);

    const parts = Array.isArray(conversation.participants) ? conversation.participants : [];
    const others = parts.filter((p) => p?.user?.id !== currentUserId);
    const otherName = getConversationDisplayName(conversation, currentUserId);
    const isGroup = conversation.type === 'group';
    const catMeta = getCategoryMeta(isGroup ? conversation.category : null);

    const statusLine = useMemo(() => {
        if (isGroup) {
            const pc = conversation.participantsCount ?? parts.length;
            const oc = conversation.onlineCount ?? parts.filter((p) => p?.user?.lastSeenAt && Date.now() - new Date(p.user.lastSeenAt).getTime() < 300000).length;
            return `${pc} member${pc !== 1 ? 's' : ''}${oc > 0 ? ` · ${oc} online` : ''}`;
        }
        const other = others[0];
        if (!other) return '';
        const ls = other.user?.lastSeenAt;
        if (!ls) return '';
        const diff = Date.now() - new Date(ls).getTime();
        if (diff < 300000) return 'Online';
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `Last seen ${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `Last seen ${hours}h ago`;
        return `Last seen ${new Date(ls).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }, [conversation, others, parts, isGroup]);

    const handleSend = useCallback(async () => {
        const body = text.trim();
        if (!body && selectedImages.length === 0) return;
        if (sending) return;
        setSending(true);
        try {
            await onSend(body, selectedImages, replyTo?.id);
            setText(''); setSelectedImages([]); setReplyTo(null);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { /* handled */ } finally { setSending(false); }
    }, [text, selectedImages, replyTo, sending, onSend]);

    const handleUpdate = useCallback(async () => {
        const body = text.trim();
        if (!body || !editingMsg || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${editingMsg.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ body }) });
            if (!res.ok) { toast.error('Failed to update message'); return; }
            const updated: MessageRow = await res.json();
            onMessageUpdate?.(updated);
            setEditingMsg(null); setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { toast.error('Failed to update message'); } finally { setSending(false); }
    }, [text, editingMsg, sending, conversation.id, onMessageUpdate]);

    const handleEdit = useCallback((msg: MessageRow) => {
        setEditingMsg(msg); setText(msg.body || ''); setReplyTo(null); setSelectedImages([]);
        setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } }, 0);
    }, []);

    const handleDelete = useCallback((msg: MessageRow) => {
        if (deleteConfirmId === msg.id) {
            fetch(`/inbox/${conversation.id}/messages/${msg.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then((res) => { if (res.ok) onMessageDelete?.(msg.id); }).catch(() => {});
            setDeleteConfirmId(null);
        } else { setDeleteConfirmId(msg.id); setTimeout(() => setDeleteConfirmId(null), 3000); }
    }, [deleteConfirmId, conversation.id, onMessageDelete]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (editingMsg) handleUpdate(); else handleSend(); }
        if (e.key === 'Escape' && editingMsg) { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }
    }, [handleSend, handleUpdate, editingMsg]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files].slice(0, 10));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const removeImage = useCallback((i: number) => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i)), []);
    const handleImageClick = useCallback((attachments: MessageAttachmentRow[], index: number) => {
        const images = attachments.filter((a) => a.url).map((a) => ({ url: a.url!, originalFilename: a.originalFilename }));
        if (images.length > 0) setLightboxOpen({ images, index });
    }, []);

    const handleForward = useCallback(async (convIds: number[]) => {
        if (!forwardMsg) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${forwardMsg.id}/forward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: JSON.stringify({ conversation_ids: convIds }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.forwarded) {
                    toast.success(`Forwarded to ${convIds.length} conversation${convIds.length > 1 ? 's' : ''}`);
                }
            } else {
                toast.error('Failed to forward message');
            }
            setForwardMsg(null);
        } catch { toast.error('Failed to forward message'); }
    }, [forwardMsg, conversation.id]);

    const handleRenameGroup = useCallback(async () => {
        if (!groupSubject.trim() || !isGroup) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ subject: groupSubject.trim() }) });
            if (res.ok) { toast.success('Group renamed'); setGroupSettingsOpen(false); }
        } catch { toast.error('Failed to rename group'); }
    }, [conversation.id, isGroup, groupSubject]);

    const handleAddParticipant = useCallback(async () => {
        if (!addUserId) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ user_id: Number(addUserId) }) });
            if (res.ok) { toast.success('Participant added'); setAddUserId(''); setAvailableUsers([]); }
        } catch { toast.error('Failed to add participant'); }
    }, [conversation.id, addUserId]);

    const handleRemoveParticipant = useCallback(async (userId: number) => {
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants/${userId}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } });
            if (res.ok) toast.success('Participant removed');
        } catch { toast.error('Failed to remove participant'); }
    }, [conversation.id]);

    const openGroupSettings = useCallback(() => {
        setGroupSubject(conversation.subject || '');
        setAvailableUsers(pageUsers.filter((u) => !parts.some((p) => p?.user?.id === u.id)));
        setGroupSettingsOpen(true);
    }, [conversation.subject, parts, pageUsers]);

    const groupedDates = useMemo(() => {
        const dates: { label: string; messageIds: number[] }[] = [];
        let lastLabel = '';
        for (const msg of messages) {
            const label = dateSeparator(msg.createdAt);
            if (label !== lastLabel) { dates.push({ label, messageIds: [msg.id] }); lastLabel = label; }
            else { dates[dates.length - 1].messageIds.push(msg.id); }
        }
        return dates;
    }, [messages]);

    const canSend = editingMsg ? text.trim().length > 0 : text.trim().length > 0 || selectedImages.length > 0;
    const avatarTone = getAvatarTone(isGroup ? conversation.id : otherName + currentUserId);

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                <div className="relative shrink-0">
                    {isGroup ? (
                        <div className={`flex size-9 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={16} /></div>
                    ) : (
                        <div className={`flex size-9 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                    )}
                    {!isGroup && others.length === 1 && statusLine === 'Online' ? (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-surface)] bg-emerald-400" />
                    ) : null}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{otherName}</p>
                        {isGroup && conversation.category ? (
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span>
                        ) : null}
                    </div>
                    {statusLine ? <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p> : null}
                </div>
                {searchOpen ? (
                    <div className="flex items-center gap-1">
                        <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search messages..." autoFocus
                            className="h-7 w-40 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 text-[10px] text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                        {searchResults.length > 0 ? <span className="text-[9px] text-[var(--crm-text-muted)] shrink-0">{searchIndex + 1}/{searchResults.length}</span> : null}
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.max(i - 1, 0)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronDown size={12} /></button>
                        <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={12} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Search size={14} /></button>
                        <button type="button" onClick={() => setInfoPanelOpen(!infoPanelOpen)} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Info size={14} /></button>
                        {isGroup ? <button type="button" onClick={openGroupSettings} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Settings size={14} /></button> : null}
                    </div>
                )}
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Messages area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none" onScroll={onScroll}>
                        {loading ? (
                            <div className="flex items-center justify-center py-8"><div className="size-5 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <MessageSquare size={32} className="text-[var(--crm-muted)]" />
                                <p className="mt-2 text-xs text-[var(--crm-text-muted)]">No messages yet</p>
                                <p className="mt-0.5 text-[10px] text-[var(--crm-muted)]">Send a message to start the conversation</p>
                            </div>
                        ) : (
                            <>
                                {paginator && paginator.currentPage < paginator.lastPage ? (
                                    <div className="flex justify-center py-3">
                                        <button type="button" onClick={onLoadOlder} disabled={loadingOlder}
                                            className="flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-1 text-[9px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition disabled:opacity-50">
                                            {loadingOlder ? <div className="size-3 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /> : null}
                                            {loadingOlder ? 'Loading...' : `Load older messages (${paginator.total - (paginator.currentPage * paginator.perPage) > 0 ? paginator.total - (paginator.currentPage * paginator.perPage) : 0} more)`}
                                        </button>
                                    </div>
                                ) : null}
                                {groupedDates.map((group) => (
                                    <div key={group.label}>
                                        <div className="flex items-center justify-center py-3">
                                            <span className="rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-0.5 text-[9px] font-semibold text-[var(--crm-text-muted)]">{group.label}</span>
                                        </div>
                                        {group.messageIds.map((msgId, idx) => {
                                            const msg = messages.find((m) => m.id === msgId)!;
                                            const prev = idx > 0 ? messages.find((m) => m.id === group.messageIds[idx - 1]) : undefined;
                                            const isSearchResult = searchResults.includes(msg.id);
                                            return (
                                                <div k