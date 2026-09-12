# CoreLingual — cleanup history

## 2026-09-12

### Repository cleanup
- Confirmed `main` is the default branch.
- Audited the relationship feature and identified overlapping versioned layers.
- Consolidated the relationship selector, persistence bridge, partner-name synchronization, and result wording into `js/relationship.js`.
- Kept `js/v147-relationship-check.js` isolated because it still owns relationship-specific questions and scoring.
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
- Reduced `js/v120-fixes.js` to a compatibility loader for `comparison-differences.js`.
- Updated `js/README.md` to reflect the stable comparison module ownership.

### Current compatibility state
- `js/v112-fixes.js` is compatibility-loader only.
- `js/v113-fixes.js` is compatibility-loader only.
- `js/v120-fixes.js` is compatibility-loader only.
- `js/comparison-differences.js` is the active owner of comparison difference/advice behavior.
- `js/v147-relationship-check.js` remains isolated as the relationship-specific question/scoring implementation.

### Next step
Verify the deployed app with the extracted stable modules. Then remove the legacy v112/v113/v120 script entries from `index.html`, preserving the stable modules and archiving the compatibility files. Continue with a function-by-function audit of v147.
