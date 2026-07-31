---
name: codebase-health-audit
description: >
  Run a systematic dead-code / redundancy / over-engineering audit
  after significant schema or architecture changes. Use when the
  user says "kod röntgeni çekelim", "code health check", "temizlik
  yapalım", or after any major restructure (schema migration, route
  restructure, model rename) — especially in fast-iterating projects
  where features get superseded quickly. Report-only by default; never
  delete or edit code unless the user explicitly approves each item.
---

# Codebase Health Audit

## When to trigger
- User explicitly asks for a "code health check" / "kod röntgeni" / cleanup pass.
- After any of: a schema migration that renames/moves fields, a route
  restructure (e.g. changing a dynamic segment), a pricing/business-logic
  model change, or several rapid iterative feature additions in a row.
- Periodically on long-running projects (e.g. every 5-10 feature tasks),
  proactively suggest this to the user if it hasn't been run recently.

## What to check (adapt sections to the actual stack)

1. **Schema / data model**
   - Fields no longer read or written anywhere (grep every field name
     across the codebase, not just the model file).
   - Fields superseded by a later migration but never removed (e.g. an
     old `moq` field after a `moqPerFabric`/`moqCombinedMultiFabric`
     split).
   - Unused models, or models with no corresponding API/UI usage.
   - Leftover foreign keys/relations from a restructured relationship.

2. **Routes / pages**
   - Dead route folders/files left over from a URL structure change
     (e.g. `/thing/[oldParam]` after migrating to `/thing/[newParam]`).
   - Duplicate logic between near-identical routes that could be
     consolidated without behavior change.

3. **Components**
   - Components no longer imported anywhere (grep each component's
     name/filename across the codebase).
   - Near-duplicate components produced by iterative rebuilds.

4. **API routes**
   - Diagnostic/debug endpoints added during troubleshooting sessions
     (e.g. env var inspection routes) that were supposed to be removed.
   - Endpoints superseded by a business-logic change (e.g. an old
     auto-trigger that a later manual-review flow was supposed to
     replace) — confirm the old path is actually disabled, not just
     unused-but-still-live.

5. **Tests**
   - Tests exercising behavior that no longer exists.
   - Hardcoded values duplicating what should be shared fixtures.

6. **Dependencies**
   - Installed packages no longer imported anywhere (check each
     package.json/requirements dependency against actual imports).

7. **General over-engineering**
   - Conditional branches for a feature path that was decided against.
   - Speculative abstraction for a "might need it later" case that
     never materialized.
   - Config options with no effect because nothing reads them.

## Output format

A table per section:

| Item | Status (dead / redundant / fine) | Recommendation (remove / consolidate / keep) | Risk if removed (none / low / needs-check) |
|---|---|---|---|

## Rules
- **Audit only in the first pass.** Do not delete or edit any code
  until the user has reviewed the findings and approved specific items.
- Cite the actual grep/search evidence for each "dead" claim — never
  assert something is unused without having actually searched for its
  usage across the whole codebase.
- Flag anything uncertain as "needs-check" rather than guessing either
  way — a false "dead" claim that turns out to be load-bearing is worse
  than a longer report.
- After the user approves specific removals, apply them in a single
  focused commit per category (schema cleanup, dead routes, unused
  deps, etc.) — not one giant mixed commit — so each change is easy to
  review or revert independently.
