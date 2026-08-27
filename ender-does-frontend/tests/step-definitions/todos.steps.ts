import {
    Given,
    When,
    Then, After,
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

import { CustomWorld } from "../support/world";

/**
 * Find a to-do using its rendered title and return
 * the containing to-do item.
 *
 * We use the title to discover the item's dynamic ID,
 * then operate entirely inside that item.
 */
async function findTodo(
    world: CustomWorld,
    title: string
) {
    const titleLocator = world.page.getByTestId(
        /^todo-title-/
    );

    const count = await titleLocator.count();

    for (let i = 0; i < count; i++) {
        const candidate = titleLocator.nth(i);

        if (
            (await candidate.textContent())?.trim() ===
            title
        ) {
            const testId =
                await candidate.getAttribute(
                    "data-testid"
                );

            if (!testId) {
                continue;
            }

            const todoId =
                testId.replace(
                    "todo-title-",
                    ""
                );

            return world.page.getByTestId(
                `todo-item-${todoId}`
            );
        }
    }

    return world.page.getByTestId(
        "todo-item-not-found"
    );
}
async function deleteTodosByTitle(
    world: CustomWorld,
    title: string
) {
    await world.page.goto("/todos");

    const titleLocators =
        world.page.getByTestId(/^todo-title-/);

    const ids: string[] = [];

    const count = await titleLocators.count();

    for (let i = 0; i < count; i++) {
        const titleLocator =
            titleLocators.nth(i);

        const text =
            await titleLocator.textContent();

        if (text?.trim() !== title) {
            continue;
        }

        const testId =
            await titleLocator.getAttribute(
                "data-testid"
            );

        if (!testId) {
            continue;
        }

        ids.push(
            testId.replace(
                "todo-title-",
                ""
            )
        );
    }

    for (const id of ids) {
        const todo =
            world.page.getByTestId(
                `todo-item-${id}`
            );

        if (await todo.count() === 0) {
            continue;
        }

        await todo
            .getByTestId(
                `todo-actions-${id}`
            )
            .click();

        await world.page
            .getByRole("menuitem", {
                name: "Delete",
                exact: true,
            })
            .click();

        const dialog =
            world.page.getByTestId(
                "delete-todo-dialog"
            );

        await expect(dialog).toBeVisible();

        await dialog
            .getByTestId(
                "delete-todo-confirm"
            )
            .click();

        await expect(dialog)
            .not.toBeVisible();

        await expect(todo)
            .not.toBeVisible({
                timeout: 10000,
            });
    }
}
/**
 * Create a to-do through the actual UI if it doesn't
 * already exist.
 */
async function ensureTodo(
    world: CustomWorld,
    title: string
) {
    const existing = await findTodo(
        world,
        title
    );

    const existingCount =
        await existing.count();

    if (existingCount > 1) {
        throw new Error(
            `Expected at most one todo titled "${title}", found ${existingCount}`
        );
    }

    if (existingCount === 1) {
        return;
    }

    await world.page
        .getByTestId("create-todo-button")
        .click();

    const dialog = world.page.getByTestId(
        "create-todo-dialog"
    );

    await expect(dialog).toBeVisible();

    await dialog
        .getByTestId("create-todo-title")
        .fill(title);

    await dialog
        .getByTestId("create-todo-body")
        .fill("Some description");

    await dialog
        .getByTestId("create-todo-submit")
        .click();

    await expect(dialog).not.toBeVisible();

    await expect(
        world.page.getByTestId(
            /^todo-title-/
        ).filter({
            hasText: title,
        })
    ).toBeVisible({
        timeout: 10000,
    });
}

/* ======================================================
   Navigation
====================================================== */

Given(
    "I am on the todos page",
    async function (this: CustomWorld) {
        await this.page.goto("/todos");

        await expect(
            this.page.getByTestId("todo-list")
        ).toBeVisible();
    }
);


/* ======================================================
   Create
====================================================== */

When(
    "I create a todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await this.page
            .getByTestId("create-todo-button")
            .click();

        const dialog =
            this.page.getByTestId(
                "create-todo-dialog"
            );

        await expect(dialog).toBeVisible();

        await dialog
            .getByTestId("create-todo-title")
            .fill(title);

        await dialog
            .getByTestId("create-todo-body")
            .fill("Some description");

        const responsePromise =
            this.page.waitForResponse(
                response =>
                    response.request().method() === "POST" &&
                    response.url().includes("/todos")
            );

        await dialog
            .getByTestId("create-todo-submit")
            .click();

        const response =
            await responsePromise;

        expect(response.ok()).toBeTruthy();

        await expect(dialog)
            .not.toBeVisible({
                timeout: 10000,
            });

        await this.page.reload();

        await expect(
            this.page.getByTestId("todo-list")
        ).toBeVisible({
            timeout: 10000,
        });

        await expect(
            this.page
                .getByTestId(/^todo-title-/)
                .filter({
                    hasText: title,
                })
                .first()
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


/* ======================================================
   Existing To-do
====================================================== */

Given(
    "I have a todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await this.page.goto("/todos");

        await ensureTodo(
            this,
            title
        );

        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
            })
        ).toBeVisible();
    }
);


/* ======================================================
   Active to-do
====================================================== */

Given(
    "I have an active todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await this.page.goto(
            "/todos?view=active"
        );

        let todo = await findTodo(
            this,
            title
        );

        if (await todo.count() === 0) {
            await this.page.goto("/todos");

            await ensureTodo(
                this,
                title
            );

            todo = await findTodo(
                this,
                title
            );
        }

        /*
         * If it exists but is completed, reopen it.
         */
        const actions =
            todo.getByTestId(
                /todo-actions-/
            );

        if (await actions.count() > 0) {
            await actions.click();

            const reopen =
                this.page.getByRole(
                    "menuitem",
                    {
                        name: "Mark as not done",
                        exact: true,
                    }
                );

            if (
                await reopen.count() > 0 &&
                await reopen.isVisible()
            ) {
                await reopen.click();
            }
        }

        await this.page.goto(
            "/todos?view=active"
        );

        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
            })
        ).toBeVisible();
    }
);


/* ======================================================
   Completed to-do
====================================================== */

Given(
    "I have a completed todo titled {string}",
    async function (
        this: CustomWorld,
        title: string
    ) {
        // Always start from the normal/all view.
        await this.page.goto("/todos");

        // Make sure the to-do exists.
        let todo = await findTodo(
            this,
            title
        );

        if (await todo.count() === 0) {
            await this.page
                .getByTestId("create-todo-button")
                .click();

            const dialog =
                this.page.getByTestId(
                    "create-todo-dialog"
                );

            await expect(dialog).toBeVisible();

            await dialog
                .getByTestId("create-todo-title")
                .fill(title);

            await dialog
                .getByTestId("create-todo-body")
                .fill("Some description");

            await dialog
                .getByTestId("create-todo-submit")
                .click();

            await expect(dialog)
                .not.toBeVisible();

            // Wait for the newly-created to do.
            await expect(
                this.page.getByTestId(
                    /^todo-title-/
                ).filter({
                    hasText: title,
                }).first()
            ).toBeVisible({
                timeout: 10000,
            });

            todo = await findTodo(
                this,
                title
            );
        }

        await expect(todo).toBeVisible();

        // Complete it only if it isn't already completed.
        const completeButton =
            todo.getByTestId(
                /todo-complete-/
            );

        if (
            await completeButton.count() > 0 &&
            await completeButton.isEnabled()
        ) {
            await completeButton.click();
        }

        // Now verify through the completed view.
        await this.page.goto(
            "/todos?view=completed"
        );

        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
            }).first()
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


/* ======================================================
   Complete
====================================================== */

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

        await expect(todo).toBeVisible();

        await todo
            .getByTestId(
                /todo-complete-/
            )
            .click();

        /*
         * Completion moves the item into the completed
         * view, so verify through the completed view.
         */
        await this.page.goto(
            "/todos?view=completed"
        );

        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
            })
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


/* ======================================================
   Reopen
====================================================== */

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

        await expect(todo).toBeVisible();

        await todo
            .getByTestId(
                /todo-actions-/
            )
            .click();

        await this.page
            .getByRole("menuitem", {
                name: action,
                exact: true,
            })
            .click();
    }
);


/* ======================================================
   Edit
====================================================== */

When(
    "I edit {string} to {string}",
    async function (
        this: CustomWorld,
        oldTitle: string,
        newTitle: string
    ) {
        const todo = await findTodo(
            this,
            oldTitle
        );

        await expect(todo).toBeVisible();

        await todo
            .getByTestId(/todo-actions-/)
            .click();

        await this.page
            .getByRole("menuitem", {
                name: "Edit",
                exact: true,
            })
            .click();

        const dialog =
            this.page.getByTestId(
                "edit-todo-dialog"
            );

        await expect(dialog).toBeVisible();

        await dialog
            .getByTestId("edit-todo-title")
            .fill(newTitle);

        await dialog
            .getByTestId("edit-todo-submit")
            .click();

        await expect(dialog)
            .not.toBeVisible();

        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: newTitle,
            })
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


/* ======================================================
   Delete
====================================================== */

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

        await expect(todo).toBeVisible();

        await todo
            .getByTestId(/todo-actions-/)
            .click();

        await this.page
            .getByRole("menuitem", {
                name: "Delete",
                exact: true,
            })
            .click();

        const dialog =
            this.page.getByTestId(
                "delete-todo-dialog"
            );

        await expect(dialog).toBeVisible();

        await dialog
            .getByTestId(
                "delete-todo-confirm"
            )
            .click();

        await expect(dialog)
            .not.toBeVisible();

        // Assert the exact to-do we deleted is gone.
        await expect(todo)
            .not.toBeVisible({
                timeout: 10000,
            });
    }
);


/* ======================================================
   Assertions
====================================================== */

Then(
    "I should see {string} in my tasks",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
            })
        ).toBeVisible({
            timeout: 10000,
        });
    }
);


Then(
    "I should not see {string} in my tasks",
    async function (
        this: CustomWorld,
        title: string
    ) {
        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
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
        await this.page.goto(
            "/todos?view=completed"
        );

        await expect(
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
            })
        ).toBeVisible({
            timeout: 10000,
        });
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
            this.page.getByTestId(
                /^todo-title-/
            ).filter({
                hasText: title,
            })
        ).toBeVisible({
            timeout: 10000,
        });
    }
);

After(async function (this: CustomWorld) {
    const titles = [
        "Create Test Todo",
        "Edit Test Todo",
        "Updated Test Todo",
        "Complete Test Todo",
        "Reopen Test Todo",
        "Delete Test Todo",
    ];

    for (const title of titles) {
        try {
            await deleteTodosByTitle(
                this,
                title
            );
        } catch (error) {
            console.error(
                `Cleanup failed for "${title}":`,
                error
            );
        }
    }
});