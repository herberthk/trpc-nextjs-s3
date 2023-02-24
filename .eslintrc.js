module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    jsx: true,
    useJSXTextNode: true,
    ecmaVersion: 2017,
    sourceType: "module",
  },
  plugins: ["unused-imports", "@typescript-eslint"],
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "prettier",
  ],
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    // quotes: ['error', 'single'],
    "no-console": "warn",
    "no-empty": "warn",
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
};
