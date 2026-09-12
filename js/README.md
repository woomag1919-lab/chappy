# CoreLingual JS structure

## Main modules
- `app.js` — main UI / page flow
- `data.js` — questionnaire data
- `profiles.js` — profile storage, selection and save
- `diagnosis.js` — diagnosis / result logic
- `diagnosis-save.js` — diagnosis save/close behavior
- `diagnosis-draft.js` — diagnosis edit cancel/restore behavior
- `diagnosis-scroll.js` — diagnosis sheet scroll reset
- `profile-diagnosis-reset.js` — deep-check UI reset when switching profiles
- `compare.js` — two-person comparison
- `compare-data.js` — active profile data bridge used by comparison/export
- `comparison-differences.js` — comparison difference/advice behavior formerly owned by v120
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
- `v112-fixes.js` is now only a compatibility loader for the stable diagnosis/profile modules.
- `v113-fixes.js` is now only a compatibility loader for the stable comparison/diagnosis modules.
- `v120-fixes.js` is now only a compatibility loader for `comparison-differences.js`.
- `fixes.js` — archived because the active compatibility files are loaded directly by `index.html`.

## Rule going forward
Avoid creating `v151`, `v152`, ... just for small UI fixes. Prefer updating the stable module that owns the behavior, and use a numbered file only when a genuinely isolated migration/rollback layer is needed.
