import {
    When,
    Then,
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

import { CustomWorld } from "../support/world";

When(
    "I open the settings page",
    async function (this: CustomWorld) {
        await this.page.goto("/settings");

        await expect(
            this.page.getByTestId(
                "settings-page"
            )
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


Then(
    "I should see the settings page",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId(
                "settings-page"
            )
        ).toBeVisible();
    }
);


Then(
    "I should see my email address",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId(
                "settings-email"
            )
        ).toBeVisible();

        await expect(
            this.page.getByTestId(
                "settings-email"
            )
        ).toHaveValue(
            process.env.TEST_USER_EMAIL ??
            "test@example.com"
        );
    }
);


When(
    "I change my name to {string}",
    async function (
        this: CustomWorld,
        name: string
    ) {
        const input =
            this.page.getByTestId(
                "settings-name"
            );

        await expect(input).toBeVisible();

        await input.fill(name);
    }
);


When(
    "I save my settings",
    async function (this: CustomWorld) {
        const responsePromise =
            this.page.waitForResponse(
                response =>
                    response.request().method() ===
                    "PUT" &&
                    response.url().includes(
                        "/users/me"
                    )
            );

        await this.page
            .getByTestId(
                "settings-save"
            )
            .click();

        const response =
            await responsePromise;

        expect(response.ok()).toBeTruthy();

        await expect(
            this.page.getByTestId(
                "settings-success"
            )
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


Then(
    "I should see the settings success message",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId(
                "settings-success"
            )
        ).toContainText(
            "Your profile has been updated."
        );
    }
);


Then(
    "my name should be {string}",
    async function (
        this: CustomWorld,
        name: string
    ) {
        await expect(
            this.page.getByTestId(
                "settings-name"
            )
        ).toHaveValue(name);
    }
);


When(
    "I upload my test profile picture",
    async function (this: CustomWorld) {
        const fileInput =
            this.page.getByTestId(
                "settings-image-input"
            );

        await expect(fileInput).toBeAttached();

        const responsePromise =
            this.page.waitForResponse(
                response =>
                    response.request().method() ===
                    "POST" &&
                    response.url().includes(
                        "/upload/avatar"
                    )
            );

        await fileInput.setInputFiles(
            "tests/fixtures/test-avatar.png"
        );

        const response =
            await responsePromise;

        expect(response.ok()).toBeTruthy();
    }
);


Then(
    "the profile picture upload should complete",
    async function (this: CustomWorld) {
        /*
         * The upload button should no longer be
         * in its uploading state.
         */
        await expect(
            this.page.getByTestId(
                "settings-change-picture"
            )
        ).toBeEnabled({
            timeout: 10000,
        });

        /*
         * Verify that an image URL was populated.
         */
        const avatar =
            this.page.getByTestId(
                "settings-avatar"
            );

        await expect(avatar).toBeVisible();

        await expect(
            avatar.locator("img")
        ).toHaveAttribute(
            "src",
            /.+/
        );
    }
);


Then(
    "I should see my account status",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId(
                "settings-account-status"
            )
        ).toBeVisible();
    }
);


Then(
    "I should see my account lock status",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId(
                "settings-account-locked"
            )
        ).toBeVisible();
    }
);


Then(
    "I should see my account roles",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId(
                "settings-roles"
            )
        ).toBeVisible();
    }
);