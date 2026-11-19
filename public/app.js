const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];const input=$('#intelligence'),gen=$('#generate'),err=$('#error'),result=$('#result');let mode='world',history=[],current=null;
fetch('/api/status').then(r=>r.json()).then(s=>{const el=$('#status');el.textContent=s.connected?'AI CONNECTED':'PREVIEW MODE';el.classList.add('live')}).catch(()=>$('#status').textContent='OFFLINE');
input.addEventListener('input',()=>{$('#count').textContent=input.value.length;gen.disabled=!input.value.trim()});
$$('.examples button').forEach(b=>b.addEventListener('click',()=>{input.value=b.textContent;input.dispatchEvent(new Event('input'));input.focus()}));
$$('.mode').forEach(b=>b.addEventListener('click',()=>{$$('.mode').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-checked','false')});b.classList.add('active');b.setAttribute('aria-checked','true');mode=b.dataset.mode}));
async function imagine(action='generate'){err.textContent='';gen.disabled=true;gen.classList.add('loading');gen.querySelector('span').textContent=action==='further'?'PUSHING IT FURTHER…':'MAKING THE LEAP…';try{const r=await fetch('/api/imagine',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({intelligence:input.value,mode,action,history,current})});const data=await r.json();if(!r.ok)throw new Error(data.error);current=data;history.push(data.imagination);$('#outIntelligence').textContent=data.intelligence;$('#outInsight').textContent=data.insight;$('#outImagination').textContent=data.imagination;result.hidden=false;result.scrollIntoView({behavior:'smooth'})}catch(e){err.textContent=e.message||'The imagination engine stumbled. Give it another shot.'}finally{gen.disabled=!input.value.trim();gen.classList.remove('loading');gen.querySelector('span').textContent='TURN INTELLIGENCE INTO IMAGINATION'}}
gen.addEventListener('click',()=>imagine('generate'));$('.actions').addEventListener('click',e=>{const a=e.target.dataset.action;if(a==='leap')imagine('leap');if(a==='further')imagine('further');if(a==='reset'){input.value='';input.dispatchEvent(new Event('input'));history=[];current=null;result.hidden=true;$('#machine').scrollIntoView({behavior:'smooth'});input.focus()}});
$('#copy').addEventListener('click',async()=>{if(!current)return;const text=`INTELLIGENCE
${current.intelligence}

INSIGHT
${current.insight}

IMAGINATION
${current.imagination}`;try{await navigator.clipboard.writeText(text);$('#copy').textContent='COPIED';setTimeout(()=>$('#copy').textContent='COPY / SHARE',1500)}catch{err.textContent='Copy was blocked by your browser.'}});
document.addEventListener('pointermove',e=>{const g=$('.cursor-glow');g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'});