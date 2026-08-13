Feature: Todo management

  Background:
    Given I am logged in
    And I am on the todos page

  Scenario: Create a todo
    When I create a todo titled "Test Todo"
    Then I should see "Test Todo" in my tasks

  Scenario: Edit a todo
    Given I have a todo titled "Test Todo"
    When I edit the todo to "Updated Todo"
    Then I should see "Updated Todo" in my tasks

  Scenario: Complete a todo
    Given I have an active todo titled "Test Todo"
    When I mark "Test Todo" as complete
    Then "Test Todo" should be marked as completed

  Scenario: Reopen a completed todo
    Given I have a completed todo titled "Test Todo"
    When I choose "Mark as not done" for "Test Todo"
    Then "Test Todo" should be marked as active

  Scenario: Delete a todo
    Given I have a todo titled "Test Todo"
    When I delete "Test Todo"
    Then I should not see "Test Todo" in my tasks