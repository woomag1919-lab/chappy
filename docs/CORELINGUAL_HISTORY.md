# CoreLingual — cleanup history

## 2026-09-12

### Repository cleanup
- Confirmed `main` is the default branch.
- Audited the relationship feature and identified overlapping versioned layers.
- Consolidated the relationship selector, persistence bridge, partner-name synchronization, and result wording into `js/relationship.js`.
- Kept `js/v147-relationship-check.js` isolated because it still owns relationship-specific questions and scoring.
- Removed superseded runtime files `v148-relationship-ui.js` and `v149-polish.js`.
- Archived the former `v150-profile-fix.js` as `archive/js/v150-profile-fix.js`.
- Archived the former `js/fixes.js` entry point as `archive/js/fixes.js` because the active compatibility files are loaded directly by `index.html`.
- Updated `js/README.md` so the runtime/legacy distinction is explicit.

### Still active
- `js/v112-fixes.js` contains profile-specific deep-check reset/save behavior and comparison image export compatibility behavior.
- `js/v113-fixes.js` contains several compatibility patches and loads `js/v120-fixes.js`.
- `js/v120-fixes.js` owns comparison difference/advice compatibility behavior and later compatibility patches.

### Next step
Do not delete the remaining compatibility layers yet. Audit their functions one by one, identify duplicate behavior, migrate only safe responsibilities to stable modules, and archive each obsolete layer after verification.
