# Contributing to WorkNest

Thank you for contributing to WorkNest! Please review these guidelines before submitting changes.

## Development Workflow

1. **Branching Strategy:**
   - Use descriptive feature branches: `feat/feature-name` or `fix/bug-name`.
   - Never commit secrets, passwords, or live Stripe keys to version control.

2. **Code Standards:**
   - Write clean, type-safe TypeScript with no implicit `any`.
   - Follow ESLint and Prettier configurations.
   - Preserve comments, schema documentation, and state machine guards.

3. **Money & Ledger Rules:**
   - Never handle currency amounts in floats. Use integer cents (`BigInt` or `Number` minor units).
   - Any money movement must write an accompanying `LedgerEntry` with a unique idempotency key.

4. **Testing Requirements:**
   - Run the full verification suite before committing:
     ```bash
     pnpm typecheck
     pnpm test
     pnpm next build
     ```
   - Add unit tests under `tests/unit/` for any new service, financial calculation, or state transition.

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(module): description`
- `fix(module): description`
- `test(module): description`
- `docs: description`
