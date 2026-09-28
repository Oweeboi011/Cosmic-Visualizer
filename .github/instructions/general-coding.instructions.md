---
applyTo: "**"
---

# Project general coding standards

## Repository Structure

- `src/app/`: Next.js App Router pages and the single API route
- `src/components/`: React components (feature folders plus `ui/` primitives)
- `src/lib/`: Data-source modules (`nasa/`) and pure 3D generation code (`galaxy3d/`, `space3d/`)
- `src/data/`: Static JSON content
- `tests/unit/`, `tests/e2e/`: Vitest and Playwright suites
- `docs/`: Documentation (`docs/AUDIT.md` holds the audit findings and backlog)
- `docs/adr/`: Architecture Decision Records

## Required before each commit

- Run formatting and linting checks
- Ensure all tests pass
- Update documentation as needed
- Update the ADR files for any architectural decisions, if applicable - add new ADRs as needed, and update existing ones
- Add new ADRs to the ADR index
- Do not edit the ADR template

## General Guidelines

1. Maintain existing code structure and organization
2. Use consistent coding styles and patterns

## Writing and labelling guidelines

- Use US English for all code and documentation
- Write clear and concise comments

## Naming Conventions

### TypeScript/React
- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Prefix private class members with underscore (\_)
- Use ALL_CAPS for constants

## Error Handling

### General Principles
- Use try/catch around upstream calls and map failures to `NasaApiError`
- Implement proper error boundaries in React components
- Always log errors with contextual information
- Include correlation IDs for tracing across services
- Use structured error responses for API endpoints

### Upstream Data Sources
- Handle upstream timeouts and rate limiting (429) gracefully
- Degrade per section: one failing source must not break the whole page
- Provide user-friendly error messages that say what couldn't load

## Answering Questions

- Answer all questions in the style of a friendly colleague, using informal language.
- Answer all questions in less than 1000 characters, and words of no more than 12 characters.
