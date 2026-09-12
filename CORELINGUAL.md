# CoreLingual — current handoff

Updated: 2026-09-12

## Purpose
CoreLingual is a web app for understanding communication differences and conversational mismatches. The product should help people understand how to understand each other, rather than judge who is right or wrong.

## Current cleanup state
- `relationship.js` is the single runtime owner for the relationship selector, relationship persistence, partner-name sync, and relationship-result wording.
- `relationship-check.js` is now the stable runtime owner for relationship-specific questions, scoring, and partner diagnosis hooks; the former v147 implementation is archived at `archive/js/v147-relationship-check.js`.
- `v147-relationship-check.js` has been removed from the runtime tree after migration to the stable module.
- `v148-relationship-ui.js` and `v149-polish.js` have been removed from the runtime tree.
- `v150-profile-fix.js` has been superseded and archived at `archive/js/v150-profile-fix.js`.
- `fixes.js` has been superseded as a runtime entry point and archived at `archive/js/fixes.js`.
- `v112-fixes.js` and `v113-fixes.js` are now compatibility loaders only.
- `v120-fixes.js` is now a compatibility loader only; its required comparison behavior lives in `comparison-differences.js`.
- The former v144/v145 diagnosis reveal-scroll layers have been migrated into `diagnosis-scroll.js` and removed from `compare-export.js`.
- `compare-export.js` now keeps the still-active v143 fixed-ad behavior, comparison image export, and related result cleanup responsibilities.

## Stable extracted modules
- `diagnosis-save.js` — diagnosis save/close behavior formerly embedded in v112.
- `diagnosis-draft.js` — existing-profile diagnosis edit cancel/restore behavior formerly embedded in v121.
- `profile-diagnosis-reset.js` — deep-check UI reset behavior formerly embedded in v112.
- `compare-data.js` — active profile comparison-data bridge formerly embedded in v113.
- `comparison-differences.js` — comparison difference/advice behavior formerly embedded in v120.
- `diagnosis-scroll.js` — diagnosis-sheet reset plus former v144/v145 reveal-scroll behavior.
- `relationship-check.js` — relationship-specific partner questions, deep questions, scoring, and partner diagnosis hooks formerly owned by v147.

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
Verify the deployed app with the extracted stable modules. Then remove the now-loader-only v112/v113/v120 script entries from `index.html` and archive the compatibility files, while preserving direct loading of the stable modules. After that, continue auditing remaining numbered modules and historical compatibility code.
