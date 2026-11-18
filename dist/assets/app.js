import { icon, courseArt } from './icons.js';
const shell=document.querySelector('#shell');
  const notice=document.querySelector('#notice');
  const kinds=['FEC','AEC','VAC'];
  const key='course-atlas.';
  const byText=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const original=(s)=>s.replace(/\u00a0/g,'□');
  const tidy=(s)=>s.replace(/\s+/g,' ').trim();
  const label=(name)=>{const s=name.replace(/\s+,/g,',').trim();if(/^evs$/i.test(s))return 'EVS';if(s==='PHYSICAL EDUCATION')return 'Physical Education';if(s==='Communication skills')return s;return s.replace(/(^|\s)([a-z])/g,(m,a,c,offset)=>offset&&['and','of','in','to','through'].includes(s.slice(offset+1).split(/[ ,:]/)[0])?m:a+c.toUpperCase());};
  function read(k,d){try{const v=localStorage.getItem(key+k);return v===null?d:JSON.parse(v)}catch{return d}}
  function persist(k,v){try{localStorage.setItem(key+k,JSON.stringify(v));return true}catch{return false}}
  let marked=new Set(),archive,courses,courseById,buckets,textIndex;
  let viewMode=read('view','grid')==='list'?'list':'grid',language=read('language','en')==='original'?'original':'en',timer,lastRoute='';
  const pageSize=18,reviewLimit=8;
  const safePage=(s,total)=>Math.max(1,Math.min(Math.ceil(total)||1,parseInt(s,10)||1));
  function route(){const [path,qs='']=location.hash.replace(/^#\/?/,'').split('?');const bits=path.split('/').filter(Boolean);return {path:bits[0]||'directory',id:bits[1]||'',params:new URLSearchParams(qs)}}
  function link(path,params={}){const p=new URLSearchParams();for(const [k,v] of Object.entries(params))if(v&&v!=='all'&&(k!=='p'||Number(v)>1))p.set(k,v);return '#/'+path+(p.size?'?'+p:'')}
  function changeParams(changes,mode='push'){const s=route(),args=Object.fromEntries(s.params);Object.assign(args,changes);const u=link(s.path+(s.id?'/'+s.id:''),args);if(mode==='replace')history.replaceState(null,'',u);else if(location.hash!==u)location.hash=u;}
  function flash(message){notice.textContent=message;notice.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>notice.classList.remove('show'),1800)}
  const nlabel=(n,s)=>`${n} ${s}${n===1?'':'s'}`;
  const slugCourse=(id)=>link('course/'+id);
  const isDark=()=>document.documentElement.dataset.theme==='dark';
  function sidebar(s){
    const active=s.path==='course'?'directory':s.path;
    const nav=(path,ic,txt,qty)=>`<a href="${link(path)}" class="nav-item ${active===path&&(!s.params.get('collection')||path!=='directory')?'current':''}"${active===path&&(!s.params.get('collection')||path!=='directory')?' aria-current="page"':''}>${icon(ic,18)}<span>${txt}</span>${qty!==undefined?`<small class="side-count">${qty}</small>`:''}</a>`;
    return `<a class="brand" href="#/directory"><img alt="" width="34" height="34" src="./assets/mark.svg"><span>Course Atlas</span></a>
    <div class="nav-block"><div class="nav-label">Browse</div>
      ${nav('directory','home','Home')}${nav('rankings','trophy','Rankings')}${nav('statistics','bars','Statistics')}${nav('saved','bookmark','Saved courses',marked.size)}
    </div><div class="nav-block"><div class="nav-label">Archive</div>
      ${nav('about','info','About &amp; Credits')}${nav('sources','folder','Source files')}
    </div><div class="nav-block"><div class="nav-label">Collections</div>${kinds.map(c=>`<a class="nav-item collection-nav ${s.path==='directory'&&s.params.get('collection')===c?'current':''}" href="${link('directory',{collection:c})}"><i class="collection-dot ${c.toLowerCase()}"></i><span>${c}</span><small>${courses.filter(k=>k.collection===c).length}</small></a>`).join('')}</div>
    <div class="side-bottom"><div class="campus"><span class="campus-icon">${icon('building',18)}</span><div><b>DTU electives</b><small>Fresources.tech archive</small></div></div></div>`;
  }
  function rootShell(){
    shell.innerHTML=`<div class="app-shell"><aside class="sidebar" aria-label="Workspace navigation" id="desktop-side"></aside>
    <div class="workspace"><header class="topbar"><div class="crumbs"><button class="icon-button mobile-menu" data-act="menu" aria-label="Open navigation">${icon('menu')}</button><a href="#/directory" class="crumb-home">${icon('panel',15)}<span>Workspace</span></a><span class="crumb-divider">/</span><span id="crumb-here"></span></div><div class="top-actions"><button class="icon-button" data-act="theme" id="theme" aria-label="Switch color theme"></button><span class="top-rule"></span><a class="source-button" href="#/sources">${icon('folder',15)}<span>Source files</span></a></div></header>
    <main id="main" tabindex="-1"></main></div></div>
    <dialog id="nav-dialog" aria-label="Workspace navigation"><button class="icon-button close-nav" data-act="close-menu" aria-label="Close navigation">${icon('close')}</button><nav id="mobile-side"></nav></dialog>`;
    document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();document.querySelector('#main').focus()});
  }
  function chrome(s,title){document.querySelector('#desktop-side').innerHTML=sidebar(s);document.querySelector('#mobile-side').innerHTML=sidebar(s);document.querySelector('#crumb-here').textContent=title;document.querySelector('#theme').innerHTML=icon(isDark()?'sun':'moon',17);document.querySelector('#theme').setAttribute('aria-label',isDark()?'Switch to light theme':'Switch to dark theme');document.title=`${title} · Course Atlas`;}
  function courseTag(c){return `<span class="course-code">${esc(c.collection)}<span>/</span>${String(c.number).padStart(2,'0')}</span>`}
  function subject(c,size=23){const [ic,tone]=courseArt(c.name);return `<span class="subject ${tone}">${icon(ic,size)}</span>`}
  function saveButton(c,big=false){const is=marked.has(c.id),verb=is?'Remove':'Save';const aria=is?`Remove ${label(c.name)} from saved courses`:`Save ${label(c.name)}`;return `<button type="button" class="${big?'btn save-big':'save-button'}${is?' is-saved':''}" data-act="save" data-id="${c.id}" aria-pressed="${is}" aria-label="${esc(aria)}" title="${esc(aria)}">${icon('bookmark',big?17:16)}${big?`<span>${is?'Saved':'Save course'}</span>`:''}</button>`}
  function hero(){return `<section class="hero"><div class="hero-art" aria-hidden="true"></div><div class="hero-inner"><div class="eyebrow"><span class="accent-line"></span>DTU elective archive</div><h1>Home</h1><p>Find out what students say about the teaching, workload, and exams for each elective.</p><div class="hero-stats"><span>${icon('book',15)}<b>${courses.length}</b> course entries</span><i></i><span>${icon('message',15)}<b>${archive.reviews.length}</b> student reviews</span></div></div></section>`}
  function heading(eye,title,desc){return `<div class="page-intro"><div class="eyebrow"><span class="accent-line"></span>${esc(eye)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>`}
  function tabs(s,allowed=kinds,all=true){const opts=all?['all',...allowed]:allowed;const d=s.params.get('collection');const chosen=allowed.includes(d)?d:(all?'all':allowed[0]);return `<div class="tabs" aria-label="Filter by collection">${opts.map(cat=>{const u=link(s.path,{...Object.fromEntries(s.params),collection:cat,p:1});return `<a href="${u}" class="tab ${cat===chosen?'active':''}"${cat===chosen?' aria-current="true"':''}>${cat==='all'?'All courses':cat}</a>`}).join('')}</div>`}
  function card(c){return `<article class="course-card">${subject(c)}${saveButton(c)}<div class="card-name">${courseTag(c)}<h3><a href="${slugCourse(c.id)}">${esc(label(c.name))}</a></h3></div><div class="card-foot"><span class="score">${icon('star',15)}<strong>${c.average}</strong><small>/ 10</small></span><span class="count">${icon('message',14)}${nlabel(c.reviewCount,'review')}</span></div></article>`}
  function searchBox(id,placeholder,value,keyHint=''){return `<div class="searchbox">${icon('search',17)}<input id="${id}" type="search" autocomplete="off" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}">${keyHint?'<kbd aria-hidden="true">/</kbd>':''}</div>`}
  function sortSelect(s){const saved=s.path==='saved',o=s.params.get('sort')||(saved?'priority':'reviews');return `<label class="sort-control">${icon('sort',16)}<select aria-label="Sort courses" id="sort-courses">${[...(saved?[['priority','My priority']]:[]),['reviews','Most reviewed'],['rating','Highest rated'],['az','Name A–Z'],['source','Source order']].map(([v,t])=>`<option value="${v}" ${o===v?'selected':''}>${t}</option>`).join('')}</select>${icon('chevron',13)}</label>`}
  function viewButtons(){return `<div class="view-controls" aria-label="Choose course layout">${['grid','list'].map(v=>`<button data-act="view" data-view="${v}" aria-label="${v==='grid'?'Grid':'List'} view" aria-pressed="${v===viewMode}" title="${v==='grid'?'Grid':'List'} view" class="${v===viewMode?'chosen':''}">${icon(v,16)}</button>`).join('')}</div>`}
  function empty(ic,title,body,act,txt){return `<div class="empty"><span class="empty-icon">${icon(ic,24)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p>${act?`<a class="btn" href="${act}">${esc(txt)} ${icon('arrow',14)}</a>`:''}</div>`}
  function pager(s,page,total,limit,word){if(!total)return '';const count=Math.ceil(total/limit),start=(page-1)*limit+1,end=Math.min(page*limit,total);const items=[];for(let i=1;i<=count;i++){if(i===1||i===count||Math.abs(i-page)<=1)items.push(i);else if(items.at(-1)!=='…')items.push('…')}
    function pl(p,content,aria){return `<a class="page-number${p===page?' selected':''}" aria-label="${aria}" ${p===page?'aria-current="page"':''} href="${link(s.path+(s.id?'/'+s.id:''),{...Object.fromEntries(s.params),p})}" data-pager>${content}</a>`}
    return `<div class="pagination"><span>Showing <b>${start}–${end}</b> of <b>${total}</b> ${total===1?word.slice(0,-1):word}</span>${count>1?`<nav aria-label="Pagination">${page>1?pl(page-1,icon('left',15),'Previous page'):`<span class="page-number off">${icon('left',15)}</span>`}${items.map(n=>n==='…'?'<span class="page-ellipsis">…</span>':pl(n,n,'Page '+n)).join('')}${page<count?pl(page+1,icon('right',15),'Next page'):`<span class="page-number off">${icon('right',15)}</span>`}</nav>`:''}</div>`;}
  function priorityRow(course, order, index, total) {
    const id = esc(course.id);
    return `<article class="priority-row" data-priority-id="${id}">
      <span class="priority-number" draggable="true" title="Drag to reorder">#${order}</span>
      <div class="priority-title">${courseTag(course)}<h3><a href="${slugCourse(course.id)}">${esc(label(course.name))}</a></h3></div>
      <div class="priority-actions">
        <button class="icon-button" data-act="priority-up" aria-label="Move ${esc(label(course.name))} up" ${index===0?'disabled':''}>${icon('upArrow',16)}</button>
        <button class="icon-button" data-act="priority-down" aria-label="Move ${esc(label(course.name))} down" ${index===total-1?'disabled':''}>${icon('downArrow',16)}</button>
        ${saveButton(course)}
      </div></article>`;
  }

  let priorityPool = [], draggedCourse = '';
  function movePriority(id, target) {
    const from = priorityPool.indexOf(id), to = priorityPool.indexOf(target);
    if (from < 0 || to < 0 || from === to) return;
    const order = [...marked];
    const slots = order.map((item, index) => priorityPool.includes(item) ? index : -1).filter(index => index >= 0);
    const reordered = [...priorityPool];
    reordered.splice(from, 1);
    reordered.splice(to, 0, id);
    slots.forEach((slot, index) => { order[slot] = reordered[index]; });
    marked = new Set(order);
    const saved = persist('saved', order);
    changeParams({p: Math.floor(to / pageSize) + 1}, 'replace');
    directory(route(), true);
    document.querySelector(`[data-priority-id="${id}"] button:not(:disabled)`)?.focus();
    flash(`Priority ${order.indexOf(id) + 1}${saved ? '' : ' for this session'}`);
  }
  document.addEventListener('dragstart', e => {
    if (!e.target.closest('.priority-number')) return;
    draggedCourse = e.target.closest('[data-priority-id]').dataset.priorityId;
    e.dataTransfer.setData('text/plain', draggedCourse);
    e.dataTransfer.effectAllowed = 'move';
  });
  document.addEventListener('dragover', e => {
    if (draggedCourse && e.target.closest('[data-priority-id]')) e.preventDefault();
  });
  document.addEventListener('drop', e => {
    const row = e.target.closest('[data-priority-id]');
    if (!draggedCourse || !row) return;
    e.preventDefault();
    movePriority(draggedCourse, row.dataset.priorityId);
    draggedCourse = '';
  });
  document.addEventListener('dragend', () => { draggedCourse = ''; });
  function directory(s,justResults=false){
    const saved=s.path==='saved',q=(s.params.get('q')||'').trim().toLowerCase(),col=s.params.get('collection'),sort=s.params.get('sort')||(saved?'priority':'reviews');
    const priority=saved&&sort==='priority',order=[...marked];
    const pool=courses.filter(c=>(!saved||marked.has(c.id))&&(!kinds.includes(col)||c.collection===col)&&q.split(/\s+/).every(t=>textIndex.get(c.id).includes(t)));
    if(priority)pool.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));else if(sort==='rating')pool.sort((a,b)=>+b.average-+a.average||b.reviewCount-a.reviewCount||byText.compare(a.name,b.name));else if(sort==='az')pool.sort((a,b)=>byText.compare(label(a.name),label(b.name))||a.firstReview-b.firstReview);else if(sort!=='source')pool.sort((a,b)=>b.reviewCount-a.reviewCount||+b.average-+a.average||a.firstReview-b.firstReview);
    const page=safePage(s.params.get('p'),pool.length/pageSize),visible=pool.slice((page-1)*pageSize,page*pageSize);
    priorityPool=priority?pool.map(c=>c.id):[];
    const rows=priority?visible.map((c,i)=>priorityRow(c,order.indexOf(c.id)+1,(page-1)*pageSize+i,pool.length)):visible.map(card);
    const body=`<div class="result-line"><div><h2>${q?'Search results':saved?'Saved courses':kinds.includes(col)?col+' courses':'All courses'}</h2><span class="pill-count">${pool.length}</span></div>${priority?'':viewButtons()}</div>${pool.length?`<div class="${priority?'priority-list':'course-grid'} ${viewMode==='list'?'list-mode':''}">${rows.join('')}</div>${pager(s,page,pool.length,pageSize,'courses')}`:empty(saved&&!marked.size?'bookmark':'search',saved&&!marked.size?'No saved courses yet':'No courses found',saved&&!marked.size?'Use the bookmark on a course to keep it here.':'Try another course name, instructor, or collection.',link(saved&&!marked.size?'directory':s.path),saved&&!marked.size?'Browse courses':'Clear filters')}`;
    if(justResults){document.querySelector('#results').innerHTML=body;document.querySelector('.directory-controls .tabs').outerHTML=tabs(s);return;}
    document.querySelector('#main').innerHTML=`${saved?heading('Your workspace','Saved courses','Put your first choice at the top. Drag a priority number or use the arrows to move a course.'):hero()}<section class="directory-controls"><div class="controls-top">${searchBox('course-search','Search courses or instructors…',s.params.get('q')||'','/')}${sortSelect(s)}</div>${tabs(s)}</section><section id="results" aria-label="Course results">${body}</section>`;
  }
  function distChart(reviews){const hist=Array(10).fill(0);reviews.forEach(r=>hist[r.rating-1]++);const max=Math.max(...hist,1);return `<div class="distribution"><p>Recommendation scores</p><div class="bars" role="img" aria-label="${esc(hist.map((n,i)=>`${i+1} out of 10: ${n} ${n===1?'response':'responses'}`).join('. '))}">${hist.map((n,i)=>`<div class="bar" title="${i+1}/10 · ${nlabel(n,'review')}"><i style="height:${n?Math.max(n*100/max,8):3}%;${n?'':'opacity:.32'}"></i><span>${i+1}</span></div>`).join('')}</div></div>`}
  function langSwitch(active){return `<div class="language-switch" aria-label="Review language">${[['en','English'],['original','Original']].map(([val,t])=>`<button data-act="lang" data-lang="${val}" class="${active===val?'selected':''}" aria-pressed="${active===val}">${t}</button>`).join('')}</div>`}
  function detailItem(review, lang) {
    const isOriginal = lang === 'original';
    const values = isOriginal ? review.original.map(original) : review.english;
    const identifier = String(review.id).padStart(3, '0');
    const courseReference = isOriginal ? tidy(values[0]) + ' · ' + tidy(values[1]) : '';
    const sourceHref = './files/FEC_Review_NEW.pdf#page=' + review.sourcePage;

    function field(label, value, symbol = '') {
      return `<div class="feedback-field">
        <dt>${symbol ? icon(symbol, 15) : ''}${label}</dt>
        <dd>${esc(value)}</dd>
      </div>`;
    }

    return `<article class="feedback-card${isOriginal ? ' feedback-original' : ''}" id="review-${review.id}" aria-labelledby="teacher-${review.id}">
      <header class="feedback-header">
        <div class="feedback-teacher"><span>Teacher</span><h3 id="teacher-${review.id}">${esc(values[3])}</h3></div>
        <div class="feedback-rating"><span>Recommendation</span><strong>${icon('star', 16)} ${review.rating}<small>/ 10</small></strong></div>
      </header>
      <dl class="feedback-primary">${field('Course review', values[6])}</dl>
      <dl class="feedback-details">
        ${field('About the teacher', values[4], 'message')}
        ${field('Study time', values[5], 'clock')}
      </dl>
      <footer class="feedback-footer">
        <div><span class="feedback-id">Review ${identifier}</span>${courseReference ? `<span class="feedback-reference">${esc(courseReference)}</span>` : ''}</div>
        <a href="${sourceHref}" target="_blank" rel="noopener">Source p. ${review.sourcePage} ${icon('external', 13)}</a>
      </footer>
    </article>`;
  }
  function teacherKey(review) {
    const name = tidy(review.english[3]).toLowerCase().replace(/[’']/g, "'")
      .replace(/^(?:mrs|mr|ms|dr|prof)(?:\.\s*|\s+)/i, '').replace(/\s+(?:sir|ma'am|maam)\.?$/, '').trim();
    return /^(?:|[-.]+|n[/.]?a|unknown|not (?:known|specified)|i (?:don't|do not) (?:remember|know)\.?)$/.test(name) ? 'unspecified' : name;
  }
  function teacherSelect(reviews, selected, lang) {
    const groups = new Map();
    for (const review of reviews) {
      const key = teacherKey(review);
      if (!groups.has(key)) groups.set(key, {name: key === 'unspecified' ? 'Unspecified' : tidy(review[lang === 'original' ? 'original' : 'english'][3]), count: 0});
      groups.get(key).count++;
    }
    const options = [...groups].sort((a,b) => byText.compare(a[1].name,b[1].name));
    return `<label class="teacher-filter">Teacher<select id="teacher-filter"><option value="">All teachers</option>
      ${options.map(([key,group]) => `<option value="${esc(key)}" ${key===selected?'selected':''}>${esc(group.name)} (${group.count})</option>`).join('')}</select></label>`;
  }
  function detail(s,only=false){
    const c=courseById.get(s.id);if(!c)return missing();const reviews=buckets.get(c.id),requested=s.params.get('lang'),lang=requested==='en'||requested==='original'?requested:language;
    const teacher=s.params.get('teacher')||'',group=teacher?reviews.filter(r=>teacherKey(r)===teacher):reviews;
    const query=(s.params.get('q')||'').trim().toLowerCase(),filtered=query?group.filter(r=>{const v=(r.english.join(' ')+' '+r.original.join(' ')).toLowerCase().replace(/\s+/g,' ');return query.split(/\s+/).every(k=>v.includes(k));}):group;
    const page=safePage(s.params.get('p'),filtered.length/reviewLimit),list=filtered.slice((page-1)*reviewLimit,page*reviewLimit);
    const content=filtered.length?list.map(r=>detailItem(r,lang)).join('')+pager(s,page,filtered.length,reviewLimit,'reviews'):empty('search','No matching reviews','Try another teacher or search term.',link('course/'+c.id,{lang}),'Clear filters');
    if(only){document.querySelector('#review-results').innerHTML=content;document.querySelector('#review-count').textContent=filtered.length;return;}
    document.querySelector('#main').innerHTML=`<a class="back-link" href="#/directory">${icon('back',16)} Home</a><section class="detail-top"><div class="detail-title"><div class="detail-context">${subject(c,24)}${courseTag(c)}</div><h1>${esc(label(c.name))}</h1></div>${saveButton(c,true)}</section><div class="detail-metrics"><div><p>Average recommendation</p><strong>${icon('star',23)}${c.average}<small>/ 10</small></strong></div><div><p>Student reviews</p><strong>${c.reviewCount}</strong></div>${distChart(reviews)}</div><section class="detail-reviews"><div class="review-toolbar"><div class="section-heading"><h2>Student reviews</h2><span id="review-count" class="pill-count">${filtered.length}</span></div>${langSwitch(lang)}</div><div class="review-search with-teacher">${teacherSelect(reviews,teacher,lang)}${searchBox('review-search','Search this course’s reviews…',s.params.get('q')||'')}</div><div id="review-results">${content}</div></section>`;
  }
  function statistics(s) {
    const collection = s.params.get('collection');
    const selectedCourses = kinds.includes(collection)
      ? courses.filter(course => course.collection === collection)
      : courses;
    const reviews = selectedCourses.flatMap(course => buckets.get(course.id));
    const ratings = reviews.map(review => review.rating)
      .filter(rating => Number.isInteger(rating) && rating >= 1 && rating <= 10);
    const average = ratings.length
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)
      : '—';
    const counts = Array(10).fill(0);
    for (const rating of ratings) counts[rating - 1]++;
    const max = Math.max(1, ...counts);
    const mostReviewed = selectedCourses.slice()
      .sort((a, b) => b.reviewCount - a.reviewCount || byText.compare(a.name, b.name))
      .slice(0, 5);

    document.querySelector('#main').innerHTML =
      heading('Review archive', 'Statistics', 'Explore review totals and recommendation scores across the elective collections.') +
      `${tabs(s)}
      <dl class="stats-summary">
        <div class="surface"><dt>Course entries</dt><dd>${selectedCourses.length}</dd></div>
        <div class="surface"><dt>Student reviews</dt><dd>${reviews.length}</dd></div>
        <div class="surface"><dt>Average recommendation</dt><dd>${average}${ratings.length ? '<small> / 10</small>' : ''}</dd></div>
      </dl>
      <div class="stats-layout">
        <section class="surface stats-panel">
          <h2>Recommendation scores</h2>
          <p>Number of reviews at each score out of 10. The average gives each scored review equal weight.</p>
          <ol class="stats-chart" aria-label="Review counts by recommendation score">
            ${counts.map((count, i) => `<li><span>${i + 1}</span><meter min="0" max="${max}" value="${count}" aria-label="Score ${i + 1} out of 10, ${nlabel(count, 'review')}"></meter><b>${count}</b></li>`).join('')}
          </ol>
        </section>
        <section class="surface stats-panel">
          <h2>Most reviewed courses</h2>
          <p>Open a course to read its student reviews.</p>
          <ol class="stats-courses">
            ${mostReviewed.map(course => `<li><a href="${slugCourse(course.id)}">${esc(label(course.name))}</a><span>${nlabel(course.reviewCount, 'review')}</span></li>`).join('')}
          </ol>
        </section>
      </div>`;
  }
  function rankings(s){const chosen=kinds.includes(s.params.get('collection'))?s.params.get('collection'):'FEC',rows=archive.rankings[chosen];const sourcePage={FEC:27,VAC:28,AEC:29}[chosen];
    document.querySelector('#main').innerHTML=heading('Review archive','Course rankings','The published order, average recommendation score, and response count for each collection.')+`<section class="surface rankings-surface"><div class="rank-toolbar">${tabs(s,['FEC','VAC','AEC'],false)}<a class="text-link" href="./files/FEC_Review_NEW.pdf#page=${sourcePage}" target="_blank" rel="noopener">Source p. ${sourcePage} ${icon('external',13)}</a></div><div class="table-scroll"><table><thead><tr><th scope="col">Rank</th><th scope="col">Course</th><th scope="col" class="number">Avg. score</th><th scope="col" class="number">Responses</th><th scope="col"><span class="sr">Save</span></th></tr></thead><tbody>${rows.map(r=>{const c=courseById.get(r.courseId);return `<tr><td><span class="rank-n ${r.rank<=3?'top-rank':''}">${String(r.rank).padStart(2,'0')}</span></td><td><a href="${slugCourse(c.id)}" class="rank-course"><b>${esc(r.name)}</b>${courseTag(c)}</a></td><td class="number"><span class="table-score">${icon('star',13)}${r.average}</span></td><td class="number">${r.responses}</td><td>${saveButton(c)}</td></tr>`}).join('')}</tbody></table></div></section>`;
  }
  function downloads(iconName,title,body,url,tag){return `<article class="file-row"><span class="file-icon">${icon(iconName,24)}</span><div><h3>${title}</h3><p>${body}</p><small>${tag}</small></div><a class="btn" href="${url}" aria-label="Download ${esc(title)}" download>${icon('down',16)}<span>Download</span></a></article>`}
  function sources(s){const col=kinds.includes(s.params.get('collection'))?s.params.get('collection'):'FEC',lang=s.params.get('lang')==='original'?'original':'en';const prompts=archive.survey[col][lang==='en'?'english':'original'];
    document.querySelector('#main').innerHTML=heading('Review archive','Source files','The original survey, its English translation, and the complete searchable dataset.')+`<section class="surface files">${downloads('file','English translation','Every review, with source-page references and the three ranking tables.','./'+archive.pdfs.english.file,archive.pdfs.english.pages+' pages · PDF')}${downloads('archive','Original review PDF','The exact file supplied, including the original wording, layout, and ranking pages.','./'+archive.pdfs.original.file,archive.pdfs.original.pages+' pages · PDF')}${downloads('code','Complete dataset','All seven survey fields in both languages, source pages, course numbers, scores, and rankings.','./assets/archive.json','361 reviews · JSON')}</section><section class="reading-notes"><h2>Reading the archive</h2><p><b>[…]</b> marks a response that ends mid-thought in the source. <b>□</b> reproduces a character that was already unreadable. The review numbers help you find the same response in the English PDF.</p><p>The source lists two AEC 5 entries with different capitalisation. Both are included separately. The rankings follow the order printed in the PDF.</p><p>Compiled by <a class="credit-link" href="https://fresources.tech/" target="_blank" rel="noopener">Fresources.tech</a>. <a class="text-link" href="${esc(archive.workbook)}" target="_blank" rel="noopener">Original Excel link ${icon('external',13)}</a></p></section><section class="surface prompts"><div class="review-toolbar"><h2>Survey questions</h2>${langSwitch(lang)}</div>${tabs(s,kinds,false)}<ol>${prompts.map(t=>`<li>${esc(tidy(original(t)))}</li>`).join('')}</ol></section>`;
  }
  function about() {
    const intro = heading('Course Atlas', 'About & Credits', 'An independent student project for exploring electives at Delhi Technological University.');
    document.querySelector('#main').innerHTML = intro + `
      <section class="credits-panel surface" aria-label="Project credits">
        <div class="credits-entry">
          <span class="credit-symbol">${icon('code', 21)}</span>
          <div><h2>Built by <a class="credit-link" href="https://mohayyad.dev/" target="_blank" rel="noopener">Mohayyad Muawia${icon('external', 14)}</a></h2>
          <p>I built Course Atlas to help fellow DTU students compare electives, read reviews in English or their original wording, and shortlist courses before registration.</p></div>
        </div>
        <div class="credits-entry">
          <span class="credit-symbol">${icon('book', 21)}</span>
          <div><h2>Survey compiled by <a class="credit-link" href="https://fresources.tech/" target="_blank" rel="noopener">Fresources.tech${icon('external', 14)}</a></h2>
          <p>DTU students contributed the reviews. Fresources.tech compiled their responses and the course rankings in the original survey workbook.</p>
          <a class="text-link" href="${esc(archive.workbook)}" target="_blank" rel="noopener">View original workbook ${icon('external', 13)}</a></div>
        </div>
      </section>`;
  }

  function missing(){document.querySelector('#main').innerHTML=empty('compass','Page not found','Return to the directory to choose a course.','#/directory','Home');}
  function render(){if(!archive)return;const s=route();document.body.classList.remove('menu-open');if(document.querySelector('#nav-dialog')?.open)document.querySelector('#nav-dialog').close();
    const title={directory:'Home',saved:'Saved courses',rankings:'Rankings',statistics:'Statistics',sources:'Source files',about:'About & Credits',course:courseById.has(s.id)?label(courseById.get(s.id).name):'Course'}[s.path]||'Page not found';chrome(s,title);
    if(s.path==='directory'||s.path==='saved')directory(s);else if(s.path==='rankings')rankings(s);else if(s.path==='statistics')statistics(s);else if(s.path==='course')detail(s);else if(s.path==='sources')sources(s);else if(s.path==='about')about();else missing();
    const now=s.path+'/'+s.id;const pageChange=now!==lastRoute;lastRoute=now;
    if(pageChange)window.scrollTo({top:0,behavior:'instant'});
  }
  document.addEventListener('input',e=>{const id=e.target.id;if(id!=='course-search'&&id!=='review-search')return;changeParams({q:e.target.value,p:1},'replace');id==='course-search'?directory(route(),true):detail(route(),true);});
  document.addEventListener('change',e=>{if(e.target.id==='teacher-filter'){changeParams({teacher:e.target.value,p:1},'replace');detail(route(),true);}if(e.target.id==='sort-courses')changeParams({sort:e.target.value,p:1});});
  document.addEventListener('click',e=>{const t=e.target.closest('[data-act]'),pg=e.target.closest('[data-pager]');if(pg){const id=route().path==='course'?'.detail-reviews':'.directory-controls';requestAnimationFrame(()=>document.querySelector(id)?.scrollIntoView({block:'start'}));}
    if(!t){const dialog=document.querySelector('#nav-dialog');if(dialog.open&&(e.target===dialog||e.target.closest('#mobile-side a')))dialog.close();return;}
    const act=t.dataset.act;
    if(act==='priority-up'||act==='priority-down'){
      const id=t.closest('[data-priority-id]').dataset.priorityId;
      movePriority(id,priorityPool[priorityPool.indexOf(id)+(act==='priority-up'?-1:1)]);
      return;
    }
    if(act==='save'){const c=courseById.get(t.dataset.id);if(!c)return;const old=marked.has(c.id);if(old)marked.delete(c.id);else marked.add(c.id);const durable=persist('saved',[...marked]);const s=route();document.querySelector('#desktop-side').innerHTML=sidebar(s);document.querySelector('#mobile-side').innerHTML=sidebar(s);if(s.path==='saved')directory(s,true);else{const big=t.classList.contains('save-big');const template=document.createElement('template');template.innerHTML=saveButton(c,big);const b=template.content.firstElementChild;t.replaceWith(b);if(e.detail===0)b.focus();}flash((old?'Removed from saved courses':'Course saved')+(durable?'':' for this session'));return;}
    if(act==='view'){viewMode=t.dataset.view;persist('view',viewMode);directory(route(),true);if(e.detail===0)document.querySelector('[data-view="'+viewMode+'"]')?.focus();return;}
    if(act==='lang'){const s=route();language=t.dataset.lang;persist('language',language);changeParams({lang:language},'replace');s.path==='sources'?sources(route()):detail(route());if(e.detail===0)document.querySelector('[data-lang="'+language+'"]')?.focus();return;}
    if(act==='theme'){const dark=!isDark();document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem(key+'theme',dark?'dark':'light')}catch{}t.innerHTML=icon(dark?'sun':'moon',17);t.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');return;}
    const dlg=document.querySelector('#nav-dialog');if(act==='menu'){dlg.showModal();document.body.classList.add('menu-open');}else if(act==='close-menu')dlg.close();
  });
  window.addEventListener('hashchange',render);
  document.addEventListener('keydown',e=>{if(e.defaultPrevented||e.altKey)return;const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'');if((e.key==='/'&&!typing)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){e.preventDefault();let b=document.querySelector('#course-search,#review-search');if(b){b.focus();b.select();}else{location.hash='#/directory';setTimeout(()=>document.querySelector('#course-search')?.focus(),30);}}});
  async function start(){try{
      const resp=await fetch('./assets/archive.json');if(!resp.ok)throw new Error('archive');archive=await resp.json();courses=archive.courses;courseById=new Map(courses.map(c=>[c.id,c]));buckets=new Map(courses.map(c=>[c.id,[]]));archive.reviews.forEach(r=>buckets.get(r.courseId).push(r));const cache=read('saved',[]);marked=new Set((Array.isArray(cache)?cache:[]).filter(i=>courseById.has(i)));
      textIndex=new Map(courses.map(c=>{const names=buckets.get(c.id).map(r=>tidy(r.english[3])+' '+tidy(r.original[3])).join(' ');return [c.id,`${c.name} ${c.name.toLowerCase()==='evs'?'Environmental Sciences':''} ${c.id} ${c.collection} ${c.number} ${c.number.padStart(2,'0')} ${names}`.toLowerCase()]}));
      rootShell();render();document.querySelector('#nav-dialog').addEventListener('close',()=>document.body.classList.remove('menu-open'));
      window.addEventListener('storage',e=>{if(e.key===key+'saved'){const ids=read('saved',[]);marked=new Set((Array.isArray(ids)?ids:[]).filter(i=>courseById.has(i)));render();}});
    }catch(error){shell.innerHTML='<main class="error-page"><h1>Course Atlas</h1><p>The directory couldn’t load. Refresh to try again, or open either PDF.</p><a class="btn" href="./files/FEC_Review_English.pdf">English translation</a> <a class="btn" href="./files/FEC_Review_NEW.pdf">Original PDF</a></main>';}}
  start();

