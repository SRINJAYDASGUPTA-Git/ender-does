import {
    Given,
    Then,
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

import { CustomWorld } from "../support/world";

Given(
    "I open the EnderDoes login page",
    async function (this: CustomWorld) {
        await this.page.goto("/login");
    }
);

Then(
    "I should see the {string} heading",
    async function (
        this: CustomWorld,
        heading: string
    ) {
        await expect(
            this.page.getByRole("heading", {
                name: heading,
            })
        ).toBeVisible();
    }
);