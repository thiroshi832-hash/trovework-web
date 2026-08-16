import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "prisma/migrations/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { sourceType: "module" },
      globals: { process: "readonly", console: "readonly" },
    },
    rules: {
      // DI and decorator metadata legitimately lean on empty constructors etc.
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    // Test doubles deliberately use `any` to stand in for Prisma's wide types.
    files: ["**/*.spec.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
);
