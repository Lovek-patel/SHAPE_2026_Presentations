// ============================================
// SLIDE 12 — CAR-T ELECTROPORATION
// Beat sequence (auto, holds at end for click):
//   0 — T cell appears, circular CAR plasmid nearby
//       text: "CAR-T cell engineering via electroporation."
//   1 — lightning bolt strikes cell, pores open,
//       plasmid enters cell
//       text: "Electric pulse opens transient membrane pores."
//   2 — pores close, cell recovers, starts glowing green (GFP)
//       text: "CAR construct integrates — GFP confirms expression."
//   3 — cell divides, daughters glow, colony grows
//       text: "Engineered CAR-T cells replicate."
//   4 — holds, cells wobble gently
//       text: "CAR-T cells ready for functional assays."
// ============================================

const EP_CONFIG = {
  beat0_dur: 3000,
  beat1_dur: 3000,
  beat2_dur: 4000,
  beat3_dur: 5000,
  beat4_dur: 99999,
};

const EP_TEXTS = [
  'CAR-T cell engineering via electroporation.',
  'Electric pulse opens transient membrane pores.',
  'CAR construct integrates — GFP confirms expression.',
  'Engineered CAR-T cells replicate.',
  'CAR-T cells ready for functional assays.',
];

let epAnimating  = false;
let epRAF        = null;
let epBeat       = 0;
let epBeatStart  = 0;
let epBeatTimers = [];
let epClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-electroporation') _resetEP();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-electroporation' && !epAnimating) {
    epAnimating = true; epBeat = 0; epClickReady = false;
    setTimeout(startEPAnimation, 500);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-electroporation' && !epAnimating) {
    epAnimating = true; epBeat = 0; epClickReady = false;
    setTimeout(startEPAnimation, 500);
  }
});
document.addEventListener('keydown', function(e) {
  if (!epClickReady) return;
  if (e.key !== 'ArrowRight' && e.key !== ' ' && e.key !== 'Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  epClickReady = false; Reveal.next();
}, true);

function _resetEP() {
  epAnimating = false; epBeat = 0; epClickReady = false;
  epBeatTimers.forEach(clearTimeout); epBeatTimers = [];
  if (epRAF) { cancelAnimationFrame(epRAF); epRAF = null; }
  const canvas = document.getElementById('electroporation-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('electroporation-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startEPAnimation() {
  const canvas = document.getElementById('electroporation-canvas');
  const textEl = document.getElementById('electroporation-text');
  if (!canvas) return;
  requestAnimationFrame(() => _startEPInner(canvas, textEl));
}

function _startEPInner(canvas, textEl) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const HEADER_H = 90;

  function sm(x)   { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function ease(x) { return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }
  function rnd(a,b){ return a+Math.random()*(b-a); }

  function showText(msg) {
    if (!textEl) return;
    textEl.classList.remove('visible');
    setTimeout(()=>{ textEl.innerHTML=msg; if(msg) textEl.classList.add('visible'); },300);
  }

  function scheduleBeat(b) {
    epBeat=b; epBeatStart=performance.now();
    if (EP_TEXTS[b]) showText(EP_TEXTS[b]);
    const dur=EP_CONFIG['beat'+b+'_dur'];
    if (!dur||dur===99999){ epClickReady=true; return; }
    epBeatTimers.push(setTimeout(()=>{ if(epAnimating) scheduleBeat(b+1); },dur));
  }

  // ---- state ----
  const CELL_CX = W*0.42, CELL_CY = H*0.52;
  const CELL_R  = 48;

  let cellOp       = 0;
  let cellGfp      = 0;       // 0=no gfp, 1=full green
  let poreProgress = 0;       // 0=closed, 1=fully open
  let poresClosing = false;
  let plasmidX     = CELL_CX + 120;
  let plasmidY     = CELL_CY - 80;
  let plasmidInside = false;
  let plasmidOp    = 1;
  let boltOp       = 0;
  let boltProgress = 0;

  // pore positions around cell
  const PORES = Array.from({length:8},(_,i)=>{
    const a=(i/8)*Math.PI*2;
    return { a, x:Math.cos(a)*CELL_R, y:Math.sin(a)*CELL_R };
  });

  // daughter cells
  let daughters = [];

  // ---- beat actions ----
  let _lastBeat=-1;
  function onBeat(b) {
    if(b===_lastBeat) return; _lastBeat=b;

    if(b===0){
      epBeatTimers.push(setTimeout(()=>{ cellOp=1; },200));
    }

    if(b===1){
      // lightning bolt strikes, then pores open, plasmid enters
      boltOp=1;
      epBeatTimers.push(setTimeout(()=>{
        if(!epAnimating) return;
        boltOp=0;
        poreProgress=0;
        poresClosing=false;
        // pores open over 600ms
        const openInt=setInterval(()=>{
          poreProgress=Math.min(1,poreProgress+0.025);
          if(poreProgress>=1) clearInterval(openInt);
        },16);
        // plasmid starts moving in
        epBeatTimers.push(setTimeout(()=>{
          if(!epAnimating) return;
          plasmidInside=true;
          // pores close after plasmid enters
          epBeatTimers.push(setTimeout(()=>{
            poresClosing=true;
            const closeInt=setInterval(()=>{
              poreProgress=Math.max(0,poreProgress-0.018);
              if(poreProgress<=0) clearInterval(closeInt);
            },16);
          },800));
        },700));
      },500));
    }

    if(b===2){
      // GFP starts appearing
      epBeatTimers.push(setTimeout(()=>{
        const gfpInt=setInterval(()=>{
          cellGfp=Math.min(1,cellGfp+0.005);
          if(cellGfp>=1) clearInterval(gfpInt);
        },16);
      },600));
    }

    if(b===3){
      // divide into daughters
      epBeatTimers.push(setTimeout(()=>{
        if(!epAnimating) return;
        // 4 daughters
        const positions=[
          {x:CELL_CX-90, y:CELL_CY-60},
          {x:CELL_CX+90, y:CELL_CY-60},
          {x:CELL_CX-90, y:CELL_CY+70},
          {x:CELL_CX+90, y:CELL_CY+70},
          {x:CELL_CX,    y:CELL_CY-110},
          {x:CELL_CX,    y:CELL_CY+110},
        ];
        positions.forEach((pos,i)=>{
          epBeatTimers.push(setTimeout(()=>{
            daughters.push({
              x:pos.x, y:pos.y, r:30+rnd(-4,4),
              op:0, gfp:cellGfp*0.8,
              phase:rnd(0,Math.PI*2), wobble:rnd(0,Math.PI*2),
              blobAmps:Array.from({length:8},()=>rnd(0.06,0.18)),
            });
          },i*250));
        });
      },500));
    }
  }

  // ---- DRAW: T cell (round, lymphocyte) ----
  function drawTCell(cx,cy,r,op,gfp,t) {
    if(op<0.01) return;
    ctx.save(); ctx.globalAlpha=op;

    const n=8, blobA=Array.from({length:n},()=>0.08);

    // GFP halo
    if(gfp>0.05){
      const grd=ctx.createRadialGradient(cx,cy,r*0.3,cx,cy,r*2.2);
      grd.addColorStop(0,`rgba(80,220,100,${gfp*0.35})`);
      grd.addColorStop(1,'rgba(80,220,100,0)');
      ctx.beginPath(); ctx.arc(cx,cy,r*2.2,0,Math.PI*2);
      ctx.fillStyle=grd; ctx.fill();
    }

    // pores — dark gaps in membrane
    if(poreProgress>0){
      PORES.forEach(p=>{
        const px=cx+p.x, py=cy+p.y;
        ctx.beginPath();
        ctx.arc(px,py,poreProgress*6,0,Math.PI*2);
        ctx.fillStyle=`rgba(14,14,14,${poreProgress*0.9})`; ctx.fill();
      });
    }

    // cell body
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    const rr=Math.round(lerp(160,60,gfp));
    const gg=Math.round(lerp(175,220,gfp));
    const bb=Math.round(lerp(210,80,gfp));
    ctx.fillStyle=`rgba(${rr},${gg},${bb},0.40)`;
    ctx.strokeStyle=gfp>0.1?`rgba(50,${Math.round(lerp(160,220,gfp))},65,0.85)`:'rgba(140,162,195,0.75)';
    ctx.lineWidth=2; ctx.fill(); ctx.stroke();

    // nucleus
    ctx.beginPath(); ctx.arc(cx+r*0.08,cy-r*0.05,r*0.45,0,Math.PI*2);
    ctx.fillStyle=gfp>0.1?`rgba(30,${Math.round(lerp(80,165,gfp))},40,0.65)`:'rgba(105,125,162,0.58)';
    ctx.lineWidth=0.9; ctx.fill();

    // GFP puncta
    if(gfp>0.2){
      for(let i=0;i<Math.floor(gfp*6);i++){
        const a=(i/6)*Math.PI*2+t*0.0003;
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r*0.45,cy+Math.sin(a)*r*0.45,2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(90,235,110,${gfp*0.85})`; ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---- DRAW: plasmid ----
  function drawPlasmid(x,y,op) {
    if(op<0.01) return;
    ctx.save(); ctx.globalAlpha=op;
    const r=20;
    ctx.strokeStyle='rgba(136,192,208,0.90)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+r-5,y-3); ctx.lineTo(x+r-5,y+3);
    ctx.fillStyle='rgba(136,192,208,0.90)'; ctx.fill();
    // CAR label
    ctx.font='9px Raleway,sans-serif'; ctx.fillStyle='rgba(136,192,208,0.85)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('CAR',x,y);
    ctx.restore();
  }

  // ---- DRAW: lightning bolt ----
  function drawBolt(cx,cy,r,op) {
    if(op<0.01) return;
    ctx.save(); ctx.globalAlpha=op;

    // two bolts from top-left and top-right converging on cell
    [[cx-80,HEADER_H+20],[cx+80,HEADER_H+20]].forEach(([sx,sy])=>{
      ctx.strokeStyle=`rgba(255,235,80,${op})`;
      ctx.lineWidth=3; ctx.lineCap='round';
      ctx.shadowColor='rgba(255,220,40,0.9)';
      ctx.shadowBlur=12;
      ctx.beginPath();
      ctx.moveTo(sx,sy);
      const mx=lerp(sx,cx,0.4)+rnd(-20,20);
      const my=lerp(sy,cy,0.4)+rnd(-15,15);
      ctx.lineTo(mx,my);
      ctx.lineTo(cx+(Math.random()-0.5)*10,cy-r-5);
      ctx.stroke();
    });
    ctx.shadowBlur=0;

    // flash circle on cell
    ctx.beginPath(); ctx.arc(cx,cy,r+8,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,235,80,${op*0.5})`; ctx.lineWidth=4; ctx.stroke();
    ctx.restore();
  }

  // ---- RENDER ----
  function render(t) {
    if(!epAnimating) return;
    onBeat(epBeat);
    const beat=epBeat;
    const rawP=clamp((performance.now()-epBeatStart)/Math.max(1,EP_CONFIG['beat'+beat+'_dur']||99999),0,1);

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);

    // bolt flash
    if(boltOp>0) {
      boltOp=Math.max(0,boltOp-0.04);
      drawBolt(CELL_CX,CELL_CY,CELL_R,boltOp);
    }

    // plasmid — moves toward cell center in beat 1
    if(!plasmidInside && beat<=1) {
      drawPlasmid(plasmidX,plasmidY,plasmidOp);
    } else if(plasmidInside) {
      plasmidX=lerp(plasmidX,CELL_CX,0.06);
      plasmidY=lerp(plasmidY,CELL_CY,0.06);
      plasmidOp=Math.max(0,plasmidOp-0.015);
      if(plasmidOp>0) drawPlasmid(plasmidX,plasmidY,plasmidOp);
    }

    // main cell
    if(beat<=2||daughters.length===0) {
      drawTCell(CELL_CX,CELL_CY,CELL_R,cellOp,cellGfp,t);
    } else {
      // fade main cell as daughters appear
      const mainFade=Math.max(0,1-daughters.filter(d=>d.op>0).length*0.18);
      drawTCell(CELL_CX,CELL_CY,CELL_R,cellOp*mainFade,cellGfp,t);
    }

    // daughters
    daughters.forEach(d=>{
      d.op=Math.min(1,d.op+0.018);
      d.gfp=Math.min(cellGfp,d.gfp+0.003);
      const wx=Math.sin(t*0.0009+d.wobble)*1.2;
      const wy=Math.cos(t*0.0007+d.wobble)*1.2;
      drawTCell(d.x+wx,d.y+wy,d.r,d.op,d.gfp,t);
    });

    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);
    epRAF=requestAnimationFrame(render);
  }

  scheduleBeat(0);
  epRAF=requestAnimationFrame(render);
}