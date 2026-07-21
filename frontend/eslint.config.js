import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        localStorage: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "react/prop-types": "off"
    },
  },
];
