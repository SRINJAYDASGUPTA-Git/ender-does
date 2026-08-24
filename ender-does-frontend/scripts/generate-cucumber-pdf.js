const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

async function main() {
    const reportDir = path.resolve("reports/cucumber");

    const files = fs
        .readdirSync(reportDir)
        .filter(
            (file) =>
                file.startsWith("cucumber-report-") &&
                file.endsWith(".html")
        )
        .map((file) => ({
            file,
            path: path.join(reportDir, file),
            time: fs.statSync(path.join(reportDir, file)).mtimeMs,
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
        throw new Error("No Cucumber HTML report found.");
    }

    const html = files[0];
    const pdfPath = html.path.replace(/\.html$/, ".pdf");

    console.log(`HTML report: ${html.path}`);
    console.log(`PDF report:  ${pdfPath}`);

    const browser = await chromium.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        await page.goto(`file://${html.path}`, {
            waitUntil: "networkidle",
        });

        await page.evaluate(async () => {
            while (true) {
                const collapsed = Array.from(
                    document.querySelectorAll(
                        'button[aria-expanded="false"]'
                    )
                );

                if (collapsed.length === 0) {
                    break;
                }

                for (const button of collapsed) {
                    button.click();

                    // Give the report time to render newly revealed content.
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            }
        });

        // console.log(
        //     `Expanded ${collapsedButtons.length} report sections.`
        // );

        /*
         * Give the browser time to finish the DOM/layout changes
         * before Chromium prints the page.
         */
        await page.waitForTimeout(1000);

        await page.pdf({
            path: pdfPath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                right: "15mm",
                bottom: "15mm",
                left: "15mm",
            },
        });
    } finally {
        await browser.close();
    }

    console.log(`PDF generated successfully: ${pdfPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});