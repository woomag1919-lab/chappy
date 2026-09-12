# CoreLingual JS structure

## Main modules
- `app.js` — main UI / page flow
- `data.js` — questionnaire data
- `profiles.js` — profile storage, selection and save
- `diagnosis.js` — diagnosis / result logic
- `compare.js` — two-person comparison
- `compare-export.js` — comparison image export
- `analyze.js` — conversation analysis
- `invite.js` — partner invite/share flow

## Stable feature entry points
- `relationship.js` — relationship-specific partner check + relationship selector. It loads the currently versioned relationship implementation in the required order.
- `fixes.js` — compatibility/fix entry point for historical fixes.

## Versioned implementation files
The `v###-*.js` files are retained temporarily as implementation modules for compatibility and rollback. New code should normally be added to the stable entry points or the main modules above rather than adding another numbered loader.

### Current relationship implementation
- `v147-relationship-check.js` — relationship-specific question sets and scoring
- `v148-relationship-ui.js` — relationship persistence bridge
- `v149-polish.js` — result wording / profile-apply polish
- `v150-profile-fix.js` — relationship selector visibility and immediate profile-name sync

### Historical compatibility implementation
- `v112-fixes.js`
- `v113-fixes.js`
- `v120-fixes.js` (loaded by the v113 compatibility layer)

## Rule going forward
Avoid creating `v151`, `v152`, ... just for small UI fixes. Prefer updating the stable module that owns the behavior, and use a numbered file only when a genuinely isolated migration/rollback layer is needed.
