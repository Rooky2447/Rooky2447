import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default [
    {
        ignores: ["build/**", "node_modules/**", "public/**"],
    },
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: { ...globals.browser, ...globals.node },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "jsx-a11y": jsxA11y,
        },
        settings: { react: { version: "detect" } },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            // French content uses apostrophes liberally — escaping every one hurts readability
            "react/no-unescaped-entities": "off",
            // Pre-existing shadcn UI uses cmdk-input-wrapper custom attribute
            "react/no-unknown-property": ["error", { ignore: ["cmdk-input-wrapper"] }],
            // Setting state in useEffect for data loading is a valid React pattern
            "react-hooks/set-state-in-effect": "off",
            // shadcn UI's Calendar internally defines render-prop components — acceptable
            "react/no-unstable-nested-components": ["warn", { allowAsProps: true }],
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        },
    },
    {
        // Pre-existing shadcn UI components — keep relaxed
        files: ["src/components/ui/**/*.{js,jsx}"],
        rules: {
            "react/no-unknown-property": "off",
            "react/no-unstable-nested-components": "off",
            "no-unused-vars": "off",
        },
    },
];
