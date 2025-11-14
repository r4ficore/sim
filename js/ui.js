// js/ui.js

export function initUI() {
  console.log('[ui] initUI start');

  const canvas = document.getElementById('world-canvas');
  const btnStart = document.getElementById('btn-start');
  const btnStep = document.getElementById('btn-step');
  const btnStartAuto = document.getElementById('btn-start-auto');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');

  if (!canvas) {
    console.error('[ui] Nie znaleziono canvasu!');
    return;
  }

  // Na razie tylko logi – później tu podłączymy SimulationController
  btnStart?.addEventListener('click', () => {
    console.log('[ui] Start clicked – tutaj zainicjujemy świat (ETAP 1+2)');
  });

  btnStep?.addEventListener('click', () => {
    console.log('[ui] Step clicked – tutaj wykonamy jedną turę (ETAP 2+3)');
  });

  btnStartAuto?.addEventListener('click', () => {
    console.log('[ui] Start AUTO clicked – tutaj odpalimy autosymulację (ETAP 7)');
  });

  btnPause?.addEventListener('click', () => {
    console.log('[ui] Pause clicked – tutaj zapauzujemy autosymulację (ETAP 7)');
  });

  btnReset?.addEventListener('click', () => {
    console.log('[ui] Reset clicked – tutaj zresetujemy świat (kolejne etapy)');
  });

  console.log('[ui] initUI done');
}
