module.exports = {
  root: true,

  parserOptions: {
    sourceType: 'script',
  },

  env: {
    browser: false,
    node: true,
  },

  plugins: ['node'],

  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],

  rules: {},
};
