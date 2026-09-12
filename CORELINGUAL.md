# CoreLingual — current handoff

Updated: 2026-09-12

## Purpose
CoreLingual is a web app for understanding communication differences and conversational mismatches. The product should help people understand how to understand each other, rather than judge who is right or wrong.

## Current cleanup state
- `relationship.js` is the single runtime owner for the relationship selector, relationship persistence, partner-name sync, and relationship-result wording.
- `v147-relationship-check.js` remains as the isolated relationship-specific question/scoring implementation.
- `v148-relationship-ui.js` and `v149-polish.js` have been removed from the runtime tree.
- `v150-profile-fix.js` has been superseded and archived at `archive/js/v150-profile-fix.js`.
- `fixes.js` has been superseded as a runtime entry point and archived at `archive/js/fixes.js`.
- `v112-fixes.js`, `v113-fixes.js`, and `v120-fixes.js` are still runtime-active and must not be removed until their individual responsibilities are migrated and verified.

## Important IDs / storage keys
- `profilePartnerPane`
- `partnerName`
- `clRelationshipBox`
- `v72OpenDiag`
- `cl_partner_relationship`
- `cl_partner`
- `corelingual:relationship-change`

## Cleanup rules
1. Do not rebuild the app from scratch.
2. Preserve working behavior and existing localStorage keys/DOM IDs unless there is a deliberate migration plan.
3. Prefer stable feature modules over new numbered `v151`, `v152`, etc. files.
4. Archive superseded code instead of deleting it blindly.
5. Before removing a legacy file, search the repository for runtime references and inspect its actual responsibilities.
6. After meaningful code changes, update `docs/CORELINGUAL_HISTORY.md`.

## Next cleanup target
Audit `v112-fixes.js` and `v113-fixes.js` function-by-function. Separate still-required compatibility behavior from obsolete historical patches. Migrate only safe, isolated responsibilities into stable modules, then archive the old layers one piece at a time.
