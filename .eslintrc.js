module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:cypress/recommended'],
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'import/order': [
      1,
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'external',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: false },
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-param-reassign': 'off',
    'no-throw-literal': 'off',
    'no-useless-escape': 'off',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
  },
};
