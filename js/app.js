(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const OFF=130,ST=['state','bookmarks','notes','highlights','objectives','quiz','settings'];
const root=$('#app');let db=null,D={},M,L=[],art,CL,sbOpen=innerWidth>900,orphans=new Set(),sc=null,tbMode='',tbId='',MS;
const RM=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
/* ---------- storage (IndexedDB, kept in memory maps too) ---------- */
const openDB=()=>new Promise((ok,no)=>{const r=indexedDB.open('howtoquackquack',1);r.onupgradeneeded=()=>ST.forEach(s=>r.result.createObjectStore(s,{keyPath:'id'}));r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const loadAll=async()=>{for(const s of ST){D[s]=new Map();if(db)await new Promise(ok=>{db.transaction(s).objectStore(s).getAll().onsuccess=e=>{e.target.result.forEach(x=>D[s].set(x.id,x));ok()}})}};
const put=(s,o)=>{D[s].set(o.id,o);if(db)db.transaction(s,'readwrite').objectStore(s).put(o)};
const del=(s,id)=>{D[s].delete(id);if(db)db.transaction(s,'readwrite').objectStore(s).delete(id)};
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,6000)}
function theme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('htqq-theme',t)}catch(e){}}
/* ---------- text helpers ---------- */
const norm=s=>s.replace(/\u200c/g,'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/ي/g,'ی').replace(/ك/g,'ک').toLowerCase();
const plain=s=>s.replace(/\$([^$]+)\$/g,(m,t)=>t.replace(/\\text\{([^}]*)\}/g,'$1').replace(/[\\{}_^]/g,'')).replace(/[*`]/g,'');
const clean=s=>plain(s).replace(/[|#>]/g,' ').replace(/^[-:\s]+$/gm,'');
const md=window.markdownit({html:false,linkify:false});
/* Markdown -> HTML. Code and math are protected from the Markdown parser first, then restored. */
function render(src,inline){
 const st=[],keep=x=>'\uE000'+(st.push(x)-1)+'\uE001';
 src=src.replace(/`[^`\n]+`/g,m=>keep({c:m.slice(1,-1)}));
 src=src.replace(/\$\$([\s\S]+?)\$\$/g,(m,t)=>keep({m:t,d:1}));
 src=src.replace(/(?<!\\)\$([^$\n]+?)\$/g,(m,t)=>keep({m:t}));
 const h=inline?md.renderInline(src):md.render(src);
 return h.replace(/\uE000(\d+)\uE001/g,(m,i)=>{const o=st[i];if(o.c!==undefined)return '<code>'+esc(o.c)+'</code>';
  return '<span class="m'+(o.d?' d':'')+'" dir="ltr">'+katex.renderToString(o.m,{throwOnError:false,displayMode:!!o.d})+'</span>'})}
/* wrap Latin runs in LTR spans so mixed Persian/English text displays correctly */
function bidi(rt){const w=document.createTreeWalker(rt,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('code,.katex,.en,textarea')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),ns=[];let n;while(n=w.nextNode())ns.push(n);
 const re=/[A-Za-z0-9][A-Za-z0-9 .,'’\-\/&+:%]*[A-Za-z0-9]|[A-Za-z]/g;
 ns.forEach(n=>{const t=n.nodeValue;re.lastIndex=0;let m,last=0,fr=null;while(m=re.exec(t)){fr=fr||document.createDocumentFragment();fr.append(t.slice(last,m.index));const s=document.createElement('span');s.className='en';s.dir='ltr';s.textContent=m[0];fr.append(s);last=m.index+m[0].length}if(fr){fr.append(t.slice(last));n.replaceWith(fr)}})}
/* ---------- content loading ---------- */
function parse(raw,i,f){
 const lines=raw.split('\n'),title=lines[0].replace(/^#\s*/,''),secs=[];let cur=null;
 lines.forEach(l=>{const m=/^(#{1,6}) (.*)$/.exec(l);if(m&&m[1].length==2){cur={h:m[2],lines:[]};secs.push(cur)}else if(cur)cur.lines.push(l)});
 const g=secs.find(s=>/^د\./.test(s.h)),gl=[];
 if(g)g.lines.filter(l=>l.startsWith('|')).slice(2).forEach(r=>{const c=r.replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(x=>x.trim());if(c.length==3)gl.push({en:c[0],fa:c[1],def:c[2]})});
 return{i,raw,title,gl,id:f.slice(0,9)}}
async function load(){M=await (await fetch('manifest.json')).json();
 L=await Promise.all(M.lessons.map(async(f,i)=>parse(await (await fetch('content/module-0/'+f)).text(),i,f)))}
/* ---------- routing ---------- */
const setScroll=f=>{if(sc)removeEventListener('scroll',sc);sc=f;if(f)addEventListener('scroll',f,{passive:true})};
function route(){setScroll(null);art=null;$('#pop').hidden=true;hideTb();document.title='How to Quack Quack';
 const h=location.hash.slice(1)||'/',[p,q]=h.split('?'),pr=new URLSearchParams(q||''),s=p.split('/').filter(Boolean);
 const f={lesson:()=>lesson((+s[1]||1)-1,pr.get('s')),glossary:()=>glossary(pr.get('q')||''),notes:notesPage,search:()=>search(pr.get('q')||'')}[s[0]];
 f?f():home()}
const status=id=>{const s=D.state.get(id);return s&&s.done?['✓','تکمیل‌شده','done']:s&&s.pos?['◐','در حال مطالعه','prog']:['○','شروع‌نشده','new']};
/* ---------- home ---------- */
function home(){
 const done=L.filter(l=>(D.state.get(l.id)||{}).done).length,last=(D.settings.get('last')||{}).v,bm=L.filter(l=>D.bookmarks.has(l.id));
 root.innerHTML=`<div class="home"><h1>How to Quack Quack</h1><p class="sub">${esc(M.titleFa)} — ${esc(M.title)}</p>
 <p>این وب‌سایت ${fa(L.length)} درس ماژول «${esc(M.titleFa)}» را در یک محیط مطالعهٔ تعاملی ارائه می‌کند.</p>
 <div class="prog"><progress max="${L.length}" value="${done}" aria-label="پیشرفت کلی"></progress><span>${fa(done)} از ${fa(L.length)} درس تکمیل شده</span></div>
 <p><a class="btn" href="#/lesson/${(last!=null?last:0)+1}">${last!=null?'ادامهٔ مطالعه':'شروع مطالعه'}</a> <a class="btn alt" href="#/glossary">واژه‌نامه</a> <a class="btn alt" href="#/notes">یادداشت‌ها</a></p>
 <h2>درس‌های نشان‌شده</h2>${bm.length?'<ul class="lessons">'+bm.map(l=>`<li><a href="#/lesson/${l.i+1}">${esc(l.title)}</a></li>`).join('')+'</ul>':'<p class="muted">درسی نشان‌شده نیست.</p>'}
 <h2>همهٔ درس‌ها</h2><ol class="lessons">${L.map(l=>{const[s,t,c]=status(l.id);return`<li><a href="#/lesson/${l.i+1}">${esc(l.title)}</a><span class="st ${c}">${s} ${t}</span>${D.bookmarks.has(l.id)?'<span class="st">★ نشان‌شده</span>':''}</li>`}).join('')}</ol>
 <div class="bk"><h2>پشتیبان‌گیری از داده‌ها</h2><p class="muted">داده‌های شما فقط در همین مرورگر و برای همین آدرس ذخیره می‌شوند. نسخهٔ محلی و نسخهٔ GitHub Pages به‌صورت خودکار همگام نمی‌شوند؛ برای انتقال از فایل پشتیبان استفاده کنید.</p>
 <button id="ex">دریافت پشتیبان (JSON)</button> <label class="btn alt" style="cursor:pointer">بازیابی از پشتیبان<input id="im" type="file" accept="application/json,.json" hidden></label></div></div>`;
 $('#ex').onclick=exportData;$('#im').onchange=e=>{if(e.target.files[0])importData(e.target.files[0]);e.target.value=''}}
/* ---------- backup ---------- */
function exportData(){const data={};ST.forEach(s=>data[s]=[...D[s].values()]);
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'how-to-quack-quack',schemaVersion:1,exportedAt:new Date().toISOString(),data},null,1)],{type:'application/json'}));
 a.download='quack-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
async function importData(file){
 let j;try{j=JSON.parse(await file.text())}catch(e){return alert('فایل JSON معتبر نیست.')}
 const bad=m=>alert('فایل پشتیبان نامعتبر یا ناسازگار است ('+m+'). هیچ داده‌ای تغییر نکرد.'),kn=x=>L.some(l=>l.id==x),S=x=>typeof x=='string';
 const V={state:x=>kn(x.id)&&(x.done===undefined||typeof x.done=='boolean')&&(x.pos===undefined||(x.pos&&S(x.pos.s))),bookmarks:x=>kn(x.id),notes:x=>S(x.text)&&kn(x.lesson),
  highlights:x=>['color','quote','prefix','suffix'].every(k=>S(x[k]))&&kn(x.lesson),objectives:x=>kn(x.id)&&Array.isArray(x.c)&&x.c.every(Number.isInteger),
  quiz:x=>kn(x.id)&&[x.latest,x.best,x.total].every(Number.isFinite),settings:x=>['theme','last'].includes(x.id)};
 if(!j||j.app!=='how-to-quack-quack')return bad('شناسهٔ برنامه');if(j.schemaVersion!==1)return bad('نسخهٔ ساختار');if(!j.data||typeof j.data!=='object')return bad('بخش data');
 for(const s of ST){const a=j.data[s];if(!Array.isArray(a)||a.some(x=>!x||typeof x!=='object'||!S(x.id)||!V[s](x)))return bad('بخش '+s)}
 if(!confirm('با بازیابی این پشتیبان، تمام یادداشت‌ها، هایلایت‌ها، پیشرفت و نتایج فعلی شما جایگزین می‌شوند. ادامه می‌دهید؟'))return;
 if(!db)return alert('ذخیره‌سازی مرورگر در دسترس نیست.');
 const t=db.transaction(ST,'readwrite');ST.forEach(s=>{const o=t.objectStore(s);o.clear();j.data[s].forEach(x=>o.put(x))});
 t.oncomplete=async()=>{await loadAll();const th=D.settings.get('theme');if(th)theme(th.v);route();toast('پشتیبان با موفقیت بازیابی شد.')};
 t.onabort=t.onerror=()=>alert('بازیابی ناموفق بود؛ داده‌های قبلی شما دست‌نخورده ماند.')}
/* ---------- lesson view ---------- */
const OL=h=>{for(let e=h.nextElementSibling;e&&e.tagName!='H2';e=e.nextElementSibling)if(e.tagName=='OL')return e};
function lesson(i,sec){
 const l=L[i];if(!l){location.hash='#/';return}CL=l;put('settings',{id:'last',v:i});if(innerWidth<=900)sbOpen=false;
 document.title=l.title+' — How to Quack Quack';
 root.innerHTML=`<div class="lw${sbOpen?'':' sb-off'}"><aside id="sb"></aside><div class="mc"><div class="stk"><div class="bar"><button id="bsb" aria-expanded="${sbOpen}">☰ درس‌ها</button><button id="btoc" aria-expanded="false" aria-controls="toc">فهرست مطالب</button><button id="bnp" aria-controls="np">یادداشت‌ها</button><button id="bbm"></button><button id="bdn"></button></div><nav id="toc" hidden aria-label="فهرست مطالب"></nav></div><article id="art" dir="rtl" lang="fa"></article><nav class="pn" aria-label="ناوبری درس‌ها"></nav></div><aside id="np" hidden aria-label="یادداشت‌ها"></aside></div>`;
 art=$('#art');art.innerHTML=render(l.raw);
 $$('table',art).forEach(t=>{const w=document.createElement('div');w.className='tw';t.replaceWith(w);w.append(t)});
 const hs=$$('h1,h2,h3,h4,h5,h6',art);hs.forEach((h,k)=>h.id='s'+k);
 $$('strong,code',art).forEach(e=>{if(e.textContent.trim()==='[دانش علمی تکمیلی]')e.classList.add('sup')});
 bidi(art);objectives(l);
 const hq=$$('h2',art).find(h=>/^ح\./.test(h.textContent));
 if(hq){let mode=0,q,a;for(let e=hq.nextElementSibling;e&&e.tagName!='H2';e=e.nextElementSibling){if(e.tagName=='H3')mode=/کلید/.test(e.textContent)?2:1;if(e.tagName=='OL'){if(mode==1&&!q)q=e;if(mode==2&&!a)a=e}}if(q&&a)buildQuiz(l,q,a)}
 orphans=new Set();[...D.highlights.values()].filter(h=>h.lesson==l.id).forEach(h=>{if(!applyHL(h))orphans.add(h.id)});
 if(orphans.size)toast(fa(orphans.size)+' هایلایت دیگر به‌طور مطمئن روی متن پیدا نشد؛ در پنل یادداشت‌ها فهرست شده‌اند.');
 glossLinks(l);drawSB();drawBar();buildTOC(hs);
 $('.pn').innerHTML=(L[i-1]?`<a href="#/lesson/${i}">→ درس قبل</a>`:'<span></span>')+'<a href="#/">صفحهٔ اصلی</a>'+(L[i+1]?`<a href="#/lesson/${i+2}">درس بعد ←</a>`:'<span></span>');
 $('#bsb').onclick=e=>{sbOpen=!sbOpen;$('.lw').classList.toggle('sb-off',!sbOpen);e.currentTarget.setAttribute('aria-expanded',sbOpen)};
 $('#btoc').onclick=e=>{const t=$('#toc');t.hidden=!t.hidden;e.currentTarget.setAttribute('aria-expanded',!t.hidden)};
 $('#bnp').onclick=()=>{const n=$('#np');n.hidden=!n.hidden;if(!n.hidden)notesPanel()};
 $('#bbm').onclick=()=>{D.bookmarks.has(l.id)?del('bookmarks',l.id):put('bookmarks',{id:l.id,t:Date.now()});drawBar()};
 $('#bdn').onclick=()=>{const s=D.state.get(l.id)||{id:l.id};s.done=!s.done;put('state',s);drawBar();drawSB()};
 const np=$('#np');
 np.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a,id=b.dataset.id;
  if(a=='close')np.hidden=true;else if(a=='add'){put('notes',{id:'n'+Date.now(),lesson:l.id,text:'',t:Date.now()});notesPanel();const t=$$('textarea',np).pop();t&&t.focus()}
  else if(a=='del'){if(confirm('این یادداشت حذف شود؟')){del('notes',id);notesPanel()}}
  else if(a=='delh'){del('highlights',id);orphans.delete(id);notesPanel()}};
 np.oninput=e=>{const t=e.target;if(t.tagName=='TEXTAREA'){const n=D.notes.get(t.dataset.id);if(n){n.text=t.value;put('notes',n)}}};
 art.onclick=e=>{const g=e.target.closest('.gt');if(g)return showPop(g);const m=e.target.closest('mark.hl');if(m&&getSelection().isCollapsed){tbMode='rm';tbId=m.dataset.id;showTb(m.getBoundingClientRect())}};
 art.onkeydown=e=>{if(e.key=='Enter'&&e.target.classList.contains('gt'))showPop(e.target)};
 const spy=(()=>{let raf=0,tm=0;return()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;let c=null;for(const h of hs){if(h.getBoundingClientRect().top<=OFF+1)c=h;else break}
  $$('#toc a').forEach(a=>{const on=c&&a.dataset.t==c.id;a.classList.toggle('cur',!!on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')});
  clearTimeout(tm);tm=setTimeout(()=>{const s=D.state.get(l.id)||{id:l.id};if(c)s.pos={s:c.id,o:Math.round(OFF-c.getBoundingClientRect().top)};else delete s.pos;put('state',s)},600)})}})();
 setScroll(spy);
 const go=()=>{const s0=D.state.get(l.id)||{},p=s0.pos,id=sec||(p&&p.s),o=sec?0:(p&&p.o)||0,el=id&&$('#'+id,art);el?scrollTo(0,scrollY+el.getBoundingClientRect().top-OFF+o):scrollTo(0,0);spy()};
 go();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go)}
function drawSB(){$('#sb').innerHTML='<nav aria-label="درس‌ها"><p><a href="#/">← صفحهٔ اصلی</a></p><ol>'+L.map(x=>{const[s,t,c]=status(x.id);return`<li><a href="#/lesson/${x.i+1}"${x===CL?' aria-current="page"':''}>${esc(x.title)}</a><br><span class="st ${c}">${s} ${t}</span></li>`}).join('')+'</ol></nav>'}
function drawBar(){const b=D.bookmarks.has(CL.id),d=!!(D.state.get(CL.id)||{}).done,bm=$('#bbm'),dn=$('#bdn');
 bm.textContent=b?'★ نشان‌شده':'☆ نشان‌کردن';bm.setAttribute('aria-pressed',b);dn.textContent=d?'✓ تکمیل‌شده (لغو)':'علامت‌گذاری به‌عنوان تکمیل‌شده';dn.setAttribute('aria-pressed',d)}
function buildTOC(hs){const t=$('#toc');t.innerHTML='<ul>'+hs.filter(h=>/^H[234]$/.test(h.tagName)).map(h=>`<li class="l${h.tagName[1]}"><a href="#${h.id}" data-t="${h.id}">${esc(h.textContent)}</a></li>`).join('')+'</ul>';
 t.onclick=e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();$('#'+a.dataset.t,art).scrollIntoView({behavior:RM()?'auto':'smooth'});if(innerWidth<=900){t.hidden=true;$('#btoc').setAttribute('aria-expanded','false')}}}
/* objectives: checkboxes added to the original list in section «ب.» */
function objectives(l){const h=$$('h2',art).find(x=>/^ب\./.test(x.textContent)),ol=h&&OL(h);if(!ol)return;
 const lis=[...ol.children],rec=D.objectives.get(l.id)||{id:l.id,c:[]},p=document.createElement('p');p.className='objp';p.setAttribute('role','status');
 const upd=()=>p.textContent=fa(rec.c.length)+' از '+fa(lis.length)+' هدف تکمیل شده است';
 lis.forEach((li,k)=>{const c=document.createElement('input');c.type='checkbox';c.className='ob';c.checked=rec.c.includes(k);c.setAttribute('aria-label','هدف '+fa(k+1)+' انجام شد');
  c.onchange=()=>{rec.c=c.checked?[...new Set([...rec.c,k])]:rec.c.filter(x=>x!==k);put('objectives',{id:l.id,c:rec.c});upd()};li.prepend(c)});
 upd();ol.after(p)}
/* quiz: the source questions are open-ended, so feedback is self-assessed against the source answer */
function buildQuiz(l,qOl,aOl){
 const Q=[...qOl.children].map(x=>x.innerHTML),A=[...aOl.children].map(x=>x.innerHTML),n=Math.min(Q.length,A.length),box=document.createElement('section');
 box.className='quiz';box.setAttribute('aria-label','آزمون');let sh=Array(n).fill(0),rs=Array(n).fill(null);
 const draw=()=>{const r=D.quiz.get(l.id),got=rs.filter(x=>x===1).length,dn=rs.filter(x=>x!==null).length;
  box.innerHTML=`<p class="muted" role="status">آخرین امتیاز: ${r?fa(r.latest)+' از '+fa(r.total):'—'} | بهترین امتیاز: ${r?fa(r.best)+' از '+fa(r.total):'—'}</p>`+
  Q.slice(0,n).map((q,k)=>`<div class="qc"><div class="qh"><span class="qn">${fa(k+1)}.</span><div>${q}</div></div>`+(!sh[k]?`<button data-a="show" data-k="${k}">نمایش پاسخ</button>`:`<div class="qa">${A[k]}</div>`+(rs[k]===null?`<p>پاسخ شما با کلید پاسخ چقدر همخوان بود؟</p><button data-a="ok" data-k="${k}">✓ درست پاسخ دادم</button> <button data-a="no" data-k="${k}">✗ نادرست بود</button>`:`<p class="${rs[k]?'okm':'nom'}">${rs[k]?'✓ درست':'✗ نادرست'} (ارزیابی خودتان)</p>`))+'</div>').join('')+
  `<p class="muted">${fa(dn)} از ${fa(n)} پرسش ارزیابی شده · امتیاز این دور: ${fa(got)}</p>`+(dn==n?'<button data-a="re">تلاش دوباره</button>':'');bidi(box)};
 box.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=+b.dataset.k,a=b.dataset.a,y=scrollY;
  if(a=='show')sh[k]=1;else if(a=='ok')rs[k]=1;else if(a=='no')rs[k]=0;else if(a=='re'){sh.fill(0);rs.fill(null)}
  if(a!='re'&&rs.every(x=>x!==null)){const s=rs.filter(x=>x===1).length,r=D.quiz.get(l.id)||{best:0,attempts:[]};put('quiz',{id:l.id,total:n,latest:s,best:Math.max(r.best||0,s),attempts:[...(r.attempts||[]),{t:Date.now(),s}].slice(-50)})}
  draw();scrollTo(0,y)};
 draw();qOl.replaceWith(box);aOl.hidden=true;aOl.insertAdjacentHTML('beforebegin','<p class="muted">پاسخ هر پرسش پس از انتخاب «نمایش پاسخ» در بخش آزمون نمایش داده می‌شود.</p>')}
/* ---------- highlights (anchored by quote + prefix + suffix) ---------- */
function tnodes(){const w=document.createTreeWalker(art,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('.katex-mathml,.quiz,.objp,[hidden],script,style')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),a=[];let n;while(n=w.nextNode())a.push(n);return a}
function ftext(ns){let t='';const off=[];ns.forEach(n=>{off.push(t.length);t+=n.nodeValue});return[t,off]}
function applyHL(h){const ns=tnodes(),[t,off]=ftext(ns),q=h.quote,c=[];
 for(let p=t.indexOf(q);p>=0;p=t.indexOf(q,p+1))c.push({p,s:(t.slice(Math.max(0,p-h.prefix.length),p)==h.prefix?2:0)+(t.slice(p+q.length,p+q.length+h.suffix.length)==h.suffix?2:0)});
 c.sort((a,b)=>b.s-a.s||Math.abs(a.p-h.start)-Math.abs(b.p-h.start));const b=c[0];
 if(!b||!(b.s==4||(c.length==1&&b.s>=2)))return false;
 const s=b.p,e=s+q.length;
 ns.forEach((n,k)=>{const a=Math.max(s,off[k])-off[k],z=Math.min(e,off[k]+n.length)-off[k];if(z>a){const r=document.createRange();r.setStart(n,a);r.setEnd(n,z);const m=document.createElement('mark');m.className='hl '+h.color;m.dataset.id=h.id;r.surroundContents(m)}});return true}
function selToHL(color){const s=getSelection();if(!art||!s.rangeCount||s.isCollapsed)return;const r=s.getRangeAt(0),ns=tnodes(),[t,off]=ftext(ns);let st=-1,en=-1;
 ns.forEach((n,k)=>{if(!r.intersectsNode(n))return;const a=n===r.startContainer?r.startOffset:0,z=n===r.endContainer?r.endOffset:n.length;if(z>a){if(st<0)st=off[k]+a;en=off[k]+z}});
 if(st<0||!t.slice(st,en).trim()){toast('انتخاب باید روی متن درس باشد.');return}
 const h={id:'h'+Date.now()+Math.random().toString(36).slice(2,6),lesson:CL.id,color,quote:t.slice(st,en),prefix:t.slice(Math.max(0,st-30),st),suffix:t.slice(en,en+30),start:st};
 put('highlights',h);s.removeAllRanges();applyHL(h)}
function removeHL(id){$$('mark.hl[data-id="'+id+'"]',art).forEach(m=>{const p=m.parentNode;m.replaceWith(...m.childNodes);p.normalize()});del('highlights',id)}
function showTb(r){const t=$('#tb');t.innerHTML=tbMode=='rm'?'<button data-rm="1">حذف هایلایت</button>':[['y','زرد'],['g','سبز'],['b','آبی'],['p','صورتی']].map(([c,n])=>`<button class="${c}" data-c="${c}" aria-label="هایلایت ${n}">${n}</button>`).join('');
 t.hidden=false;const w=t.offsetWidth,h=t.offsetHeight;let y=matchMedia('(pointer:coarse)').matches?r.bottom+10:r.top-h-8;if(y<8)y=r.bottom+10;
 t.style.top=Math.max(8,Math.min(innerHeight-h-8,y))+'px';t.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px'}
function hideTb(){$('#tb').hidden=true;tbMode=''}
function selCheck(){if(!art||!art.isConnected)return hideTb();const s=getSelection();
 if(!s.rangeCount||s.isCollapsed){if(tbMode!='rm')hideTb();return}
 if(!art.contains(s.anchorNode)||!art.contains(s.focusNode)||(s.anchorNode.parentElement||art).closest('.quiz'))return hideTb();
 tbMode='new';showTb(s.getRangeAt(0).getBoundingClientRect())}
/* ---------- glossary links + popover ---------- */
function glossLinks(l){const map=new Map(),al=[];
 l.gl.forEach((g,k)=>{const e=plain(g.en);[...new Set([...e.split(/\s\/\s/),...e.replace(/\s*\([^)]*\)/g,'').split(/\s\/\s/),...plain(g.fa).split(/\s\/\s/)].map(s=>s.trim()).filter(s=>s.length>=3))].forEach(a=>{const key=a.toLowerCase();if(!map.has(key)){map.set(key,k);al.push(a)}})});
 if(!al.length)return;al.sort((a,b)=>b.length-a.length);
 const B='A-Za-z\\u0600-\\u06FF\\u200c',re=new RegExp('(?<!['+B+'])('+al.map(a=>a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?!['+B+'])','gi'),seen=new Set(),ns=[];
 for(const e of art.children){if(e.tagName=='H2'&&/^د\./.test(e.textContent))break;if(/^H[1-6]$/.test(e.tagName))continue;
  const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('code,.katex,.gt,h1,h2,h3,h4,h5,h6,button,textarea,.quiz,[hidden]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while(n=w.nextNode())ns.push(n)}
 ns.forEach(n=>{const t=n.nodeValue;re.lastIndex=0;let m,last=0,fr=null;
  while(m=re.exec(t)){const k=map.get(m[1].toLowerCase());if(seen.has(k))continue;seen.add(k);fr=fr||document.createDocumentFragment();fr.append(t.slice(last,m.index));
   const s=document.createElement('span');s.className='gt';s.tabIndex=0;s.setAttribute('role','button');s.title='تعریف واژه';s.dataset.k=k;s.textContent=m[1];fr.append(s);last=m.index+m[1].length}
  if(fr){fr.append(t.slice(last));n.replaceWith(fr)}})}
function showPop(el){const g=CL.gl[+el.dataset.k],p=$('#pop');
 p.innerHTML=`<strong>${render(g.en,true)}</strong> · <span>${render(g.fa,true)}</span><div>${render(g.def,true)}</div>`;bidi(p);p.hidden=false;
 const r=el.getBoundingClientRect();p.style.top=Math.max(8,Math.min(innerHeight-p.offsetHeight-8,r.bottom+6))+'px';p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.left))+'px'}
/* ---------- notes ---------- */
function notesPanel(){const np=$('#np'),l=CL,ns=[...D.notes.values()].filter(n=>n.lesson==l.id).sort((a,b)=>a.t-b.t),or=[...D.highlights.values()].filter(h=>h.lesson==l.id&&orphans.has(h.id));
 np.innerHTML=`<div class="nph"><h2>یادداشت‌های این درس</h2><button data-a="close">بستن</button></div><p><button class="btn" data-a="add">+ افزودن یادداشت</button></p>`+
 ns.map(n=>`<div class="note"><textarea data-id="${n.id}" rows="5" aria-label="متن یادداشت">${esc(n.text)}</textarea><button data-a="del" data-id="${n.id}">حذف</button></div>`).join('')+(ns.length?'<p class="muted">یادداشت‌ها به‌طور خودکار ذخیره می‌شوند.</p>':'')+
 (or.length?'<h3>هایلایت‌های بدون تطابق</h3><p class="muted">این هایلایت‌ها دیگر به‌طور مطمئن روی متن پیدا نشدند و به متن دیگری وصل نشده‌اند.</p>'+or.map(h=>`<div class="note"><q>${esc(h.quote.slice(0,140))}</q><button data-a="delh" data-id="${h.id}">حذف</button></div>`).join(''):'')}
function notesPage(){const ns=[...D.notes.values()];
 root.innerHTML='<div class="pg"><h1>یادداشت‌ها</h1>'+(ns.length?L.map(l=>{const a=ns.filter(n=>n.lesson==l.id).sort((x,y)=>x.t-y.t);return a.length?`<h2><a href="#/lesson/${l.i+1}">${esc(l.title)}</a></h2>`+a.map(n=>`<div class="note ro">${esc(n.text).replace(/\n/g,'<br>')||'<span class="muted">(خالی)</span>'}</div>`).join(''):''}).join('')+'<p class="muted">برای ویرایش یا حذف، یادداشت را از داخل درس مربوط باز کنید.</p>':'<p class="muted">هنوز یادداشتی ثبت نشده است. یادداشت‌ها را از داخل هر درس اضافه کنید.</p>')+'</div>'}
/* ---------- glossary page ---------- */
function glossary(q){root.innerHTML=`<div class="pg"><h1>واژه‌نامه</h1><input id="gq" type="search" placeholder="جستجوی واژه (انگلیسی یا فارسی)" aria-label="جستجو در واژه‌نامه" value="${esc(q)}" style="width:100%"><p id="gc" class="muted" role="status"></p><div id="gl"></div></div>`;
 const all=L.flatMap(l=>l.gl.map(g=>({...g,l}))).sort((a,b)=>plain(a.en).localeCompare(plain(b.en)));
 const draw=()=>{const t=norm($('#gq').value.trim()),f=all.filter(g=>!t||norm(plain(g.en)+' '+plain(g.fa)+' '+plain(g.def)).includes(t));$('#gc').textContent=fa(f.length)+' واژه';
  $('#gl').innerHTML=f.map(g=>`<article class="gc"><h3><span dir="ltr">${g.h1||(g.h1=render(g.en,true))}</span> <span class="fa">${g.h2||(g.h2=render(g.fa,true))}</span></h3><div>${g.h3||(g.h3=render(g.def,true))}</div><a href="#/lesson/${g.l.i+1}">درس ${fa(g.l.i+1)}</a></article>`).join('');bidi($('#gl'))};
 $('#gq').oninput=draw;draw()}
/* ---------- global search ---------- */
function buildIndex(){if(MS)return;
 MS=new MiniSearch({fields:['title','heading','text'],storeFields:['lesson','sec','heading','title','text'],tokenize:s=>norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean)});const docs=[];
 L.forEach(l=>{let sid=-1,cur;const fl=()=>docs.push({id:l.i+'-'+cur.sec,lesson:l.i,sec:cur.sec,heading:clean(cur.heading),title:l.title,text:clean(cur.t.join('\n'))});
  l.raw.split('\n').forEach(ln=>{const m=/^(#{1,6}) (.*)$/.exec(ln);if(m){if(sid>=0)fl();sid++;cur={heading:m[2],sec:'s'+sid,t:[]}}else if(cur)cur.t.push(ln)});if(cur)fl()});
 MS.addAll(docs)}
function search(q){root.innerHTML=`<div class="pg"><h1>جستجو</h1><form id="sf2"><input type="search" id="q2" value="${esc(q)}" aria-label="عبارت جستجو"> <button class="btn">جستجو</button></form><div id="sr" role="status"></div></div>`;
 $('#sf2').onsubmit=e=>{e.preventDefault();location.hash='#/search?q='+encodeURIComponent($('#q2').value)};
 if(!q.trim()){$('#sr').innerHTML='<p class="muted">عبارتی وارد کنید.</p>';return}
 buildIndex();const o={prefix:true,combineWith:'AND',boost:{heading:3,title:2}};let r=MS.search(q,o);if(!r.length)r=MS.search(q,{...o,combineWith:'OR'});
 const toks=norm(q).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
 if(!toks.length){$('#sr').innerHTML='<p class="muted">نتیجه‌ای پیدا نشد.</p>';return}
 const re=new RegExp(toks.map(t=>[...t].map(c=>c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\u200c?')).join('|'),'gi');
 const snip=t=>{t=t.replace(/\s+/g,' ').trim();re.lastIndex=0;const m=re.exec(t),s=m?Math.max(0,m.index-70):0;return(s?'… ':'')+esc(t.slice(s,s+220)).replace(re,x=>'<mark>'+x+'</mark>')+'…'};
 $('#sr').innerHTML=`<p class="muted">${fa(r.length)} نتیجه</p><ul>`+r.slice(0,40).map(d=>`<li><a href="#/lesson/${d.lesson+1}?s=${d.sec}"><strong>${esc(d.title)}</strong> › ${esc(d.heading)}</a><p dir="auto">${snip(d.text||d.heading)}</p></li>`).join('')+'</ul>';bidi($('#sr'))}
/* ---------- init ---------- */
(async()=>{
 try{db=await openDB()}catch(e){db=null}
 await loadAll();
 const th=D.settings.get('theme');if(th)theme(th.v);
 $('#thm').onclick=()=>{const t=document.documentElement.dataset.theme=='dark'?'light':'dark';put('settings',{id:'theme',v:t});theme(t)};
 $('#sf').onsubmit=e=>{e.preventDefault();location.hash='#/search?q='+encodeURIComponent(e.target.q.value)};
 $('#tb').onpointerdown=e=>e.preventDefault();
 $('#tb').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.rm)removeHL(tbId);else selToHL(b.dataset.c);hideTb()};
 let tm;document.addEventListener('selectionchange',()=>{clearTimeout(tm);tm=setTimeout(selCheck,300)});
 document.addEventListener('click',e=>{if(!e.target.closest('#pop,.gt'))$('#pop').hidden=true;if(tbMode=='rm'&&!e.target.closest('#tb,mark.hl'))hideTb()});
 document.addEventListener('keydown',e=>{if(e.key=='Escape'){$('#pop').hidden=true;hideTb()}});
 addEventListener('hashchange',route);
 try{await load()}catch(e){root.innerHTML='<div class="pg"><h1>خطا در بارگذاری درس‌ها</h1><p>اگر فایل index.html را مستقیم باز کرده‌اید، برنامه را با start.bat اجرا کنید.</p></div>';return}
 if(!db)toast('ذخیره‌سازی مرورگر در دسترس نیست؛ داده‌ها فقط تا بستن صفحه می‌مانند.');
 route()})();
})();
