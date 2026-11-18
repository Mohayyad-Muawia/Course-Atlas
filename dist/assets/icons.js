const shapes = {
  home:'<path d="m3 10 9-7.5 9 7.5M5 9v11h5v-7h4v7h5V9"/>',
  trophy:'<path d="M7 3h10v5a5 5 0 0 1-10 0zM7 5H3v2a4 4 0 0 0 5 4m9-6h4v2a4 4 0 0 1-5 4M12 13v5m-5 3h10l-2-3H9z"/>',
  bars:'<path d="M3 3v17h18M7 16v-5m5 5V6m5 10V9"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
  upArrow:'<path d="M12 19V5m-6 6 6-6 6 6"/>',
  downArrow:'<path d="M12 5v14m-6-6 6 6 6-6"/>',
  fitness:'<path d="m6 6 12 12M3 8l5-5m8 18 5-5M2 5l3-3m14 20 3-3"/>',
  flower:'<path d="M12 20c-4-3-6-8 0-16 6 8 4 13 0 16ZM12 20C5 20 2 15 2 9c3 0 6 2 7 4m3 7c7 0 10-5 10-11-3 0-6 2-7 4"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12"/><path d="M3 6h1M3 12h1M3 18h1"/>',
  rank:'<path d="M3 20h18M5 20v-7h4v7m1 0V5h4v15m1 0V9h4v11"/>',
  bookmark:'<path d="M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4-6 4z"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  layers:'<path d="m3 8 9-5 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  book:'<path d="M3 4c3-1 6 0 9 2 3-2 6-3 9-2v14c-3-1-6 0-9 2-3-2-6-3-9-2zM12 6v14"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  chevron:'<path d="m7 10 5 5 5-5"/>', right:'<path d="m9 6 6 6-6 6"/>',left:'<path d="m15 6-6 6 6 6"/>',
  external:'<path d="M14 4h6v6m0-6-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  down:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
  file:'<path d="M5 3h9l5 5v13H5zM14 3v6h5M8 13h8M8 16h5"/>',
  message:'<path d="M20 5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4v3l5-3h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
  sliders:'<path d="M3 7h7m4 0h7M3 17h11m4 0h3"/><circle cx="12" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  sort:'<path d="M4 6h15M4 11h11M4 16h6m6 0 3 3 3-3m-3 3v-9"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon:'<path d="M20.7 14.5A9 9 0 0 1 9.5 3.3a9 9 0 1 0 11.2 11.2z"/>',
  leaf:'<path d="M20 3c.2 6.2-.8 11.8-5.6 14.2a6.1 6.1 0 0 1-8.5-6.5C6.5 5.8 13.7 7.4 20 3zM4 21c1.6-4.8 4.7-8.4 10.3-11.5"/>',
  mic:'<rect x="9" y="2.5" width="6" height="12.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7"/>',
  brain:'<path d="M12 5c-2.3-4-6.4-1-5.8 1.7C3.1 7.2 3 11.6 5 12.7c-1.3 2.4.1 5.1 2.8 5.2.4 3.3 4.2 3.4 4.2.5V5zm0 0c2.3-4 6.4-1 5.8 1.7 3.1.5 3.2 4.9 1.2 6-1.7 1.1-3 .9-3 .9m3-.9c1.3 2.4-.1 5.1-2.8 5.2-.4 3.3-4.2 3.4-4.2.5M6.3 6.8c.3 1 1.2 1.6 2.3 1.8M5 12.7c1 .8 2.4.9 3.7.1"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c-4.6 5-4.6 13 0 18 4.6-5 4.6-13 0-18z"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m1 3a4.5 4.5 0 0 1 4 4.5v1"/>',
  shield:'<path d="M12 3c2.6 1.7 5.5 2.6 8 3.1v5.6c0 4.3-3.8 7.8-8 10-4.2-2.2-8-5.7-8-10V6.1C6.5 5.6 9.4 4.7 12 3z"/><path d="m8.4 12.2 2.2 2.3 4.9-5"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5z"/>',
  heart:'<path d="M20 5.7c-2.8-3.1-6.2-1.2-8 1-1.8-2.2-5.2-4.1-8-1-4 4.4.5 8.6 8 14.3 7.5-5.7 12-9.9 8-14.3z"/>',
  puzzle:'<path d="M4 5h6c0-1.8 1-3 2.5-3S15 3.2 15 5h4v5c1.8 0 3 1 3 2.5S20.8 15 19 15v4h-5c0-1.8-1-3-2.5-3S9 17.2 9 19H4z"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12c4 3 14 3 18 0M10 13h4"/>',
  activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  music:'<path d="M9 17V6l11-2v11M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
  pen:'<path d="m4 15 11-11a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L9 20l-6 1zM13 6l5 5"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14c2 3 6 3 8 0M8.5 9h.2m6.6 0h.2"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
  language:'<path d="M2 5h12M8 3v2m3 0c-2 5-5 8-8 10m2-8c2 3 4 5 7 7m2 6 4-11 4 11m-6-5h4"/>',
  chart:'<path d="M3 3v17h18M7 15l4-5 3 2 5-6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  archive:'<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v12h14V8M10 12h4"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
  check:'<path d="m4 13 5 5L20 6"/>', code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
  building:'<path d="m3 8 9-5 9 5M4 9h16M5 20h14M7 11v6m5-6v6m5-6v6M3 21h18"/>',
  panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>'
};
export function icon(name,size=18,cls=''){return '<svg class="ico '+cls+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[name]||shapes.book)+'</svg>'}
export function courseArt(name){
  const n=name.toLowerCase();
  if(n==='evs')return ['leaf','sage']; if(n.includes('environmental'))return ['globe','aqua'];
  if(n.includes('public speaking')||n.includes('spoken'))return ['mic','lilac'];
  if(n.includes('emotional'))return ['brain','rose']; if(n.includes('logical'))return ['puzzle','sky'];
  if(n.includes('ethic'))return ['shield','sand']; if(n.includes('leadership'))return ['compass','apricot'];
  if(n.includes('happiness'))return ['smile','sand']; if(n.includes('soft skills'))return ['people','sage'];
  if(n.includes('sport')||n.includes('physical'))return ['fitness','apricot'];
  if(n.includes('yoga'))return ['flower','sage'];
  if(n.includes('communication'))return ['message','sky'];
  if(n.includes('financial'))return ['chart','sky'];
  if(n.includes('entrepreneur')||n.includes('corporate'))return ['briefcase','sky'];
  if(n.includes('hindi')||n.includes('japanese')||n.includes('german'))return ['language','aqua'];
  if(n.includes('outreach')||n.includes('human values'))return ['people','rose'];
  if(n.includes('biological'))return ['leaf','sage']; if(n.includes('sketch')||n.includes('design'))return ['pen','sand'];
  if(n.includes('music'))return ['music','lilac']; if(n==='ncc')return ['shield','aqua'];
  if(n.includes('engineer'))return ['chip','sky'];return ['book','lilac'];
}
