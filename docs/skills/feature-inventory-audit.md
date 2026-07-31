---
name: feature-inventory-audit
description: >
  Produce a single, consolidated, code-verified inventory of what a
  feature area (e.g. an admin panel, a customer portal, a checkout
  flow) actually contains right now — what exists and works, what's
  partial or broken, what's missing entirely. Use when the user says
  "envanter çıkaralım", "ne var ne yok görelim", "bunu tam olarak
  gözden geçirelim", or after a feature area has been built
  incrementally across many separate sessions/tasks and no single
  up-to-date picture of it exists. Report-only; never fix anything in
  the same pass unless explicitly asked.
---

# Feature Inventory Audit

## When to trigger
- User asks for a full inventory/audit of a feature area built over
  many incremental sessions ("admin panelde ne var ne yok görmedik").
- Before making a major decision about what to build next in an area —
  to avoid re-building something that already exists, or assuming
  something works when it was only partially wired up.
- Periodically for any user-facing surface that accumulated features
  across more than ~5 separate tasks without a consolidated check.

## Why this matters
In fast-iterating projects, features get added piecemeal across many
separate prompts/sessions. Each individual task report says "done,"
but no one ever asks "given everything that's happened, what does this
whole area actually look like right now?" Gaps and partial
implementations hide in that blind spot — this audit exists to close it.

## How to run it

1. **Define the feature area's expected surface first.** Before
   auditing, list out the sub-areas that *should* exist based on prior
   decisions/specs (e.g. for an admin panel: auth, order management,
   application review, product/catalog settings, any dashboard/
   overview). Pull this from prior specs/blueprints if available,
   not from memory of what was asked for informally.

2. **For each sub-area, trace the actual code — do not summarize from
   memory or from prior task reports.** Prior reports say a feature is
   "done" at the time it was built; schema/route changes since then
   may have silently broken or orphaned it. Re-verify against current
   code.

3. **Classify each item:**
   - ✅ Exists & functional — confirmed by tracing the actual
     component/route/API and its data flow end to end.
   - 🟡 Exists but partial/broken — explain exactly what's missing or
     broken (e.g. "UI exists but the button has no onClick handler,"
     "API route exists but is never called from any UI").
   - ❌ Does not exist at all.

4. **Explicitly check for gaps that are easy to miss because nothing
   prompted them directly:**
   - Any overview/dashboard/summary view, or does the user land
     straight on a raw list with no aggregate info?
   - Any multi-user/permission distinction, or is it still a single
     shared credential with no per-user identity or audit trail?
   - Any downloadable/exportable output (PDF, CSV) that was assumed
     to exist but was never actually wired to a UI trigger?
   - Any settings/configuration surface for things that are currently
     hardcoded (site text, templates, thresholds)?

5. **Re-verify previously-flagged risky items** (security gates,
   accessibility fixes, anything called out as fragile in a past
   session) are still intact after subsequent changes — restructures
   elsewhere in the codebase can silently regress unrelated-looking
   fixes.

## Output format

A table per sub-area:

| Feature | Status (✅/🟡/❌) | Notes |
|---|---|---|

## Rules
- Do not fix anything in this pass — audit only, so the user can
  decide priorities with full information before any code changes.
- Every claim must be traceable to actual code inspected in this
  session, not to a prior task's self-report of "done."
- When a prior report and the current code disagree, trust the code
  and say so plainly — this is often exactly the kind of drift the
  audit exists to catch.
- Keep the report tight: a table entry per feature, not a narrative
  per feature — this is a reference document, not a story.
