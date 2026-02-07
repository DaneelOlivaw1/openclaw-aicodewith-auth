# Draft: Centralized Configuration Refactor

## Requirements (confirmed)
- Refactor openclaw-aicodewith-auth to adopt centralized configuration architecture
- Reference project: opencode-aicodewith-auth

## Current State Analysis

### Current Project Structure (openclaw-aicodewith-auth)
```
index.ts           - Plugin entry, registers 3 providers separately
src/
  auth.ts          - Auth method creation, hardcoded model lists
  constants.ts     - URLs, provider IDs, env vars
  models.ts        - Model definitions (GPT, Claude, Gemini arrays)
```

**Pain Points Identified:**
1. **Scattered Configuration**: Model definitions in `models.ts`, URLs in `constants.ts`, provider registration in `index.ts`
2. **No Single Source of Truth**: Adding a model requires changes in multiple files
3. **No Model Registry Pattern**: No centralized way to query/filter models
4. **No Deprecation Support**: No mechanism for model migrations
5. **No Test Infrastructure**: No tests exist
6. **Manual Provider Registration**: Each provider registered separately with duplicated code

### Reference Project Architecture (opencode-aicodewith-auth)
```
index.ts                    - Plugin entry, auth hook, config injection
provider.ts                 - Multi-provider factory
lib/
  constants.ts              - Global constants, imports from models
  types.ts                  - Shared TypeScript interfaces
  models/
    registry.ts             - SINGLE SOURCE OF TRUTH for all models
    index.ts                - Re-exports from registry
  config/
    index.ts                - Config utilities exports
    sync.ts                 - Config synchronization
    utils.ts                - Deep equal, JSON helpers
  request/                  - Request transformation
  hooks/                    - Auto-update, OMO config sync
tests/
  unit/
    model-registry.test.ts  - Registry tests
    ...
vitest.config.ts            - Test configuration
```

**Key Patterns:**
1. **Single Source of Truth**: All models defined in `lib/models/registry.ts`
2. **Derived Data**: Helper functions generate configs from registry
3. **Model Migrations**: Deprecated models with `replacedBy` field
4. **Type Safety**: Strong TypeScript interfaces
5. **Test Coverage**: Comprehensive unit tests with vitest

## Technical Decisions

### Architecture to Adopt
1. **Model Registry Pattern**: Single `lib/models/registry.ts` with all model definitions
2. **Derived Configurations**: Auto-generate provider configs from registry
3. **Deprecation Support**: Add `deprecated` and `replacedBy` fields
4. **Helper Functions**: `getActiveModels()`, `getModelById()`, `buildProviderConfig()`
5. **Test Infrastructure**: Add vitest with unit tests

### File Structure (Target)
```
index.ts                    - Plugin entry (simplified)
src/
  constants.ts              - URLs, env vars (no model data)
  auth.ts                   - Auth method (uses registry)
lib/
  models/
    registry.ts             - SINGLE SOURCE OF TRUTH
    index.ts                - Re-exports
  config/
    utils.ts                - Helper utilities
tests/
  unit/
    model-registry.test.ts  - Registry tests
vitest.config.ts            - Test config
```

## Research Findings

### From Reference Project:
- `ModelDefinition` interface with: id, family, displayName, version, limit, modalities, reasoning, deprecated, replacedBy, aliases
- `ModelFamily` type: "codex" | "gpt" | "claude" | "gemini"
- Helper functions: getActiveModels, getDeprecatedModels, getModelById, getModelByAlias, getModelsByFamily, buildModelMigrations, buildProviderConfig

### OpenClaw Plugin API Differences:
- Uses `openclaw/plugin-sdk` instead of `@opencode-ai/plugin`
- Different provider registration API
- No fetch interceptor pattern (simpler)

## Decisions Made
- ✅ Model migration support: YES (deprecated + replacedBy fields)
- ✅ Test coverage: FULL (Model registry + Provider config + Auth tests)
- ✅ Build-time config generation: YES (scripts/generate-*.ts)
- ✅ Provider structure: KEEP 3 separate providers (aicodewith-gpt, aicodewith-claude, aicodewith-gemini)
- ✅ Alias system: NO (keep simple)
- ✅ Default model: Via Registry (add isDefault field + getDefaultModel() helper)

## Open Questions
- None remaining

## Metis Review Findings (Addressed)
1. Provider structure decision → Keep 3 providers (no breaking change)
2. Alias system scope → No aliases needed
3. Default model selection → Registry-based with isDefault field
4. Model interface compatibility → Will adapt to OpenClaw SDK requirements while adding new fields

## Scope Boundaries
- INCLUDE: Model registry, helper functions, test infrastructure
- INCLUDE: Refactored constants and auth modules
- EXCLUDE: Request transformation (not needed for OpenClaw - simpler plugin API)
- EXCLUDE: OMO config sync (OpenCode-specific)
- EXCLUDE: Auto-update hooks (can be added later)
- EXCLUDE: Fetch interceptor pattern (OpenClaw uses different API)

## Key Differences Between Projects

### OpenCode Plugin API
- Uses `@opencode-ai/plugin` with fetch interceptors
- Complex auth hook with custom fetch
- Provider config auto-injection to opencode.json
- Request transformation for different model families

### OpenClaw Plugin API
- Uses `openclaw/plugin-sdk` with simpler registration
- Direct provider registration via `api.registerProvider()`
- No fetch interceptor needed
- Simpler auth method returning configPatch

## Refactoring Strategy

### Phase 1: Create Model Registry (Foundation)
1. Create `lib/models/registry.ts` with ModelDefinition interface
2. Define all models in single MODELS array
3. Add helper functions (getActiveModels, getModelById, etc.)
4. Create `lib/models/index.ts` for exports

### Phase 2: Centralize Provider Config
5. Create `lib/config/providers.ts` with provider definitions
6. Define API types, base URLs, labels in one place
7. Create factory function to build provider configs

### Phase 3: Refactor Existing Code
8. Update `src/constants.ts` - remove model-related constants
9. Update `src/auth.ts` - use centralized config
10. Update `index.ts` - use provider factory

### Phase 4: Add Test Infrastructure
11. Add vitest.config.ts
12. Create tests/unit/model-registry.test.ts
13. Create tests/unit/provider-config.test.ts
