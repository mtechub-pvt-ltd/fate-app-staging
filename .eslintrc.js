module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb', 'plugin:prettier/recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Enforces the use of single quotes for strings
    quotes: ['error', 'single'],

    // Disallow semicolons as statement terminators
    semi: ['error', 'never'],

    // Enforces consistent indentation with 2 spaces
    indent: ['error', 2],

    // Enforces the use of strict mode directives
    strict: ['error', 'never'],

    // Disallows unused variables
    'no-unused-vars': 'warn',

    // Enforce the consistent use of either backticks, double, or single quotes
    'jsx-quotes': ['error', 'prefer-double'],

    // Enforces spacing inside of curly braces in JSX attributes
    'react/jsx-curly-spacing': ['error', { when: 'never', children: true }],

    // Enforces the use of a trailing comma in object and array literals
    'comma-dangle': ['error', 'always-multiline'],

    // Prevent missing displayName in a React component definition
    'react/display-name': 'off',

    // Prevents usage of .bind() and arrow functions in JSX props
    'react/jsx-no-bind': 'warn',

    // Enforces a specific function type for function components
    'react/function-component-definition': ['error', { namedComponents: 'arrow-function' }],

    // Enforce a defaultProps definition for every prop that is not a required prop
    'react/require-default-props': 'off',

    // Prevents missing props validation in a React component definition
    'react/prop-types': 'off',

    // Enforces hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
