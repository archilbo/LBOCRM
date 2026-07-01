ey={msg.id} id={`msg-${msg.id}`} className={`msg-slide-in ${isSearchResult ? (searchResults[searchIndex] === msg.id ? 'ring-2 ring-[var(--crm-gold)]/50 rounded-lg' : 'ring-1 ring-[var(--crm-gold)]/20 rounded-lg') : ''}`}>
                                                    <MessageBubble msg={msg} isMine={msg.userId === currentUserId} grouped={shouldGroup(prev, msg)} isGroup={isGroup}
                                                        currentUserId={currentUserId} onReply={setReplyTo} onForward={setForwardMsg} onImageClick={handleImageClick}
                                                        onEdit={handleEdit} onDelete={handleDelete} searchQuery={searchQuery} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Reply preview in composer */}
                    {replyTo && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-[var(--crm-gold)]" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-[var(--crm-gold)]">Replying to {replyTo.userName || 'a message'}</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{replyTo.body || (replyTo.attachments && replyTo.attachments.length > 0 ? 'Photo' : '')}</p>
                            </div>
                            <button type="button" onClick={() => setReplyTo(null)} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Editing bar */}
                    {editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-emerald-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-emerald-400">Editing message</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{editingMsg.body || ''}</p>
                            </div>
                            <button type="button" onClick={() => { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Image previews */}
                    {selectedImages.length > 0 ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 overflow-x-auto shrink-0">
                            {selectedImages.map((file, i) => (
                                <div key={i} className="relative shrink-0">
                                    <img src={URL.createObjectURL(file)} alt="" className="size-14 rounded-lg object-cover border border-[var(--crm-border)]" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"><X size={8} /></button>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-1.5 shrink-0">
                            <div className="flex items-center gap-1">
                                {typingUsers.slice(0, 2).map((u) => (
                                    <span key={u.id} className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[7px] font-bold text-[var(--crm-gold)]">
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-[var(--crm-text-muted)]">
                                {typingUsers.length === 1 ? `${typingUsers[0].name} is typing` :
                                    typingUsers.length === 2 ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing` :
                                    `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`}
                                <span className="inline-flex items-center gap-0.5 ml-1">
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                </span>
                            </p>
                        </div>
                    ) : null}

                    {/* Composer */}
                    <div className="flex items-end gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                        {!editingMsg ? <button type="button" onClick={() => fileInputRef.current?.click()} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><ImageIcon size={18} /></button> : <div className="size-9 shrink-0" />}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageSelect} />
                        <div className="relative flex-1">
                            <textarea ref={textareaRef} value={text} onChange={(e) => { setText(e.target.value); sendTyping(); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} onKeyDown={handleKeyDown}
                                placeholder="Type a message..." rows={1}
                                className="min-h-[36px] w-full resize-none rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-3 py-2 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" style={{ lineHeight: '1.4' }} />
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            {text.trim().length > 0 && !editingMsg ? (
                                <div className="flex items-center gap-0.5">
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-gold)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-gold)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-gold)]" />
                                </div>
                            ) : null}
                            <button type="button" onClick={editingMsg ? handleUpdate : handleSend} disabled={!canSend || sending}
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold)] text-black disabled:opacity-40 transition hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0">
                                {sending ? <div className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : editingMsg ? <Check size={16} /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info panel */}
                {infoPanelOpen ? (
                    <div className="w-72 shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-surface)] overflow-y-auto scrollbar-none">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--crm-border)]">
                            <p className="text-xs font-bold text-[var(--crm-text)]">Info</p>
                            <button type="button" onClick={() => setInfoPanelOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                        {isGroup ? (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={24} /></div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    {conversation.category ? <span className={`rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span> : null}
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide">Participants</p>
                                    <div className="space-y-1.5">
                                        {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => {
                                            const ls = p?.user?.lastSeenAt;
                                            const isOnline = ls && Date.now() - new Date(ls).getTime() < 300000;
                                            return (
                                                <div key={p.id} className="flex items-center gap-2">
                                                    <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-[var(--crm-muted)]'}`} />
                                                    <span className="text-xs text-[var(--crm-text)]">{p.user?.name}</span>
                                                    {!isOnline && ls ? <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(ls)}</span> : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                                <div className="space-y-1.5">
                                    <button type="button" onClick={() => { fetch(`/inbox/${conversation.id}/archive`, { method: 'POST', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then(() => window.location.reload()); }}
                                        className="w-full rounded-lg bg-[var(--crm-surface-2)] px-3 py-2 text-[10px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition text-left">Archive conversation</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-lg font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                                <div className="space-y-1.5">
                                    <button type="button" onClick={() => { fetch(`/inbox/${conversation.id}/archive`, { method: 'POST', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then(() => window.location.reload()); }}
                                        className="w-full rounded-lg bg-[var(--crm-surface-2)] px-3 py-2 text-[10px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition text-left">Archive conversation</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {lightboxOpen ? <Lightbox images={lightboxOpen.images} initialIndex={lightboxOpen.index} onClose={() => setLightboxOpen(null)} /> : null}
            {forwardMsg ? <ForwardModal conversations={conversations} currentUserId={currentUserId} onClose={() => setForwardMsg(null)} onForward={handleForward} /> : null}
            {groupSettingsOpen ? (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" onClick={() => setGroupSettingsOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                            <p className="text-sm font-bold text-[var(--crm-text)]">Group settings</p>
                            <button type="button" onClick={() => setGroupSettingsOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={16} /></button>
                        </div>
                        <div className="px-4 py-3 space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Group name</p>
                                <div className="flex gap-2">
                                    <input value={groupSubject} onChange={(e) => setGroupSubject(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                                    <button type="button" onClick={handleRenameGroup} className="h-8 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black hover:brightness-110 transition">Save</button>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Participants</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => (
                                        <div key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--crm-surface)] px-3 py-2">
                                            <span className="text-xs font-semibold text-[var(--crm-text)]">{p.user?.name}</span>
                                            <button type="button" onClick={() => handleRemoveParticipant(p.user!.id)} className="text-[var(--crm-text-muted)] hover:text-red-400 transition"><UserMinus size={13} /></button>
                                        </div>
                                    ))}
          