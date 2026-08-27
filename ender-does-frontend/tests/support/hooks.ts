import {After, AfterAll, Before, BeforeAll, setDefaultTimeout,} from "@cucumber/cucumber";

import {Browser, chromium, Page} from "playwright";

import {CustomWorld} from "./world";

const BASE_URL =
    process.env.BASE_URL ?? "http://localhost:3000";

setDefaultTimeout(30000);

let browser: Browser;

const TEST_EMAIL =
    process.env.TEST_USER_EMAIL ??
    "test@example.com";

const TEST_PASSWORD =
    process.env.TEST_USER_PASSWORD ??
    "password";
async function purgeAllTodos(page: Page) {
    console.log("🧹 Starting final Todo purge...");

    await page.goto("/login");

    await page
        .getByTestId("login-email")
        .fill(TEST_EMAIL);

    await page
        .getByTestId("login-password")
        .fill(TEST_PASSWORD);

    await page
        .getByTestId("login-submit")
        .click();

    await page.waitForURL("**/dashboard", {
        timeout: 10000,
    });

    console.log("🧹 Authenticated for purge");

    const todos = await page.evaluate(async () => {
        const response = await fetch("/api/todos/");

        if (!response.ok) {
            throw new Error(
                `Failed to fetch todos: ${response.status}`
            );
        }

        return response.json();
    });

    console.log(
        `🧹 Found ${todos.length} todos`
    );

    for (const todo of todos) {
        const response = await page.evaluate(
            async (id) => {
                const result = await fetch(
                    `/api/todos/${id}`,
                    {
                        method: "DELETE",
                    }
                );

                return {
                    status: result.status,
                    ok: result.ok,
                };
            },
            todo.id
        );

        if (!response.ok) {
            throw new Error(
                `Failed to delete todo ${todo.id}: ${response.status}`
            );
        }
    }

    console.log(
        `🧹 Deleted ${todos.length} todos`
    );
}

BeforeAll(async function () {
    browser = await chromium.launch({
        headless: true,
    });
});

Before(async function (this: CustomWorld) {
    this.browser = browser;

    this.context =
        await browser.newContext({
            baseURL: BASE_URL,
        });

    this.page =
        await this.context.newPage();
});

After(async function (this: CustomWorld) {
    await this.context?.close();
});

AfterAll(async function () {
    console.log("🧹 Running final Todo purge...");

    const context = await browser.newContext({
        baseURL: BASE_URL,
    });

    const page = await context.newPage();

    try {
        await purgeAllTodos(page);
    } catch (error) {
        console.error(
            "❌ Final Todo purge failed:",
            error
        );
    } finally {
        if (context) {
            await context.close();
            await browser.close();
        }
        console.log("🧹 Browser closed.");
    }
});