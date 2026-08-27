import {
    Given,
    When,
    Then,
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

import { CustomWorld } from "../support/world";

const TEST_EMAIL =
    process.env.TEST_USER_EMAIL ??
    "test@example.com";

const TEST_PASSWORD =
    process.env.TEST_USER_PASSWORD ??
    "password";

const INVALID_EMAIL =
    "invalid-e2e@enderdoes.local";

const INVALID_PASSWORD =
    "definitely-wrong-password";

Given(
    "I open the EnderDoes login page",
    async function (this: CustomWorld) {
        await this.page.goto("/login");

        await expect(
            this.page.getByTestId("login-form")
        ).toBeVisible();
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
                exact: true,
            })
        ).toBeVisible();
    }
);

Then(
    "I should see the login form",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId("login-form")
        ).toBeVisible();

        await expect(
            this.page.getByTestId("login-email")
        ).toBeVisible();

        await expect(
            this.page.getByTestId("login-password")
        ).toBeVisible();

        await expect(
            this.page.getByTestId("login-submit")
        ).toBeVisible();
    }
);

When(
    "I log in with my test account",
    async function (this: CustomWorld) {
        await this.page
            .getByTestId("login-email")
            .fill(TEST_EMAIL);

        await this.page
            .getByTestId("login-password")
            .fill(TEST_PASSWORD);

        await this.page
            .getByTestId("login-submit")
            .click();

        await this.page.waitForURL(
            "**/dashboard",
            {
                timeout: 10000,
            }
        );
    }
);

Then(
    "I should be redirected to the dashboard",
    async function (this: CustomWorld) {
        await expect(
            this.page
        ).toHaveURL(/\/dashboard$/);

        // await expect(
        //     this.page.getByTestId("dashboard-progress-card")
        // ).toBeVisible();
    }
);

When(
    "I attempt to log in with invalid credentials",
    async function (this: CustomWorld) {
        await this.page
            .getByTestId("login-email")
            .fill(INVALID_EMAIL);

        await this.page
            .getByTestId("login-password")
            .fill(INVALID_PASSWORD);

        await this.page
            .getByTestId("login-submit")
            .click();
    }
);

Then(
    "I should see a login error",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId("login-error")
        ).toBeVisible();
    }
);

Given(
    "I open the EnderDoes registration page",
    async function (this: CustomWorld) {
        await this.page.goto("/register");

        await expect(
            this.page.getByTestId("register-form")
        ).toBeVisible();
    }
);

Then(
    "I should see the registration form",
    async function (this: CustomWorld) {
        await expect(
            this.page.getByTestId("register-form")
        ).toBeVisible();

        await expect(
            this.page.getByTestId("register-name")
        ).toBeVisible();

        await expect(
            this.page.getByTestId("register-email")
        ).toBeVisible();

        await expect(
            this.page.getByTestId("register-password")
        ).toBeVisible();

        await expect(
            this.page.getByTestId(
                "register-confirm-password"
            )
        ).toBeVisible();

        await expect(
            this.page.getByTestId("register-submit")
        ).toBeVisible();
    }
);

When(
    "I log out",
    async function (this: CustomWorld) {


        const userMenu =
            this.page.getByTestId("user-menu");



        await expect(userMenu).toBeVisible({
            timeout: 10000,
        });



        await userMenu.click();



        const logoutButton =
            this.page.getByTestId("logout-button");



        await expect(logoutButton).toBeVisible({
            timeout: 10000,
        });



        await logoutButton.click();



        await this.page.waitForURL(
            "**/login",
            {
                timeout: 10000,
            }
        );


    }
);

Then(
    "I should be redirected to the login page",
    async function (this: CustomWorld) {
        await expect(
            this.page
        ).toHaveURL(/\/login$/);

        await expect(
            this.page.getByTestId("login-form")
        ).toBeVisible();
    }
);

Given(
    "I am logged in",
    async function (this: CustomWorld) {
        await this.page.goto("/login");

        await this.page
            .getByTestId("login-email")
            .fill(TEST_EMAIL);

        await this.page
            .getByTestId("login-password")
            .fill(TEST_PASSWORD);

        await this.page
            .getByTestId("login-submit")
            .click();

        await this.page.waitForURL(
            "**/dashboard",
            {
                timeout: 10000,
            }
        );

        await expect(
            this.page.getByTestId("user-menu")
        ).toBeVisible({
            timeout: 10000,
        });
    }
);