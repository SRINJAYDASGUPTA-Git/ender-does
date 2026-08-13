import {
    Given,
    When,
    Then,
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

import { CustomWorld } from "../support/world";

const TEST_EMAIL =
    process.env.TEST_USER_EMAIL ?? "test@example.com";

const TEST_PASSWORD =
    process.env.TEST_USER_PASSWORD ?? "password";

console.log(TEST_EMAIL, TEST_PASSWORD);


async function findTodo(
    world: CustomWorld,
    title: string
) {
    return world.page
        .locator("div")
        .filter({
            hasText: title,
        })
        .filter({
            has: world.page.getByText(title, {
                exact: true,
            }),
        })
        .first();
}


// ======================================================
// Authentication
// ======================================================

Given(
    "I am logged in",
    async function (this: CustomWorld) {
        await this.page.goto("/login");

        await this.page
            .getByLabel("Email")
            .fill(TEST_EMAIL);

        await this.page
            .getByRole("textbox", {
                name: "Password",
            })
            .fill(TEST_PASSWORD);

        await this.page
            .getByRole("button", {
                name: "Sign In",
            })
            .click();

        await this.page.waitForURL("**/");
    }
);


// ======================================================
// Navigation
// ======================================================

Given(
    "I am on the todos page",
    async function (this: CustomWorld) {
        await this.page.goto("/todos");

        await expect(
            this.page.getByRole("heading", {
                name: /tasks/i,
            })
        ).toBeVisible();
    }
);


// ======================================================
// Create
// ======================================================

When(
    "I create a todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        const createButton = this.page
            .getByRole("button", {
                name: "Create Task",
                exact: true,
            })
            .first();

        await createButton.click();

        const dialog = this.page.getByRole("dialog");

        await expect(dialog).toBeVisible();

        await dialog
            .getByLabel("Title")
            .fill(title);

        await dialog
            .getByLabel("Description")
            .fill("Some description");

        await dialog
            .getByRole("button", {
                name: "Create Task",
                exact: true,
            })
            .click();

        await expect(dialog).not.toBeVisible();

        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


// ======================================================
// Existing To do
// ======================================================

Given(
    "I have a todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await this.page.goto("/todos");

        const todo = await findTodo(
            this,
            title
        );

        if (await todo.count() === 0) {
            await this.page
                .getByRole("button", {
                    name: "Create Task",
                    exact: true,
                })
                .first()
                .click();

            const dialog = this.page.getByRole("dialog");

            await expect(dialog).toBeVisible();

            await dialog
                .getByLabel("Title", {
                    exact: true,
                })
                .fill(title);

            await dialog
                .getByRole("button", {
                    name: "Create Task",
                    exact: true,
                })
                .click();

            await expect(dialog).not.toBeVisible();
        }

        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible();
    }
);


// ======================================================
// Active To do
// ======================================================

Given(
    "I have an active todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await this.page.goto(
            "/todos?view=active"
        );

        const todo = await findTodo(
            this,
            title
        );

        if (
            await todo.count() === 0
        ) {
            await this.page.goto("/todos");

            await this.page
                .getByRole("button", {
                    name: /create task/i,
                })
                .click();

            await this.page
                .getByLabel("Title")
                .fill(title);

            await this.page
                .getByRole("button", {
                    name: /create/i,
                })
                .click();
        }

        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible();
    }
);


// ======================================================
// Completed Todo
// ======================================================

Given(
    "I have a completed todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await this.page.goto("/todos");

        const todo = await findTodo(
            this,
            title
        );

        if (
            await todo.count() === 0
        ) {
            await this.page
                .getByRole("button", {
                    name: /create task/i,
                })
                .click();

            await this.page
                .getByLabel("Title")
                .fill(title);

            await this.page
                .getByRole("button", {
                    name: /create/i,
                })
                .click();
        }

        const completedView =
            this.page.getByText(title, {
                exact: true,
            });

        // If it isn't already completed,
        // complete it.
        const checkbox =
            completedView
                .locator("xpath=..")
                .getByRole("button", {
                    name: /mark as complete/i,
                });

        if (await checkbox.count() > 0) {
            await checkbox.click();
        }

        await this.page.goto(
            "/todos?view=completed"
        );

        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible();
    }
);


// ======================================================
// Complete
// ======================================================

When(
    "I mark {string} as complete",
    async function (
        this: CustomWorld,
        title: string
    ) {
        const todo = await findTodo(
            this,
            title
        );

        await todo
            .getByRole("button", {
                name: /mark as complete/i,
            })
            .click();

        await expect(
            todo.getByRole("button", {
                name: /completed/i,
            })
        ).toBeVisible();
    }
);


// ======================================================
// Reopen
// ======================================================

When(
    "I choose {string} for {string}",
    async function (
        this: CustomWorld,
        action: string,
        title: string
    ) {
        const todo = await findTodo(
            this,
            title
        );

        await todo
            .getByRole("button", {
                name: /task actions/i,
            })
            .click();

        await this.page
            .getByRole("menuitem", {
                name: action,
            })
            .click();
    }
);


// ======================================================
// Edit
// ======================================================

When(
    "I edit the todo to {string}",
    async function (
        this: CustomWorld,
        newTitle: string
    ) {
        const todo = await findTodo(
            this,
            "Test Todo"
        );

        await expect(todo).toBeVisible();

        console.log("=== TODO TEXT ===");
        console.log(await todo.innerText());

        console.log("=== TODO BUTTONS ===");
        console.log(
            await todo
                .getByRole("button")
                .allTextContents()
        );

        console.log("=== TODO BUTTON ARIA ===");
        console.log(
            await todo
                .locator("button")
                .evaluateAll((buttons) =>
                    buttons.map((button) => ({
                        text: button.textContent,
                        ariaLabel:
                            button.getAttribute("aria-label"),
                        title:
                            button.getAttribute("title"),
                    }))
                )
        );
    }
);


// ======================================================
// Delete
// ======================================================

When(
    "I delete {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        const todo = await findTodo(
            this,
            title
        );

        await todo
            .getByRole("button", {
                name: /task actions/i,
            })
            .click();

        await this.page
            .getByRole("menuitem", {
                name: /delete/i,
            })
            .click();

        // Confirmation dialog
        await this.page
            .getByRole("button", {
                name: /delete/i,
            })
            .last()
            .click();

        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).not.toBeVisible();
    }
);


// ======================================================
// Assertions
// ======================================================

Then(
    "I should see {string} in my tasks",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible();
    }
);

Then(
    "I should not see {string} in my tasks",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).not.toBeVisible();
    }
);

Then(
    "{string} should be marked as completed",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible();

        await this.page.goto(
            "/todos?view=completed"
        );

        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible();
    }
);

Then(
    "{string} should be marked as active",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await this.page.goto(
            "/todos?view=active"
        );

        await expect(
            this.page.getByText(title, {
                exact: true,
            })
        ).toBeVisible();
    }
);