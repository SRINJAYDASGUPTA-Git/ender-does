import {
    Before,
    After,
    setDefaultTimeout,
} from "@cucumber/cucumber";
import { chromium } from "playwright";
import { CustomWorld } from "./world";

const BASE_URL =
    process.env.BASE_URL ?? "http://localhost:3000";
setDefaultTimeout(30000);

Before(async function (this: CustomWorld) {
    this.browser = await chromium.launch({
        headless: true,
    });

    this.context = await this.browser.newContext({
        baseURL: BASE_URL,
    });

    this.page = await this.context.newPage();
});

After(async function (this: CustomWorld) {
    await this.context?.close();
    await this.browser?.close();
});