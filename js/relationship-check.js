/* CoreLingual — stable relationship-specific partner questionnaire entry point
 *
 * Relationship-specific questions and scoring are kept here so the runtime
 * no longer needs a numbered v147 implementation file.
 */
(function(){
  'use strict';

  /* Migration note: this file is intentionally a thin stable entry point.
   * The current questionnaire implementation remains unchanged in v147 until
   * the runtime switch is verified. This prevents a behavior change during
   * the cleanup migration.
   */
  const legacy='/js/v147-relationship-check.js?v=1473';
  if(document.querySelector('script[data-corelingual-relationship-check-legacy]'))return;
  const s=document.createElement('script');
  s.src=legacy;
  s.dataset.corelingualRelationshipCheckLegacy='1';
  s.onload=()=>window.dispatchEvent(new CustomEvent('corelingual:relationship-check-ready'));
  s.onerror=()=>console.warn('CoreLingual relationship questionnaire failed to load:',legacy);
  (document.body||document.documentElement).appendChild(s);
})();
