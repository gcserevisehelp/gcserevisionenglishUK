window.NEON_DATA = {
  brand: "NEON ENGLISH",
  courses: [
    {
      slug:"standard", name:"Standard", focus:"English Literature — AQA", price:4.99, days:14, accent:"green",
      tagline:"Focused Literature revision", detail:"Core Literature knowledge, essay structure, quotation recall and exam practice in a short focused course.",
      features:["Literature Paper 1 + Paper 2 map","Essay paragraph builder","Quote recall practice","Knowledge quizzes","1 revision game"]
    },
    {
      slug:"pro", name:"Pro", focus:"English Language — AQA", price:5.99, days:21, accent:"purple",
      tagline:"Focused Language revision", detail:"Paper 1 and Paper 2 taught through NEON's Q5 → Q4 → Q3 → Q2 → Q1 revision route, with writing builders and question practice.",
      features:["Language Paper 1","Language Paper 2","Q5 P4 writing builder","Question-by-question practice","2 revision games"]
    },
    {
      slug:"plus", name:"Plus", focus:"Literature + Language essentials", price:7.99, days:30, accent:"cyan",
      tagline:"A bit of both", detail:"A balanced mix of Language and Literature essentials for students who want both without the full deep-dive library.",
      features:["Language essentials","Literature essentials","Mixed quizzes","Progress tracking","3 revision games"]
    },
    {
      slug:"premium", name:"Premium", focus:"Literature + Language", price:9.99, days:60, accent:"orange",
      tagline:"Both in smaller detail", detail:"Longer access to both subjects in short, digestible lessons with planners, quizzes, practice and revision tools.",
      features:["Both GCSE English subjects","Condensed lesson library","Exam checklists","Revision planner","4 revision games"]
    },
    {
      slug:"plus-premium", name:"Plus-Premium", focus:"Full Literature + Language", price:14.99, days:180, accent:"green", featured:true,
      tagline:"All detail + every extra", detail:"The complete NEON library: detailed lessons, practice tools, games, planners, profile features and the biggest access window.",
      features:["Full detailed lesson library","All interactive builders","All games + challenges","Advanced practice bank","Profile stats + achievements","180 days access"]
    }
  ],

  modules: {
    standard: [
      {title:"Start here", lessons:["lit-map","lit-argument","lit-paragraph"]},
      {title:"Paper 1", lessons:["macbeth-core","macbeth-characters","acc-core","acc-change"]},
      {title:"Paper 2", lessons:["modern-text","anthology","unseen"]},
      {title:"Exam skills", lessons:["quote-recall","lit-planning","lit-final-check"]}
    ],
    pro: [
      {title:"Language route", lessons:["language-roadmap","timing-reset"]},
      {title:"Paper 1 — Q5 to Q1", lessons:["p1q5","p1q4","p1q3","p1q2","p1q1"]},
      {title:"Paper 2 — Q5 to Q1", lessons:["p2q5","p2q4","p2q3","p2q2","p2q1"]},
      {title:"Upgrade your writing", lessons:["sentence-control","rhetoric","proofread"]}
    ],
    plus: [
      {title:"Mixed foundations", lessons:["language-roadmap","lit-map","lit-paragraph","p1q5","p2q5"]},
      {title:"Reading skills", lessons:["p1q4","p1q3","p1q2","p2q4","p2q2"]},
      {title:"Literature essentials", lessons:["macbeth-core","acc-core","anthology","unseen"]},
      {title:"Mini mock", lessons:["mini-mock","exam-day"]}
    ],
    premium: [
      {title:"Language quick lessons", lessons:["language-roadmap","p1q5","p1q4","p1q3","p1q2","p1q1","p2q5","p2q4","p2q3","p2q2","p2q1"]},
      {title:"Literature quick lessons", lessons:["lit-map","lit-paragraph","macbeth-core","acc-core","modern-text","anthology","unseen"]},
      {title:"Planning & performance", lessons:["timing-reset","mini-mock","exam-day"]}
    ],
    "plus-premium": [
      {title:"Orientation", lessons:["welcome","language-roadmap","lit-map","study-system"]},
      {title:"Language Paper 1 — Q5 to Q1", lessons:["p1q5","creative-atmosphere","p1q4","p1q3","p1q2","p1q1"]},
      {title:"Language Paper 2 — Q5 to Q1", lessons:["p2q5","p4-deep-dive","rhetoric","p2q4","p2q3","p2q2","p2q1"]},
      {title:"Literature Paper 1", lessons:["lit-argument","lit-paragraph","macbeth-core","macbeth-characters","macbeth-themes","acc-core","acc-change","acc-themes"]},
      {title:"Literature Paper 2", lessons:["modern-text","anthology","poetry-compare","unseen","unseen-compare"]},
      {title:"Advanced exam skills", lessons:["quote-recall","sentence-control","timing-reset","proofread","mini-mock","exam-day"]}
    ]
  },

  lessons: {
    "welcome": {title:"Welcome to NEON", type:"lesson", minutes:4, summary:"How to use the full course without drowning in revision.", body:[
      "NEON works best when you do small, focused sessions rather than trying to complete everything in one go.",
      "Choose one skill, learn the method, practise it immediately, then return later for retrieval. Your Profile tracks progress, study minutes, streaks, bookmarks and achievements.",
      "Use Practice when you want exam-style work, Games when you need quick retrieval, and the Planner when you want a weekly structure."
    ]},
    "study-system": {title:"The 30-Minute NEON Study System", type:"lesson", minutes:6, summary:"A repeatable routine for busy revision days.", body:[
      "Try a 30-minute loop: 8 minutes retrieval, 12 minutes focused practice, 7 minutes checking, 3 minutes planning what to revisit next.",
      "Do not measure revision only by time. A short session where you recall, apply and correct something is usually more useful than passively rereading notes."
    ], callout:"Your planner can store a different task for each day. Aim for consistency rather than perfection."},
    "language-roadmap": {title:"English Language: Your Q5 → Q1 Route", type:"lesson", minutes:7, summary:"Learn the course order for both Language papers.", body:[
      "NEON teaches the Language papers backwards as a revision route: Q5 → Q4 → Q3 → Q2 → Q1. This is a course strategy, not an AQA rule about the order you must use in the real exam.",
      "The reason is simple: Q5 is the biggest writing task, so you learn the most demanding skill first. Then you move through evaluation, structure or comparison, language analysis and finally retrieval.",
      "Paper 1: Q5 creative writing → Q4 evaluation → Q3 structure → Q2 language → Q1 retrieval. Paper 2: Q5 viewpoint writing → Q4 comparison → Q3 language → Q2 summary/inference → Q1 retrieval."
    ], callout:"Practise different timings before the exam and use the order that helps you perform most reliably."},
    "timing-reset": {title:"Timing & Reset Strategy", type:"checklist", minutes:6, summary:"Protect your marks when one question takes too long.", body:[
      "Set a planned stopping point for every question. If you go over, finish the sentence, leave space and move on.",
      "A reset is not failure. It is an exam-management decision designed to protect marks elsewhere.",
      "Build full-paper stamina gradually: single question → paired questions → half paper → full timed paper."
    ]},
    "p1q5": {title:"Paper 1 Q5: Creative Writing", type:"interactive", minutes:14, summary:"Build a controlled description or narrative.", body:[
      "Keep the idea manageable. Strong writing is controlled writing, not a huge plot that you cannot finish.",
      "Use a simple shape: OPEN → DEVELOP → SHIFT → END. Decide the atmosphere before you start and make your imagery support it.",
      "Vary sentence length deliberately. Short sentences can create emphasis, but they only work when they contrast with the writing around them."
    ], callout:"Use Practice → Creative Writing to generate an original prompt and plan it before writing."},
    "creative-atmosphere": {title:"Creative Writing: Atmosphere Without Overwriting", type:"lesson", minutes:9, summary:"Make description vivid without stuffing every sentence with techniques.", body:[
      "Pick two or three recurring details — for example light, sound and movement — and let them evolve across the piece.",
      "Avoid stacking adjectives. One precise verb can do more work than a chain of vague description.",
      "Think about viewpoint. What can the narrator notice now? What can they not yet see? Controlling information creates tension naturally."
    ]},
    "p1q4": {title:"Paper 1 Q4: Evaluation", type:"lesson", minutes:10, summary:"Make a judgement and prove it.", body:[
      "Treat the statement in the question as something to test. You can fully agree, partly agree or challenge part of it — but your judgement must stay tied to the extract.",
      "A useful paragraph pattern is JUDGEMENT → EVIDENCE → METHOD/CHOICE → EFFECT → RETURN TO JUDGEMENT.",
      "Avoid simply listing techniques. Explain why the writer's choices make your judgement convincing."
    ]},
    "p1q3": {title:"Paper 1 Q3: Structure", type:"lesson", minutes:9, summary:"Track movement, focus and change across a text.", body:[
      "Ask four questions: where does the text begin, what becomes important, where does the focus shift, and what has changed by the end?",
      "Structure is about organisation across the whole extract. Zooming in on one sentence is usually language analysis, not structural analysis.",
      "Useful ideas include shifts in focus, contrasts, withheld information, cyclical endings, zooming in or out, and changes in pace."
    ]},
    "p1q2": {title:"Paper 1 Q2: Language", type:"lesson", minutes:8, summary:"Select a little evidence and analyse it properly.", body:[
      "Choose evidence that gives you something precise to explain. You do not need to identify a complicated technique in every quotation.",
      "Zoom in on a useful word or image, explore its associations, and explain the impression it creates in this specific context.",
      "Avoid vague comments such as 'this makes the reader want to read on'. Say what the reader understands, imagines or feels and why."
    ]},
    "p1q1": {title:"Paper 1 Q1: Retrieval", type:"lesson", minutes:4, summary:"Take the straightforward marks cleanly.", body:[
      "Stay inside the lines named in the question. Find distinct pieces of information and keep your answers literal.",
      "Do not turn Q1 into analysis. Precision is the skill being tested here."
    ]},
    "p2q5": {title:"Paper 2 Q5: Viewpoint Writing — P4 Framework", type:"interactive", minutes:16, summary:"Learn Presently → Personally → Publicly → Predictably.", body:[
      "Use the course layout as a planning scaffold: PRESENTLY → PERSONALLY → PUBLICLY → PREDICTABLY.",
      "PRESENTLY: establish your viewpoint and hook the audience. PERSONALLY: make the issue human with a believable personal perspective. PUBLICLY: widen the argument to society, evidence or shared experience. PREDICTABLY: address an opposing view, rebut it and finish decisively.",
      "Match the form. An article may use a headline or subheading. A letter needs an appropriate opening and sign-off. A speech should sound spoken and directly address its audience."
    ], q5:true, callout:"Your original Q5 guidance sheet is shown inside this lesson. The interactive builder lets you plan each P4 stage before writing."},
    "p4-deep-dive": {title:"P4 Deep Dive: Make Each Stage Do a Different Job", type:"lesson", minutes:11, summary:"Stop the four sections sounding repetitive.", body:[
      "Presently should establish urgency and your central viewpoint. Personally should narrow the lens. Publicly should widen it. Predictably should show that you have considered the other side and can still defend your position.",
      "The power of the structure comes from movement. If every paragraph simply repeats 'this is bad', the framework has not done its job.",
      "Plan one purpose for each section before you plan individual techniques."
    ]},
    "rhetoric": {title:"Rhetoric Toolkit for Q5", type:"lesson", minutes:10, summary:"Use persuasive devices because they serve the argument.", body:[
      "Useful tools include direct address, rhetorical questions, contrast, repetition, rule of three, anecdotes, statistics and carefully controlled emotive language.",
      "The goal is not to cram every device into every paragraph. Choose techniques that fit the voice, audience and purpose.",
      "Invented statistics in practice pieces should be obviously fictional or used as a classroom exercise, not presented as real-world fact outside the task."
    ]},
    "p2q4": {title:"Paper 2 Q4: Compare Viewpoints & Methods", type:"lesson", minutes:11, summary:"Compare both what the writers think and how they communicate it.", body:[
      "Keep both writers active in the paragraph. A strong comparison moves between them rather than writing two separate mini essays.",
      "Start from the viewpoint: what does Writer A believe or feel? How is that similar to or different from Writer B? Then compare the methods used to create those viewpoints.",
      "Use comparison words naturally: whereas, similarly, in contrast, both, however, while."
    ]},
    "p2q3": {title:"Paper 2 Q3: Language", type:"lesson", minutes:8, summary:"Analyse the named source closely.", body:[
      "Select precise evidence from the specified source and connect the language choice to the impression or viewpoint being created.",
      "Look for patterns across the source as well as individual words. A repeated image or semantic field can give you a stronger argument."
    ]},
    "p2q2": {title:"Paper 2 Q2: Summary & Inference", type:"lesson", minutes:8, summary:"Compare what the sources tell you.", body:[
      "Identify a clear similarity or difference, support it with information from both sources, then infer what that evidence suggests.",
      "Do not drift into detailed language analysis. The focus is the information and what you can reasonably infer from it."
    ]},
    "p2q1": {title:"Paper 2 Q1: Retrieval", type:"lesson", minutes:4, summary:"Check statements accurately against the source.", body:[
      "Read each statement carefully and check it against the specified lines. Do not answer from memory or assumption.",
      "Use a final scan before moving on so rushing does not cost you a straightforward mark."
    ]},
    "sentence-control": {title:"Sentence Control", type:"interactive", minutes:9, summary:"Vary sentence shape for meaning, not decoration.", body:[
      "A sentence should earn its shape. Use length, punctuation and rhythm to guide emphasis.",
      "Try rewriting the same idea three ways: calm and measured, urgent and forceful, reflective and uncertain. Notice how syntax changes tone."
    ]},
    "proofread": {title:"The 3-Pass Proofread", type:"checklist", minutes:5, summary:"A fast final check that catches the mistakes most likely to cost clarity.", body:[
      "Pass 1 — sentences: capitals, full stops and accidental run-ons. Pass 2 — accuracy: spellings you know you often miss. Pass 3 — meaning: any sentence that does not quite say what you intended.",
      "Do not rewrite half the response at the end. Make small, high-value corrections."
    ]},

    "lit-map": {title:"Literature Exam Map", type:"lesson", minutes:7, summary:"Know what belongs in each Literature paper.", body:[
      "Paper 1 covers Shakespeare and the 19th-century novel. Paper 2 covers the modern text, anthology poetry and unseen poetry.",
      "Literature is not a memory test alone. Knowledge matters because it gives you material for an argument. Your response still needs a clear interpretation, relevant evidence and analysis of the writer's choices."
    ]},
    "lit-argument": {title:"Build a Line of Argument", type:"lesson", minutes:10, summary:"Make the whole essay answer one central interpretation.", body:[
      "Before writing, finish this sentence: 'The writer presents ___ as ___ because ___.'. That becomes the core of your thesis.",
      "Each paragraph should develop a different part of that argument rather than restarting from zero.",
      "A good conclusion does not need to repeat everything. It can show how the pattern across the text strengthens your overall interpretation."
    ]},
    "lit-paragraph": {title:"Build a Literature Paragraph", type:"interactive", minutes:10, summary:"IDEA → EVIDENCE → METHOD → WHY IT MATTERS.", body:[
      "IDEA: answer the question with an interpretation. EVIDENCE: use a short quotation or precise reference. METHOD: explore a meaningful language, form or structure choice. WHY IT MATTERS: connect the analysis back to the question and the writer's wider message.",
      "Do not force terminology. A clear explanation of a simple method is stronger than an impressive label you cannot actually analyse."
    ]},
    "macbeth-core": {title:"Macbeth: Core Story & Arc", type:"lesson", minutes:9, summary:"Track Macbeth's movement from respected warrior to destructive ruler.", body:[
      "Build your revision around change. At the beginning Macbeth is publicly respected; after the prophecy, ambition becomes increasingly important; once he chooses violence, fear and insecurity drive further violence.",
      "This arc can support questions on ambition, power, guilt, masculinity, kingship and the supernatural."
    ]},
    "macbeth-characters": {title:"Macbeth: Character Web", type:"lesson", minutes:10, summary:"Connect characters instead of revising them in isolation.", body:[
      "Lady Macbeth, Banquo, Macduff and Duncan each reveal something different about Macbeth. Compare their choices and values rather than learning four separate character lists.",
      "For example, Banquo can act as a contrast because he hears prophecy without making the same choices Macbeth makes."
    ]},
    "macbeth-themes": {title:"Macbeth: Themes That Connect", type:"lesson", minutes:9, summary:"Ambition, guilt, power, kingship and the supernatural.", body:[
      "Instead of making one revision sheet per theme, build links. Ambition leads to choices about power; those choices create guilt and fear; the supernatural complicates responsibility; kingship shows the consequences for the wider country.",
      "This gives you flexible material for unfamiliar questions."
    ]},
    "acc-core": {title:"A Christmas Carol: Core Story & Arc", type:"lesson", minutes:8, summary:"Track Scrooge from isolation to participation.", body:[
      "Scrooge's change is the structural spine of the novella. Revise what each stage forces him to confront: memory, present responsibility and future consequence.",
      "Questions about family, poverty, responsibility, redemption and Christmas can all connect to that movement."
    ]},
    "acc-change": {title:"A Christmas Carol: Change", type:"lesson", minutes:8, summary:"Turn character development into an essay line.", body:[
      "Avoid simply saying 'Scrooge changes'. Explain what changes in his values and behaviour, why Dickens stages that change, and what readers are encouraged to learn from it.",
      "Track contrasts between the opening and ending to make the transformation visible."
    ]},
    "acc-themes": {title:"A Christmas Carol: Responsibility, Poverty & Family", type:"lesson", minutes:9, summary:"Connect social ideas to character and structure.", body:[
      "Use context to illuminate the text, not replace analysis. If you mention social attitudes or poverty, immediately connect that information to Dickens's choices in the novella.",
      "Family can be used as a contrast to Scrooge's early isolation, while responsibility connects personal change to wider society."
    ]},
    "modern-text": {title:"Modern Text: Build Your Own Knowledge Grid", type:"interactive", minutes:10, summary:"A flexible framework for whichever modern text your school studies.", body:[
      "Create four columns: character, theme, turning point, flexible evidence. Fill them using the text your school studies.",
      "NEON deliberately does not reproduce copyrighted modern-text extracts. Use your school copy and class notes to populate the grid."
    ]},
    "anthology": {title:"Anthology Poetry: Compare Ideas First", type:"lesson", minutes:9, summary:"Start with the argument, then compare methods.", body:[
      "Begin with the conceptual comparison: what does each poem suggest about the topic? Where do they agree, differ or complicate one another?",
      "Then select methods that create those ideas. Do not compare techniques just because both poems happen to contain them."
    ]},
    "poetry-compare": {title:"Poetry Comparison Builder", type:"interactive", minutes:10, summary:"Both poems… however… whereas…", body:[
      "Build a comparative thesis before you select evidence. A useful shape is: 'Both poems present ___, but while Poem A suggests ___, Poem B presents ___.'.",
      "Each paragraph should keep the comparison active instead of discussing one poem for a page and bolting the second poem on at the end."
    ]},
    "unseen": {title:"Unseen Poetry: Three Reads", type:"lesson", minutes:8, summary:"Situation → shifts → strongest evidence.", body:[
      "Read 1: what is happening, who is speaking and what is the broad feeling? Read 2: where does the poem change? Read 3: which details best support your interpretation?",
      "You do not need to decode every line. Build a defensible interpretation from evidence you can explain."
    ]},
    "unseen-compare": {title:"Unseen Comparison", type:"lesson", minutes:8, summary:"Compare one strong idea accurately.", body:[
      "Identify the clearest relationship between the poems. Then select one or two methods from each that help you explain that relationship.",
      "Clarity matters more than covering every possible similarity and difference."
    ]},
    "quote-recall": {title:"Quotation Recall Without Panic", type:"interactive", minutes:8, summary:"Learn short, flexible evidence.", body:[
      "Prioritise short quotations that can connect to more than one theme. Attach each quotation to a character, theme and moment so it has multiple retrieval routes.",
      "Use the Flashcards resource to create your own quotation set from texts you study."
    ]},
    "lit-planning": {title:"5-Minute Literature Plan", type:"checklist", minutes:7, summary:"Thesis, three moves, evidence, ending.", body:[
      "Write a one-sentence thesis. Choose three paragraph moves that develop it. Add one or two pieces of evidence per move. Note the writer's choice you can analyse. Then start writing.",
      "A plan should make the writing easier, not become a miniature essay."
    ]},
    "lit-final-check": {title:"Literature Final Check", type:"checklist", minutes:5, summary:"A five-question quality check.", body:[
      "Have I answered the exact question? Is my argument clear? Have I used evidence? Have I analysed writer's choices rather than just naming techniques? Have I returned to the question throughout?"
    ]},
    "mini-mock": {title:"Build a Mini Mock", type:"interactive", minutes:5, summary:"Create a mixed timed practice session.", body:[
      "Pick one Language reading question, one writing task and one Literature paragraph. Set a strict time limit and complete them in one sitting.",
      "Afterwards, review only three things: accuracy, explanation and time control. Choose one of those as the focus for the next mini mock."
    ]},
    "exam-day": {title:"Exam-Day Checklist", type:"checklist", minutes:5, summary:"Simple actions that protect your performance.", body:[
      "Know which paper you are sitting. Read the exact question wording. Watch the clock. Leave space if you need to move on. Use spare time to proofread and check rather than adding a completely new idea at the last second."
    ]}
  },

  practicePrompts: {
    p1q5:[
      "Write a description suggested by this idea: an empty place just before a storm.",
      "Write a story about a decision that changes the rest of a day.",
      "Describe a crowded place becoming suddenly quiet.",
      "Write a story that begins with somebody realising they are in the wrong place."
    ],
    p2q5:[
      "'Young people spend too much time on screens and not enough time being active.' Write a speech for your school giving your viewpoint.",
      "'Schools should give students more opportunities to learn practical life skills.' Write an article giving your viewpoint.",
      "'Public spaces should be designed more for teenagers.' Write a letter to a local council giving your viewpoint.",
      "'Homework should be shorter but more focused.' Write an article in which you argue your view."
    ],
    p1q4:[
      "A reader says: 'The writer makes the setting seem threatening from the very beginning.' How far do you agree? Plan the evidence you would use.",
      "A reader says: 'The character appears confident, but the writer gradually reveals their uncertainty.' How far do you agree?"
    ],
    p1q3:[
      "Explain how a writer could structure a scene so that an ordinary journey becomes increasingly tense.",
      "Explain how a writer could shift focus from a busy crowd to one individual to create significance."
    ],
    lit:[
      "Plan an essay exploring how a writer presents ambition and its consequences.",
      "Plan an essay exploring how a writer presents responsibility.",
      "Plan an essay exploring how a character changes across a text.",
      "Plan a comparison about how two poems present conflict or power."
    ]
  },

  glossary:[
    ["Thesis","Your overall interpretation or central argument."],
    ["Connotation","An idea or association suggested by a word beyond its literal meaning."],
    ["Semantic field","A group of words linked by a shared area of meaning."],
    ["Juxtaposition","Placing contrasting things near each other to emphasise a difference."],
    ["Cyclical structure","An ending that returns to an idea, image or situation from the beginning."],
    ["Narrative viewpoint","The position or perspective from which a story is told."],
    ["Inference","A conclusion reasonably drawn from evidence rather than directly stated."],
    ["Rhetorical question","A question used for effect rather than to receive a literal answer."],
    ["Anaphora","Repetition at the beginning of successive clauses or sentences."],
    ["Motif","A recurring image, idea or pattern that develops meaning across a text."],
    ["Tone","The attitude or emotional quality created by the writer's choices."],
    ["Form","The type or shape of a text, such as a play, novella, speech or article."]
  ],

  games:[
    {id:"question-order", title:"Question Order Sprint", icon:"↩", description:"Put the Language questions into the NEON Q5 → Q1 revision order."},
    {id:"technique-match", title:"Technique Match", icon:"⌁", description:"Match a technique to its best definition as quickly as you can."},
    {id:"p4-sort", title:"P4 Sort", icon:"P⁴", description:"Sort ideas into Presently, Personally, Publicly or Predictably."},
    {id:"sentence-surgery", title:"Sentence Surgery", icon:"✎", description:"Choose the cleanest improvement to a clumsy sentence."},
    {id:"thesis-builder", title:"Thesis Builder", icon:"◆", description:"Turn a vague idea into a sharper Literature thesis."},
    {id:"retrieval-rush", title:"Retrieval Rush", icon:"⚡", description:"Fast-fire GCSE English terminology retrieval."}
  ],

  achievements:[
    {id:"first-step", icon:"✓", name:"First Step", description:"Complete your first lesson", threshold:1},
    {id:"five-lessons", icon:"5", name:"Getting Going", description:"Complete 5 lessons", threshold:5},
    {id:"ten-lessons", icon:"10", name:"Double Digits", description:"Complete 10 lessons", threshold:10},
    {id:"streak-3", icon:"🔥", name:"On a Roll", description:"Reach a 3-day study streak", streak:3},
    {id:"streak-7", icon:"★", name:"Study Week", description:"Reach a 7-day study streak", streak:7},
    {id:"xp-500", icon:"⚡", name:"500 XP", description:"Earn 500 XP", xp:500}
  ]
};
