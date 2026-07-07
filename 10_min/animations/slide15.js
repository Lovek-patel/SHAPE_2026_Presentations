// ============================================
// SLIDE 15 — MURINE ELISA RESULTS
// Three grouped bar charts side by side
// Groups: WT, iRGD, iRGE
// Timepoints: Day -1, 3, 7, 11
// Data from 20260603 ELISA file
// ============================================

const ELISA_DATA = {
  WT: [
    { day:'Day −1', avg:4548738, sem:375998  },
    { day:'Day 3',  avg:4916988, sem:446645  },
    { day:'Day 7',  avg:4720113, sem:167304  },
    { day:'Day 11', avg:0,       sem:32911   },
  ],
  iRGD: [
    { day:'Day −1', avg:521500,  sem:250718  },
    { day:'Day 3',  avg:238750,  sem:199645  },
    { day:'Day 7',  avg:2220125, sem:384955  },
    { day:'Day 11', avg:0,       sem:165681  },
  ],
  iRGE: [
    { day:'Day −1', avg:1536000, sem:897902  },
    { day:'Day 3',  avg:0,       sem:461140  },
    { day:'Day 7',  avg:2365000, sem:575647  },
    { day:'Day 11', avg:4981750, sem:1279850 },
  ],
};

const GROUP_COLS = {
  WT:   { bar:'rgba(136,192,208,0.82)', err:'rgba(90,155,178,0.90)',  label:'rgba(136,192,208,0.92)' },
  iRGD: { bar:'rgba(100,192,118,0.82)', err:'rgba(60,152,80,0.90)',   label:'rgba(100,192,118,0.92)' },
  iRGE: { bar:'rgba(205,160,55,0.82)',  err:'rgba(168,124,28,0.90)',  label:'rgba(205,160,55,0.92)'  },
};

let elisaRAnimating  = false;
let elisaRRAF        = null;
let elisaRClickReady = false;
let elisaRBarP       = { WT:[0,0,0,0], iRGD:[0,0,0,0], iRGE:[0,0,0,0] };

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-elisa-results') _resetElisaR();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-elisa-results' && !elisaRAnimating) {
    elisaRAnimating=true; elisaRClickReady=false;
    elisaRBarP={ WT:[0,0,0,0], iRGD:[0,0,0,0], iRGE:[0,0,0,0] };
    setTimeout(startElisaR, 400);
  }
});
Reveal.on('ready', function() {
  const s=Reveal.getCurrentSlide();
  if(s&&s.id==='slide-elisa-results'&&!elisaRAnimating){
    elisaRAnimating=true; elisaRClickReady=false;
    elisaRBarP={ WT:[0,0,0,0], iRGD:[0,0,0,0], iRGE:[0,0,0,0] };
    setTimeout(startElisaR, 400);
  }
});
document.addEventListener('keydown', function(e) {
  if(!elisaRClickReady) return;
  if(e.key!=='ArrowRight'&&e.key!==' '&&e.key!=='Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  elisaRClickReady=false; Reveal.next();
},true);

function _resetElisaR() {
  elisaRAnimating=false; elisaRClickReady=false;
  if(elisaRRAF){ cancelAnimationFrame(elisaRRAF); elisaRRAF=null; }
  const canvas=document.getElementById('elisa-results-canvas');
  if(canvas) canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
}

function startElisaR() {
  const canvas=document.getElementById('elisa-results-canvas');
  if(!canvas) return;
  requestAnimationFrame(()=>_startElisaRInner(canvas));
}

function _startElisaRInner(canvas) {
  const par=canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W=canvas.width, H=canvas.height;
  const ctx=canvas.getContext('2d');
  const HEADER_H=90;

  function sm(x){ x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function ease(x){ return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }

  const MAX_VAL = 6000000; // y axis max (round number above max avg)
  const groups  = Object.keys(ELISA_DATA);

  // stagger bar growth on entry
  let startTime=null;
  const STAGGER_MS=120;

  // ---- DRAW: one grouped bar chart ----
  function drawGroupChart(chartX,chartY,chartW,chartH,groupName,barPs) {
    const data=ELISA_DATA[groupName];
    const col=GROUP_COLS[groupName];
    const padL=chartW*0.18, padB=chartH*0.18, padT=chartH*0.10, padR=chartW*0.04;
    const plotX=chartX+padL, plotY=chartY+padT;
    const plotW=chartW-padL-padR, plotH=chartH-padT-padB;

    // group title
    ctx.font='bold 17px Raleway,sans-serif';
    ctx.fillStyle=col.label; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(groupName, chartX+chartW/2, chartY+2);

    // axes
    ctx.strokeStyle='rgba(160,175,192,0.45)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(plotX,plotY); ctx.lineTo(plotX,plotY+plotH);
    ctx.lineTo(plotX+plotW,plotY+plotH); ctx.stroke();

    // y gridlines + labels
    [0,1,2,3,4,5,6].forEach(v=>{
      const vy=plotY+plotH-plotH*(v/6);
      ctx.strokeStyle='rgba(130,145,162,0.13)'; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.moveTo(plotX,vy); ctx.lineTo(plotX+plotW,vy); ctx.stroke();
      ctx.font='12px Raleway,sans-serif';
      ctx.fillStyle='rgba(150,165,182,0.72)'; ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillText(v>0?(v+'M'):'0', plotX-4, vy);
    });

    // y-axis label
    ctx.save(); ctx.translate(chartX+7,plotY+plotH/2); ctx.rotate(-Math.PI/2);
    ctx.font='11px Raleway,sans-serif'; ctx.fillStyle='rgba(150,165,182,0.60)';
    ctx.textAlign='center'; ctx.fillText('RLU',0,0); ctx.restore();

    // bars
    const gapW=plotW/data.length;
    const barW=gapW*0.52;
    data.forEach((d,i)=>{
      const bh=plotH*(d.avg/MAX_VAL)*ease(barPs[i]);
      const bx=plotX+i*gapW+(gapW-barW)/2;
      const by=plotY+plotH-bh;

      ctx.fillStyle=col.bar;
      ctx.beginPath(); ctx.roundRect(bx,by,barW,Math.max(2,bh),[3,3,0,0]); ctx.fill();

      // SEM error bar
      if(d.avg>0&&barPs[i]>0.5){
        const semH=plotH*(d.sem/MAX_VAL)*ease(barPs[i]);
        ctx.strokeStyle=col.err; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(bx+barW/2,by-semH); ctx.lineTo(bx+barW/2,by+semH); ctx.stroke();
        // caps
        ctx.beginPath(); ctx.moveTo(bx+barW/2-4,by-semH); ctx.lineTo(bx+barW/2+4,by-semH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx+barW/2-4,by+semH); ctx.lineTo(bx+barW/2+4,by+semH); ctx.stroke();
      }

      // x label
      ctx.font='12px Raleway,sans-serif';
      ctx.fillStyle='rgba(185,198,215,0.82)'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(d.day, bx+barW/2, plotY+plotH+5);
    });
  }

  // ---- RENDER ----
  function render(t) {
    if(!elisaRAnimating) return;
    if(!startTime) startTime=t;
    const elapsed=t-startTime;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);

    // grow bars staggered
    groups.forEach((g,gi)=>{
      ELISA_DATA[g].forEach((_,i)=>{
        const delay=(gi*4+i)*STAGGER_MS;
        const barElapsed=Math.max(0,elapsed-delay-200);
        elisaRBarP[g][i]=Math.min(1,elisaRBarP[g][i]+(barElapsed>0?0.038:0));
      });
    });

    // three charts side by side
    const margin=14;
    const chartW=(W-margin*4)/3;
    const chartH=H-HEADER_H-16;

    groups.forEach((g,i)=>{
      const cx=margin+(chartW+margin)*i;
      drawGroupChart(cx, HEADER_H+8, chartW, chartH, g, elisaRBarP[g]);
    });

    // check if done — set clickReady after all bars grown
    const allDone=groups.every(g=>elisaRBarP[g].every(p=>p>=1));
    if(allDone&&!elisaRClickReady) elisaRClickReady=true;

    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);
    elisaRRAF=requestAnimationFrame(render);
  }

  elisaRRAF=requestAnimationFrame(render);
}