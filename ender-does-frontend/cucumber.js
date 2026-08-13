module.exports = {
    default: {
        paths: ["tests/features/**/*.feature"],

        require: [
            "tests/support/env.ts",
            "tests/support/**/*.ts",
            "tests/step-definitions/**/*.ts",
        ],

        requireModule: ["tsx"],

        format: [
            "progress",
            "html:reports/cucumber/cucumber-report.html",
        ],

        publishQuiet: true,
        timeout: 30000,
    },
};