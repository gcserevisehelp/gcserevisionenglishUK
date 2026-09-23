(() => {
  const D = window.NEON_DATA;
  const C = window.NEON_CONFIG || {};
  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const toast = document.getElementById('toast');
  const announcementBar = document.getElementById('announcementBar');
  const cfgReady = C.supabaseUrl && C.supabaseAnonKey && !C.supabaseUrl.includes('YOUR_');
  const sb = cfgReady && window.supabase ? window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey) : null;

  const state = {
    user:null, profile:null, enrollments:[], progress:[], notes:[], bookmarks:[], activities:[], dbCourses:[], dbLessons:[], announcements:[],
    route:'home', routeArg:null, activeLesson:null,
    local: JSON.parse(localStorage.getItem('neon_local') || '{}')
  };

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = v => new Intl.NumberFormat('en-GB',{style:'currency',currency:C.currency||'GBP'}).format(Number(v||0));
  const today = () => new Date().toISOString().slice(0,10);
  const initials = name => (name || 'NE').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const saveLocal = () => localStorage.setItem('neon_local', JSON.stringify(state.local));

  function showToast(message,type='success'){
    toast.textContent = message; toast.className = `toast ${type}`;
    setTimeout(()=>toast.classList.add('hidden'),3000);
  }
  function openModal(html){ modalBody.innerHTML=html; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); }
  function closeModal(){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); modalBody.innerHTML=''; }

  function mergedCourses(){
    return D.courses.map(c=>{
      const db=state.dbCourses.find(x=>x.slug===c.slug);
      return db ? {...c,...db,features:c.features} : c;
    }).sort((a,b)=>(a.sort_order??99)-(b.sort_order??99));
  }

  function profileData(){
    return state.profile || state.local.profile || {display_name:'Learner',year_group:'Year 11',target_grade:'5',daily_goal:30,exam_board:'AQA',bio:''};
  }

  function completedIds(){
    const cloud = state.progress.filter(p=>p.completed).map(p=>p.lesson_id);
    const local = state.local.completed || [];
    return new Set([...cloud,...local]);
  }
  function bookmarkedIds(){
    const cloud=state.bookmarks.map(b=>b.lesson_id); const local=state.local.bookmarks||[]; return new Set([...cloud,...local]);
  }
  function courseLessonIds(slug){ return (D.modules[slug]||[]).flatMap(m=>m.lessons); }
  function coursePercent(slug){
    const ids=courseLessonIds(slug); if(!ids.length) return 0;
    const done=completedIds(); return Math.round(ids.filter(x=>done.has(x)).length/ids.length*100);
  }
  function allCompletedCount(){ return completedIds().size; }
  function xp(){ return allCompletedCount()*35 + (state.local.gameWins||0)*20 + (state.local.practiceDone||0)*25; }
  function streak(){
    const dates=[...(state.local.studyDates||[])];
    state.activities.forEach(a=>{if(a.created_at)dates.push(a.created_at.slice(0,10));});
    const set=new Set(dates); let n=0; const d=new Date();
    while(set.has(d.toISOString().slice(0,10))){n++;d.setDate(d.getDate()-1);} return n;
  }
  function logLocalActivity(label,icon='✓'){
    const d=today(); state.local.studyDates=[...new Set([...(state.local.studyDates||[]),d])];
    state.local.activity=[{id:uuid(),label,icon,created_at:new Date().toISOString()},...(state.local.activity||[])].slice(0,30); saveLocal();
  }

  function accessFor(slug){
    if(C.demoMode) return {ok:true,label:'Demo access'};
    if(state.profile?.is_admin) return {ok:true,label:'Owner access'};
    const e=state.enrollments.find(e=>e.course_slug===slug && (!e.expires_at || new Date(e.expires_at)>new Date()));
    if(e) return {ok:true,label:e.expires_at?`Access until ${new Date(e.expires_at).toLocaleDateString('en-GB')}`:'Active access'};
    return {ok:false,label:'Course locked'};
  }

  function setRoute(route,arg=null,push=true){
    state.route=route; state.routeArg=arg;
    const hash = arg ? `#${route}/${encodeURIComponent(arg)}` : `#${route}`;
    if(push && location.hash!==hash) history.pushState(null,'',hash);
    render(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function parseHash(){
    const h=(location.hash||'#home').slice(1); const [r,a]=h.split('/');
    state.route=r||'home'; state.routeArg=a?decodeURIComponent(a):null;
  }

  async function init(){
    parseHash();
    document.getElementById('year').textContent=new Date().getFullYear();
    const support=document.getElementById('supportLink'); if(C.supportEmail) support.href=`mailto:${C.supportEmail}`;
    applyPreferences(); bindShell();
    if(sb){
      const {data:{session}}=await sb.auth.getSession(); state.user=session?.user||null;
      sb.auth.onAuthStateChange(async(_event,session)=>{state.user=session?.user||null;await loadCloud();render();});
      await loadCloud();
    }
    render();
  }

  async function loadCloud(){
    if(!sb) return;
    const publicTasks=[
      sb.from('courses').select('*').eq('active',true).order('sort_order'),
      sb.from('announcements').select('*').eq('active',true).order('created_at',{ascending:false}).limit(3),
      sb.from('lessons').select('*').eq('published',true).order('position')
    ];
    const [cr,an,ls]=await Promise.all(publicTasks);
    if(!cr.error) state.dbCourses=cr.data||[];
    if(!an.error) state.announcements=an.data||[];
    if(!ls.error) state.dbLessons=ls.data||[];
    if(state.user){
      const uid=state.user.id;
      const [p,e,pr,n,b,a]=await Promise.all([
        sb.from('profiles').select('*').eq('id',uid).maybeSingle(),
        sb.from('enrollments').select('*').eq('user_id',uid),
        sb.from('learner_progress').select('*').eq('user_id',uid),
        sb.from('notes').select('*').eq('user_id',uid),
        sb.from('bookmarks').select('*').eq('user_id',uid),
        sb.from('activity_log').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(30)
      ]);
      if(!p.error) state.profile=p.data;
      if(!e.error) state.enrollments=e.data||[];
      if(!pr.error) state.progress=pr.data||[];
      if(!n.error) state.notes=n.data||[];
      if(!b.error) state.bookmarks=b.data||[];
      if(!a.error) state.activities=a.data||[];
    } else { state.profile=null;state.enrollments=[];state.progress=[];state.notes=[];state.bookmarks=[];state.activities=[]; }
  }

  function bindShell(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-nav]'); if(nav){setRoute(nav.dataset.nav);document.getElementById('mainNav').classList.remove('open');}
      if(e.target.matches('[data-close-modal]')||e.target.closest('[data-close-modal]')) closeModal();
      const course=e.target.closest('[data-course]'); if(course)setRoute('course',course.dataset.course);
      const lesson=e.target.closest('[data-lesson]'); if(lesson) openLesson(lesson.dataset.course,lesson.dataset.lesson);
    });
    document.getElementById('mobileMenuBtn').onclick=()=>document.getElementById('mainNav').classList.toggle('open');
    document.getElementById('searchBtn').onclick=openSearch;
    window.addEventListener('popstate',()=>{parseHash();render();});
    window.addEventListener('hashchange',()=>{parseHash();render();});
  }

  function render(){
    updateHeader(); updateAnnouncement();
    $$('.main-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===state.route));
    const routes={home:renderHome,courses:renderCourses,course:()=>renderCourse(state.routeArg),practice:renderPractice,games:renderGames,resources:renderResources,planner:renderPlanner,profile:renderProfile};
    (routes[state.route]||renderHome)();
    app.focus({preventScroll:true});
  }

  function updateHeader(){
    const p=profileData(); document.getElementById('profileInitials').textContent=initials(p.display_name);
    document.getElementById('profileLabel').textContent=state.user?(p.display_name||'Profile').split(' ')[0]:'Profile';
  }
  function updateAnnouncement(){
    const a=state.announcements[0];
    if(a){announcementBar.innerHTML=`<strong>${esc(a.title||'Update')}:</strong> ${esc(a.body||'')}`;announcementBar.classList.remove('hidden');}
    else announcementBar.classList.add('hidden');
  }

  function renderHome(){
    const p=profileData(); const courses=mergedCourses(); const continueCourse=courses.find(c=>accessFor(c.slug).ok && coursePercent(c.slug)<100) || courses[4];
    const pct=coursePercent(continueCourse.slug);
    app.innerHTML=`
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">GCSE English • AQA</span>
          <h1>Revision that tells you <span>what to do next.</span></h1>
          <p>Learn the method, practise it immediately, track your progress and keep everything — lessons, games, notes, planner and profile — in one clean place.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" data-nav="courses">Explore courses →</button>
            <button class="btn btn-secondary" data-nav="practice">Try quick practice</button>
          </div>
          <div class="trust-row"><span>Original practice</span><span>Interactive tools</span><span>Progress tracking</span></div>
        </div>
        <div class="hero-panel">
          <div class="mini-label">${state.user?'Continue learning':'Your learning dashboard'}</div>
          <h3>${state.user?`Welcome back, ${esc((p.display_name||'Learner').split(' ')[0])}`:'Everything in one place'}</h3>
          <div class="next-card">
            <div class="lesson-kicker">${esc(continueCourse.name)} • ${pct}% complete</div>
            <h4>${state.user?'Continue your course':'Create a profile and track your progress'}</h4>
            <p class="muted">${state.user?esc(continueCourse.focus):'Save lessons, notes, streaks, goals, exam dates and revision plans.'}</p>
            <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
            <div style="margin-top:14px"><button class="btn btn-green btn-sm" ${state.user?`data-course="${continueCourse.slug}"`:'id="heroLogin"'}>${state.user?'Continue →':'Create / log in →'}</button></div>
          </div>
          <div class="stat-strip"><div class="stat-pill"><strong>${allCompletedCount()}</strong><span>Lessons</span></div><div class="stat-pill"><strong>${streak()}</strong><span>Day streak</span></div><div class="stat-pill"><strong>${xp()}</strong><span>XP</span></div></div>
        </div>
      </section>

      <section class="section compact">
        <div class="section-head"><div><span class="eyebrow">Find your route</span><h2>What do you want to work on?</h2></div><p>Go straight to the bit you need. NEON is built to feel like a learning platform, not a giant folder of revision sheets.</p></div>
        <div class="choice-grid">
          ${choiceCard('✦','English Language','Paper 1 + Paper 2, including the Q5 → Q1 revision route.','courses','pro')}
          ${choiceCard('◆','English Literature','Essay skills, Shakespeare, 19th-century novel, poetry and unseen.','courses','standard')}
          ${choiceCard('↗','Quick Practice','Generate an original prompt, use a timer and self-check your answer.','practice','')}
          ${choiceCard('⚡','Revision Games','Short retrieval challenges for when a full lesson feels too much.','games','')}
        </div>
      </section>

      <section class="section section-soft">
        <div class="section-head"><div><span class="eyebrow">Courses</span><h2>Choose how much you want.</h2></div><button class="btn btn-secondary" data-nav="courses">Compare all courses</button></div>
        <div class="course-grid">${courses.slice(0,3).map(courseCard).join('')}</div>
      </section>

      <section class="section section-dark">
        <div class="section-head"><div><span class="eyebrow">Simple by design</span><h2>How NEON works</h2></div><p class="muted">The platform moves from explanation to practice to retrieval, instead of leaving you to figure out what to do with a revision page.</p></div>
        <div class="steps"><div class="step"><h3>Choose a course</h3><p>Pick Language, Literature or both, with access length matched to the tier.</p></div><div class="step"><h3>Learn the method</h3><p>Short lessons break each exam skill into a repeatable process.</p></div><div class="step"><h3>Practise it</h3><p>Use builders, original prompts, quizzes and games straight away.</p></div><div class="step"><h3>Track improvement</h3><p>Your Profile keeps progress, goals, notes, streaks and achievements together.</p></div></div>
      </section>

      <section class="section">
        <div class="section-head"><div><span class="eyebrow">More than lessons</span><h2>A whole revision toolkit.</h2></div></div>
        <div class="feature-grid">
          ${feature('◎','Profile & progress','Target grade, study goal, streak, XP, completed lessons and achievements.')}
          ${feature('◴','Revision planner','Plan all seven days and keep a simple daily revision target.')}
          ${feature('✎','Private notes','Write notes underneath lessons and bring them back when you return.')}
          ${feature('★','Bookmarks','Save the lessons you know you need to revisit before mocks.')}
          ${feature('⌁','Practice generator','Fresh original prompts for Language writing, evaluation, structure and Literature planning.')}
          ${feature('⚡','Games & retrieval','Quick-fire activities for terminology, question order, P4 and sentence control.')}
        </div>
      </section>`;
    $('#heroLogin')?.addEventListener('click',showAuth);
    $$('[data-route-arg]').forEach(el=>el.onclick=()=>setRoute(el.dataset.route,el.dataset.routeArg||null));
  }

  function choiceCard(icon,title,text,route,arg){ return `<button class="choice-card" data-route="${route}" data-route-arg="${arg||''}"><span class="choice-icon">${icon}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><span class="arrow">→</span></button>`; }
  function feature(icon,title,text){ return `<div class="feature-card"><span class="feature-icon">${icon}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`; }
  function courseCard(c){
    const a=accessFor(c.slug),pct=coursePercent(c.slug);
    return `<article class="course-card ${c.featured?'featured':''}" data-accent="${esc(c.accent)}"><div class="course-top"></div><div class="course-body"><h3 class="course-name">${esc(c.name)}</h3><div class="course-focus">${esc(c.focus)}</div><div class="course-price">${money(c.price)} <small>one-off</small></div><span class="course-duration">${c.days} days access</span><ul class="feature-list">${(c.features||[]).slice(0,6).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${a.ok?`<div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><small class="muted" style="margin:7px 0 14px">${pct}% complete • ${esc(a.label)}</small>`:''}<div class="course-actions"><button class="btn btn-secondary" data-course="${c.slug}">View</button><button class="btn ${a.ok?'btn-green':'btn-primary'}" data-course="${c.slug}">${a.ok?'Continue':'Choose'}</button></div></div></article>`;
  }

  function renderCourses(){
    app.innerHTML=`<section class="page-hero"><span class="eyebrow">Course library</span><h1>Choose your English revision course.</h1><p>Higher tiers give longer access and more depth. Every course keeps the same clean lesson system, with Plus-Premium unlocking the full library and every extra.</p></section><section class="section compact"><div class="course-grid">${mergedCourses().map(courseCard).join('')}</div><div class="callout" style="margin-top:26px"><strong>Not sure?</strong> Standard is Literature-focused, Pro is Language-focused, Plus mixes both, Premium gives both in condensed detail, and Plus-Premium is the complete library.</div></section>`;
  }

  function renderCourse(slug){
    const c=mergedCourses().find(x=>x.slug===slug); if(!c){setRoute('courses',null,false);return;}
    const access=accessFor(slug), modules=D.modules[slug]||[], ids=courseLessonIds(slug),pct=coursePercent(slug);
    app.innerHTML=`<section class="page-hero"><span class="eyebrow">${esc(c.name)} course</span><h1>${esc(c.focus)}</h1><p>${esc(c.detail)}</p><div class="hero-actions"><span class="course-duration">${c.days} days access</span><span class="course-duration">${ids.length} lessons</span><span class="course-duration">${pct}% complete</span>${access.ok?`<button class="btn btn-green" data-lesson="${ids[0]}" data-course="${slug}">Start / continue course →</button>`:`<button class="btn btn-primary" id="buyCourse">Get ${esc(c.name)} — ${money(c.price)}</button>`}</div></section>
    <section class="section compact"><div class="dashboard-grid"><div><span class="eyebrow">Curriculum</span><h2>Everything inside ${esc(c.name)}</h2>${modules.map((m,i)=>`<div class="panel" style="margin:14px 0"><strong>Module ${i+1}: ${esc(m.title)}</strong><div style="margin-top:10px">${m.lessons.map((id,j)=>{const l=D.lessons[id];const done=completedIds().has(id);const preview=i===0&&j===0;return `<button class="lesson-link ${done?'done':''} ${!access.ok&&!preview?'locked':''}" data-lesson="${id}" data-course="${slug}"><span class="dot">${done?'✓':j+1}</span><span>${esc(l?.title||id)} ${!access.ok&&!preview?'🔒':''}</span></button>`}).join('')}</div></div>`).join('')}</div><aside><div class="panel"><h3>Your access</h3><p class="muted">${esc(access.label)}</p><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><p><strong>${pct}% complete</strong></p>${!state.user?'<button class="btn btn-primary btn-block" id="courseLogin">Log in / create profile</button>':''}</div><div class="panel" style="margin-top:14px"><h3>Included tools</h3><ul class="feature-list">${c.features.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></aside></div></section>`;
    $('#courseLogin')?.addEventListener('click',showAuth);
    $('#buyCourse')?.addEventListener('click',()=>beginPurchase(c));
  }

  function openLesson(courseSlug,lessonId){
    const access=accessFor(courseSlug), ids=courseLessonIds(courseSlug), preview=ids.indexOf(lessonId)===0;
    if(!access.ok&&!preview){showToast('This lesson is inside the paid course.','error');return;}
    state.activeLesson=lessonId; state.route='course'; state.routeArg=courseSlug; history.replaceState(null,'',`#course/${courseSlug}`); renderLesson(courseSlug,lessonId);
  }

  function lessonData(courseSlug,id){
    const db=state.dbLessons.find(x=>x.course_slug===courseSlug && x.lesson_key===id);
    if(db) return {...D.lessons[id],title:db.title||D.lessons[id]?.title,summary:db.summary||D.lessons[id]?.summary,body:(db.body||'').split(/\n\n+/)};
    return D.lessons[id];
  }

  function renderLesson(courseSlug,lessonId){
    const c=mergedCourses().find(x=>x.slug===courseSlug), l=lessonData(courseSlug,lessonId); if(!c||!l){renderCourse(courseSlug);return;}
    const done=completedIds(), bookmarks=bookmarkedIds(), note=state.notes.find(n=>n.lesson_id===lessonId)?.body ?? state.local.notes?.[lessonId] ?? '';
    app.innerHTML=`<div class="course-layout"><aside class="course-sidebar"><button class="btn btn-secondary btn-sm" data-course="${courseSlug}">← Course overview</button><h2 style="margin-top:20px">${esc(c.name)}</h2><div class="sub">${coursePercent(courseSlug)}% complete</div><div class="progress-track"><div class="progress-fill" style="width:${coursePercent(courseSlug)}%"></div></div>${(D.modules[courseSlug]||[]).map(m=>`<div class="module-title">${esc(m.title)}</div>${m.lessons.map(id=>{const x=lessonData(courseSlug,id);return `<button class="lesson-link ${done.has(id)?'done':''} ${id===lessonId?'active':''}" data-lesson="${id}" data-course="${courseSlug}"><span class="dot">${done.has(id)?'✓':'•'}</span><span>${esc(x?.title||id)}</span></button>`}).join('')}`).join('')}</aside><article class="course-content"><div class="lesson-header"><span class="eyebrow">${esc(l.type||'lesson')} • ${l.minutes||8} min</span><h1>${esc(l.title)}</h1><p class="muted">${esc(l.summary||'')}</p><div class="lesson-tools"><button class="btn ${done.has(lessonId)?'btn-green':'btn-primary'}" id="completeLesson">${done.has(lessonId)?'✓ Completed':'Mark lesson complete'}</button><button class="btn btn-secondary" id="bookmarkLesson">${bookmarks.has(lessonId)?'★ Bookmarked':'☆ Bookmark'}</button></div></div><div class="lesson-body">${(l.body||[]).map((p,i)=>`<p>${esc(p)}</p>${i===0&&l.callout?`<div class="callout">${esc(l.callout)}</div>`:''}`).join('')}${lessonInteractive(lessonId,l)}</div><div class="notes-box"><h2>Your private notes</h2><p class="muted">Write something you want to remember when you come back to this lesson.</p><textarea id="lessonNotes" placeholder="My notes…">${esc(note)}</textarea><div style="margin-top:8px"><button class="btn btn-secondary btn-sm" id="saveNotes">Save notes</button></div></div></article></div>`;
    $('#completeLesson').onclick=()=>toggleComplete(lessonId,courseSlug);
    $('#bookmarkLesson').onclick=()=>toggleBookmark(lessonId,courseSlug);
    $('#saveNotes').onclick=()=>saveNote(lessonId,$('#lessonNotes').value);
    bindLessonInteractive(lessonId);
  }

  function lessonInteractive(id,l){
    if(id==='p2q5') return `<div class="panel" style="margin-top:28px"><h2>P4 interactive planner</h2><div class="form-grid"><div class="field"><label>Presently — current issue + viewpoint</label><textarea id="p4presently" rows="5"></textarea></div><div class="field"><label>Personally — human/personal angle</label><textarea id="p4personally" rows="5"></textarea></div><div class="field"><label>Publicly — wider society/evidence</label><textarea id="p4publicly" rows="5"></textarea></div><div class="field"><label>Predictably — opposing view + rebuttal</label><textarea id="p4predictably" rows="5"></textarea></div></div><div class="admin-actions" style="margin-top:12px"><button class="btn btn-green" id="buildP4">Build my outline</button><button class="btn btn-secondary" id="clearP4">Clear</button></div><div id="p4Output" class="callout hidden"></div></div><h2>Your Q5 layout sheet</h2><p class="muted">Use this as the visual structure your course teaches.</p><img class="q5-sheet" src="q5-layout.png" alt="Paper 2 Question 5 Presently Personally Publicly Predictably layout">`;
    if(id==='lit-paragraph') return `<div class="panel" style="margin-top:24px"><h2>Paragraph builder</h2><div class="form-grid"><div class="field"><label>Idea</label><input id="pbIdea" placeholder="The writer presents…"></div><div class="field"><label>Evidence</label><input id="pbEvidence" placeholder="A short quotation/reference"></div><div class="field"><label>Method</label><input id="pbMethod" placeholder="A useful writer's choice"></div><div class="field"><label>Why it matters</label><input id="pbWhy" placeholder="This suggests…"></div></div><button class="btn btn-green" style="margin-top:12px" id="buildParagraph">Build paragraph plan</button><div id="pbOutput" class="callout hidden"></div></div>`;
    if(l.type==='checklist') return `<div class="panel" style="margin-top:24px"><h2>Quick self-check</h2><div class="checklist">${(l.body||[]).map((p,i)=>`<label class="check-item"><input type="checkbox"><span>${esc(p)}</span></label>`).join('')}</div></div>`;
    return '';
  }

  function bindLessonInteractive(id){
    if(id==='p2q5'){
      $('#buildP4').onclick=()=>{const vals=['presently','personally','publicly','predictably'].map(x=>$(`#p4${x}`).value.trim());const out=$('#p4Output');out.innerHTML=`<strong>Your P4 outline</strong><br><br><b>Presently:</b> ${esc(vals[0]||'—')}<br><br><b>Personally:</b> ${esc(vals[1]||'—')}<br><br><b>Publicly:</b> ${esc(vals[2]||'—')}<br><br><b>Predictably:</b> ${esc(vals[3]||'—')}`;out.classList.remove('hidden');};
      $('#clearP4').onclick=()=>{$$('#p4presently,#p4personally,#p4publicly,#p4predictably').forEach(x=>x.value='');$('#p4Output').classList.add('hidden');};
    }
    if(id==='lit-paragraph') $('#buildParagraph').onclick=()=>{const out=$('#pbOutput');out.innerHTML=`<strong>Plan:</strong> ${esc($('#pbIdea').value||'[idea]')} → use ${esc($('#pbEvidence').value||'[evidence]')} → explore ${esc($('#pbMethod').value||'[method]')} → explain ${esc($('#pbWhy').value||'[why it matters]')}.`;out.classList.remove('hidden');};
  }

  async function toggleComplete(id,courseSlug){
    const isDone=completedIds().has(id);
    if(state.user&&sb){
      const payload={user_id:state.user.id,lesson_id:id,course_slug:courseSlug,completed:!isDone,completed_at:!isDone?new Date().toISOString():null};
      const {error}=await sb.from('learner_progress').upsert(payload,{onConflict:'user_id,lesson_id'}); if(error){showToast(error.message,'error');return;} await recordActivity(!isDone?`Completed ${D.lessons[id]?.title||id}`:`Reopened ${D.lessons[id]?.title||id}`,'✓'); await loadCloud();
    } else {
      let arr=state.local.completed||[]; arr=isDone?arr.filter(x=>x!==id):[...new Set([...arr,id])];state.local.completed=arr;if(!isDone)logLocalActivity(`Completed ${D.lessons[id]?.title||id}`,'✓');saveLocal();
    }
    showToast(isDone?'Marked as not complete':'Lesson completed +35 XP'); renderLesson(courseSlug,id);
  }

  async function toggleBookmark(id,courseSlug){
    const has=bookmarkedIds().has(id);
    if(state.user&&sb){
      if(has) await sb.from('bookmarks').delete().eq('user_id',state.user.id).eq('lesson_id',id); else await sb.from('bookmarks').insert({user_id:state.user.id,lesson_id:id,course_slug:courseSlug}); await loadCloud();
    }else{let a=state.local.bookmarks||[];state.local.bookmarks=has?a.filter(x=>x!==id):[...new Set([...a,id])];saveLocal();}
    showToast(has?'Bookmark removed':'Lesson bookmarked');renderLesson(courseSlug,id);
  }

  async function saveNote(id,body){
    if(state.user&&sb){const {error}=await sb.from('notes').upsert({user_id:state.user.id,lesson_id:id,body,updated_at:new Date().toISOString()},{onConflict:'user_id,lesson_id'});if(error){showToast(error.message,'error');return;}await loadCloud();}
    else{state.local.notes={...(state.local.notes||{}),[id]:body};saveLocal();}
    showToast('Notes saved');
  }

  async function recordActivity(label,icon){
    if(state.user&&sb) await sb.from('activity_log').insert({user_id:state.user.id,label,icon}); else logLocalActivity(label,icon);
  }

  function beginPurchase(c){
    if(c.payment_url){window.open(c.payment_url,'_blank','noopener');return;}
    openModal(`<h2 id="modalTitle">${esc(c.name)} checkout</h2><p>${esc(c.focus)} • <strong>${money(c.price)}</strong> • ${c.days} days access.</p><div class="callout"><strong>Checkout isn't connected yet.</strong><br>The course and database are payment-ready, but a secure payment link/webhook still needs to be added in the Control Room.</div>${!state.user?'<button class="btn btn-primary" id="purchaseLogin">Create / log in to your learner profile</button>':''}`);
    $('#purchaseLogin')?.addEventListener('click',()=>{closeModal();showAuth();});
  }

  function renderPractice(){
    app.innerHTML=`<section class="page-hero"><span class="eyebrow">Practice lab</span><h1>Do the skill, not just the notes.</h1><p>Generate an original task, use the built-in timer and check your response against a focused checklist. Your writing stays in your browser unless you save it yourself.</p></section><section class="section compact"><div class="practice-grid"><div class="question-card"><div class="filter-row" id="practiceFilters"><button class="filter-chip active" data-skill="p2q5">P2 Q5</button><button class="filter-chip" data-skill="p1q5">P1 Q5</button><button class="filter-chip" data-skill="p1q4">P1 Q4</button><button class="filter-chip" data-skill="p1q3">P1 Q3</button><button class="filter-chip" data-skill="lit">Literature</button></div><span class="eyebrow">Your task</span><h3 id="practiceTitle">Paper 2 Q5</h3><div class="question-text" id="practiceQuestion"></div><div class="admin-actions"><button class="btn btn-secondary btn-sm" id="newPrompt">New prompt ↻</button><button class="btn btn-soft btn-sm" id="showP4Hint">Show method</button></div><textarea class="answer-area" id="practiceAnswer" placeholder="Plan or write your answer here…"></textarea><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:12px"><button class="btn btn-green" id="finishPractice">Finish practice +25 XP</button><span class="muted" id="wordCount">0 words</span></div></div><aside><div class="panel"><span class="eyebrow">Focus timer</span><div class="timer" id="timerDisplay">15:00</div><div class="admin-actions"><button class="btn btn-primary btn-sm" id="startTimer">Start</button><button class="btn btn-secondary btn-sm" id="resetTimer">Reset</button><select id="timerMinutes"><option>10</option><option selected>15</option><option>20</option><option>30</option><option>45</option></select></div></div><div class="panel" style="margin-top:14px"><h3>Self-check</h3><div id="practiceChecklist" class="checklist"></div></div></aside></div></section>`;
    let skill='p2q5',timerId=null,seconds=900;
    const names={p2q5:'Paper 2 Q5',p1q5:'Paper 1 Q5',p1q4:'Paper 1 Q4',p1q3:'Paper 1 Q3',lit:'Literature planning'};
    const checks={p2q5:['Clear viewpoint','Matches form/audience/purpose','P4 movement: presently → personally → publicly → predictably','Varied rhetoric used for a reason','Accurate sentences and punctuation'],p1q5:['Clear atmosphere or manageable plot','Intentional structure','Precise vocabulary and verbs','Sentence variety for effect','Ending feels controlled'],p1q4:['Clear judgement','Precise evidence','Explains writer choices','Evaluates effect','Returns to the statement'],p1q3:['Tracks beginning → development → shift → ending','Uses structural ideas, not only language','Explains why focus changes','Links structure to reader understanding'],lit:['Clear thesis','Three paragraph moves','Relevant evidence','Writer methods to analyse','Every point returns to question']};
    const refreshPrompt=()=>{const a=D.practicePrompts[skill];$('#practiceTitle').textContent=names[skill];$('#practiceQuestion').textContent=a[Math.floor(Math.random()*a.length)];$('#practiceChecklist').innerHTML=checks[skill].map(x=>`<label class="check-item"><input type="checkbox"><span>${esc(x)}</span></label>`).join('');};refreshPrompt();
    $$('#practiceFilters button').forEach(b=>b.onclick=()=>{skill=b.dataset.skill;$$('#practiceFilters button').forEach(x=>x.classList.toggle('active',x===b));refreshPrompt();});
    $('#newPrompt').onclick=refreshPrompt;
    $('#showP4Hint').onclick=()=>openModal(`<h2 id="modalTitle">Method reminder</h2>${skill==='p2q5'?'<div class="callout"><b>Presently</b> establish the issue → <b>Personally</b> narrow the lens → <b>Publicly</b> widen out → <b>Predictably</b> rebut the opposing view and finish.</div>':'<div class="callout">Read the exact task, decide the purpose of your response, make a short plan, then write with control rather than trying to include every technique you know.</div>'}`);
    $('#practiceAnswer').oninput=e=>$('#wordCount').textContent=`${e.target.value.trim()?e.target.value.trim().split(/\s+/).length:0} words`;
    const drawTimer=()=>$('#timerDisplay').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    $('#startTimer').onclick=()=>{if(timerId)return;timerId=setInterval(()=>{seconds--;drawTimer();if(seconds<=0){clearInterval(timerId);timerId=null;showToast('Timer finished');}},1000)};
    $('#resetTimer').onclick=()=>{clearInterval(timerId);timerId=null;seconds=Number($('#timerMinutes').value)*60;drawTimer();};
    $('#timerMinutes').onchange=()=>{$('#resetTimer').click();};
    $('#finishPractice').onclick=()=>{state.local.practiceDone=(state.local.practiceDone||0)+1;logLocalActivity(`Completed ${names[skill]} practice`,'✎');saveLocal();showToast('Practice finished +25 XP');};
  }

  function renderGames(){
    app.innerHTML=`<section class="page-hero"><span class="eyebrow">Revision arcade</span><h1>Quick games. Real exam knowledge.</h1><p>Use these when you want a short retrieval burst between bigger revision sessions.</p></section><section class="section compact"><div class="games-grid">${D.games.map(g=>`<article class="game-card"><span class="game-icon">${g.icon}</span><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p><button class="btn btn-secondary btn-sm" data-game="${g.id}">Play →</button></article>`).join('')}</div><div id="gameMount" style="margin-top:26px"></div></section>`;
    $$('[data-game]').forEach(b=>b.onclick=()=>mountGame(b.dataset.game));
  }

  function mountGame(id){
    const mount=$('#gameMount');
    if(id==='question-order'){
      const q=['Q1','Q2','Q3','Q4','Q5'].sort(()=>Math.random()-.5);mount.innerHTML=`<div class="game-arena"><h2>Question Order Sprint</h2><p>Click the Language question numbers in NEON's revision order.</p><div class="option-grid">${q.map(x=>`<button class="option-btn" data-q="${x}">${x}</button>`).join('')}</div><p id="gameFeedback" class="muted"></p></div>`;let next=5;$$('[data-q]').forEach(b=>b.onclick=()=>{if(b.dataset.q===`Q${next}`){b.classList.add('correct');b.disabled=true;next--;if(next===0)winGame('Perfect — Q5 → Q4 → Q3 → Q2 → Q1.');}else{b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),500);}});return;
    }
    if(id==='technique-match'||id==='retrieval-rush'){
      const pairs=[['Juxtaposition','Placing contrasting things close together'],['Inference','A conclusion drawn from evidence'],['Motif','A recurring image or idea'],['Rhetorical question','A question used mainly for effect'],['Semantic field','A group of related words']];let i=0;const ask=()=>{const [term,ans]=pairs[i%pairs.length];const opts=[ans,...pairs.filter(x=>x[1]!==ans).map(x=>x[1])].sort(()=>Math.random()-.5).slice(0,4);mount.innerHTML=`<div class="game-arena"><h2>${id==='retrieval-rush'?'Retrieval Rush':'Technique Match'}</h2><p><strong>${term}</strong></p><div class="option-grid">${opts.map(x=>`<button class="option-btn" data-a="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>`;$$('[data-a]').forEach(b=>b.onclick=()=>{if(b.dataset.a===ans){b.classList.add('correct');i++;if(i>=5)winGame('5/5 — strong retrieval.');else setTimeout(ask,350);}else b.classList.add('wrong');});};ask();return;
    }
    if(id==='p4-sort'){
      const items=[['Presently','Start with the current issue and your viewpoint'],['Personally','Zoom in to a human or personal angle'],['Publicly','Widen out to society or evidence'],['Predictably','Acknowledge and rebut the other side']];let score=0;mount.innerHTML=`<div class="game-arena"><h2>P4 Sort</h2>${items.sort(()=>Math.random()-.5).map(([key,text],i)=>`<div class="panel" style="margin:10px 0"><b>${esc(text)}</b><div class="filter-row">${['Presently','Personally','Publicly','Predictably'].map(x=>`<button class="filter-chip" data-p4="${key}" data-answer="${x}">${x}</button>`).join('')}</div></div>`).join('')}</div>`;$$('[data-p4]').forEach(b=>b.onclick=()=>{if(b.dataset.p4===b.dataset.answer){b.classList.add('active');b.parentElement.querySelectorAll('button').forEach(x=>x.disabled=true);score++;if(score===4)winGame('P4 sorted correctly.');}else{b.style.borderColor='#ef9da7';}});return;
    }
    if(id==='sentence-surgery'){
      mount.innerHTML=`<div class="game-arena"><h2>Sentence Surgery</h2><p>Choose the clearest version.</p><div class="option-grid"><button class="option-btn" data-correct="0">The storm, which was very big and dark and scary, was making the street very scary.</button><button class="option-btn" data-correct="1">The storm swallowed the street in a sudden darkness.</button><button class="option-btn" data-correct="0">The storm was a storm that was dark and it made darkness happen.</button><button class="option-btn" data-correct="0">Darkly, the storm stormed with storm-like darkness.</button></div></div>`;$$('[data-correct]').forEach(b=>b.onclick=()=>b.dataset.correct==='1'?winGame('Clean, precise and controlled.'):b.classList.add('wrong'));return;
    }
    if(id==='thesis-builder'){
      mount.innerHTML=`<div class="game-arena"><h2>Thesis Builder</h2><p>Which thesis gives the strongest arguable interpretation?</p><div class="option-grid"><button class="option-btn" data-correct="0">Macbeth is about ambition.</button><button class="option-btn" data-correct="1">Shakespeare presents unchecked ambition as a force that turns private desire into public destruction.</button><button class="option-btn" data-correct="0">There is ambition in Macbeth and lots happens.</button><button class="option-btn" data-correct="0">Macbeth is ambitious because he wants things.</button></div></div>`;$$('[data-correct]').forEach(b=>b.onclick=()=>b.dataset.correct==='1'?winGame('That thesis gives you a direction for the whole essay.'):b.classList.add('wrong'));return;
    }
  }

  function winGame(message){ state.local.gameWins=(state.local.gameWins||0)+1;logLocalActivity(message,'⚡');saveLocal();$('#gameMount').innerHTML=`<div class="game-arena"><h2>Nice work ⚡</h2><p>${esc(message)}</p><p><strong>+20 XP</strong></p><button class="btn btn-green" data-nav="games">Choose another game</button></div>`;showToast('Game complete +20 XP'); }

  function renderResources(){
    const customCards=state.local.flashcards||[];
    app.innerHTML=`<section class="page-hero"><span class="eyebrow">Resource hub</span><h1>Everything you keep coming back to.</h1><p>Glossary, flashcards, bookmarks, checklists and your own revision material — built into the same platform.</p></section><section class="section compact"><div class="resource-grid">${feature('ABC','GCSE glossary','Key terminology explained in clear language.')}${feature('◫','My flashcards','Create your own quotation or terminology cards.')}${feature('★','Bookmarked lessons','Jump back to lessons you marked for another look.')}${feature('✓','Exam checklists','Quick reminders for planning and checking work.')}${feature('P⁴','Q5 P4 framework','Presently → Personally → Publicly → Predictably.')}${feature('↩','Q5 → Q1 route','The NEON Language revision order in one place.')}</div><div class="dashboard-grid" style="margin-top:22px"><div class="panel"><h2>Glossary</h2><div class="activity-list">${D.glossary.map(([t,d])=>`<div class="activity-item"><div class="activity-icon">A</div><div><strong>${esc(t)}</strong><small>${esc(d)}</small></div></div>`).join('')}</div></div><aside><div class="panel"><h2>Flashcards</h2><div id="flashcardMount">${customCards.length?flashcardHtml(customCards[0],false):'<p class="muted">No cards yet. Add your own quotation, definition or reminder.</p>'}</div><div class="admin-actions" style="margin-top:12px"><button class="btn btn-green btn-sm" id="addFlashcard">Add card</button>${customCards.length?'<button class="btn btn-secondary btn-sm" id="nextFlashcard">Next</button>':''}</div></div><div class="panel" style="margin-top:14px"><h2>Bookmarks</h2>${[...bookmarkedIds()].length?[...bookmarkedIds()].map(id=>`<button class="lesson-link" data-find-lesson="${id}"><span class="dot">★</span>${esc(D.lessons[id]?.title||id)}</button>`).join(''):'<p class="muted">Bookmark lessons and they will appear here.</p>'}</div></aside></div></section>`;
    let cardIndex=0,flipped=false;
    $('#addFlashcard').onclick=()=>openModal(`<h2 id="modalTitle">Add flashcard</h2><div class="field"><label>Front</label><textarea id="fcFront"></textarea></div><div class="field" style="margin-top:12px"><label>Back</label><textarea id="fcBack"></textarea></div><button class="btn btn-green" style="margin-top:14px" id="saveFlashcard">Save card</button>`);
    document.addEventListener('click',function cardSaver(e){if(e.target.id==='saveFlashcard'){const f=$('#fcFront').value.trim(),b=$('#fcBack').value.trim();if(!f||!b)return;state.local.flashcards=[...(state.local.flashcards||[]),{front:f,back:b}];saveLocal();closeModal();renderResources();document.removeEventListener('click',cardSaver);}}, {once:false});
    $('#nextFlashcard')?.addEventListener('click',()=>{cardIndex=(cardIndex+1)%customCards.length;flipped=false;$('#flashcardMount').innerHTML=flashcardHtml(customCards[cardIndex],false);bindFlash();});
    const bindFlash=()=>$('.flashcard')?.addEventListener('click',()=>{flipped=!flipped;$('#flashcardMount').innerHTML=flashcardHtml(customCards[cardIndex],flipped);bindFlash();});bindFlash();
    $$('[data-find-lesson]').forEach(b=>b.onclick=()=>{const id=b.dataset.findLesson;const slug=Object.keys(D.modules).find(s=>courseLessonIds(s).includes(id)&&accessFor(s).ok)||'plus-premium';openLesson(slug,id);});
  }
  function flashcardHtml(c,flip){return `<div class="flashcard"><div>${flip?`<span class="back">${esc(c.back)}</span>`:esc(c.front)}<small style="display:block;margin-top:14px;color:#9ca9a0;font-size:.72rem">Click to flip</small></div></div>`;}

  function renderPlanner(){
    const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']; const plan=state.local.plan||{}; const p=profileData();
    app.innerHTML=`<section class="page-hero"><span class="eyebrow">Revision planner</span><h1>Plan a week you can actually follow.</h1><p>Your current daily goal is <strong>${Number(p.daily_goal)||30} minutes</strong>. Keep tasks specific: “P2 Q5 plan + 1 paragraph” is better than “revise English”.</p></section><section class="section compact"><div class="planner-grid">${days.map(d=>`<div class="day-card"><strong>${d}</strong><textarea data-plan-day="${d}" placeholder="What will you revise?">${esc(plan[d]||'')}</textarea></div>`).join('')}</div><div class="admin-actions" style="margin-top:18px"><button class="btn btn-green" id="savePlan">Save weekly plan</button><button class="btn btn-secondary" id="clearPlan">Clear</button></div><div class="callout" style="margin-top:22px"><strong>Suggested mix:</strong> two Language sessions, two Literature sessions, one mixed practice session, one quick retrieval session, and one rest/catch-up day.</div></section>`;
    $('#savePlan').onclick=()=>{state.local.plan={};$$('[data-plan-day]').forEach(t=>state.local.plan[t.dataset.planDay]=t.value);saveLocal();showToast('Planner saved');};
    $('#clearPlan').onclick=()=>{$$('[data-plan-day]').forEach(t=>t.value='');state.local.plan={};saveLocal();};
  }

  function renderProfile(){
    const p=profileData(),acts=[...state.activities,...(state.local.activity||[])].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,8); const ach=D.achievements; const done=allCompletedCount(),s=streak(),x=xp();
    if(!state.user){
      app.innerHTML=`<section class="page-hero"><span class="eyebrow">Your profile</span><h1>Make NEON yours.</h1><p>You can use some features without an account, but logging in lets Supabase sync your learner profile and course access.</p></section><section class="section compact"><div class="dashboard-grid"><div class="panel"><div class="profile-hero"><div class="big-avatar">${initials(p.display_name)}</div><div><h1>${esc(p.display_name||'Learner')}</h1><p>Local profile • ${esc(p.exam_board||'AQA')} • Target grade ${esc(p.target_grade||'5')}</p></div><button class="btn btn-primary" id="profileLogin">Log in / sign up</button></div></div><aside class="panel"><h3>Local progress</h3><div class="stat-grid" style="grid-template-columns:1fr 1fr"><div class="stat-card"><div class="stat-value">${done}</div><div class="stat-label">Lessons</div></div><div class="stat-card"><div class="stat-value">${x}</div><div class="stat-label">XP</div></div></div></aside></div>${profileMain(p,acts,ach,done,s,x)}</section>`;
      $('#profileLogin').onclick=showAuth;
    } else {
      app.innerHTML=`<section class="page-hero"><div class="profile-hero"><div class="big-avatar">${initials(p.display_name)}</div><div><span class="eyebrow">Learner profile</span><h1>${esc(p.display_name||state.user.email)}</h1><p>${esc(p.exam_board||'AQA')} • ${esc(p.year_group||'Year 11')} • Target grade ${esc(p.target_grade||'5')}</p></div><button class="btn btn-secondary" id="logoutBtn">Log out</button></div></section><section class="section compact">${profileMain(p,acts,ach,done,s,x)}</section>`;
      $('#logoutBtn').onclick=async()=>{await sb.auth.signOut();showToast('Logged out');};
    }
    bindProfile(p);
  }

  function profileMain(p,acts,ach,done,s,x){
    return `<div class="stat-grid"><div class="stat-card"><div class="stat-value">${done}</div><div class="stat-label">Lessons complete</div></div><div class="stat-card"><div class="stat-value">${s}</div><div class="stat-label">Day streak</div></div><div class="stat-card"><div class="stat-value">${x}</div><div class="stat-label">XP earned</div></div><div class="stat-card"><div class="stat-value">${state.local.practiceDone||0}</div><div class="stat-label">Practice sessions</div></div></div><div class="dashboard-grid" style="margin-top:20px"><div><div class="panel"><h2>Edit profile</h2><div class="form-grid"><div class="field"><label>Display name</label><input id="pfName" value="${esc(p.display_name||'')}"></div><div class="field"><label>Year group</label><select id="pfYear"><option ${p.year_group==='Year 10'?'selected':''}>Year 10</option><option ${p.year_group==='Year 11'?'selected':''}>Year 11</option><option ${p.year_group==='Other'?'selected':''}>Other</option></select></div><div class="field"><label>Target grade</label><select id="pfGrade">${['4','5','6','7','8','9'].map(g=>`<option ${String(p.target_grade)===g?'selected':''}>${g}</option>`).join('')}</select></div><div class="field"><label>Daily revision goal</label><select id="pfGoal">${[15,20,30,45,60].map(n=>`<option value="${n}" ${Number(p.daily_goal)===n?'selected':''}>${n} minutes</option>`).join('')}</select></div><div class="field"><label>Exam board</label><input value="AQA" disabled></div><div class="field"><label>Next English exam / mock</label><input id="pfExamDate" type="date" value="${esc(p.exam_date||'')}"></div><div class="field full"><label>About my revision</label><textarea id="pfBio" rows="3" placeholder="For example: I want to improve Paper 2 Q5 and unseen poetry.">${esc(p.bio||'')}</textarea></div></div><button class="btn btn-green" id="saveProfile" style="margin-top:14px">Save profile</button></div><div class="panel" style="margin-top:16px"><h2>Achievements</h2><div class="badges">${ach.map(a=>{const unlocked=(a.threshold&&done>=a.threshold)||(a.streak&&s>=a.streak)||(a.xp&&x>=a.xp);return `<span class="badge ${unlocked?'':'locked'}"><span>${a.icon}</span>${esc(a.name)}</span>`}).join('')}</div></div></div><aside><div class="panel"><h2>Accessibility & focus</h2><div class="toggle-row"><span>Larger text</span><button class="switch ${state.local.largeText?'on':''}" data-pref="largeText"></button></div><div class="toggle-row"><span>Reduce motion</span><button class="switch ${state.local.reduceMotion?'on':''}" data-pref="reduceMotion"></button></div><div class="toggle-row"><span>Focus mode</span><button class="switch ${state.local.focusMode?'on':''}" data-pref="focusMode"></button></div></div><div class="panel" style="margin-top:16px"><h2>Recent activity</h2>${acts.length?`<div class="activity-list">${acts.map(a=>`<div class="activity-item"><div class="activity-icon">${esc(a.icon||'✓')}</div><div><strong>${esc(a.label)}</strong><small>${new Date(a.created_at).toLocaleDateString('en-GB')}</small></div></div>`).join('')}</div>`:'<p class="muted">Complete a lesson, game or practice task and it will appear here.</p>'}</div></aside></div>`;
  }

  function bindProfile(p){
    $('#saveProfile')?.addEventListener('click',saveProfile);
    $$('[data-pref]').forEach(b=>b.onclick=()=>{const k=b.dataset.pref;state.local[k]=!state.local[k];saveLocal();applyPreferences();b.classList.toggle('on',state.local[k]);});
  }
  async function saveProfile(){
    const payload={display_name:$('#pfName').value.trim()||'Learner',year_group:$('#pfYear').value,target_grade:$('#pfGrade').value,daily_goal:Number($('#pfGoal').value),exam_board:'AQA',exam_date:$('#pfExamDate').value||null,bio:$('#pfBio').value.trim(),updated_at:new Date().toISOString()};
    state.local.profile={...(state.local.profile||{}),...payload};saveLocal();
    if(state.user&&sb){const {error}=await sb.from('profiles').update(payload).eq('id',state.user.id);if(error){showToast(error.message,'error');return;}await loadCloud();}
    showToast('Profile saved');updateHeader();
  }
  function applyPreferences(){ document.body.classList.toggle('large-text',!!state.local.largeText);document.body.classList.toggle('reduce-motion',!!state.local.reduceMotion);document.body.classList.toggle('focus-mode',!!state.local.focusMode); }

  function showAuth(){
    if(!sb){openModal(`<h2 id="modalTitle">Supabase isn't connected</h2><p>Add your project URL and publishable key to <code>config.js</code> first.</p>`);return;}
    openModal(`<h2 id="modalTitle">Welcome to NEON</h2><p class="muted">Log in to sync your course access and profile, or create a learner account.</p><div class="field"><label>Email</label><input id="authEmail" type="email" autocomplete="email"></div><div class="field" style="margin-top:12px"><label>Password</label><input id="authPassword" type="password" autocomplete="current-password"></div><div class="admin-actions" style="margin-top:16px"><button class="btn btn-primary" id="doLogin">Log in</button><button class="btn btn-secondary" id="doSignup">Create account</button><button class="btn btn-soft" id="doReset">Forgot password</button></div><p class="muted" style="font-size:.78rem;margin-top:18px">Do not share your password with anyone. Course payment details are handled separately from this login.</p>`);
    $('#doLogin').onclick=()=>authAction('login'); $('#doSignup').onclick=()=>authAction('signup'); $('#doReset').onclick=()=>authAction('reset');
  }
  async function authAction(kind){
    const email=$('#authEmail').value.trim(),password=$('#authPassword').value;if(!email){showToast('Enter your email.','error');return;}
    let res;
    if(kind==='login') res=await sb.auth.signInWithPassword({email,password});
    if(kind==='signup') res=await sb.auth.signUp({email,password});
    if(kind==='reset') res=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname+'#profile'});
    if(res.error){showToast(res.error.message,'error');return;}closeModal();showToast(kind==='reset'?'Password reset email sent':kind==='signup'?'Account created — check your email if confirmation is enabled':'Logged in');
  }

  function openSearch(){
    const items=Object.entries(D.lessons);openModal(`<h2 id="modalTitle">Search lessons</h2><div class="field"><input id="lessonSearch" placeholder="Try: Q5, poetry, structure, Macbeth…" autofocus></div><div id="searchResults" style="margin-top:14px"></div>`);
    const draw=()=>{const q=$('#lessonSearch').value.toLowerCase().trim();const found=items.filter(([id,l])=>!q||`${l.title} ${l.summary} ${(l.body||[]).join(' ')}`.toLowerCase().includes(q)).slice(0,12);$('#searchResults').innerHTML=found.map(([id,l])=>{const slug=Object.keys(D.modules).find(s=>courseLessonIds(s).includes(id))||'plus-premium';return `<button class="lesson-link" data-search-lesson="${id}" data-search-course="${slug}"><span class="dot">→</span><span><b>${esc(l.title)}</b><small style="display:block;color:#78857c">${esc(l.summary||'')}</small></span></button>`}).join('')||'<p class="muted">No matching lessons.</p>';$$('[data-search-lesson]').forEach(b=>b.onclick=()=>{closeModal();openLesson(b.dataset.searchCourse,b.dataset.searchLesson);});};
    $('#lessonSearch').oninput=draw;draw();
  }

  init();
})();
