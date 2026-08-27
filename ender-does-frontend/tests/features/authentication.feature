Feature: Authentication

  Scenario: Login page is accessible
    Given I open the EnderDoes login page
    Then I should see the "Welcome back" heading
    And I should see the login form

  Scenario: User can log in
    Given I open the EnderDoes login page
    When I log in with my test account
    Then I should be redirected to the dashboard

  Scenario: User cannot log in with invalid credentials
    Given I open the EnderDoes login page
    When I attempt to log in with invalid credentials
    Then I should see a login error

  Scenario: Registration page is accessible
    Given I open the EnderDoes registration page
    Then I should see the "Create an account" heading
    And I should see the registration form

  Scenario: User can log out
    Given I am logged in
    When I log out
    Then I should be redirected to the login page