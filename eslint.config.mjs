import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import noCommentsPlugin from './eslint-plugin-no-comments.js'

export default tseslint.config(
    // =====================================================
    // GLOBAL IGNORES
    // =====================================================
    {
        ignores: [
            'dist',
            'node_modules',
            '*.config.js',
            '*.config.ts',
        ],
    },

    // =====================================================
    // BASE JS
    // =====================================================
    js.configs.recommended,

    // =====================================================
    // TYPESCRIPT + REACT
    // =====================================================
    {
        files: ['**/*.{ts,tsx}'],

        languageOptions: {
            parser: tseslint.parser,
            globals: globals.browser,
        },

        plugins: {
            react,
            '@typescript-eslint': tseslint.plugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            prettier,
            'no-comments': noCommentsPlugin,
        },

        settings: {
            react: {
                version: 'detect',
            },
        },

        rules: {
            // ---------------------------------
            // Recommended configs
            // ---------------------------------
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...reactRefresh.configs.vite.rules,
            ...prettierConfig.rules,

            // ---------------------------------
            // React modern (17+)
            // ---------------------------------
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react/jsx-no-useless-fragment': 'warn',

            // ---------------------------------
            // Fix React 19 + TS conflicts
            // ---------------------------------
            'no-undef': 'off',

            // ---------------------------------
            // General rules
            // ---------------------------------
            'no-empty': ['warn', { allowEmptyCatch: false }],

            // ---------------------------------
            // TypeScript
            // ---------------------------------
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { varsIgnorePattern: '^[_A-Z]' },
            ],

            // ---------------------------------
            // React Refresh
            // ---------------------------------
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],

            // ---------------------------------
            // Disable React Compiler experimental rule
            // ---------------------------------
            'react-hooks/incompatible-library': 'off',

            // ---------------------------------
            // Custom rules
            // ---------------------------------
            'no-comments/no-empty-jsx': 'error',
            'no-comments/no-empty-blocks': 'warn',
            'no-comments/no-explanatory-comments': 'warn',

            // ---------------------------------
            // Prettier
            // ---------------------------------
            'prettier/prettier': 'error',
        },
    }
)
