// ============================================
// SLIDE 13 — CAR-T RESULTS
// Same 3-step image sequence as slide 11
// Step 0 (auto): BF only, centered
// Step 1 (auto, 2s): BF left + GFP right
// Step 2 (click): Merge only, centered
// Step 3 (click): advance
// ============================================

let cartStep       = 0;
let cartActive     = false;
let cartTimers     = [];
let cartClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-cart-results') _resetCART();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-cart-results') {
    cartActive=true; setTimeout(startCART,400);
  }
});
Reveal.on('ready', function() {
  const s=Reveal.getCurrentSlide();
  if(s&&s.id==='slide-cart-results'){ cartActive=true; setTimeout(startCART,400); }
});
document.addEventListener('keydown', function(e) {
  if(!cartClickReady||!cartActive) return;
  if(e.key!=='ArrowRight'&&e.key!==' '&&e.key!=='Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(cartStep===1){
    cartStep=2; setCartStep(2);
    cartClickReady=true;
  } else if(cartStep===2){
    cartClickReady=false; cartActive=false; Reveal.next();
  }
},true);

function _resetCART() {
  cartActive=false; cartClickReady=false; cartStep=0;
  cartTimers.forEach(clearTimeout); cartTimers=[];
  setCartStep(0);
}

function startCART() {
  cartStep=0; cartClickReady=false; setCartStep(0);
  cartTimers.push(setTimeout(()=>{
    if(!cartActive) return;
    cartStep=1; setCartStep(1);
    cartTimers.push(setTimeout(()=>{ if(cartActive) cartClickReady=true; },1000));
  },2000));
}

function setCartStep(step) {
  const stage=document.querySelector('#slide-cart-results .results-stage');
  if(!stage) return;
  stage.classList.remove('step-0','step-1','step-2');
  stage.classList.add('step-'+step);
}