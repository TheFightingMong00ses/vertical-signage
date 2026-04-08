//export ESLint configuration, apply to the following files
export default [
  {
    files: ["src/**/*.js"],
    ignores: ["node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
