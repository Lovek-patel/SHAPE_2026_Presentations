DAYS.push({label:'Day 3 — The Glomerulus', short:'D3', slides:[

/* ── TITLE ─────────────────────────────────────────────────────── */
{layout:'title', kicker:'Day 3 · Ch. 3 / 10', title:'The Glomerulus',
 subtitle:'Structure, then the forces that make it filter',
 meta:'Lead: Love · ~15 min structure + math'},

/* ── BOWMAN HISTORY ─────────────────────────────────────────────── */
{title:'William Bowman, 1842', kind:'Hook', kicker:'A bit of history',
 block:{type:'split-visual',
   body:'William Bowman described the glomerular capsule in 1842 based on microscopic anatomy alone, before any tools existed to measure pressure or flow. His conclusion — that the structure functioned as a pressure-driven filter — was not directly confirmed by measurement until the 1920s.',
   diagram:'<img src="assets/bowman_portrait.jpeg" alt="William Bowman" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── RENAL CORPUSCLE ────────────────────────────────────────────── */
{title:'The renal corpuscle', kind:'Anatomy', kicker:'3.1 The Renal Corpuscle',
 subtitle:'Every nephron starts here: a tuft of capillaries wrapped inside a capsule.',
 block:{type:'split-visual',
   body:[
     '<strong>Glomerular capillaries</strong> — a tuft fed by the afferent arteriole, drained by the efferent arteriole. Mesangial cells sit between loops, providing structural support and contractile tone.',
     "<strong>Bowman's capsule</strong> — wraps the capillary tuft, collecting the filtrate as it forms. The space inside is Bowman's space, where filtrate becomes the start of tubular fluid."
   ],
   diagram:'<img src="assets/bowman_capsule.png" alt="Histology of Bowman\'s capsule" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── FILTRATION BARRIER ─────────────────────────────────────────── */
{title:'The filtration barrier: three layers, one job', kind:'Anatomy',
 kicker:'3.4 The Glomerular Filtration Barrier',
 subtitle:'Everything that crosses from blood to filtrate has to pass through all three.',
 block:{type:'stack', items:[
   {type:'filtration-animation'},
   {type:'icon-row', items:[
     {icon:'grid',   h:'Fenestrated endothelium',    p:'Full of pores. Lets water and small solutes through freely, excludes blood cells.'},
     {icon:'layers', h:'Basement membrane',           p:'Dense extracellular matrix. The main size and charge barrier.'},
     {icon:'branch', h:'Podocytes & slit diaphragm', p:'Interdigitating foot processes. The slit diaphragm between them is the final, finest filter.'},
   ]}
 ]}},

/* ── SELECTIVITY ────────────────────────────────────────────────── */
{title:'Selectivity: who gets through, and why', kind:'Anatomy',
 kicker:'3.5 Selectivity of the Filtration Barrier',
 block:{type:'selectivity-layout'}},

/* ── TRANSITION ─────────────────────────────────────────────────── */
{title:'So what determines how much filters, and how fast?', kind:'Transition',
 kicker:'From structure to force',
 block:{type:'callout-large', text:'Everything we just described is built to do one thing: hold a pressure gradient across a membrane. The next part of the lecture is about quantifying that gradient, and what it predicts.'}},

/* ── DIVIDER ────────────────────────────────────────────────────── */
{layout:'divider', kicker:'At the board', title:'The Math: Forces at the Filter',
 subtitle:'Deriving net filtration pressure and GFR from first principles', tag:'Derivation'},

/* ── FOUR FORCES ────────────────────────────────────────────────── */
{title:'Four forces, one membrane', kind:'Math · Setup', kicker:'10.1.1 Physical Intuition',
 subtitle:'Imagine the glomerular capillary wall as a membrane separating two compartments.',
 block:{type:'formula-values',
   lines:[
     'P<sub>GC</sub> — hydrostatic pressure in the capillary (pushes fluid <span class="hl">out</span>)',
     'P<sub>BS</sub> — hydrostatic pressure in Bowman\'s space (pushes <span class="hl">back</span>)',
     'π<sub>GC</sub> — oncotic pressure of plasma proteins (draws fluid <span class="hl">in</span>)',
     'π<sub>BS</sub> — oncotic pressure in Bowman\'s space (normally ≈ 0, favors filtration)',
   ],
   note:'Net filtration = outward forces minus inward forces'}},

/* ── STARLING ───────────────────────────────────────────────────── */
{title:'The Starling equation', kind:'Math · Derivation', kicker:'10.1.2 Formal Derivation',
 block:{type:'formula', lines:[
   'P<sub>UF</sub> = (P<sub>GC</sub> − P<sub>BS</sub>) − (π<sub>GC</sub> − π<sub>BS</sub>)',
   'SNGFR = K<sub>f</sub> · P<sub>UF</sub>',
 ], note:'K<sub>f</sub> = L<sub>p</sub> · S — ultrafiltration coefficient: hydraulic permeability × filtration surface area'}},

/* ── NUMBERS ────────────────────────────────────────────────────── */
{title:'Plugging in real numbers', kind:'Math · Worked Example', kicker:'10.1.3 Normal Values',
 block:{type:'formula-values',
   lines:[
     'P<sub>UF</sub> = (60 − 18) − (25 − 0) = <span class="hl">17 mmHg</span>',
     'GFR = K<sub>f</sub> · P<sub>UF</sub> = 12.5 × 17 ≈ <span class="hl">125 mL/min</span>',
   ],
   note:'Whole-kidney K<sub>f</sub> ≈ 12.5 mL/min/mmHg',
   values:[
     {k:'P<sub>GC</sub>',  v:'60 mmHg'},
     {k:'P<sub>BS</sub>',  v:'18 mmHg'},
     {k:'π<sub>GC</sub>',  v:'25 mmHg'},
     {k:'π<sub>BS</sub>',  v:'~0 mmHg'},
   ]}},

/* ── WHY π_GC RISES ALONG THE CAPILLARY ────────────────────────── */
{title:'Why π<sub>GC</sub> is not actually constant', kind:'Math · Nuance',
 kicker:'The oncotic pressure rise along the capillary',
 block:{type:'two-col',
   left:{h:'What we assumed', body:[
     'π<sub>GC</sub> = 25 mmHg fixed — a single number for the whole capillary',
     'This gives P<sub>UF</sub> = 17 mmHg everywhere along the capillary',
     'Clean, tractable, and approximately right for a first pass',
   ]},
   right:{h:'What actually happens', body:[
     'As plasma is filtered, protein stays behind — oncotic pressure rises',
     'π<sub>GC</sub>(x) ≈ 50 − 20·e<sup>−x/10</sup> mmHg along the capillary length',
     'P<sub>UF</sub> falls to zero before the end of the capillary — filtration equilibrium',
     'The full Deen model integrates this — that is what the simulation runs',
   ]}}},

/* ── PI_BS NUANCE ───────────────────────────────────────────────── */
{title:'Why π<sub>BS</sub> matters even when it is small', kind:'Math · Nuance',
 kicker:'A modeling choice worth flagging',
 block:{type:'assumptions', items:[
   'Under normal conditions π<sub>BS</sub> ≈ 0–2 mmHg — omitting it introduces only ~5% error',
   'In nephrotic syndrome, albumin crosses the barrier and π<sub>BS</sub> can rise to 3–8 mmHg, meaningfully lowering P<sub>UF</sub>',
   'A complete model always keeps π<sub>BS</sub> — it is the difference between a model that works under normal conditions and one that still works when the patient is sick',
 ]}},

/* ── DIVIDER: GFR + RPF ─────────────────────────────────────────── */
{layout:'divider', kicker:'Measuring the filter', title:'GFR and Renal Plasma Flow',
 subtitle:'What they are, why they matter, and how we measure them', tag:'Clearance'},

/* ── WHAT IS GFR ────────────────────────────────────────────────── */
{title:'Glomerular filtration rate', kind:'Math · Definition', kicker:'10.4 GFR — What it is',
 block:{type:'split-visual',
   body:[
     {type:'stat-grid', items:[
       {num:'125', lbl:'mL/min — normal GFR in a healthy adult'},
       {num:'180', lbl:'L/day — total volume filtered every 24 hours'},
       {num:'99%', lbl:'of that filtrate is reabsorbed — only 1–2 L becomes urine'},
     ]},
   ],
   diagram:`<div style="background:var(--teal-100);border-radius:14px;padding:32px 28px;display:flex;flex-direction:column;gap:16px;height:100%;justify-content:center;">
     <p style="font-family:var(--font-mono);font-size:14px;color:var(--teal-700);margin:0;">Why it matters</p>
     <p style="font-size:20px;line-height:1.55;color:var(--ink);margin:0;">GFR is the single most important number in nephrology. It tells you how much kidney function a patient has. Below 60 mL/min for 3+ months is chronic kidney disease. Below 15 is kidney failure.</p>
     <div style="border-top:1px solid var(--line);padding-top:14px;">
       <p style="font-family:var(--font-mono);font-size:13px;color:var(--muted);margin:0;">CKD stages are defined entirely by GFR. Every treatment decision follows from it.</p>
     </div>
   </div>`}},

/* ── GFR EQUATION ───────────────────────────────────────────────── */
{title:'How we measure GFR', kind:'Math · Measurement', kicker:'10.4.1 Measuring GFR',
 subtitle:'We cannot measure filtration directly. We infer it from how a tracer substance behaves.',
 block:{type:'stack', items:[
   {type:'formula', lines:[
     'GFR = C<sub>inulin</sub> = (U<sub>in</sub> · V̇) / P<sub>in</sub>',
   ], note:'Inulin is freely filtered, never reabsorbed, never secreted — so everything that is filtered must be excreted. Amount filtered = K<sub>f</sub>·P<sub>UF</sub>·GFR = amount in urine.'},
   {type:'two-col',
     left:{h:'Why inulin works', body:[
       'Freely filtered: molecular weight ~5,000 Da, passes the barrier without restriction',
       'Not reabsorbed: tubule cells have no transporter for it',
       'Not secreted: it cannot enter the tubule from the interstitium',
       'Therefore: filtered load = excreted load, and C<sub>inulin</sub> = GFR exactly',
     ]},
     right:{h:'In clinical practice', body:[
       'Inulin infusion is the gold standard but requires IV infusion and timed urine collection',
       'Creatinine clearance is used instead — endogenous, no infusion needed',
       'eGFR (estimated) uses serum creatinine + age + sex — good enough for most clinical decisions',
       'Limitation: creatinine is also secreted by the proximal tubule, so C<sub>Cr</sub> slightly overestimates true GFR',
     ]}},
 ]}},

/* ── WHAT IS RPF ────────────────────────────────────────────────── */
{title:'Renal plasma flow', kind:'Math · Definition', kicker:'10.4 RPF — What it is',
 block:{type:'split-visual',
   body:[
     {type:'stat-grid', items:[
       {num:'600',  lbl:'mL/min — normal renal plasma flow'},
       {num:'1,200', lbl:'mL/min — total renal blood flow (plasma + cells)'},
       {num:'20%',   lbl:'filtration fraction = GFR / RPF'},
     ]},
   ],
   diagram:`<div style="background:var(--teal-100);border-radius:14px;padding:32px 28px;display:flex;flex-direction:column;gap:16px;height:100%;justify-content:center;">
     <p style="font-family:var(--font-mono);font-size:14px;color:var(--teal-700);margin:0;">Why it matters</p>
     <p style="font-size:20px;line-height:1.55;color:var(--ink);margin:0;">RPF tells you how much plasma the kidney is seeing per minute. GFR tells you how much of it gets filtered. The ratio (filtration fraction) tells you how hard the kidney is working relative to its blood supply.</p>
     <div style="border-top:1px solid var(--line);padding-top:14px;">
       <p style="font-family:var(--font-mono);font-size:13px;color:var(--muted);margin:0;">A high FF means the kidney is filtering aggressively: common in early diabetes and volume depletion.</p>
     </div>
   </div>`}},

/* ── RPF EQUATION ───────────────────────────────────────────────── */
{title:'How we measure RPF', kind:'Math · Measurement', kicker:'10.4.2 Measuring RPF',
 subtitle:'We need a substance that is completely removed from plasma in a single pass through the kidney.',
 block:{type:'stack', items:[
   {type:'formula', lines:[
     'RPF = C<sub>PAH</sub> = (U<sub>PAH</sub> · V̇) / P<sub>PAH</sub>',
     'FF = GFR / RPF',
   ], note:'PAH (para-aminohippuric acid) is filtered AND secreted by the proximal tubule. At low plasma concentrations, ~90% is removed in one pass, so C<sub>PAH</sub> ≈ RPF.'},
   {type:'two-col',
     left:{h:'Why PAH works', body:[
       'Filtered at the glomerulus — same as any small freely filtered molecule',
       'Actively secreted by organic anion transporters (OAT1/3) in the proximal tubule',
       'At low concentrations, extraction is ~91% — close enough to 100% that C<sub>PAH</sub> ≈ RPF',
     ]},
     right:{h:'What changes RPF', body:[
       'Afferent arteriole dilation: increases RPF and GFR together',
       'Efferent arteriole constriction: decreases RPF but maintains or increases GFR — raises FF',
       'Volume depletion: both RPF and GFR fall, but RPF falls more — FF rises',
       'NSAID use: blocks prostaglandin-mediated afferent dilation — RPF and GFR both drop',
     ]}},
 ]}},

/* ── WORKED EXAMPLE ─────────────────────────────────────────────── */
{title:'Putting the numbers together', kind:'Math · Worked Example', kicker:'10.4.5 Full Example',
 block:{type:'formula-values',
   lines:[
     'GFR = C<sub>inulin</sub> = (125 mg/mL × 1 mL/min) / 1.04 mg/mL = <span class="hl">120 mL/min</span>',
     'RPF = C<sub>PAH</sub> = (30 mg/mL × 1 mL/min) / 0.05 mg/mL = <span class="hl">600 mL/min</span>',
     'FF = GFR / RPF = 120 / 600 = <span class="hl">20%</span>',
   ],
   note:'FE<sub>Na</sub> = (U<sub>Na</sub>/P<sub>Na</sub>) / (U<sub>Cr</sub>/P<sub>Cr</sub>) × 100 — fractional excretion of sodium, a marker of tubular function',
   values:[
     {k:'GFR',                        v:'120 mL/min'},
     {k:'RPF',                        v:'600 mL/min'},
     {k:'FF',                         v:'20%'},
     {k:'FE<sub>Na</sub>',            v:'0.48%'},
   ]}},

/* ── ASSUMPTIONS ────────────────────────────────────────────────── */
{title:'What we assumed to get here', kind:'Math · Assumptions',
 kicker:'Tying back to the modeling theme',
 subtitle:'Every number on the last few slides depended on a simplification.',
 block:{type:'assumptions', items:[
   'P<sub>GC</sub> and P<sub>BS</sub> were treated as constant along the capillary — in reality, π<sub>GC</sub> rises as plasma is filtered, which is why the full derivation integrates along the capillary length',
   'We used representative textbook normal values — real GFR varies by nephron, by patient, and by time of day',
   'We ignored arteriolar resistance changes — afferent and efferent tone shift P<sub>GC</sub> and flow independently, and that is its own model',
   'PAH extraction was assumed to be 100% — it is actually ~91%, so C<sub>PAH</sub> slightly underestimates true RPF',
 ]}},

/* ── DISCUSSION ─────────────────────────────────────────────────── */
{title:'What does an abnormal glomerulus tell us?', kind:'Discussion',
 kicker:'Closing the loop',
 block:{type:'discussion', q:[
   'Name a disease state.',
   'Predict which term in the Starling equation it would change first.',
   'What would that do to GFR, RPF, and filtration fraction?',
 ]}},

/* ── PROJECT REMINDER ───────────────────────────────────────────── */
{layout:'project', kicker:'Project Reminder', title:'Make a Fake Organ',
 subtitle:'Your final project is to design and build (or model) a functional organ analog. It must demonstrate at least one physiological function. It does not have to be a kidney.',
 progress:'By Day 3: Start thinking about what physiological function you want your organ to replicate. Filtration? Concentration? Hormone signaling? Pick one and hold it.'},

]});
