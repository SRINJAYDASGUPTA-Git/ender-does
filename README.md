<div align="center">

<img src="https://enderdoes.srinjaydg.in/word_logo.png" alt="EnderDoes" width="360">

# EnderDoes

### A full-stack task management application with a modern frontend, a deployed Spring backend, and an actively developed .NET backend translation.

<p>
  <a href="https://github.com/SRINJAYDASGUPTA-Git/ender-does">
    <img src="https://img.shields.io/github/stars/SRINJAYDASGUPTA-Git/ender-does?style=flat-square&logo=github" alt="GitHub stars">
  </a>
  <a href="https://github.com/SRINJAYDASGUPTA-Git/ender-does">
    <img src="https://img.shields.io/github/forks/SRINJAYDASGUPTA-Git/ender-does?style=flat-square&logo=github" alt="GitHub forks">
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet" alt=".NET 10">
  <img src="https://img.shields.io/badge/Spring%20Boot-current-6DB33F?style=flat-square&logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/PostgreSQL-database-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL">
</p>

</div>

---

## Overview

**EnderDoes** is a full-stack task management web application built around a Next.js frontend and a REST API architecture.

The repository currently contains:

- A **Next.js / React / TypeScript** frontend
- The existing **Java / Spring Boot** backend currently used by the deployed application
- A newer **ASP.NET Core / .NET 10** backend translating the existing Spring API
- Dedicated backend unit and integration testing
- Frontend end-to-end testing with Playwright and Cucumber
- Docker and Jenkins configuration

The project is both a working application and an ongoing backend technology transition.

---

## Technology Stack

<div align="center">

<a href="https://nextjs.org">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind" alt="Next.js React TypeScript Tailwind CSS">
</a>

<br>

<a href="https://spring.io/projects/spring-boot">
  <img src="https://skillicons.dev/icons?i=java,spring" alt="Java Spring Boot">
</a>

<a href="https://dotnet.microsoft.com">
  <img src="https://skillicons.dev/icons?i=dotnet,cs" alt="C# .NET">
</a>

<a href="https://www.postgresql.org">
  <img src="https://skillicons.dev/icons?i=postgres" alt="PostgreSQL">
</a>

<a href="https://www.docker.com">
  <img src="https://skillicons.dev/icons?i=docker" alt="Docker">
</a>

<a href="https://www.jenkins.io">
  <img src="https://skillicons.dev/icons?i=jenkins" alt="Jenkins">
</a>

<a href="https://playwright.dev">
  <img src="https://skillicons.dev/icons?i=playwright" alt="Playwright">
</a>

</div>

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Axios |
| Current Backend | Java, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, Flyway, JWT, Springdoc OpenAPI |
| New Backend | C#, ASP.NET Core, .NET 10, Entity Framework Core, Npgsql, JWT, Swagger/OpenAPI |
| Backend Testing | xUnit, Moq, ASP.NET Core testing, SQLite, Coverlet |
| Test Reporting | Allure.Xunit |
| E2E Testing | Playwright, Cucumber, Gherkin |
| Infrastructure | Docker, Jenkins |
| Database | PostgreSQL |

---

## Architecture

```text
                         EnderDoes
                            |
                            v
                 +-----------------------+
                 |    Next.js Frontend   |
                 | React + TypeScript    |
                 +-----------+-----------+
                             |
                             | REST API
                             v
              +-----------------------------+
              |     Backend Implementations |
              |                             |
              | +-------------------------+ |
              | | Java / Spring Boot      | |
              | | CURRENT DEPLOYED API    | |
              | +-------------------------+ |
              |                             |
              | +-------------------------+ |
              | | ASP.NET Core / .NET 10  | |
              | | NEW API TRANSLATION     | |
              | +-------------------------+ |
              +-------------+---------------+
                            |
                            v
                      +-----------+
                      | PostgreSQL|
                      +-----------+
```

The Java/Spring Boot implementation is the **currently deployed backend**.

The ASP.NET Core implementation is a **newer translation of the existing Spring API**, with its own implementation and test project.

---

## Frontend

The frontend is built with:

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **Axios**
- NextAuth and supporting frontend libraries

Application routes include:

```text
app/
├── (auth)/
│   ├── login/
│   └── register/
│
├── (dashboard)/
│   ├── dashboard/
│   ├── settings/
│   └── todos/
│
└── api/
```

The frontend provides the web interface for authentication, the dashboard, todo management, and user settings.

It also contains browser-level end-to-end testing infrastructure using **Playwright** and **Cucumber/Gherkin**.

---

## Current Backend: Java / Spring Boot

The existing backend is implemented with:

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- JWT
- Springdoc OpenAPI
- H2
- Spring Actuator

This is the backend **currently deployed and running with the frontend**.

---

## New Backend: ASP.NET Core / .NET 10

A newer backend implementation is being developed as a translation of the existing Spring API.

The .NET backend is organized around:

```text
Auth/
Controller/
Data/
Exceptions/
Todo/
User/
```

Its implementation includes:

- JWT Bearer authentication
- User management
- Todo management
- DTOs
- Services
- Mappers
- Entity Framework Core
- PostgreSQL through Npgsql
- Swagger/OpenAPI
- Global exception handling

The .NET implementation is intended to reproduce the existing backend API responsibilities rather than represent a separate product.

---

## Core API Functionality

### Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

JWT-based authentication establishes the authenticated user context used by protected endpoints.

### Todo Management

```http
GET    /api/v1/todo
GET    /api/v1/todo/{id}
POST   /api/v1/todo
PUT    /api/v1/todo/{id}
PATCH  /api/v1/todo/{id}
PATCH  /api/v1/todo/{id}/reopen
DELETE /api/v1/todo/{id}
```

The API supports retrieving, creating, updating, completing, reopening, and deleting user-owned todos.

### User Profile

```http
GET /api/v1/auth/me
PUT /api/v1/auth/me
```

Authenticated users can retrieve and update their own user information.

---

## Testing

The repository contains a dedicated `.NET` test project with unit and integration coverage.

### Backend Testing

The test stack includes:

- **xUnit**
- **Moq**
- ASP.NET Core MVC testing
- **SQLite** test database support
- **Coverlet** code coverage
- **Allure.Xunit** reporting

Tests cover areas including:

```text
Auth/
├── AuthControllerTests
├── AuthServiceTests
└── JWTServiceTests

Todo/
├── TodoControllerTests
├── TodoMapperTests
└── TodoServiceTests

User/
├── UserControllerTests
└── UserServiceTests

Integration/
├── AuthIntegrationTests
└── CustomWebApplicationFactory
```

There is also dedicated testing for global exception handling.

### End-to-End Testing

The frontend testing infrastructure uses:

- **Playwright**
- **Cucumber.js**
- **Gherkin**

This complements the backend unit and integration tests with browser-level application testing.

---

## Development and Infrastructure

The repository contains configuration for:

- Docker
- Jenkins
- Swagger / OpenAPI
- Git
- ESLint
- pnpm

These files represent project tooling and configuration. Their presence alone does not imply that every pipeline or deployment configuration is currently active.

---

## Repository Language Breakdown

GitHub Linguist reports the following byte distribution:

| Language | Percentage |
| --- | ---: |
| **TypeScript** | **55.29%** |
| **C#** | **22.26%** |
| **Java** | **19.62%** |
| CSS | 0.98% |
| JavaScript | 0.84% |
| Gherkin | 0.60% |
| Dockerfile | 0.27% |
| Shell | 0.14% |

The three major programming languages account for:

```text
TypeScript + C# + Java = 97.17%
```

The TypeScript share is strongly influenced by the size of the frontend, including application pages and UI/component code.

---

## Repository Structure

```text
ender-does/
├── ender-does-frontend/
│   ├── app/
│   ├── components/
│   ├── ...
│   ├── Dockerfile
│   └── Jenkinsfile
│
├── ender-does-backend/
│   └── Java / Spring Boot backend
│
├── ender-does-backend-NET/
│   └── ASP.NET Core / .NET 10 backend
│
├── ender-does-backend-NET.Tests/
│   └── xUnit / integration tests
│
└── ender-does.slnx
```

---

## Project Direction

EnderDoes currently represents a working application alongside an ongoing backend transition:

```text
Existing Application
       |
       +-- Next.js Frontend
       |
       +-- Java / Spring Boot Backend
                     |
                     | API translation
                     v
              ASP.NET Core
                 .NET 10
                     |
                     v
             Automated Testing
       xUnit + Allure + Integration Tests
```

The Java backend remains the currently deployed implementation, while the .NET backend represents the newer backend translation and migration effort.

---

## License

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

<div align="center">

### EnderDoes

**Next.js. Spring Boot. .NET. PostgreSQL.**

[Repository](https://github.com/SRINJAYDASGUPTA-Git/ender-does)

</div>
