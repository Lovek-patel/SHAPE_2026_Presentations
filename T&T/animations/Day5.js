DAYS.push({label:'Day 5: Renal Simulation', short:'D5', slides:[

/* ── TITLE ─────────────────────────────────────────────────────── */
{layout:'title', kicker:'Day 5 · Simulations', title:'Modeling the Kidney', subtitle:'What a simulation is, and why we use them', meta:'Lead: Love'},

/* ── HOOK ───────────────────────────────────────────────────────── */
{title:'A model is only as good as its worst assumption', kind:'Hook', kicker:'The organizing idea',
 block:{type:'quote', text:'A model that makes accurate predictions for the wrong reasons is not a good model. It is a coincidence.', cite:''}},

/* ── WHAT IS A MODEL ────────────────────────────────────────────── */
{title:'What is a model, really?', kind:'Foundation', kicker:'19.1: Definitions',
 subtitle:"Every equation we've written so far is a model.",
 block:{type:'bullets', items:[
   'A model is a <strong>claim</strong> about which features of the biology matter, and which can be safely ignored',
   "Starling's equation (Day 3) is a model. So is the exponential gradient we'll derive on Day 6",
   'A simulation is just a model solved numerically instead of by hand',
 ]}},

/* ── WHAT MODELS CAN TELL US ────────────────────────────────────── */
{title:'What models can actually tell us', kind:'Capability', kicker:'19.4.1',
 block:{type:'icon-row', items:[
   {icon:'cycle', h:'Whether a mechanism is sufficient', p:'Does the known TAL transport rate actually generate the observed medullary gradient? The model says yes. Without it, that is not obvious.'},
   {icon:'scale', h:'Which parameters matter most',     p:'Sensitivity analysis shows which physiological variables move GFR the most, guiding where to look experimentally.'},
   {icon:'pulse', h:'What a perturbation will do',      p:'If TGF gain increases, the model predicts oscillations at a specific frequency. A testable prediction.'},
 ]}},

/* ── WHAT MODELS CANNOT TELL US ─────────────────────────────────── */
{title:'What models cannot tell us', kind:'Limitation', kicker:'19.4.2: The other half of the picture',
 block:{type:'bullets', items:[
   '<strong>What happens when an assumption is violated</strong>: a model assuming uniform transporter density will be wrong in diabetic nephropathy, where expression is patchy',
   '<strong>Anything left out of the equations</strong>: a purely hydraulic GFR model says nothing about charge selectivity unless you add a term for it',
   '<strong>Population variability</strong>: a model predicts the mean nephron, not the distribution of real ones',
   '<strong>Causality from correlation</strong>: fitting data well is necessary, but never sufficient, proof a model is mechanistically right',
 ]}},

/* ── HISTORY ────────────────────────────────────────────────────── */
{title:'Renal modeling has a 180-year head start', kind:'History', kicker:'19.2 A Brief History',
 block:{type:'timeline', steps:[
   {h:'Bowman, 1842',                   p:'Predicted the glomerulus was a pressure filter from anatomy alone'},
   {h:'Homer Smith, 1930s-40s',          p:'Established the clearance equation: inulin for GFR, PAH for renal plasma flow'},
   {h:'Deen, Robertson & Brenner, 1972', p:"First ODE model of glomerular ultrafiltration: Day 3"},
   {h:'Stephenson; Kokko & Rector, 1966-72', p:"First countercurrent ODE models of the loop of Henle: Day 6"},
   {h:'Layton, Pitman & Moore, 1991',    p:'First bifurcation analysis of spontaneous TGF oscillations'},
 ]}},

/* ── MODEL HIERARCHY ────────────────────────────────────────────── */
{title:'Not all models are built the same way', kind:'Framework', kicker:'19.3 A Hierarchy of Renal Models',
 subtitle:"There is no universally 'correct' level: the right one depends on the question you're asking.",
 block:{type:'staircase', items:[
   {h:38,  lvl:'L0', t:'Algebraic',             p:'Single equations, no time: Starling, clearance'},
   {h:55,  lvl:'L1', t:'Single-compartment ODE', p:'One variable evolving in time: TGF linearized, AVP kinetics'},
   {h:74,  lvl:'L2', t:'Spatially distributed',  p:'Concentration as a function of position: Deen model, countercurrent ODEs'},
   {h:90,  lvl:'L3', t:'Multi-segment tubular',  p:'Coupled Level-2 models across every nephron segment'},
   {h:100, lvl:'L4', t:'Whole-kidney systems',   p:'Multiple nephron populations, vasculature, feedback: the Guyton model'},
 ]}},

/* ── ASSUMPTION AUDIT ───────────────────────────────────────────── */
{title:'Before trusting any model, ask four questions', kind:'Framework', kicker:'The Assumption Audit',
 block:{type:'assumptions', items:[
   'What assumptions does this model make?',
   'Are those assumptions physiologically justified?',
   'Under what conditions do they fail, and where should we stop trusting the predictions?',
   'What does the model leave out, and could that change the answer?',
 ]}},

/* ── NUMERICAL METHODS ──────────────────────────────────────────── */
{title:'The tools that solve these equations', kind:'Technical', kicker:'19.5 Numerical Methods Overview',
 block:{type:'compare', cols:['Example','Solver'],
   rows:[
     {label:'Initial value ODE',    vals:['Something changing over time',    'ode45 / solve_ivp']},
     {label:'Boundary value ODE',   vals:['Fixed at both ends of a tube',    'shooting method / bvp4c']},
     {label:'Delay-differential',   vals:['Depends on a past state',         'dde23 / ddeint']},
     {label:'Nonlinear algebra',    vals:['Steady-state solution',           "fsolve / Newton's method"]},
   ]}},

/* ── WHAT WE SIMULATE ───────────────────────────────────────────── */
{title:'What we will actually simulate', kind:'Preview', kicker:'Two models, two days',
 block:{type:'two-col',
   left:{h:'The Deen glomerular model',    body:["The full version of Day 3's Starling equation, with oncotic pressure varying along the capillary","We'll perturb K_f and watch GFR respond"]},
   right:{h:'The NephronSimulator',       body:['A compartment model of the full nephron: all five segments, ten adjustable parameters, live dynamics']}}},

/* ── DIVIDER ────────────────────────────────────────────────────── */
{layout:'divider', kicker:'Live simulation', title:"Let's Explore It Together", subtitle:'The simulator is already built.', tag:'Live session'},

/* ── MEET THE SIMULATOR ─────────────────────────────────────────── */
{title:'Meet the NephronSimulator', kind:'Simulator intro', kicker:'What it is',
 block:{type:'split-visual',
   body:[
     '<strong>What it models:</strong> plasma to glomerulus to proximal tubule to loop of Henle to distal tubule to collecting duct to urine',
     '<strong>What it shows:</strong> time-series graphs of sodium, urine flow, and osmolarity, plus a real-time segment heatmap',
     '<strong>What it is not:</strong> a validated clinical simulation. It is a teaching model, tuned so that the dynamics are visible on a classroom timescale. Absolute values should not be treated as clinical data.'
   ],
   diagram:'<img src="assets/simulator.png" alt="NephronSimulator interface" style="width:100%;border-radius:12px;">'}},

/* ── PARAMETERS 1-5 ─────────────────────────────────────────────── */
{title:'Parameters 1-5: filtration and hormones', kind:'Simulator parameters', kicker:'What we built in (1 of 2)',
 block:{type:'compare', cols:['Default','What it controls'],
   rows:[
     {label:'Plasma Sodium',           vals:['140 mEq/L', 'Sets the sodium load entering the glomerulus.']},
     {label:'Plasma Glucose',          vals:['95 mg/dL',  'Above ~180 mg/dL the Tm-limited SGLT2 is overwhelmed: glucose appears in urine.']},
     {label:'GFR',                     vals:['120 mL/min','Below 60 simulates CKD; below 15 is ESRD.']},
     {label:'ADH Level',               vals:['2.5 U',     'ADH = 0 simulates diabetes insipidus.']},
     {label:'Aldosterone',             vals:['2.5 U',     'High aldosterone = Na retention, hypertension.']},
   ]}},

/* ── PARAMETERS 6-10 ────────────────────────────────────────────── */
{title:'Parameters 6-10: tubular mechanics', kind:'Simulator parameters', kicker:'What we built in (2 of 2)',
 block:{type:'compare', cols:['Default','What it controls'],
   rows:[
     {label:'Water Intake',            vals:['1.5 mL/min','Volume load independent of GFR.']},
     {label:'PT Reabsorption Fraction',vals:['0.67',      'Reducing this mimics PT injury.']},
     {label:'Loop of Henle Strength',  vals:['1.0x',      'Setting to 0.2 collapses the medullary gradient: mimics furosemide.']},
     {label:'Distal Na Reabsorption',  vals:['0.09',      'Aldosterone-sensitive fine-tuning.']},
     {label:'CD Water Permeability',   vals:['0.90',      'Interacts multiplicatively with ADH and the medullary gradient.']},
   ]}},

/* ── KEY ASSUMPTIONS ────────────────────────────────────────────── */
{title:'The assumptions we made when building it', kind:'Assumption audit', kicker:'What the code trusts',
 block:{type:'assumptions', items:[
   '<strong>First-order lag dynamics</strong>: every parameter change takes effect gradually. The time constant (tau) is tuned for classroom visibility, not clinical speed.',
   '<strong>Isosmotic proximal tubule reabsorption</strong>: sodium and water always leave the PT in a fixed ratio. Real SGLT2 coupling shifts this ratio, but the model holds it constant.',
   '<strong>Tm-limited glucose reabsorption</strong>: glucosuria appears as a sharp threshold (min function), not the gradual splay seen in real humans.',
   '<strong>Medullary gradient as a scalar</strong>: the entire countercurrent gradient is summarized as one number that scales with loop strength. The spatial distribution is lost.',
   '<strong>Collecting duct cap at 0.97</strong>: prevents urine volume from reaching zero or going negative. A numerical safety net, not a physiological mechanism.',
 ]}},

/* ── CODE HIGHLIGHT ─────────────────────────────────────────────── */
{title:'Here is what those assumptions look like in code', kind:'Code walkthrough', kicker:'From equation to line',
 block:{type:'code-pairs', items:[
   {label:'Lag dynamics (ADH as example)', code:'ADH_eff = ADH_eff + (ADH_tgt - ADH_eff) / tau_ADH;', note:'Discrete first-order filter. Approaches ADH_tgt asymptotically each tick.'},
   {label:'Glomerular filtration', code:'FiltNa_k = GFR_eff/1000 * NaP_k;', note:"Starling's four forces compressed into one slider. Ask: what did we hide inside GFR_eff?"},
   {label:'Glucose transport maximum', code:'Glu_reabs = min(Glu_inPT, Tm_Glu);', note:'Simple Tm limit. No SGLT1/SGLT2 distinction, no splay. Adequate for demonstration.'},
   {label:'Medullary gradient', code:'medGrad_k = baselineGrad * LoHstr_eff;', note:'Entire countercurrent mechanism as one scalar. The Day 6 ODEs put the spatial dimension back.'},
 ]}},

/* ── HOW TO USE THE SIMULATOR ───────────────────────────────────── */
{title:'How to use it', kind:'Simulator guide', kicker:'The prediction protocol',
 block:{type:'bullets', items:[
   '<strong>Step 1: Pick a scenario</strong> from the dropdown, or move a slider manually',
   '<strong>Step 2: Predict</strong> before pressing Start: what will happen to urine volume, urine sodium, and urine osmolarity?',
   '<strong>Step 3: Run</strong>, press Start, watch the Time-Series tab',
   '<strong>Step 4: Compare</strong>, was the prediction right? If not, trace back through the parameter chain to find where it diverged',
   '<strong>Step 5: Reset</strong> before each new scenario to get a clean baseline',
 ]}},

/* ── SCENARIOS 1-4 ──────────────────────────────────────────────── */
{title:'Scenarios 1-4: volume and sodium balance', kind:'Scenarios', kicker:'What we will run today (1 of 2)',
 block:{type:'compare', cols:['Key change','Watch for'],
   rows:[
     {label:'Baseline',             vals:['Defaults',                     'Establish normal: urine flow ~1 mL/min, osmolarity ~600 mOsm']},
     {label:'High Salt Meal',       vals:['NaP rises to ~150',            'Urine Na spikes. Does plasma Na correct? How fast?']},
     {label:'Dehydration',          vals:['ADH spikes, water intake drops','Urine volume collapses, osmolarity rises sharply']},
     {label:'Excess Water Intake',  vals:['Water intake max, ADH falls',  'Urine flow spikes, osmolarity crashes toward plasma']},
   ]}},

/* ── SCENARIOS 5-8 ──────────────────────────────────────────────── */
{title:'Scenarios 5-8: disease and diuretics', kind:'Scenarios', kicker:'What we will run today (2 of 2)',
 block:{type:'compare', cols:['Key change','Watch for'],
   rows:[
     {label:'Low GFR (CKD)',        vals:['GFR drops to 20-30',           'Everything slows. Urine Na may change direction.']},
     {label:'High ADH (SIADH)',     vals:['ADH maxed',                    'Plasma Na drifts down. Why is treatment fluid restriction?']},
     {label:'Glucosuria',           vals:['Glucose over 180 mg/dL',       'Glucose in urine. Osmotic diuresis follows.']},
     {label:'Diuretic Effect',      vals:['Loop strength to 0.2',         'Medullary gradient collapses. Urine osmolarity crashes.']},
   ]}},

/* ── CODE EDIT 1 ────────────────────────────────────────────────── */
{title:'Try it: change tau_ADH', kind:'Code edit', kicker:'Edit 1 of 2',
 block:{type:'code-edit',
   find:    'tau_ADH   = 15;',
   change:  'Try tau_ADH = 3 (very fast response) or tau_ADH = 60 (barely visible)',
   predict: 'What happens to the Dehydration scenario when the response is nearly instantaneous? When it is almost frozen?',
   restore: "Set it back to 15 before the next edit."}},

/* ── CODE EDIT 2 ────────────────────────────────────────────────── */
{title:'Try it: remove the collecting duct cap', kind:'Code edit', kicker:'Edit 2 of 2',
 block:{type:'code-edit',
   find:    'cdFrac_target = min(0.97, CDperm_base * admMult * min(1.5, medGrad_k));',
   change:  'Remove the outer min(0.97, ...) and let it run uncapped',
   predict: 'What should happen to urine volume under Dehydration? What actually happens?',
   restore: 'This one matters: restore the original line before moving on. The cap is a numerical safety net.'}},

/* ── WRAP UP ────────────────────────────────────────────────────── */
{title:'What the simulator leaves out', kind:'Discussion', kicker:'Closing the loop',
 block:{type:'discussion', q:[
   'No immune system, no vascular tone, no tubuloglomerular feedback, no renin-angiotensin axis.',
   'Which of those would you add first, and why?',
   'If you used this simulator to test a bioartificial kidney design, which assumption would make you most nervous?'
 ]}},

/* ── PROJECT REMINDER ───────────────────────────────────────────── */
{layout:'project', kicker:'Project Reminder', title:'Make a Fake Organ',
 subtitle:'Your final project is to design and build (or model) a functional organ analog. It must demonstrate at least one physiological function. It does not have to be a kidney.',
 progress:'By Day 5: You should have a working idea of what your organ does and which function you want to replicate. Not a final design, just a direction.'},

]});
