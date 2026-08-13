Feature: User Settings

  Background:
    Given I am logged in

  Scenario: Settings page is accessible
    When I open the settings page
    Then I should see the settings page
    And I should see my email address

  Scenario: User can update their name
    When I open the settings page
    And I change my name to "E2E Test User"
    And I save my settings
    Then I should see the settings success message
    And my name should be "E2E Test User"

  Scenario: User can upload a profile picture
    When I open the settings page
    And I upload my test profile picture
    Then the profile picture upload should complete

  Scenario: Account information is displayed
    When I open the settings page
    Then I should see my account status
    And I should see my account lock status
    And I should see my account roles