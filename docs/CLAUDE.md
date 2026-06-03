# docs/ -- SCC project docs

This directory holds all documentation for the SCC project.

## Structure

| Directory | Purpose | Loaded |
|-----------|---------|--------|
| `core/` | Project constitution - identity, constraints, core decisions | Always |
| `rules/` | Coding rules - SCC-specific decisions that must be followed | On violation |
| `patterns/` | Implementation patterns - code examples, "how to do it" | During implementation |
| `domain/` | Business domain knowledge - per-view/shared concepts | During domain work |
| `archive/` | Historical records - audits, reviews, past branch artifacts | Never |

## Key paths

- Project overview -> `core/project.md`
- Coding rules -> `core/conventions.md` -> `rules/`
- Implementation patterns -> `patterns/`
