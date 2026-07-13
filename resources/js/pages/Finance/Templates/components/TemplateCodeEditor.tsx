import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { closeBrackets } from '@codemirror/autocomplete';

type TemplateCodeEditorProps = {
    value: string;
    onChange: (value: string) => void;
    language?: 'html' | 'css';
    minHeight?: string;
    placeholder?: string;
    onSave?: () => void;
};

export type TemplateCodeEditorHandle = {
    insertAtCursor: (text: string) => void;
};

export const TemplateCodeEditor = forwardRef<TemplateCodeEditorHandle, TemplateCodeEditorProps>(
    function TemplateCodeEditor(
        { value, onChange, language = 'html', minHeight = '180px', placeholder, onSave },
        ref,
    ) {
        const cmRef = useRef<ReactCodeMirrorRef>(null);

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

        const extensions = [
            oneDark,
            EditorView.lineWrapping,
            closeBrackets(),
            language === 'css' ? css() : html(),
        ];

        return (
            <CodeMirror
                ref={cmRef}
                value={value}
                onChange={(val) => onChange(val)}
                extensions={extensions}
                height="100%"
                minHeight={minHeight === '0' ? undefined : minHeight}
                placeholder={placeholder}
                theme="dark"
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
        );
    },
);

export default TemplateCodeEditor;
