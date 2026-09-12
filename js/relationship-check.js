/* CoreLingual — stable relationship-specific partner questionnaire entry point
 *
 * Relationship-specific questions/scoring remain unchanged in the legacy
 * implementation during this migration. This stable entry point owns the
 * runtime loading boundary so the numbered file can be archived later.
 */
(function(){
  'use strict';

  const legacy='/js/v147-relationship-check.js?v=1473';
  if(document.querySelector('script[data-corelingual-relationship-check-legacy]'))return;
  const s=document.createElement('script');
  s.src=legacy;
  s.dataset.corelingualRelationshipCheckLegacy='1';
  s.onload=()=>window.dispatchEvent(new CustomEvent('corelingual:relationship-check-ready'));
  s.onerror=()=>console.warn('CoreLingual relationship questionnaire failed to load:',legacy);
  (document.body||document.documentElement).appendChild(s);
})();
