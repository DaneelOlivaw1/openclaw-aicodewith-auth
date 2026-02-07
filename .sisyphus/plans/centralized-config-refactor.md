# Centralized Configuration Refactor

## TL;DR

> **Quick Summary**: Refactor scattered environment variable access throughout the codebase into a centralized, type-safe configuration module with validation at startup.
> 
> **Deliverables**:
> - Centralized config module at `src/config/index.ts`
> - Type-safe configuration schema with Zod validation
> - All env var access migrated to use centralized config
> - Startup validation that fails fast on missing/invalid config
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
Refactor the codebase to use a centralized configuration system instead of scattered `process.env` access throughout the application. This improves type safety, enables validation at startup, and makes configuration requirements explicit.

### Interview Summary
**Key Discussions**:
- Configuration should be validated at application startup
- Use Zod for schema validation to maintain consistency with existing patterns
- Group related config values (database, auth, API keys, etc.)
- Fail fast on missing required configuration

**Research Findings**:
- Current codebase has `process.env` access scattered across multiple files
- No centralized validation of environment variables
- Some env vars may be accessed but never validated

### Metis Review
**Identified Gaps** (addressed):
- Need to audit all existing env var usage before migration
- Must ensure backward compatibility during migration
- Should provide clear error messages for missing config

---

## Work Objectives

### Core Objective
Create a single source of truth for all application configuration with type safety and startup validation.

### Concrete Deliverables
- `src/config/index.ts` - Main config module with typed exports
- `src/config/schema.ts` - Zod schemas for config validation
- `src/config/types.ts` - TypeScript types for configuration
- Updated imports across all files that access env vars

### Definition of Done
- [x] All `process.env` access replaced with config imports
- [x] Application fails to start with clear error if required config missing
- [x] TypeScript provides autocomplete for all config values
- [x] No runtime errors from undefined config access

### Must Have
- Type-safe access to all configuration values
- Validation at startup (not lazy)
- Clear error messages for missing/invalid config
- Grouped configuration by domain (db, auth, api, etc.)

### Must NOT Have (Guardrails)
- No lazy validation (must validate at startup)
- No default values for sensitive config (API keys, secrets)
- No `process.env` access outside the config module
- No breaking changes to existing functionality

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after
- **Framework**: bun test

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Config Module** | Bash (bun/node) | Import config, access values, verify types |
| **Validation** | Bash | Start app with missing env, verify error |
| **Type Safety** | Bash (tsc) | Run type checker, verify no errors |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Audit existing env var usage
└── Task 2: Create config schema and types

Wave 2 (After Wave 1):
├── Task 3: Implement config module with validation
└── Task 4: Migrate existing env var access
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4 | 2 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | 4 | None |
| 4 | 3 | None | None |

---

## TODOs

- [x] 1. Audit Existing Environment Variable Usage

  **What to do**:
  - Search entire codebase for `process.env` access patterns
  - Document all environment variables currently in use
  - Categorize by domain (database, auth, external APIs, app settings)
  - Identify which are required vs optional
  - Note any existing default values

  **Must NOT do**:
  - Do not modify any files during audit
  - Do not assume env vars from .env.example are complete

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: This is a read-only audit task with clear scope
  - **Skills**: [`git-master`]
    - `git-master`: May need to search git history for env var additions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: None (can start immediately)

  **References**:
  - Search pattern: `grep -r "process\.env" src/`
  - `.env.example` - Reference for documented env vars

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Complete env var audit documented
    Tool: Bash (grep, find)
    Preconditions: Codebase accessible
    Steps:
      1. grep -r "process\.env" src/ --include="*.ts" --include="*.tsx"
      2. Document each unique env var found
      3. Cross-reference with .env.example
      4. Create categorized list in audit output
    Expected Result: Complete list of all env vars with categories
    Evidence: Audit results in task output
  ```

  **Commit**: NO (audit only, no file changes)

---

- [x] 2. Create Configuration Schema and Types

  **What to do**:
  - Create `src/config/schema.ts` with Zod schemas for all config groups
  - Create `src/config/types.ts` with TypeScript types inferred from schemas
  - Define required vs optional fields
  - Add appropriate Zod transformations (e.g., string to number for ports)

  **Must NOT do**:
  - Do not add default values for secrets/API keys
  - Do not make required fields optional
  - Do not skip validation for any env var

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward schema definition task
  - **Skills**: []
    - No special skills needed for Zod schema creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References**:
  - Zod documentation: https://zod.dev
  - Existing Zod usage patterns in codebase (if any)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Schema files created with proper types
    Tool: Bash (tsc, bun)
    Preconditions: Task 1 audit complete for reference
    Steps:
      1. Verify src/config/schema.ts exists
      2. Verify src/config/types.ts exists
      3. Run: bun run tsc --noEmit src/config/schema.ts
      4. Assert: No TypeScript errors
      5. Verify all env vars from audit have corresponding schema fields
    Expected Result: Type-safe schemas compile without errors
    Evidence: tsc output showing no errors
  ```

  **Commit**: YES
  - Message: `feat(config): add Zod schemas and types for centralized configuration`
  - Files: `src/config/schema.ts`, `src/config/types.ts`
  - Pre-commit: `bun run tsc --noEmit`

---

- [x] 3. Implement Config Module with Startup Validation

  **What to do**:
  - Create `src/config/index.ts` as the main config module
  - Parse and validate all env vars at module load time
  - Export typed configuration object
  - Provide clear error messages for validation failures
  - Group config by domain (db, auth, api, app)

  **Must NOT do**:
  - Do not use lazy validation
  - Do not catch and swallow validation errors
  - Do not export raw process.env access

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Standard implementation task with clear requirements
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Wave 1)
  - **Blocks**: Task 4
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `src/config/schema.ts` - Schemas created in Task 2
  - `src/config/types.ts` - Types created in Task 2
  - Task 1 audit results for complete env var list

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Config module exports typed configuration
    Tool: Bash (bun)
    Preconditions: Schema and types from Task 2 exist
    Steps:
      1. Create test file that imports config
      2. bun run -e "import { config } from './src/config'; console.log(typeof config)"
      3. Assert: Output shows 'object'
      4. Verify TypeScript autocomplete works (tsc compiles)
    Expected Result: Config exports typed object
    Evidence: Successful import and type check

  Scenario: Missing required config fails at startup
    Tool: Bash
    Preconditions: Config module implemented
    Steps:
      1. Unset a required env var temporarily
      2. Attempt to import config module
      3. Assert: Process exits with non-zero code
      4. Assert: Error message mentions missing variable name
    Expected Result: Clear error on missing config
    Evidence: Error output captured
  ```

  **Commit**: YES
  - Message: `feat(config): implement centralized config module with startup validation`
  - Files: `src/config/index.ts`
  - Pre-commit: `bun run tsc --noEmit`

---

- [x] 4. Migrate Existing Environment Variable Access

  **What to do**:
  - Replace all `process.env.X` access with `config.x` imports
  - Update imports in all affected files
  - Remove any inline env var validation (now handled centrally)
  - Verify no `process.env` access remains outside config module

  **Must NOT do**:
  - Do not change any business logic
  - Do not modify env var values or defaults
  - Do not leave any process.env access outside config module

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mechanical find-and-replace task with clear pattern
  - **Skills**: [`git-master`]
    - `git-master`: For atomic commits of migration changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:
  - Task 1 audit for list of files to update
  - `src/config/index.ts` - Config module to import from
  - Existing import patterns in codebase

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: No process.env access outside config module
    Tool: Bash (grep)
    Preconditions: Migration complete
    Steps:
      1. grep -r "process\.env" src/ --include="*.ts" --include="*.tsx" | grep -v "src/config/"
      2. Assert: No matches found (empty output)
    Expected Result: All env access centralized
    Evidence: grep output showing no matches

  Scenario: Application starts successfully after migration
    Tool: Bash
    Preconditions: All env vars set correctly
    Steps:
      1. bun run build (if applicable)
      2. bun run start or bun run dev
      3. Assert: Application starts without config errors
      4. Assert: Basic functionality works
    Expected Result: App runs with centralized config
    Evidence: Startup logs showing success
  ```

  **Commit**: YES
  - Message: `refactor: migrate all env var access to centralized config module`
  - Files: All files that previously accessed process.env
  - Pre-commit: `bun run tsc --noEmit && grep -r "process\.env" src/ --include="*.ts" | grep -v "src/config/" | wc -l` (should be 0)
