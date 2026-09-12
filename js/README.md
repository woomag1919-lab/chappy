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
- `relationship.js` — single owner for relationship selector, relationship persistence bridge, result wording, and loading of the relationship-specific question/scoring module

## Relationship implementation status
- `relationship.js` now owns the relationship UI and persistence behavior.
- `v147-relationship-check.js` remains temporarily as the isolated relationship-specific question/scoring module.
- `v148-relationship-ui.js` and `v149-polish.js` have already been removed from the runtime tree.
- `v150-profile-fix.js` has been superseded by `relationship.js` and archived at `archive/js/v150-profile-fix.js`.

## Historical compatibility implementation
- `v112-fixes.js` — still runtime-active; contains profile-specific deep-check reset/save and comparison image export compatibility behavior.
- `v113-fixes.js` — still runtime-active; contains compatibility patches through v146 and dynamically loads `v120-fixes.js`.
- `v120-fixes.js` — still runtime-active through `v113-fixes.js`; comparison difference/advice and later UI compatibility patches.
- `fixes.js` — archived because `index.html` loads the active compatibility modules directly and no runtime reference to this entry point remains.

## Rule going forward
Avoid creating `v151`, `v152`, ... just for small UI fixes. Prefer updating the stable module that owns the behavior, and use a numbered file only when a genuinely isolated migration/rollback layer is needed.
