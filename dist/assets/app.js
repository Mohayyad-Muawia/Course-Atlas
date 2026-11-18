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
  const pageSize=9,reviewLimit=8;
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
    <div class="nav-block"><div class="nav-label">Workspace</div>
      ${nav('directory','grid','Course directory')}${nav('rankings','rank','Rankings')}${nav('saved','bookmark','Saved courses',marked.size)}
    </div><div class="nav-block"><div class="nav-label">Collections</div>${kinds.map(c=>`<a class="nav-item collection-nav ${s.path==='directory'&&s.params.get('collection')===c?'current':''}" href="${link('directory',{collection:c})}"><i class="collection-dot ${c.toLowerCase()}"></i><span>${c}</span><small>${courses.filter(k=>k.collection===c).length}</small></a>`).join('')}</div>
    <div class="side-bottom">${nav('about','people','About &amp; Credits')}<a class="nav-item ${active==='sources'?'current':''}" href="#/sources">${icon('folder',18)}<span>Source files</span></a><div class="campus"><span class="campus-icon">${icon('building',18)}</span><div><b>DTU electives</b><small>Fresources.tech archive</small></div></div></div>`;
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
  function hero(){return `<section class="hero"><div class="hero-art" aria-hidden="true"></div><div class="hero-inner"><div class="eyebrow"><span class="accent-line"></span>DTU elective archive</div><h1>Course directory</h1><p>Find out what students say about the teaching, workload, and exams for each elective.</p><div class="hero-stats"><span>${icon('layers',15)}<b>${courses.length}</b> course entries</span><i></i><span>${icon('message',15)}<b>${archive.reviews.length}</b> student reviews</span></div></div></section>`}
  function heading(eye,title,desc){return `<div class="page-intro"><div class="eyebrow"><span class="accent-line"></span>${esc(eye)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>`}
  function tabs(s,allowed=kinds,all=true){const opts=all?['all',...allowed]:allowed;const d=s.params.get('collection');const chosen=allowed.includes(d)?d:(all?'all':allowed[0]);return `<div class="tabs" aria-label="Filter by collection">${opts.map(cat=>{const u=link(s.path,{...Object.fromEntries(s.params),collection:cat,p:1});return `<a href="${u}" class="tab ${cat===chosen?'active':''}"${cat===chosen?' aria-current="true"':''}>${cat==='all'?'All courses':cat}</a>`}).join('')}</div>`}
  function card(c){return `<article class="course-card">${subject(c)}${saveButton(c)}<div class="card-name">${courseTag(c)}<h3><a href="${slugCourse(c.id)}">${esc(label(c.name))}</a></h3></div><div class="card-foot"><span class="score">${icon('star',15)}<strong>${c.average}</strong><small>/ 10</small></span><span class="count">${icon('message',14)}${nlabel(c.reviewCount,'review')}</span></div></article>`}
  function searchBox(id,placeholder,value,keyHint=''){return `<div class="searchbox">${icon('search',17)}<input id="${id}" type="search" autocomplete="off" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}">${keyHint?'<kbd aria-hidden="true">/</kbd>':''}</div>`}
  function sortSelect(s){const o=s.params.get('sort')||'reviews';return `<label class="sort-control">${icon('sort',16)}<select aria-label="Sort courses" id="sort-courses">${[['reviews','Most reviewed'],['rating','Highest rated'],['az','Name A–Z'],['source','Source order']].map(([v,t])=>`<option value="${v}" ${o===v?'selected':''}>${t}</option>`).join('')}</select>${icon('chevron',13)}</label>`}
  function viewButtons(){return `<div class="view-controls" aria-label="Choose course layout">${['grid','list'].map(v=>`<button data-act="view" data-view="${v}" aria-label="${v==='grid'?'Grid':'List'} view" aria-pressed="${v===viewMode}" title="${v==='grid'?'Grid':'List'} view" class="${v===viewMode?'chosen':''}">${icon(v,16)}</button>`).join('')}</div>`}
  function empty(ic,title,body,act,txt){return `<div class="empty"><span class="empty-icon">${icon(ic,24)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p>${act?`<a class="btn" href="${act}">${esc(txt)} ${icon('arrow',14)}</a>`:''}</div>`}
  function pager(s,page,total,limit,word){if(!total)return '';const count=Math.ceil(total/limit),start=(page-1)*limit+1,end=Math.min(page*limit,total);const items=[];for(let i=1;i<=count;i++){if(i===1||i===count||Math.abs(i-page)<=1)items.push(i);else if(items.at(-1)!=='…')items.push('…')}
    function pl(p,content,aria){return `<a class="page-number${p===page?' selected':''}" aria-label="${aria}" ${p===page?'aria-current="page"':''} href="${link(s.path+(s.id?'/'+s.id:''),{...Object.fromEntries(s.params),p})}" data-pager>${content}</a>`}
    return `<div class="pagination"><span>Showing <b>${start}–${end}</b> of <b>${total}</b> ${total===1?word.slice(0,-1):word}</span>${count>1?`<nav aria-label="Pagination">${page>1?pl(page-1,icon('left',15),'Previous page'):`<span class="page-number off">${icon('left',15)}</span>`}${items.map(n=>n==='…'?'<span class="page-ellipsis">…</span>':pl(n,n,'Page '+n)).join('')}${page<count?pl(page+1,icon('right',15),'Next page'):`<span class="page-number off">${icon('right',15)}</span>`}</nav>`:''}</div>`;}
  function directory(s,justResults=false){
    const saved=s.path==='saved',q=(s.params.get('q')||'').trim().toLowerCase(),col=s.params.get('collection'),sort=s.params.get('sort')||'reviews';
    const pool=courses.filter(c=>(!saved||marked.has(c.id))&&(!kinds.includes(col)||c.collection===col)&&q.split(/\s+/).every(t=>textIndex.get(c.id).includes(t)));
    if(sort==='rating')pool.sort((a,b)=>+b.average-+a.average||b.reviewCount-a.reviewCount||byText.compare(a.name,b.name));else if(sort==='az')pool.sort((a,b)=>byText.compare(label(a.name),label(b.name))||a.firstReview-b.firstReview);else if(sort!=='source')pool.sort((a,b)=>b.reviewCount-a.reviewCount||+b.average-+a.average||a.firstReview-b.firstReview);
    const page=safePage(s.params.get('p'),pool.length/pageSize),visible=pool.slice((page-1)*pageSize,page*pageSize);
    const body=`<div class="result-line"><div><h2>${q?'Search results':saved?'Saved courses':kinds.includes(col)?col+' courses':'All courses'}</h2><span class="pill-count">${pool.length}</span></div>${viewButtons()}</div>${pool.length?`<div class="course-grid ${viewMode==='list'?'list-mode':''}">${visible.map(card).join('')}</div>${pager(s,page,pool.length,pageSize,'courses')}`:empty(saved&&!marked.size?'bookmark':'search',saved&&!marked.size?'No saved courses yet':'No courses found',saved&&!marked.size?'Use the bookmark on a course to keep it here.':'Try another course name, instructor, or collection.',link(saved&&!marked.size?'directory':s.path),saved&&!marked.size?'Browse courses':'Clear filters')}`;
    if(justResults){document.querySelector('#results').innerHTML=body;document.querySelector('.directory-controls .tabs').outerHTML=tabs(s);return;}
    document.querySelector('#main').innerHTML=`${saved?heading('Your workspace','Saved courses','Courses bookmarked on this device.'):hero()}<section class="directory-controls"><div class="controls-top">${searchBox('course-search','Search courses or instructors…',s.params.get('q')||'','/')}${sortSelect(s)}</div>${tabs(s)}</section><section id="results" aria-label="Course results">${body}</section>`;
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
  function detail(s,only=false){
    const c=courseById.get(s.id);if(!c)return missing();const reviews=buckets.get(c.id),requested=s.params.get('lang'),lang=requested==='en'||requested==='original'?requested:language;
    const query=(s.params.get('q')||'').trim().toLowerCase(),filtered=query?reviews.filter(r=>{const v=(r.english.join(' ')+' '+r.original.join(' ')).toLowerCase().replace(/\s+/g,' ');return query.split(/\s+/).every(k=>v.includes(k));}):reviews;
    const page=safePage(s.params.get('p'),filtered.length/reviewLimit),list=filtered.slice((page-1)*reviewLimit,page*reviewLimit);
    const content=filtered.length?list.map(r=>detailItem(r,lang)).join('')+pager(s,page,filtered.length,reviewLimit,'reviews'):empty('search','No matching reviews','Try another word or clear this search.',link('course/'+c.id,{lang}),'Clear search');
    if(only){document.querySelector('#review-results').innerHTML=content;document.querySelector('#review-count').textContent=filtered.length;return;}
    document.querySelector('#main').innerHTML=`<a class="back-link" href="#/directory">${icon('back',16)} Course directory</a><section class="detail-top"><div class="detail-title"><div class="detail-context">${subject(c,24)}${courseTag(c)}</div><h1>${esc(label(c.name))}</h1></div>${saveButton(c,true)}</section><div class="detail-metrics"><div><p>Average recommendation</p><strong>${icon('star',23)}${c.average}<small>/ 10</small></strong></div><div><p>Student reviews</p><strong>${c.reviewCount}</strong></div>${distChart(reviews)}</div><section class="detail-reviews"><div class="review-toolbar"><div class="section-heading"><h2>Student reviews</h2><span id="review-count" class="pill-count">${filtered.length}</span></div>${langSwitch(lang)}</div><div class="review-search">${searchBox('review-search','Search this course’s reviews…',s.params.get('q')||'')}</div><div id="review-results">${content}</div></section>`;
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

  function missing(){document.querySelector('#main').innerHTML=empty('compass','Page not found','Return to the directory to choose a course.','#/directory','Course directory');}
  function render(){if(!archive)return;const s=route();document.body.classList.remove('menu-open');if(document.querySelector('#nav-dialog')?.open)document.querySelector('#nav-dialog').close();
    const title={directory:'Course directory',saved:'Saved courses',rankings:'Rankings',sources:'Source files',about:'About & Credits',course:courseById.has(s.id)?label(courseById.get(s.id).name):'Course'}[s.path]||'Page not found';chrome(s,title);
    if(s.path==='directory'||s.path==='saved')directory(s);else if(s.path==='rankings')rankings(s);else if(s.path==='course')detail(s);else if(s.path==='sources')sources(s);else if(s.path==='about')about();else missing();
    const now=s.path+'/'+s.id;const pageChange=now!==lastRoute;lastRoute=now;
    if(pageChange)window.scrollTo({top:0,behavior:'instant'});
  }
  document.addEventListener('input',e=>{const id=e.target.id;if(id!=='course-search'&&id!=='review-search')return;changeParams({q:e.target.value,p:1},'replace');id==='course-search'?directory(route(),true):detail(route(),true);});
  document.addEventListener('change',e=>{if(e.target.id==='sort-courses')changeParams({sort:e.target.value,p:1});});
  document.addEventListener('click',e=>{const t=e.target.closest('[data-act]'),pg=e.target.closest('[data-pager]');if(pg){const id=route().path==='course'?'.detail-reviews':'.directory-controls';requestAnimationFrame(()=>document.querySelector(id)?.scrollIntoView({block:'start'}));}
    if(!t){const dialog=document.querySelector('#nav-dialog');if(dialog.open&&(e.target===dialog||e.target.closest('#mobile-side a')))dialog.close();return;}
    const act=t.dataset.act;
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

