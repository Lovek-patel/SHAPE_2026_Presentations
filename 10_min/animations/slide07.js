// ============================================
// SLIDE 07 — ANCHORED iRGD RESULTS
// Tunable timing at top
// ============================================

const ELISA_CONFIG = {
  STEP_DURATION_MS:  2200,   // time between each ELISA step
  ELISA_TO_DATA_MS:  3000,   // pause after last ELISA step before showing data
  NEG_TO_POS_MS:     4000,   // pause between TEV- and TEV+ appearing
};

let elisaAnimating  = false;
let elisaRAF        = null;
let elisaPhase      = 0;    // 0=elisa, 1=tev-, 2=tev+, 3=hold
let elisaClickReady = false;
let elisaStep       = -1;
let elisaStepStart  = 0;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-elisa-anc') _resetElisa();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-elisa-anc' && !elisaAnimating) {
    elisaAnimating = true; elisaPhase = 0; elisaStep = -1; elisaClickReady = false;
    setTimeout(startElisaAnimation, 500);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-elisa-anc' && !elisaAnimating) {
    elisaAnimating = true; elisaPhase = 0; elisaStep = -1; elisaClickReady = false;
    setTimeout(startElisaAnimation, 500);
  }
});

// only one click needed: advance to next slide from hold state
document.addEventListener('keydown', function(e) {
  if (!elisaClickReady) return;
  if (e.key !== 'ArrowRight' && e.key !== ' ' && e.key !== 'Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  elisaClickReady = false;
  Reveal.next();
}, true);

function _resetElisa() {
  elisaAnimating = false; elisaPhase = 0; elisaStep = -1; elisaClickReady = false;
  if (elisaRAF) { cancelAnimationFrame(elisaRAF); elisaRAF = null; }
  const canvas = document.getElementById('elisa-anc-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function startElisaAnimation() {
  const canvas = document.getElementById('elisa-anc-canvas');
  if (!canvas) return;
  requestAnimationFrame(() => _startElisaInner(canvas));
}

function _startElisaInner(canvas) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const HEADER_H = 90;

  const C = {
    accent:'#88c0d0', text:'#f0f4f8',
    subtle:'#c8d4dc', muted:'#7a8a96', bg:'#0e0e0e',
  };

  const STEPS = [
    { label:'Coat plate',       sub:'α-HA (Mouse)',       col:'rgba(136,192,208,0.95)' },
    { label:'Add sample',       sub:'HA · Myc · iRGD',    col:'rgba(185,155,85,0.95)'  },
    { label:'Add α-Myc',        sub:'α-Myc (Rabbit)',      col:'rgba(110,190,100,0.95)' },
    { label:'Add detection Ab', sub:'α-Rabbit IgG-HRP',   col:'rgba(215,145,55,0.95)'  },
    { label:'Add CMix',         sub:'Chemiluminescence',  col:'rgba(148,88,215,0.95)'  },
    { label:'Signal detected',  sub:'Luminescence read',  col:'rgba(168,100,235,0.95)' },
  ];

  let stepShown = new Array(STEPS.length).fill(false);
  let stepFaded = new Array(STEPS.length).fill(false);
  let stepTimers = [];

  function scheduleSteps() {
    STEPS.forEach((_, i) => {
      stepTimers.push(setTimeout(() => {
        if (!elisaAnimating) return;
        elisaStep = i; elisaStepStart = performance.now(); stepShown[i] = true;
        if (i > 0) setTimeout(() => { stepFaded[i-1] = true; }, 900);
      }, (i+1) * ELISA_CONFIG.STEP_DURATION_MS));
    });

    // auto-advance to data after all steps + pause
    const toData = STEPS.length * ELISA_CONFIG.STEP_DURATION_MS + ELISA_CONFIG.ELISA_TO_DATA_MS;
    stepTimers.push(setTimeout(() => {
      if (!elisaAnimating) return;
      elisaPhase = 1; // show tev-
    }, toData));

    // auto-advance to tev+
    stepTimers.push(setTimeout(() => {
      if (!elisaAnimating) return;
      elisaPhase = 2; // show tev+
    }, toData + ELISA_CONFIG.NEG_TO_POS_MS));

    // ready for final click to go to next slide
    stepTimers.push(setTimeout(() => {
      if (!elisaAnimating) return;
      elisaPhase = 3;
      elisaClickReady = true;
    }, toData + ELISA_CONFIG.NEG_TO_POS_MS + 1200));
  }

  const MAX_VAL = 6200;
  const BARS_NEG = [
    { label:'UTD',       val:55,   col:'rgba(88,164,210,0.88)'  },
    { label:'Mock',      val:140,  col:'rgba(210,100,88,0.88)'  },
    { label:'Anc-iRGD',  val:1115, col:'rgba(100,185,110,0.88)', star:true },
  ];
  const BARS_POS = [
    { label:'UTD',       val:55,   col:'rgba(88,164,210,0.88)'  },
    { label:'Mock',      val:50,   col:'rgba(210,100,88,0.88)'  },
    { label:'Anc-iRGD',  val:5600, col:'rgba(100,185,110,0.88)', star:true },
  ];

  let negBarP=[0,0,0], posBarP=[0,0,0];
  let negGrowStart=null, posGrowStart=null;

  function sm(x){ x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function ease(x){ return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }
  function stepP(i){
    if (elisaStep<i) return 0;
    if (elisaStep>i) return 1;
    return Math.min(1,(performance.now()-elisaStepStart)/700);
  }

  function drawYAb(x,y,size,col,pointsUp){
    const dir=pointsUp?1:-1;
    ctx.strokeStyle=col; ctx.lineWidth=size*0.17; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+dir*size*0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-size*0.5,y-dir*size*0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+size*0.5,y-dir*size*0.5); ctx.stroke();
  }

  function drawFig(t,fx,fy,fw,fh,opacity){
    if(opacity<0.01) return;
    ctx.save(); ctx.globalAlpha=opacity;
    const S=fw/380;
    const plateY=fy+fh*0.80;
    const plateX=fx+fw*0.08, plateW=fw*0.84;
    ctx.fillStyle='rgba(175,192,210,0.72)';
    ctx.fillRect(plateX,plateY,plateW,4*S);

    const p0=stepP(0);
    if(p0>0){
      const abX=fx+fw*0.38, abY=plateY-sm(p0)*30*S;
      ctx.globalAlpha=opacity*Math.min(1,p0*2);
      drawYAb(abX,abY,40*S,'rgba(136,192,208,0.92)',true);
      [[-0.5,-0.5],[0.5,-0.5]].forEach(([ax,ay])=>{
        ctx.beginPath(); ctx.arc(abX+40*S*ax,abY-40*S*ay*(-1),3.5*S,0,Math.PI*2);
        ctx.fillStyle='rgba(136,192,208,0.85)'; ctx.fill();
      });
    }

    const p1=stepP(1);
    if(p1>0){
      const baseX=fx+fw*0.30, baseY=plateY-72*S-(1-sm(p1))*60*S;
      ctx.globalAlpha=opacity*Math.min(1,p1*2);
      const sCol='rgba(185,155,85,0.90)', S2=S;
      const haX=baseX+12*S2, haY=baseY;
      const myX=baseX+52*S2, myY=baseY-4*S2;
      const irX=baseX+95*S2, irY=baseY-8*S2;
      const tw=20*S2, rw=20*S2, rh=14*S2, r=10*S2;

      ctx.strokeStyle=sCol; ctx.lineWidth=1.8*S2; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(haX+tw*0.5,haY); ctx.lineTo(myX-rw*0.5,myY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(myX+rw*0.5,myY); ctx.lineTo(irX-r,irY); ctx.stroke();

      ctx.beginPath(); ctx.moveTo(haX,haY-tw*0.55); ctx.lineTo(haX-tw*0.55,haY+tw*0.40); ctx.lineTo(haX+tw*0.55,haY+tw*0.40); ctx.closePath();
      ctx.fillStyle=sCol; ctx.fill();
      ctx.font=`bold ${Math.round(8.5*S2)}px Raleway,sans-serif`; ctx.fillStyle='white'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('HA',haX,haY+3*S2);

      ctx.beginPath(); ctx.roundRect(myX-rw*0.5,myY-rh*0.5,rw,rh,2*S2); ctx.fillStyle=sCol; ctx.fill();
      ctx.font=`bold ${Math.round(8.5*S2)}px Raleway,sans-serif`; ctx.fillStyle='white'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('Myc',myX,myY);

      ctx.beginPath(); ctx.arc(irX,irY,r,0,Math.PI*2); ctx.fillStyle=sCol; ctx.fill();
      ctx.font=`bold ${Math.round(8*S2)}px Raleway,sans-serif`; ctx.fillStyle='white'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('iRGD',irX,irY);

      if(p1>0.75){
        const abX=fx+fw*0.38, abY=plateY-sm(1)*30*S;
        const armTipR={x:abX+40*S*0.5,y:abY-40*S*0.5};
        ctx.globalAlpha=opacity*(p1-0.75)/0.25;
        ctx.strokeStyle='rgba(136,192,208,0.55)'; ctx.lineWidth=1.5*S;
        ctx.setLineDash([3*S,3*S]);
        ctx.beginPath(); ctx.moveTo(haX,haY+tw*0.40); ctx.lineTo(armTipR.x,armTipR.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const p2=stepP(2);
    if(p2>0){
      const baseX=fx+fw*0.30, myX=baseX+52*S, myY=(plateY-72*S)-4*S;
      const abX=myX+8*S, abY=myY-35*S-(1-sm(p2))*55*S;
      ctx.globalAlpha=opacity*Math.min(1,p2*2);
      drawYAb(abX,abY,34*S,'rgba(110,190,100,0.92)',false);
      if(p2>0.7){
        const armTipL={x:abX-34*S*0.5,y:abY+34*S*0.5};
        ctx.globalAlpha=opacity*(p2-0.7)/0.3;
        ctx.strokeStyle='rgba(110,190,100,0.55)'; ctx.lineWidth=1.5*S;
        ctx.setLineDash([3*S,3*S]);
        ctx.beginPath(); ctx.moveTo(myX,myY-7*S); ctx.lineTo(armTipL.x,armTipL.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const p3=stepP(3);
    if(p3>0){
      const baseX=fx+fw*0.30, myX=baseX+52*S, myY=(plateY-72*S)-4*S;
      const aMycX=myX+8*S, aMycY=myY-35*S;
      const hrpR={x:aMycX+34*S*0.5,y:aMycY+34*S*0.5};
      const abX=hrpR.x+6*S, abY=hrpR.y-32*S-(1-sm(p3))*50*S;
      ctx.globalAlpha=opacity*Math.min(1,p3*2);
      drawYAb(abX,abY,30*S,'rgba(215,145,55,0.92)',false);
      const hrpTip={x:abX+30*S*0.5,y:abY+30*S*0.5};
      ctx.beginPath(); ctx.arc(hrpTip.x,hrpTip.y,9*S,0,Math.PI*2);
      ctx.fillStyle='rgba(215,145,55,0.88)'; ctx.fill();
      ctx.font=`bold ${Math.round(7.5*S)}px Raleway,sans-serif`; ctx.fillStyle='white'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('HRP',hrpTip.x,hrpTip.y);
      if(p3>0.7){
        const armTipL={x:abX-30*S*0.5,y:abY+30*S*0.5};
        ctx.globalAlpha=opacity*(p3-0.7)/0.3;
        ctx.strokeStyle='rgba(215,145,55,0.55)'; ctx.lineWidth=1.5*S;
        ctx.setLineDash([3*S,3*S]);
        ctx.beginPath(); ctx.moveTo(hrpR.x,hrpR.y); ctx.lineTo(armTipL.x,armTipL.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const p4=stepP(4);
    if(p4>0){
      const baseX=fx+fw*0.30, myX=baseX+52*S, myY=(plateY-72*S)-4*S;
      const gx=myX, gy=myY-55*S;
      ctx.globalAlpha=opacity*sm(p4)*0.65;
      const grd=ctx.createRadialGradient(gx,gy,2*S,gx,gy,65*S);
      grd.addColorStop(0,'rgba(148,88,215,0.92)');
      grd.addColorStop(0.45,'rgba(120,65,192,0.42)');
      grd.addColorStop(1,'rgba(80,40,160,0)');
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(gx,gy,65*S,0,Math.PI*2); ctx.fill();
    }

    const p5=stepP(5);
    if(p5>0){
      const baseX=fx+fw*0.30, myX=baseX+52*S, myY=(plateY-72*S)-4*S;
      const gx=myX, gy=myY-55*S;
      const pulse=0.5+0.5*Math.sin(performance.now()*0.004);
      ctx.globalAlpha=opacity*sm(p5)*(0.55+0.20*pulse);
      const grd=ctx.createRadialGradient(gx,gy,4*S,gx,gy,75*S);
      grd.addColorStop(0,'rgba(168,100,235,0.95)');
      grd.addColorStop(0.35,'rgba(140,70,210,0.50)');
      grd.addColorStop(1,'rgba(90,40,170,0)');
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(gx,gy,75*S,0,Math.PI*2); ctx.fill();
    }

    ctx.globalAlpha=1; ctx.restore();
  }

  function drawStepLabels(lx,ly,lh,opacity){
    if(opacity<0.01) return;
    ctx.save();
    ctx.globalAlpha=opacity;
    ctx.font='600 18px Raleway,sans-serif';
    ctx.fillStyle='rgba(136,192,208,0.95)';
    ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText('ELISA',lx,ly);

    const startY=ly+30, lineH=(lh-30)/STEPS.length;
    STEPS.forEach((s,i)=>{
      if(!stepShown[i]) return;
      const ty=startY+i*lineH+lineH*0.4;
      const fresh=i===elisaStep, faded=stepFaded[i];
      const op=faded?0.28:fresh?1.0:0.60;
      ctx.globalAlpha=opacity*op;
      ctx.beginPath(); ctx.arc(lx+6,ty,4,0,Math.PI*2);
      ctx.fillStyle=s.col; ctx.fill();
      ctx.font=fresh?'500 14px Raleway,sans-serif':'400 13px Raleway,sans-serif';
      ctx.fillStyle=fresh?C.text:C.subtle; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText(s.label,lx+16,ty-5);
      ctx.font='400 11px Raleway,sans-serif';
      ctx.fillStyle=faded?C.muted:s.col;
      ctx.fillText(s.sub,lx+16,ty+9);
    });
    ctx.globalAlpha=1; ctx.restore();
  }

  function drawBarChart(chartX,chartY,chartW,chartH,bars,barP,title,opacity){
    if(opacity<0.01) return;
    ctx.save(); ctx.globalAlpha=opacity;

    const padL=chartW*0.20,padB=chartH*0.22,padT=chartH*0.14,padR=chartW*0.04;
    const plotX=chartX+padL, plotY=chartY+padT;
    const plotW=chartW-padL-padR, plotH=chartH-padT-padB;

    // "DATA" heading (only drawn once, shared — caller handles positioning)
    // section title
    ctx.font='500 14px Raleway,sans-serif';
    ctx.fillStyle=C.accent; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(title,chartX+chartW/2,chartY+4);

    ctx.strokeStyle='rgba(160,175,192,0.45)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(plotX,plotY); ctx.lineTo(plotX,plotY+plotH); ctx.lineTo(plotX+plotW,plotY+plotH); ctx.stroke();

    [0,1000,2000,3000,4000,5000,6000].forEach(v=>{
      const vy=plotY+plotH-plotH*(v/MAX_VAL);
      ctx.strokeStyle='rgba(130,145,162,0.14)'; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(plotX,vy); ctx.lineTo(plotX+plotW,vy); ctx.stroke();
      ctx.font='12px Raleway,sans-serif';
      ctx.fillStyle='rgba(150,165,182,0.75)'; ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillText(v===0?'0':v>=1000?(v/1000)+'k':''+v,plotX-5,vy);
    });

    ctx.save(); ctx.translate(chartX+9,plotY+plotH/2); ctx.rotate(-Math.PI/2);
    ctx.font='11px Raleway,sans-serif'; ctx.fillStyle='rgba(150,165,182,0.62)';
    ctx.textAlign='center'; ctx.fillText('Relative Intensity',0,0); ctx.restore();

    const gapW=plotW/bars.length, barW=gapW*0.42;
    bars.forEach((b,i)=>{
      const bh=plotH*(b.val/MAX_VAL)*ease(barP[i]);
      const bx=plotX+i*gapW+(gapW-barW)/2, by=plotY+plotH-bh;
      ctx.fillStyle=b.col;
      ctx.beginPath(); ctx.roundRect(bx,by,barW,Math.max(2,bh),[3,3,0,0]); ctx.fill();
      if(b.star&&bh>8){
        ctx.font='bold 18px serif'; ctx.fillStyle='rgba(255,215,55,0.92)';
        ctx.textAlign='center'; ctx.textBaseline='bottom';
        ctx.fillText('★',bx+barW/2,by-8);
      }
      ctx.font='12px Raleway,sans-serif';
      ctx.fillStyle='rgba(185,198,215,0.85)'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(b.label,bx+barW/2,plotY+plotH+7);
    });

    ctx.globalAlpha=1; ctx.restore();
  }

  function render(t){
    if(!elisaAnimating) return;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,HEADER_H);

    const phase=elisaPhase;

    if(phase===0){
      // full ELISA
      drawStepLabels(W*0.02,HEADER_H+10,H-HEADER_H-20,1);
      drawFig(t,W*0.24,HEADER_H+8,W*0.54,H-HEADER_H-16,1);
    } else {
      // split: elisa dimmed left, data right
      const elisaOp=0.32;
      drawStepLabels(W*0.01,HEADER_H+10,H-HEADER_H-20,elisaOp);
      drawFig(t,W*0.14,HEADER_H+8,W*0.26,H-HEADER_H-16,elisaOp);

      // dim "ELISA" label
      ctx.font='600 14px Raleway,sans-serif';
      ctx.fillStyle='rgba(136,192,208,0.30)';
      ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText('ELISA',W*0.01,HEADER_H+10);

      // "DATA" heading bright
      ctx.font='600 18px Raleway,sans-serif';
      ctx.fillStyle='rgba(136,192,208,0.95)';
      ctx.textAlign='left';
      ctx.fillText('Data',W*0.43,HEADER_H+10);

      // divider
      ctx.strokeStyle='rgba(55,65,75,0.45)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(W*0.42,HEADER_H+8); ctx.lineTo(W*0.42,H-8); ctx.stroke();

      // tev- chart — always full brightness
      if(phase>=1){
        if(!negGrowStart) negGrowStart=t;
        negBarP=negBarP.map((p,i)=>Math.min(1,p+((t-negGrowStart-i*150>0)?0.040:0)));
        drawBarChart(W*0.43,HEADER_H+28,W*0.27,H-HEADER_H-44,BARS_NEG,negBarP,'− TEV Protease',1);
      }

      // tev+ chart — always full brightness
      if(phase>=2){
        if(!posGrowStart) posGrowStart=t;
        posBarP=posBarP.map((p,i)=>Math.min(1,p+((t-posGrowStart-i*150>0)?0.036:0)));
        drawBarChart(W*0.72,HEADER_H+28,W*0.27,H-HEADER_H-44,BARS_POS,posBarP,'+ TEV Protease',1);
      }
    }

    ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,HEADER_H);
    elisaRAF=requestAnimationFrame(render);
  }

  scheduleSteps();
  elisaRAF=requestAnimationFrame(render);
}