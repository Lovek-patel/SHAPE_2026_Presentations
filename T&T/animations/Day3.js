DAYS.push({label:'Day 3 — The Glomerulus', short:'D3', slides:[

/* ── TITLE ─────────────────────────────────────────────────────── */
{layout:'title', kicker:'Day 3 · Ch. 3 / 10', title:'The Glomerulus', subtitle:'Structure, then the forces that make it filter', meta:'Lead: Love · ~15 min structure + math'},

/* ── BOWMAN HISTORY (plain, clean, image) ───────────────────────── */
{title:'William Bowman, 1842', kind:'Hook', kicker:'A bit of history',
 block:{type:'split-visual',
   body:'William Bowman described the glomerular capsule in 1842 based on microscopic anatomy alone, before any tools existed to measure pressure or flow. His conclusion — that the structure functioned as a pressure-driven filter — was not directly confirmed by measurement until the 1920s. The anatomy was right. The physics was right. The experiment came later.',
   diagram:'<img src="assets/bowman_portrait.jpeg" alt="William Bowman portrait" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── RENAL CORPUSCLE with image ─────────────────────────────────── */
{title:'The renal corpuscle', kind:'Anatomy', kicker:'3.1 The Renal Corpuscle',
 subtitle:'Every nephron starts here: a tuft of capillaries wrapped inside a capsule.',
 block:{type:'split-visual',
   body:[
     '<strong>Glomerular capillaries</strong> — a tuft fed by the afferent arteriole, drained by the efferent arteriole. Mesangial cells sit between loops, providing structural support and contractile tone.',
     "<strong>Bowman's capsule</strong> — wraps the capillary tuft, collecting the filtrate as it forms. The space inside is Bowman's space, where filtrate becomes the start of tubular fluid."
   ],
   diagram:'<img src="assets/bowman_capsule.png" alt="Histology of Bowman\'s capsule and glomerulus" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── FILTRATION BARRIER with particle animation ─────────────────── */
{title:'The filtration barrier: three layers, one job', kind:'Anatomy', kicker:'3.4 The Glomerular Filtration Barrier',
 subtitle:'Everything that crosses from blood to filtrate has to pass through all three.',
 block:{type:'stack', items:[
   {type:'filtration-animation'},
   {type:'icon-row', items:[
     {icon:'grid',   h:'Fenestrated endothelium', p:'Full of pores. Lets water and small solutes through freely, excludes blood cells.'},
     {icon:'layers', h:'Basement membrane',       p:'Dense extracellular matrix. The main size and charge barrier.'},
     {icon:'branch', h:'Podocytes & slit diaphragm', p:'Interdigitating foot processes. The slit diaphragm between them is the final, finest filter.'},
   ]}
 ]}},

/* ── SELECTIVITY with animation and examples ────────────────────── */
{title:'Selectivity: who gets through, and why', kind:'Anatomy', kicker:'3.5 Selectivity of the Filtration Barrier',
 block:{type:'selectivity-layout'}},

/* ── TRANSITION ─────────────────────────────────────────────────── */
{title:'So what determines how much filters, and how fast?', kind:'Transition', kicker:'From structure to force',
 block:{type:'callout-large', text:'Everything we just described is built to do one thing: hold a pressure gradient across a membrane. The next part of the lecture is about quantifying that gradient, and what it predicts.'}},

/* ── DIVIDER ────────────────────────────────────────────────────── */
{layout:'divider', kicker:'Now at the board', title:'The Math: Forces at the Filter', subtitle:'Deriving net filtration pressure and GFR from first principles', tag:'Derivation'},

/* ── FOUR FORCES ────────────────────────────────────────────────── */
{title:'Four forces, one membrane', kind:'Math · Setup', kicker:'10.1.1 Physical Intuition',
 subtitle:'Imagine the glomerular capillary wall as a membrane separating two compartments. Fluid crosses it, driven by pressure and opposed by osmotic suction.',
 block:{type:'formula-values',
   lines:[
     'P<sub>GC</sub> — hydrostatic pressure in the capillary (pushes fluid <span class="hl">out</span>)',
     'P<sub>BS</sub> — hydrostatic pressure in Bowman\'s space (pushes <span class="hl">back</span>)',
     'π<sub>GC</sub> — oncotic pressure of plasma proteins (draws fluid <span class="hl">in</span>)',
     'π<sub>BS</sub> — oncotic pressure in Bowman\'s space (normally ≈ 0, favors filtration)'
   ],
   note:'Net filtration = outward forces minus inward forces'}},

/* ── STARLING ───────────────────────────────────────────────────── */
{title:'The Starling equation', kind:'Math · Derivation', kicker:'10.1.2 Formal Derivation',
 block:{type:'formula', lines:[
   'P<sub>UF</sub> = (P<sub>GC</sub> − P<sub>BS</sub>) − (π<sub>GC</sub> − π<sub>BS</sub>)',
   'SNGFR = K<sub>f</sub> · P<sub>UF</sub>',
 ], note:'K_f = L_p · S — ultrafiltration coefficient: hydraulic permeability × filtration surface area'}},

/* ── NUMBERS ────────────────────────────────────────────────────── */
{title:'Plugging in real numbers', kind:'Math · Worked Example', kicker:'10.1.3 Normal Values',
 block:{type:'formula-values',
   lines:[
     'P<sub>UF</sub> = (60 − 18) − (25 − 0) = <span class="hl">17 mmHg</span>',
     'GFR = K<sub>f</sub> · P<sub>UF</sub> = 12.5 × 17 ≈ <span class="hl">125 mL/min</span>'
   ],
   note:'Whole-kidney K_f ≈ 12.5 mL/min/mmHg',
   values:[{k:'P_GC',v:'60 mmHg'},{k:'P_BS',v:'18 mmHg'},{k:'π_GC',v:'25 mmHg'},{k:'π_BS',v:'~0 mmHg'}]}},

/* ── PI_BS NUANCE ───────────────────────────────────────────────── */
{title:'Why π_BS matters even when it is small', kind:'Math · Nuance', kicker:'A modeling choice worth flagging',
 block:{type:'assumptions', items:[
   'Under normal conditions π_BS ≈ 0–2 mmHg — omitting it introduces only ~5% error',
   'In nephrotic syndrome, albumin crosses the barrier and π_BS can rise to 3–8 mmHg, meaningfully lowering P_UF',
   'A complete model always keeps π_BS — it is the difference between a model that works normally and one that still works when the patient is sick',
 ]}},

/* ── CLEARANCE DEFINITION ───────────────────────────────────────── */
{title:'Renal clearance: a different way to measure the same thing', kind:'Math · Definition', kicker:'10.4 Renal Clearance',
 subtitle:'Clearance is a virtual volume — the volume of plasma fully cleared of a substance per minute.',
 block:{type:'formula', lines:[
   'C<sub>X</sub> = (U<sub>X</sub> · V̇) / P<sub>X</sub>',
 ], note:'U_X = urine concentration · V̇ = urine flow rate · P_X = plasma concentration'}},

/* ── TWO TRACERS ────────────────────────────────────────────────── */
{title:'Two tracers, two measurements', kind:'Math · Application', kicker:'10.4.2 / 10.4.3',
 block:{type:'two-col',
   left:{h:'Inulin gives GFR', body:['Freely filtered, never reabsorbed or secreted','Filtered amount = excreted amount, so C_inulin = GFR directly']},
   right:{h:'PAH gives renal plasma flow', body:['Nearly 100% removed in a single pass (filtered + secreted)','C_PAH ≈ RPF — gives the denominator for filtration fraction']}}},

/* ── WORKED EXAMPLE ─────────────────────────────────────────────── */
{title:'Worked example', kind:'Math · Worked Example', kicker:'10.4.5',
 block:{type:'stat-grid', items:[
   {num:'120',   lbl:'GFR (mL/min) — from inulin clearance'},
   {num:'600',   lbl:'RPF (mL/min) — from PAH clearance'},
   {num:'20%',   lbl:'Filtration fraction = GFR / RPF'},
   {num:'0.48%', lbl:'FE_Na — consistent with normal tubular reabsorption'},
 ]}},

/* ── ASSUMPTIONS ────────────────────────────────────────────────── */
{title:'What we assumed to get here', kind:'Math · Assumptions', kicker:'Tying back to the modeling theme',
 subtitle:'Every number on the last few slides depended on a simplification. Worth naming them before moving on.',
 block:{type:'assumptions', items:[
   'P_GC and P_BS were treated as constant along the capillary — in reality, oncotic pressure rises as plasma is filtered, which is why the full derivation integrates along the capillary length',
   'We used representative textbook normal values — real GFR varies by nephron and by patient',
   'We ignored arteriolar resistance changes — afferent and efferent tone shift P_GC and Q_i independently, and that is its own model',
 ]}},

/* ── DISCUSSION ─────────────────────────────────────────────────── */
{title:'What does an abnormal glomerulus tell us?', kind:'Discussion', kicker:'Closing the loop',
 block:{type:'discussion', q:[
   'Name a disease state.',
   'Predict which term in the Starling equation it would change first.',
   'What would that do to GFR?'
 ]}},

/* ── PROJECT REMINDER ───────────────────────────────────────────── */
{layout:'project', kicker:'Project Reminder', title:'Make a Fake Organ',
 subtitle:'Your final project is to design and build (or model) a functional organ analog. It must demonstrate at least one physiological function. It does not have to be a kidney.',
 progress:'By Day 3: Start thinking about what physiological function you want your organ to replicate. Filtration? Concentration? Hormone signaling? Pick one and hold it.'},

]});