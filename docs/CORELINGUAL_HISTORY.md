# CoreLingual — cleanup history

## 2026-09-12

### Repository cleanup
- Confirmed `main` is the default branch.
- Audited the relationship feature and identified overlapping versioned layers.
- Consolidated the relationship selector, persistence bridge, partner-name synchronization, and result wording into `js/relationship.js`.
- Migrated the relationship-specific questions, deep questions, scoring, and partner diagnosis hooks from `js/v147-relationship-check.js` into stable `js/relationship-check.js`.
- Archived the former v147 implementation at `archive/js/v147-relationship-check.js` and removed `js/v147-relationship-check.js` from the runtime tree.
- Removed superseded runtime files `v148-relationship-ui.js` and `v149-polish.js`.
- Archived the former `v150-profile-fix.js` as `archive/js/v150-profile-fix.js`.
- Archived the former `js/fixes.js` entry point as `archive/js/fixes.js`.
- Removed obsolete v145/v146 logic from `js/v120-fixes.js` and kept only the active comparison difference/advice behavior.
- Removed the obsolete v119 wrapper and migrated the new-profile draft reset into `profiles.js`.
- Removed the duplicate comparison-export override from `js/v112-fixes.js` because `compare-export.js` is the active owner.
- Extracted the former v121 diagnosis edit cancel/restore behavior into stable `js/diagnosis-draft.js`.
- Extracted the former v112 diagnosis save/close behavior into stable `js/diagnosis-save.js`.
- Extracted the former v112 profile deep-check reset behavior into stable `js/profile-diagnosis-reset.js`.
- Reduced `js/v112-fixes.js` to a small compatibility loader.
- Extracted the former v113 comparison-data bridge into stable `js/compare-data.js`.
- Extracted the former v117 diagnosis-sheet scroll reset into stable `js/diagnosis-scroll.js`.
- Extracted the former v120 comparison difference/advice behavior into stable `js/comparison-differences.js`.
- Reduced `js/v113-fixes.js` to a compatibility loader for the stable comparison/diagnosis modules.
- Moved the former v144 deep-check reveal scroll behavior and v145 first-result reveal scroll behavior from `js/compare-export.js` into stable `js/diagnosis-scroll.js`.
- Reduced `js/compare-export.js` to its still-active v143 fixed-ad behavior, comparison image export, and related result cleanup responsibilities; obsolete v144/v145 scroll layers are no longer embedded there.
- Archived the now-unused `js/v120-fixes.js` compatibility loader at `archive/js/v120-fixes.js` after confirming the stable comparison module is already reached through the current runtime path.
- Updated `js/README.md` and the handoff documentation to reflect stable module ownership.

### Current compatibility state
- `js/v112-fixes.js` is compatibility-loader only and remains referenced by the current `index.html` until the final entry-point cleanup.
- `js/v113-fixes.js` is compatibility-loader only and remains referenced by the current `index.html` until the final entry-point cleanup.
- `js/v120-fixes.js` has been archived because it is no longer needed at runtime.
- `js/comparison-differences.js` is the active owner of comparison difference/advice behavior.
- `js/diagnosis-scroll.js` owns diagnosis-sheet reset plus the former v144/v145 reveal-scroll behavior.
- `js/relationship.js` is the active relationship feature entry point.
- `js/relationship-check.js` is the active relationship-specific question/scoring implementation.
- `js/v147-relationship-check.js` is no longer part of the runtime tree; its implementation is preserved under `archive/js/`.

### Next step
Verify the deployed app with the extracted stable modules. Then remove the legacy v112/v113 script entries from `index.html`, replacing them with direct stable-module script entries where required, while preserving the compatibility files in `archive/js/`. Continue auditing remaining numbered modules and other historical compatibility code.
