Feature: Todo Management

  Background:
    Given I am logged in
    And I am on the todos page

  Scenario: Create a todo
    When I create a todo titled "Create Test Todo"
    Then I should see "Create Test Todo" in my tasks

  Scenario: Edit a todo
    Given I have a todo titled "Edit Test Todo"
    When I edit "Edit Test Todo" to "Updated Test Todo"
    Then I should see "Updated Test Todo" in my tasks

  Scenario: Complete a todo
    Given I have an active todo titled "Complete Test Todo"
    When I mark "Complete Test Todo" as complete
    Then "Complete Test Todo" should be marked as completed

  Scenario: Reopen a completed todo
    Given I have a completed todo titled "Reopen Test Todo"
    When I choose "Mark as not done" for "Reopen Test Todo"
    Then "Reopen Test Todo" should be marked as active

  Scenario: Delete a todo
    Given I have a todo titled "Delete Test Todo"
    When I delete "Delete Test Todo"
    Then I should not see "Delete Test Todo" in my tasks