module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'react/react-in-jsx-scope': 'off', // This disables the React import requirement
        'react/jsx-uses-react': 'off',     // This is also needed for React 17+
        '@typescript-eslint/no-unused-vars': 'off', // This disables the unused variables warning
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};