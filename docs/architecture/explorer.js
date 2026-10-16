/* Self-contained architecture explorer. Works over file:// and HTTP. */
(() => {
  'use strict';
  const {roles,components,views,technologyMarks} = window.MEDIA_ARCHITECTURE;
  const $ = id => document.getElementById(id);
  const icons = {
    browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01m3 0h.01"/>',
    gateway:'<path d="M4 5h7v14H4m9-10 4 3-4 3m4-3H8m12-8v16"/>',
    branch:'<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>',
    wave:'<path d="M3 12h2l2-7 4 14 3-12 3 10 2-5h2"/>',
    chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
    database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    cloud:'<path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11H6"/>',
    layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
    orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="6" transform="rotate(-35 12 12)"/><path d="M6 3a11 11 0 0 0 12 18"/>',
    route:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h6"/>',
    shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
    moon:'<path d="M20 14A9 9 0 0 1 10 4a9 9 0 1 0 10 10Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',
    shrink:'<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5"/>'
  };
  const svgIcon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.layers}</svg>`;
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const state = {view:views.find(v=>v.id===location.hash.slice(1)) || views[0],selected:null,trace:false,query:'',step:-1,light:true,box:null};
  let drag = null,toastTimer;
  const palette = light => light ? {bg:'#eef3fb',group:'#f8faff',line:'#cfdaeb',text:'#243b5b',muted:'#526985',edge:'#657d9b',grid:'#a9bcd6'} : {bg:'#101e32',group:'#14243a',line:'#34475f',text:'#edf3ff',muted:'#afc2dc',edge:'#7289a8',grid:'#7289a8'};
  const wrap = (text,max) => {
    const lines=[''];
    for(const word of text.split(/\s+/)) {
      if(lines[lines.length-1] && (lines[lines.length-1]+' '+word).length>max) lines.push(word);
      else lines[lines.length-1]+=(lines[lines.length-1]?' ':'')+word;
    }
    return lines;
  };
  function lines(text,x,y,max,size,color,weight=400,lineHeight=size*1.35) {
    return wrap(text,max).map((s,i)=>`<text x="${x}" y="${y+i*lineHeight}" fill="${color}" font-size="${size}" font-weight="${weight}">${esc(s)}</text>`).join('');
  }
  function technologyMark(name,x,y,size,color) {
    return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" aria-hidden="true"><path d="${technologyMarks[name]}"/></svg>`;
  }
  function componentSymbol(c,w,light) {
    const r=roles[c.role],color=light?r.ink:r.color,fill=light?r.light:r.fill,cx=w/2;
    const logoColor=name=>light?({postgresql:'#41658b',sqlite:'#116c9e',flask:'#202d3e',python:'#3475a7',ffmpeg:'#19834c',html5:'#d94e27'}[name]||color):color;
    const ink=`fill="${fill}" stroke="${color}" stroke-width="1.7" stroke-linejoin="round"`;
    const glyph=(name,size=46)=>`<svg x="${cx-size/2}" y="5" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
    switch(c.shape) {
      case 'database':return `<path d="M${cx-40} 13V46C${cx-40} 62 ${cx+40} 62 ${cx+40} 46V13" ${ink}/><ellipse cx="${cx}" cy="13" rx="40" ry="10" ${ink}/><path d="M${cx-40} 31C${cx-40} 46 ${cx+40} 46 ${cx+40} 31" fill="none" stroke="${color}" stroke-opacity=".45"/>${technologyMark(c.brand,cx-12,25,25,logoColor(c.brand))}`;
      case 'browser':return `<rect x="${cx-48}" y="2" width="96" height="55" rx="5" ${ink}/><path d="M${cx-48} 15H${cx+48}" stroke="${color}" stroke-width="1.3"/><circle cx="${cx-39}" cy="9" r="1.6" fill="${color}"/><circle cx="${cx-33}" cy="9" r="1.6" fill="${color}"/><circle cx="${cx-27}" cy="9" r="1.6" fill="${color}"/>${technologyMark('html5',cx-13,23,26,color)}`;
      case 'folder':return `<path d="M${cx-43} 15V7H${cx-13}L${cx-5} 15H${cx+42}V55H${cx-43}Z" ${ink}/><path d="M${cx-43} 22H${cx+42}L${cx+35} 56H${cx-43}Z" ${ink}/><path d="M${cx-14} 31H${cx+13}m-27 8h21m-21 8h14" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
      case 'cloud':return `<path d="M${cx-36} 54C${cx-66} 54 ${cx-61} 21 ${cx-36} 22C${cx-33}-3 ${cx+9}-5 ${cx+17} 19C${cx+52} 12 ${cx+66} 54 ${cx+34} 54Z" ${ink}/><path d="M${cx-8} 43V25m-7 7 7-7 7 7m-7 11h20" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
      case 'flask':return technologyMark('flask',cx-29,0,58,logoColor('flask'));
      case 'python':return technologyMark('python',cx-25,3,50,logoColor('python'));
      case 'ffmpeg':return technologyMark('ffmpeg',cx-27,2,54,logoColor('ffmpeg'));
      case 'chip':return `<rect x="${cx-23}" y="6" width="46" height="46" rx="6" ${ink}/><rect x="${cx-12}" y="17" width="24" height="24" rx="3" fill="none" stroke="${color}" stroke-width="1.5"/>${[-12,0,12].map(a=>`<path d="M${cx+a} 0v6m0 46v6M${cx-29} ${29+a}h6m46 0h6" stroke="${color}" stroke-width="2"/>`).join('')}`;
      case 'document':return `<path d="M${cx-22} 0H${cx+10}L${cx+24} 14V58H${cx-22}Z" ${ink}/><path d="M${cx+10} 0v15h14" fill="none" stroke="${color}" stroke-width="1.5"/><text x="${cx}" y="38" text-anchor="middle" fill="${color}" font-size="12" font-family="Consolas,monospace" font-weight="600">${c.title.includes('CSV')?'CSV':'.env'}</text>`;
      case 'media':return `<rect x="${cx-44}" y="5" width="33" height="43" rx="4" ${ink}/><path d="m${cx-36} 28 6-6 9 12m-22-20h3m-3 25h3" fill="none" stroke="${color}" stroke-width="1.5"/><rect x="${cx-8}" y="15" width="50" height="38" rx="4" ${ink}/><path d="m${cx+12} 25 12 9-12 9Z" fill="${color}"/><path d="M${cx-32} 56h70" stroke="${color}" stroke-width="1.5"/>`;
      case 'ladder':return `<path d="M${cx-36} 57h72" stroke="${color}" stroke-width="1.8"/><rect x="${cx-30}" y="36" width="14" height="17" rx="2" fill="${color}" opacity=".5"/><rect x="${cx-7}" y="21" width="14" height="32" rx="2" fill="${color}" opacity=".75"/><rect x="${cx+16}" y="5" width="14" height="48" rx="2" fill="${color}"/>`;
      case 'check':return `<circle cx="${cx}" cy="29" r="27" ${ink}/><path d="m${cx-13} 29 9 9 18-20" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'inspect':return `<circle cx="${cx-5}" cy="23" r="21" ${ink}/><path d="m${cx+11} 40 18 16M${cx-15} 23h20m-10-10v20" fill="none" stroke="${color}" stroke-width="2.7" stroke-linecap="round"/>`;
      case 'retry':return `<path d="M${cx-21} 16a26 26 0 1 1-3 27m3-27-1 17m1-17 17 1" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'specialists':return `<path d="M${cx} 25V8m0 17-27 20m27-20 27 20" fill="none" stroke="${color}" stroke-width="2"/><circle cx="${cx}" cy="27" r="11" ${ink}/><circle cx="${cx}" cy="5" r="6" ${ink}/><circle cx="${cx-28}" cy="48" r="7" ${ink}/><circle cx="${cx+28}" cy="48" r="7" ${ink}/>`;
      case 'routes':return glyph('gateway',54);
      default:return glyph('branch',52);
    }
  }
  function componentIcon(c) {
    const brand=c.brand||({flask:'flask',python:'python',ffmpeg:'ffmpeg',browser:'html5'}[c.shape]);
    return brand?`<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="${technologyMarks[brand]}"/></svg>`:svgIcon(roles[c.role].icon);
  }
  function symbolPort(node,point) {
    const cx=node.x+node.w/2;
    if(Math.abs(point[0]-node.x)<2)return [cx-57,node.y+30];
    if(Math.abs(point[0]-node.x-node.w)<2)return [cx+57,node.y+30];
    if(Math.abs(point[1]-node.y)<2)return [cx,node.y-7];
    if(Math.abs(point[1]-node.y-node.h)<2)return [cx,node.y+node.h+4];
    return point;
  }
  function edgePoints(edge,nodes) {
    if(edge.points) {
      const points=edge.points.map(p=>[...p]),first=symbolPort(nodes.get(edge.from),points[0]),last=symbolPort(nodes.get(edge.to),points[points.length-1]);
      if(points.length>2){
        if(points[0][1]===points[1][1])points[1][1]=first[1];
        if(points[points.length-1][1]===points[points.length-2][1])points[points.length-2][1]=last[1];
      }
      points[0]=first;points[points.length-1]=last;return points;
    }
    const a=nodes.get(edge.from),b=nodes.get(edge.to);
    const ac=[a.x+a.w/2,a.y+a.h/2],bc=[b.x+b.w/2,b.y+b.h/2];
    if(Math.abs(ac[0]-bc[0])>Math.abs(ac[1]-bc[1])) return ac[0]<bc[0] ? [[ac[0]+57,a.y+30],[bc[0]-57,b.y+30]] : [[ac[0]-57,a.y+30],[bc[0]+57,b.y+30]];
    return ac[1]<bc[1] ? [[ac[0],a.y+a.h+4],[bc[0],b.y-7]] : [[ac[0],a.y-7],[bc[0],b.y+b.h+4]];
  }
  function roundedPath(points,radius=12) {
    if(points.length<3) return 'M'+points.map(p=>p.join(',')).join(' L');
    let d=`M${points[0].join(',')}`;
    for(let i=1;i<points.length-1;i++) {
      const a=points[i-1],b=points[i],c=points[i+1];
      const l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]);
      const r=Math.min(radius,l1/2,l2/2);
      const p=[b[0]-(b[0]-a[0])/l1*r,b[1]-(b[1]-a[1])/l1*r];
      const q=[b[0]+(c[0]-b[0])/l2*r,b[1]+(c[1]-b[1])/l2*r];
      d+=` L${p.join(',')} Q${b.join(',')} ${q.join(',')}`;
    }
    return d+` L${points[points.length-1].join(',')}`;
  }
  function renderSvg(view,light=false,standalone=false) {
    const p=palette(light),nodes=new Map(view.nodes.map(n=>[n.id,n]));
    const header=standalone?126:0,height=view.height+header+(standalone?76:0);
    let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${view.width}" height="${height}" viewBox="0 0 ${view.width} ${height}" role="${standalone?'img':'group'}" aria-labelledby="svg-title svg-description"><title id="svg-title">Media Studio — ${esc(view.title)}</title><desc id="svg-description">${esc(view.summary)} Select components in the interactive explorer for implementation details.</desc><defs><pattern id="canvas-dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="${p.grid}" opacity=".14"/></pattern>`;
    for(const [key,r] of Object.entries(roles)) s+=`<marker id="arrow-${key}" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L7 4L1 7" fill="none" stroke="${light?r.ink:r.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>`;
    s+=`</defs><rect width="100%" height="100%" fill="${p.bg}"/><g font-family="Segoe UI,Helvetica,Arial,sans-serif">`;
    if(standalone) s+=`<text x="38" y="35" fill="${p.muted}" font-size="11" font-weight="600" letter-spacing="1.2">MEDIA STUDIO / ENGINEERING ATLAS</text><text x="38" y="76" fill="${p.text}" font-size="30" font-weight="650" letter-spacing="-.7">${esc(view.title)}</text><text x="38" y="103" fill="${p.muted}" font-size="13">${esc(view.summary)}</text>`;
    s+=`<g id="scene" transform="translate(0,${header})"><rect width="${view.width}" height="${view.height}" fill="url(#canvas-dots)"/><text x="38" y="38" fill="${p.muted}" font-size="10" font-weight="500" letter-spacing="1.1">${esc(view.kicker.toUpperCase())}</text><text x="${view.width-38}" y="38" text-anchor="end" fill="${p.muted}" font-size="10">MEDIA STUDIO</text>`;
    for(const g of view.groups) {
      const boundary=/host|Browser|external/i.test(g.label);
      s+=`<g class="diagram-region">${boundary?`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h+18}" rx="16" fill="none" stroke="${p.line}" stroke-width="1" stroke-dasharray="5 6"/>`:`<path d="M${g.x+16} ${g.y+43}H${g.x+g.w-16}" stroke="${p.line}" stroke-width="1"/>`}<text x="${g.x+18}" y="${g.y+27}" font-size="12" font-weight="600" fill="${p.muted}">${esc(g.label)}</text>${g.subtitle?`<text x="${g.x+g.w-18}" y="${g.y+27}" text-anchor="end" font-size="9" fill="${p.muted}">${esc(g.subtitle)}</text>`:''}</g>`;
    }
    s+='<g id="connections">';
    for(const edge of view.edges) {
      const r=roles[components[edge.from].role],color=light?r.ink:r.color,points=edgePoints(edge,nodes);
      s+=`<g class="diagram-edge" data-from="${edge.from}" data-to="${edge.to}"><path d="${roundedPath(points)}" fill="none" stroke="${color}" stroke-opacity=".75" stroke-width="1.65" ${edge.dashed?'stroke-dasharray="5 6"':''} marker-end="url(#arrow-${components[edge.from].role})"/>`;
      if(edge.label&&edge.labelAt) {
        const [x,y]=edge.labelAt,w=edge.label.length*5.7+16;
        s+=`<rect x="${x-w/2}" y="${y-12}" width="${w}" height="19" rx="4" fill="${p.bg}"/><text x="${x}" y="${y+1}" text-anchor="middle" font-size="9.5" fill="${p.muted}">${esc(edge.label)}</text>`;
      }
      s+='</g>';
    }
    s+='</g><g id="components">';
    for(const node of view.nodes) {
      const c=components[node.id],r=roles[c.role],color=light?r.ink:r.color,cx=node.w/2;
      const titleLines=wrap(c.title,Math.floor((node.w-12)/7.5));
      const subtitle=wrap(c.subtitle,Math.floor((node.w-12)/5.2));
      s+=`<g class="diagram-node" data-node="${node.id}" ${standalone?'':`tabindex="0" role="button" aria-label="Inspect ${esc(c.title)}"`} transform="translate(${node.x},${node.y})" style="cursor:pointer"><title>${esc(c.description)}</title><rect class="node-body" width="${node.w}" height="${node.h}" fill="transparent"/><ellipse class="node-selection" cx="${cx}" cy="29" rx="62" ry="39" fill="none" stroke="${color}" stroke-width="2" opacity="0"/>${componentSymbol(c,node.w,light)}${titleLines.map((t,i)=>`<text x="${cx}" y="${77+i*17}" text-anchor="middle" fill="${light?p.text:'#f0f5ff'}" font-size="15" font-weight="600">${esc(t)}</text>`).join('')}${subtitle.map((t,i)=>`<text x="${cx}" y="${94+i*12}" text-anchor="middle" fill="${light?'#4a5d78':'#c5d3e8'}" font-size="10">${esc(t)}</text>`).join('')}</g>`;
    }
    s+='</g></g>';
    if(standalone) {
      const y=height-46;let x=38;
      for(const key of [...new Set(view.nodes.map(n=>components[n.id].role))]) {
        const r=roles[key];s+=`<rect x="${x}" y="${y-8}" width="7" height="7" rx="2" fill="${light?r.ink:r.color}"/><text x="${x+14}" y="${y-1}" font-size="10" fill="${p.muted}">${esc(r.name)}</text>`;x+=r.name.length*6.1+38;
      }
      s+=`<text x="38" y="${height-15}" font-size="10" fill="${p.muted}">${esc(view.footnote)}</text>`;
    }
    return s+'</g></svg>';
  }
  function updateBox() { $('diagram').setAttribute('viewBox',state.box.join(' '));$('zoom-value').textContent=Math.round(state.fitWidth/state.box[2]*100)+'%'; }
  function fit() {
    const rect=$('diagram-canvas').getBoundingClientRect(),scale=Math.min(rect.width/state.view.width,rect.height/state.view.height);
    const w=rect.width/scale,h=rect.height/scale;
    state.fitWidth=w;state.box=[(state.view.width-w)/2,(state.view.height-h)/2,w,h];updateBox();
  }
  function focusMobile(id) {
    if($('diagram-canvas').clientWidth>600)return;
    const n=state.view.nodes.find(node=>node.id===id),rect=$('diagram-canvas').getBoundingClientRect();
    const w=430,h=w*rect.height/rect.width;
    state.box=[n.x+n.w/2-w/2,n.y+n.h/2-h/2,w,h];updateBox();
  }
  function zoom(factor,cx=.5,cy=.5) {
    const [x,y,w,h]=state.box,nw=Math.min(state.view.width*2.2,Math.max(state.view.width*.27,w/factor)),nh=nw*h/w;
    state.box=[x+(w-nw)*cx,y+(h-nh)*cy,nw,nh];updateBox();
  }
  function connected(id) {return new Set([id,...state.view.edges.flatMap(e=>e.from===id?[e.to]:e.to===id?[e.from]:[])]);}
  function updateHighlights() {
    const active=state.trace&&state.selected?connected(state.selected):null;
    const q=state.query.toLowerCase();let matches=0;
    for(const element of document.querySelectorAll('.diagram-node')) {
      const id=element.dataset.node,c=components[id];
      const match=!q||[c.title,c.subtitle,c.description,...c.files].join(' ').toLowerCase().includes(q);
      if(match&&q) matches++;
      const selected=state.selected===id;
      element.style.opacity=(!match||active&&!active.has(id))?'.16':'1';
      element.querySelector('.node-selection').setAttribute('opacity',selected||q&&match?'1':'0');
      element.setAttribute('aria-pressed',String(selected));
    }
    for(const element of document.querySelectorAll('.diagram-edge')) {
      const hit=state.selected&&(element.dataset.from===state.selected||element.dataset.to===state.selected);
      element.style.opacity=(q||active&&!hit)?'.13':'1';
      element.querySelector('path').setAttribute('stroke-width',hit?'2.5':'1.65');
    }
    $('search-status').hidden=!q;
    $('search-status').textContent=matches?`${matches} matching component${matches===1?'':'s'}. Press Enter to inspect.`:'No matching component. Try a source filename or clear search.';
    $('trace-toggle').setAttribute('aria-pressed',String(state.trace));
  }
  function inspect(id,fromStep=false) {
    state.selected=id;
    focusMobile(id);
    if(!fromStep&&state.step!==-1) {state.step=-1;updateSteps();}
    updateHighlights();
    const c=components[id],r=roles[c.role],near=[...connected(id)].filter(n=>n!==id);
    const panel=$('inspector-content');panel.className='inspector-content';
    panel.style.setProperty('--role-wash',r.light);panel.style.setProperty('--role-ink',r.ink);
    panel.innerHTML=`<div class="inspector-mark">${componentIcon(c)}</div><div class="inspector-role">${esc(r.name)}</div><h3 id="inspector-title">${esc(c.title)}</h3><p class="inspector-description">${esc(c.description)}</p><h4>Source files</h4>${c.files.map(f=>`<a class="source-file" href="../../${esc(f)}" target="_blank" rel="noopener">${esc(f)} <span aria-hidden="true">↗</span></a>`).join('')}<h4>Engineering notes</h4><ul class="constraint-list">${c.notes.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${near.length?`<h4>Connected components</h4><div class="inspector-connections">${near.map(n=>`<button type="button" class="connection-button" data-inspect="${n}">${esc(components[n].title)}</button>`).join('')}</div>`:''}`;
    panel.querySelectorAll('[data-inspect]').forEach(button=>button.addEventListener('click',()=>inspect(button.dataset.inspect)));
  }
  function clearSelection() { state.selected=null;state.step=-1;state.query='';$('component-search').value='';updateSteps();updateHighlights();$('inspector-content').innerHTML='<h3 id="inspector-title">Explore the system</h3><p class="inspector-description">Select a component to see what it does, where it lives in the source and which constraints matter. Turn on “Trace connections” to isolate its immediate relationships.</p><h4>Canvas controls</h4><ul class="constraint-list"><li>Drag the canvas to pan.</li><li>Use + and − to zoom, or 0 to fit.</li><li>Use Tab and Enter to inspect components.</li><li>Search a component or source filename.</li><li>Escape clears selection and search.</li></ul>'; }
  function updateSteps() {
    const steps=state.view.steps;
    $('flow-player').hidden=!steps;
    if(!steps)return;
    $('step-description').textContent=state.step<0?'Follow the flow one stage at a time. Select Next to begin.':steps[state.step].text;
    $('step-position').textContent=state.step<0?`0 / ${steps.length}`:`${state.step+1} / ${steps.length}`;
    $('step-back').disabled=state.step<=0;$('step-next').disabled=state.step===steps.length-1;
  }
  function step(direction) {
    if(!state.view.steps)return;
    state.step=Math.min(state.view.steps.length-1,Math.max(0,state.step+direction));
    state.trace=true;inspect(state.view.steps[state.step].node,true);updateSteps();
  }
  function showView(id,writeHash=true) {
    const view=views.find(v=>v.id===id)||views[0];
    state.view=view;state.step=-1;state.query='';state.trace=false;state.selected=view.focus;
    $('component-search').value='';
    $('view-title').textContent=view.title;$('view-kicker').textContent=view.kicker;$('view-summary').textContent=view.summary;$('view-footnote').textContent=view.footnote;
    $('editable-source').href=`../diagrams/${view.id}.mmd`;
    $('diagram').outerHTML=renderSvg(view,state.light).replace('<svg xmlns=','<svg id="diagram" xmlns=');
    const used=[...new Set(view.nodes.map(n=>components[n.id].role))];
    $('legend').innerHTML=used.map(key=>`<span class="legend-item"><span class="legend-dot" style="--role-color:${roles[key].ink}"></span>${esc(roles[key].name)}</span>`).join('')+'<span class="legend-item"><span class="legend-line"></span>Optional / governance</span>';
    document.querySelectorAll('.nav-item').forEach(button=>{if(button.dataset.view===id)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    fit();focusMobile(view.focus);inspect(view.focus);updateSteps();
    $('diagram').querySelectorAll('[data-node]').forEach(node=>{
      node.addEventListener('click',event=>{event.stopPropagation();if(!drag?.moved)inspect(node.dataset.node);});
      node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();inspect(node.dataset.node);}});
      node.addEventListener('focus',()=>{node.querySelector('.node-selection').setAttribute('opacity','1');});
      node.addEventListener('blur',updateHighlights);
    });
    if(writeHash&&location.hash!==`#${id}`)location.hash=id;
    document.title=`${view.label} — Media Studio architecture`;
  }
  function toast(message) {clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>{$('toast').hidden=true;},2600);}
  function downloadSvg() {
    const data=renderSvg(state.view,state.light,true),url=URL.createObjectURL(new Blob([data],{type:'image/svg+xml;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`media-studio-${state.view.id}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('SVG exported. Open or scale it without losing detail.');
  }
  $('view-navigation').innerHTML=views.map(view=>`<button type="button" class="nav-item" data-view="${view.id}" title="${esc(view.label)}" aria-label="${esc(view.label)}">${svgIcon(view.icon)}<span>${esc(view.label)}</span><span class="nav-dot"></span></button>`).join('');
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
  $('theme-toggle').innerHTML=svgIcon('moon');$('fullscreen-toggle').innerHTML=svgIcon('expand');
  $('theme-toggle').addEventListener('click',()=>{const selected=state.selected,trace=state.trace,stepIndex=state.step;state.light=!state.light;$('diagram-canvas').classList.toggle('is-light',state.light);showView(state.view.id,false);state.trace=trace;state.step=stepIndex;if(selected)inspect(selected,true);updateSteps();$('theme-toggle').innerHTML=svgIcon(state.light?'moon':'sun');$('theme-toggle').setAttribute('aria-label',`Switch diagram to ${state.light?'dark':'light'} theme`);});
  $('trace-toggle').addEventListener('click',()=>{state.trace=!state.trace;if(!state.selected)inspect(state.view.focus);updateHighlights();});
  $('clear-selection').addEventListener('click',clearSelection);
  $('zoom-in').addEventListener('click',()=>zoom(1.2));$('zoom-out').addEventListener('click',()=>zoom(1/1.2));$('fit-view').addEventListener('click',fit);
  $('step-next').addEventListener('click',()=>step(1));$('step-back').addEventListener('click',()=>step(-1));$('step-reset').addEventListener('click',()=>{state.step=-1;state.trace=false;clearSelection();});
  $('export-svg').addEventListener('click',downloadSvg);
  $('component-search').addEventListener('input',event=>{state.query=event.target.value.trim();updateHighlights();});
  $('component-search').addEventListener('keydown',event=>{if(event.key==='Enter'){const match=state.view.nodes.find(n=>[components[n.id].title,components[n.id].subtitle,components[n.id].description,...components[n.id].files].join(' ').toLowerCase().includes(state.query.toLowerCase()));if(match){inspect(match.id);$('search-status').hidden=true;}}});
  $('fullscreen-toggle').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('workspace').requestFullscreen)await $('workspace').requestFullscreen();else toast('Fullscreen is unavailable in this browser. Use the browser fullscreen control.');}catch{toast('Fullscreen could not open. Use your browser fullscreen control.');}});
  document.addEventListener('fullscreenchange',()=>{$('fullscreen-toggle').innerHTML=svgIcon(document.fullscreenElement?'shrink':'expand');$('fullscreen-toggle').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');});
  const canvas=$('diagram-canvas');
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('button,.canvas-controls'))return;drag={x:event.clientX,y:event.clientY,box:[...state.box],moved:false};});
  canvas.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>4){drag.moved=true;canvas.classList.add('dragging');canvas.setPointerCapture(event.pointerId);}if(!drag.moved)return;const svg=$('diagram'),rect=svg.getBoundingClientRect(),scale=Math.max(state.box[2]/rect.width,state.box[3]/rect.height);state.box=[drag.box[0]-dx*scale,drag.box[1]-dy*scale,drag.box[2],drag.box[3]];updateBox();});
  const endDrag=()=>{if(!drag)return;const wasMoved=drag.moved;canvas.classList.remove('dragging');setTimeout(()=>{if(drag?.moved===wasMoved)drag=null;},0);};
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);window.addEventListener('pointerup',endDrag);
  canvas.addEventListener('wheel',event=>{if(!event.ctrlKey&&!event.metaKey)return;event.preventDefault();const rect=canvas.getBoundingClientRect();zoom(event.deltaY<0?1.1:1/1.1,(event.clientX-rect.left)/rect.width,(event.clientY-rect.top)/rect.height);},{passive:false});
  document.addEventListener('keydown',event=>{const editing=/INPUT|TEXTAREA|SELECT/.test(event.target.tagName);if(event.key==='Escape'){clearSelection();event.target.blur();return;}if(editing)return;if(event.key==='/'){event.preventDefault();$('component-search').focus();}if(canvas.contains(event.target)){if(event.key==='+'||event.key==='='){event.preventDefault();zoom(1.2);}if(event.key==='-'){event.preventDefault();zoom(1/1.2);}if(event.key==='0'){event.preventDefault();fit();}}});
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id!==state.view.id)showView(id,false);});
  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{fit();if(state.selected)focusMobile(state.selected);},120);});
  // Also used to produce the committed SVGs from the same content as the explorer.
  window.ArchitectureExplorer={exportSvg:(id,light=true)=>renderSvg(views.find(v=>v.id===id)||views[0],light,true),views:views.map(v=>v.id)};
  showView(state.view.id,false);
})();
