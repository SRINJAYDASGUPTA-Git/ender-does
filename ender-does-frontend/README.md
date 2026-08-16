# EnderDoes Frontend

The frontend application for **EnderDoes**, a simple task management application built with Next.js.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Playwright
- Cucumber.js

## Features

- User authentication
- Create, edit, complete, reopen, and delete todos
- Active and completed task views
- User settings
- Profile image support
- End-to-end testing with Cucumber and Playwright

## Development

Install dependencies:

```bash
npm install
````

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

## Testing

Run the Cucumber end-to-end test suite:

```bash
npm run test:e2e
```

Generate the Cucumber report:

```bash
npm run test:e2e:report
```

## Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Docker

The frontend can also be built and run as a Docker container:

```bash
docker build -t enderdoes-frontend .
docker run -p 3000:3000 enderdoes-frontend
```

## Project Structure

```text
ender-does-frontend/
├── app/
├── components/
├── providers/
├── types/
├── utils/
├── tests/
│   ├── features/
│   ├── step-definitions/
│   └── support/
├── public/
├── Dockerfile
├── Jenkinsfile
├── next.config.ts
└── package.json
```

## CI/CD

The frontend is part of the EnderDoes monorepo.

Changes under:

```text
ender-does-frontend/
```

are intended to trigger the frontend Jenkins pipeline.

The pipeline will eventually:

1. Install dependencies
2. Build the application
3. Run the E2E test suite
4. Generate the Cucumber report
5. Build the Docker image
6. Deploy the frontend