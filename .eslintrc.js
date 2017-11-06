module.exports = {
  parser: 'babel-eslint',
  plugins: [],
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
  },
};
