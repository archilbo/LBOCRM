import { ScrollShadow } from '@heroui/react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { EditorView, keymap } from '@codemirror/view';
import { closeBrackets } from '@codemirror/autocomplete';
import { useTheme } from '@/providers/ThemeProvider';

type TemplateCodeEditorProps = {
    value: string;
    onChange: (value: string) => void;
    language?: 'html' | 'css';
    minHeight?: string;
    placeholder?: string;
    onSave?: () => void;
};

const archilboEditorTheme = EditorView.theme({
    '&': {
        backgroundColor: 'var(--surface)',
        color: 'var(--text)',
    },
    '.cm-content': {
        caretColor: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        padding: '10px 0',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent)' },
    '.cm-gutters': {
        backgroundColor: 'var(--background)',
        color: 'var(--text-muted)',
        borderRight: '1px solid var(--border)',
    },
    '.cm-activeLine, .cm-activeLineGutter': {
        backgroundColor: 'color-mix(in srgb, var(--accent) 6%, transparent)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: 'color-mix(in srgb, var(--accent) 22%, transparent)',
    },
});

export type TemplateCodeEditorHandle = {
    insertAtCursor: (text: string) => void;
};

export const TemplateCodeEditor = forwardRef<TemplateCodeEditorHandle, TemplateCodeEditorProps>(
    function TemplateCodeEditor(
        { value, onChange, language = 'html', minHeight = '180px', placeholder, onSave },
        ref,
    ) {
        const cmRef = useRef<ReactCodeMirrorRef>(null);
        const onSaveRef = useRef(onSave);
        const { theme } = useTheme();

        useEffect(() => {
            onSaveRef.current = onSave;
        }, [onSave]);

        useImperativeHandle(ref, () => ({
            insertAtCursor(text: string) {
                const view = cmRef.current?.view;
                if (!view) return;
                view.dispatch({
                    changes: { from: view.state.selection.main.head, insert: text },
                });
                view.focus();
            },
        }));

        const extensions = useMemo(() => [
            archilboEditorTheme,
            EditorView.lineWrapping,
            closeBrackets(),
            keymap.of([{
                key: 'Mod-s',
                run: () => {
                    onSaveRef.current?.();
                    return true;
                },
            }]),
            language === 'css' ? css() : html(),
        ], [language]);

        return (
            <ScrollShadow
                orientation="vertical"
                className="h-full min-h-0"
                size={16}
            >
                <CodeMirror
                    ref={cmRef}
                    value={value}
                    onChange={(val) => onChange(val)}
                    extensions={extensions}
                    className="min-h-full"
                    minHeight={minHeight === '0' ? undefined : minHeight}
                    placeholder={placeholder}
                    theme={theme}
                    indentWithTab={false}
                    basicSetup={{
                        lineNumbers: true,
                        foldGutter: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        highlightActiveLine: true,
                    }}
                />
            </ScrollShadow>
        );
    },
);

export default TemplateCodeEditor;
