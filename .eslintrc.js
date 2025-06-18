module.exports = [
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                browser: true,
                es2021: true,
            },
        },
        plugins: {
            react: require("eslint-plugin-react"),
            prettier: require("eslint-plugin-prettier"),
            "unused-imports": require("eslint-plugin-unused-imports"),
        },
        rules: {
            "react/prop-types": "off",
            "prettier/prettier": "error",
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
            "no-unused-vars": [
                "error",
                {
                    vars: "all",
                    args: "none",
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
];
