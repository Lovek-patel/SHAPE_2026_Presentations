DAYS.push({label:'Day 6 — The Loop of Henle', short:'D6', slides:[

/* ── TITLE ─────────────────────────────────────────────────────── */
{layout:'title', kicker:'Day 6 · Ch. 5 / 12', title:'The Loop of Henle', subtitle:'The structure that lets urine become more concentrated than blood', meta:'Lead: Love · structure + math (board)'},

/* ── HOOK ───────────────────────────────────────────────────────── */
{title:'No other segment can do this', kind:'Hook', kicker:'Why the loop is special',
 block:{type:'callout-large', text:"Every other part of the nephron moves solute and water around. Only the loop of Henle can produce urine more concentrated than plasma, up to 4x more concentrated. That is not an accident of anatomy. It is an engineered countercurrent system."}},

/* ── ANATOMY WITH IMAGE ─────────────────────────────────────────── */
{title:'Four segments, four jobs', kind:'Anatomy', kicker:'5.2 The Four Segments',
 subtitle:"Each segment's permeability to water and NaCl is different — and that difference is the whole mechanism.",
 block:{type:'split-visual',
   body:[
     {type:'compare', cols:['Water?','NaCl?','Active?'],
      rows:[
       {label:'Thin descending (tDLH)', vals:['Yes','No','None']},
       {label:'Thin ascending (tALH)',  vals:['No','Yes','None']},
       {label:'Thick ascending (TAL)',  vals:['No','Yes','Pump']},
      ]}
   ],
   diagram:'<img src="assets/LOH.jpg" alt="Loop of Henle anatomy diagram" style="width:100%;border-radius:12px;object-fit:contain;">'}},

/* ── TAL ENGINE ─────────────────────────────────────────────────── */
{title:'The thick ascending limb: the engine of the system', kind:'Anatomy', kicker:'5.2.4 The Engine',
 subtitle:'Water-impermeable. Actively pumps NaCl. Arguably the single most important segment for urine concentration.',
 block:{type:'two-col',
   left:{h:'NKCC2', body:[
     'Moves 1 Na⁺, 1 K⁺, 2 Cl⁻ from lumen into cell per cycle',
     'Powered by the Na⁺ gradient from basolateral Na⁺/K⁺-ATPase',
     'Normally reabsorbs ~25% of filtered Na⁺'
   ]},
   right:{h:'Why water-impermeability matters', body:[
     'If water followed the pumped NaCl, there would be no gradient — just isosmotic reabsorption',
     'Instead, the lumen dilutes while the interstitium concentrates — the two outputs that make the whole mechanism work'
   ]}}},

/* ── CLINICAL PAYOFF ────────────────────────────────────────────── */
{title:'A clinical payoff: loop diuretics', kind:'Application', kicker:'Why this matters in the clinic',
 block:{type:'callout-large', text:'Furosemide and bumetanide block NKCC2 directly. Because the TAL normally reabsorbs a quarter of filtered sodium, blocking it is the most powerful class of diuretic available — but it also collapses the medullary gradient, so the kidney temporarily cannot concentrate urine at all.'}},

/* ── SINGLE EFFECT ──────────────────────────────────────────────── */
{title:'The single effect — and why it is not enough on its own', kind:'Core concept', kicker:'5.3 Setting Up the Problem',
 subtitle:'At any single cross-section, the TAL can only generate about 200 mOsm/kg of difference between lumen and interstitium.',
 block:{type:'stat-grid', items:[
   {num:'200',   lbl:'mOsm/kg — the maximum single effect the TAL can generate at one point'},
   {num:'500',   lbl:'mOsm/kg — the ceiling if that were the whole story (300 + 200)'},
   {num:'1,200', lbl:'mOsm/kg — what the medulla actually reaches. Something else is multiplying the effect.'},
 ]}},

/* ── COUNTERCURRENT MECHANISM WITH GRADIENT IMAGE ───────────────── */
{title:'The countercurrent multiplier: tracing the fluid', kind:'Mechanism', kicker:'5.3 Qualitative Mechanism',
 block:{type:'split-visual',
   body:[
     {type:'timeline', steps:[
       {h:'TAL pumps',                            p:'Builds a 200 mOsm gap: 300 mOsm lumen vs. 500 mOsm interstitium'},
       {h:'Descending limb equilibrates',         p:'Water-permeable tDLH lets the descending fluid reach ~500 mOsm by the bend'},
       {h:'TAL pumps again from a higher baseline',p:'Now starting at 500, the same 200 mOsm step builds the interstitium to ~700'},
       {h:'Repeat',                               p:'Each cycle raises the baseline deeper into the medulla'},
       {h:'After many iterations',                p:'Gradient runs from ~300 mOsm at the cortex to ~1,200 mOsm at the papillary tip'},
     ]}
   ],
   diagram:'<img src="assets/gradient.png" alt="Medullary concentration gradient" style="width:100%;border-radius:12px;object-fit:contain;">'}},

/* ── MATH DIVIDER ───────────────────────────────────────────────── */
{layout:'divider', kicker:'Math — slides cover Part 1', title:'The Math: Building the Gradient', subtitle:'Setting up the two-tube model and solving the simplified case', tag:'Derivation, Part 1'},

/* ── TWO-TUBE SETUP ─────────────────────────────────────────────── */
{title:'Model the loop as two coupled pipes', kind:'Math · Setup', kicker:'12.1 Setting Up the Two-Tube Model',
 subtitle:'Fluid flows down tube 1 (descending limb) and up tube 2 (ascending limb), exchanging solute through the interstitium between them.',
 block:{type:'formula', lines:[
   'C₁(y) — solute concentration in the descending limb',
   'C₂(y) — solute concentration in the ascending limb',
   'C<sub>e</sub>(y) — solute concentration in the interstitium',
 ], note:'y ∈ [0, L]: axial position, y = 0 at the cortex, y = L at the loop tip'}},

/* ── GOVERNING EQUATIONS ────────────────────────────────────────── */
{title:'Conservation in each segment', kind:'Math · Setup', kicker:'12.1 Governing Equations',
 block:{type:'formula', lines:[
   'Descending (tDLH): q₁(y)·C₁(y) = Q₀C₀ &nbsp;&nbsp; <span style="opacity:.6">(solute conserved, water leaves osmotically)</span>',
   'Ascending (TAL): q₂(dC₂/dy) = P<sub>s</sub>A<sub>s</sub>(C<sub>e</sub>−C₂) + active pump term',
 ], note:'The ascending limb combines passive diffusion with the active NaCl pump'}},

/* ── ASSUMPTIONS ────────────────────────────────────────────────── */
{title:'Four assumptions that simplify this enormously', kind:'Math · Assumptions', kicker:'12.2 — Same theme as Day 5',
 block:{type:'assumptions', items:[
   'Water flux in the tDLH is fast — C₁(y) = C_e(y) everywhere (osmotic equilibrium with the interstitium)',
   'Flow rates are constant: q₁ = q₂ = q',
   'Active transport is linearized: when C₂ << K_m, the Michaelis-Menten pump term ≈ λC₂',
   'The interstitium is well-mixed and at steady state',
 ]}},

/* ── SIMPLIFIED ODEs ────────────────────────────────────────────── */
{title:'The simplified system', kind:'Math · Derivation', kicker:'12.2 Simplified Two-Tube ODEs',
 block:{type:'formula', lines:[
   'q (dC₁/dy) = d(C₂ − C₁)',
   '−q (dC₂/dy) = d(C₁ − C₂) + λC₂',
 ], note:'d = solute exchange coefficient between limbs · λ = linearized active transport rate'}},

/* ── CENTRAL RESULT ─────────────────────────────────────────────── */
{title:'In the limit of perfect exchange, it solves cleanly', kind:'Math · Result', kicker:'12.2 The Central Result',
 block:{type:'formula-values',
   lines:['C<sub>e</sub>(y) = C₀ · exp( λy / 2q )'],
   note:'The interstitial osmolality grows exponentially from cortex to papilla',
   values:[{k:'amplification',v:'exp(λL/2q)'},{k:'with λ/q≈0.3/mm',v:'e^2.1 ≈ 8.2×'}]}},

/* ── WHERE THE MODEL BREAKS ─────────────────────────────────────── */
{title:'Plugging in numbers — and where the simple model breaks', kind:'Math · Worked Example', kicker:'A useful discrepancy',
 block:{type:'two-col',
   left:{h:'What the linear model predicts', body:[
     'Starting from C₀ = 300 mOsm/kg',
     'Amplification of 8.2× gives ≈ 2,460 mOsm/kg at the tip'
   ]},
   right:{h:"What's actually observed", body:[
     '~1,200 mOsm/kg — the linear approximation overestimates pump capacity at high concentration',
     'The full Michaelis-Menten pump (board work) brings the number back down to reality'
   ]}}},

/* ── BOARD DIVIDER ──────────────────────────────────────────────── */
{layout:'divider', kicker:'Now at the board', title:'Solving the Full System', subtitle:'The nonlinear Michaelis-Menten pump, boundary conditions, and the numerical solution', tag:'Derivation, Part 2'},

/* ── PROJECT REMINDER ───────────────────────────────────────────── */
{layout:'project', kicker:'Project Reminder', title:'Make a Fake Organ',
 subtitle:'Your final project is to design and build (or model) a functional organ analog. It must demonstrate at least one physiological function. It does not have to be a kidney.',
 progress:'By Day 6: You should know what function your organ replicates and have a rough sense of how you will demonstrate it. If you are modeling the loop, think about what the key parameter in your model would be.'},

]});