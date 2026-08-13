import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
    { ignores: ['public/build/**', 'vendor/**', 'node_modules/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: { 'react-hooks': reactHooks },
        rules: {
            ...reactHooks.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            'no-empty': 'warn',
            'no-useless-assignment': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
            // React Compiler diagnostics require compiler-ready component boundaries.
            // Keep them visible while the existing application is migrated incrementally.
            'react-hooks/purity': 'warn',
            'react-hooks/refs': 'warn',
            'react-hooks/static-components': 'warn',
            'react-hooks/immutability': 'warn',
        },
    },
    {
        files: ['resources/js/**/*.{ts,tsx}'],
    },
);
