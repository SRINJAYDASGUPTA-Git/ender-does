const timestamp = new Date()
    .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    })
    .replace(/[/:,\s]/g, "-");

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
            `html:reports/cucumber/cucumber-report-${timestamp}.html`,
        ],

        publishQuiet: true,
        timeout: 30000,
    },
};