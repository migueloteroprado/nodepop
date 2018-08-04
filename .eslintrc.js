module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "browser": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "warn",
            "always"
        ],
        "globals": {},
        "strict": "error",
        "global-strict": true,
        "quotmark": "single",
        "undef": true,
        "unused": true,
        "no-console": "off",
        "no-unused-vars": [
            "warn", {
                "vars": "all", 
                "args": "after-used"
            }
        ]
    }
};


