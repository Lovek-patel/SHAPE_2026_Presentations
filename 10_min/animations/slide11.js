// ============================================
// SLIDE 11 — TRANSDUCTION RESULTS
// Step 0 (auto): BF only, centered
// Step 1 (auto, 2s): BF left + GFP right
// Step 2 (click):   Merge only, centered
// Step 3 (click):   advance to next slide
// ============================================

let resultsStep       = 0;
let resultsActive     = false;
let resultsTimers     = [];
let resultsClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-results') _resetResults();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-results') {
    resultsActive = true;
    setTimeout(startResults, 400);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-results') { resultsActive=true; setTimeout(startResults,400); }
});

document.addEventListener('keydown', function(e) {
  if (!resultsClickReady || !resultsActive) return;
  if (e.key !== 'ArrowRight' && e.key !== ' ' && e.key !== 'Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();

  if (resultsStep === 1) {
    // step 1 → step 2: show merge
    resultsStep = 2;
    setStep(2);
    // next click will advance slide
    resultsClickReady = true;
  } else if (resultsStep === 2) {
    resultsClickReady = false;
    resultsActive = false;
    Reveal.next();
  }
}, true);

function _resetResults() {
  resultsActive = false;
  resultsClickReady = false;
  resultsStep = 0;
  resultsTimers.forEach(clearTimeout); resultsTimers = [];
  setStep(0);
}

function startResults() {
  resultsStep = 0;
  resultsClickReady = false;
  setStep(0);
  // auto-advance to step 1 after 2s
  resultsTimers.push(setTimeout(() => {
    if (!resultsActive) return;
    resultsStep = 1;
    setStep(1);
    // ready for click after GFP has appeared
    resultsTimers.push(setTimeout(() => {
      if (resultsActive) resultsClickReady = true;
    }, 1000));
  }, 2000));
}

function setStep(step) {
  const stage = document.querySelector('#slide-results .results-stage');
  if (!stage) return;
  // remove all step classes, add current
  stage.classList.remove('step-0','step-1','step-2');
  stage.classList.add('step-'+step);
}