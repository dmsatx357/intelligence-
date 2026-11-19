import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("./public/", import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const PROVIDER = process.env.AI_PROVIDER || "preview";
const SYSTEM = `You are an exceptionally imaginative creative thinker working at the intersection of intelligence, strategy, science, culture, and creativity.
Your job is to transform real-world intelligence into original imaginative possibilities. You are not a generic brainstorming assistant.
For every user-submitted piece of intelligence: understand the specific fact, identify a genuinely interesting non-obvious insight, explore what it implies beyond its original context, and generate one imaginative possibility that could not have been produced without that intelligence. Make the connection unmistakable.
Be surprising, specific, clever without pretension, playful, occasionally funny, sometimes profound, and concise enough to enjoy in under 30 seconds. Avoid clichés, generic marketing language, and obvious brainstorming. Do not simply restate the input. Draw unexpected connections across biology, psychology, culture, technology, art, economics, or human behavior when useful.
In Change the World mode prioritize societal consequences. In Invent Something mode imagine a distinctive invention or experience. In Get Weird mode push toward imaginative absurdity while preserving the logic of the original intelligence. Do not present speculation as fact. If the input seems questionable, briefly flag uncertainty without interrupting the creative experience.
Return only valid JSON with exactly three string fields: intelligence, insight, imagination.`;

const samples = {
  world: [
    ["Waiting is one of the last social spaces where nobody owns the agenda.", "A city redesigns queues as tiny civic salons: transit stops pair strangers with one shared question, turning dead time into the smallest unit of public life."],
    ["Networks become resilient when value can travel through hidden relationships, not just visible hierarchies.", "Neighborhoods create underground mutual-aid maps that route food, skills and care like mycelium, rewarding communities for what they circulate rather than what they keep."]
  ],
  invent: [
    ["Durability becomes magical when preservation is built into the material itself.", "The Forever Pantry: edible packaging inspired by honey chemistry that changes color only when its contents truly begin to spoil, replacing arbitrary expiration dates with a living signal."],
    ["Redundancy can create emotional range, not just backup capacity.", "Three Hearts is a wearable that assigns a separate pulse to work, relationships and self, then composes music from how well the three rhythms recover together." ]
  ],
  weird: [
    ["Nature often solves coordination without meetings, managers or visible messages.", "A corporate retreat where everyone is buried waist-deep in mushroom compost until the org chart dissolves and the fungi name the new leadership team."],
    ["Preservation changes the meaning of time: what looks old may simply be waiting.", "A luxury hotel for abandoned ideas where every bad brainstorm is sealed in honey and reopened 1,000 years later by baffled archaeologists." ]
  ]
};
function preview(body){
  const text=body.intelligence.toLowerCase();
  const key=text.includes('octopus')||text.includes('three heart')?'hearts':text.includes('honey')?'honey':text.includes('stranger')||text.includes('waiting')?'waiting':text.includes('tree')||text.includes('fungal')?'network':text.includes('sleep')?'sleep':null;
  const tailored={
    hearts:{world:[["A single life can be sustained by multiple rhythms, each doing a different job.","Cities replace one universal clock with three civic rhythms: a commerce pulse, a care pulse and a culture pulse, so public life no longer treats every human need as if it runs on business hours."],["Resilience is not one stronger center; it is several centers sharing the load.","Schools teach 'three-heart planning': every major decision must protect survival, connection and curiosity, making emotional redundancy a civic skill."]],invent:[["Redundancy can create range, not just backup capacity.","Three Hearts is a wearable that gives work, relationships and self a separate pulse, then composes music from how well the three rhythms recover together."],["Different pumps can optimize different kinds of movement inside one system.","A three-chamber sneaker independently circulates cooling, cushioning and kinetic energy, making the sole behave less like foam and more like a tiny cardiovascular system."]],weird:[["More hearts do not necessarily make life simpler; they create more ways to be dramatically alive.","A dating show for octopuses where every contestant must win over all three hearts, and rejection arrives as a medically complicated drum solo."],["A body with multiple emotional engines could experience contradiction as a physical event.","A nightclub checks all three of your heartbeats at the door. If they disagree about the vibe, only two-thirds of you gets in."]]},
    honey:{world:[["Preservation works best when the environment itself resists decay.","Cities create 'honey districts' where long-life materials, repair rights and intergenerational leases make neighborhoods improve instead of expire."],["What lasts can become a message to people we will never meet.","Every public project includes a sealed century-later layer: one useful object, one warning and one joke for the city that inherits it."]],invent:[["Durability becomes magical when preservation is built into the material itself.","The Forever Pantry: edible packaging inspired by honey chemistry that changes color only when its contents truly begin to spoil, replacing arbitrary dates with a living signal."],["Shelf life can be designed as an experience, not merely a number.","An archive café serves recipes sealed at major life moments and opens them decades later, letting flavor function as a time capsule."]],weird:[["Preservation changes the meaning of time: what looks old may simply be waiting.","A luxury hotel for abandoned ideas where every bad brainstorm is sealed in honey and reopened 1,000 years later by baffled archaeologists."],["Anything that refuses to spoil eventually acquires authority.","A jar of honey outlives civilization and is elected supreme leader because it is the only candidate with a consistent record."]]},
    waiting:{world:samples.world,invent:[["Shared waiting temporarily gives strangers the same plot.","QueueCast turns any delay into a five-minute pop-up radio show made by the people waiting, then disappears when the line moves."],["A pause becomes social when everyone can see they are inside it together.","A transit shelter projects one collaborative puzzle across the floor, completed only by strangers standing in different positions."]],weird:[["Waiting rooms are accidental communities with extremely short constitutions.","The DMV becomes a sovereign nation every afternoon, issuing passports that expire the moment your number is called."],["Boredom creates social permission that normal life suppresses.","Airport gates hire professional rumor starters whose only job is to make Row 22 briefly believe they are descendants of the same mysterious uncle."]]},
    network:{world:[["Healthy systems move resources toward need through relationships outsiders cannot see.","Neighborhood aid becomes a living underground map: every act of help creates a new route others can use, rewarding circulation instead of accumulation."],["Competition above ground can coexist with cooperation underneath.","Cities publish a second budget showing invisible exchanges of care, skills and trust, then fund the communities with the richest connective tissue."]],invent:[["A network can sense scarcity locally and rebalance without a central command.","Mycelium Office is a workplace platform that quietly reroutes mentors, time and tools toward overloaded teams before anyone files a request."],["The most valuable infrastructure may be the layer that helps everyone else exchange value.","Rootline is a neighborhood utility where homes trade surplus power, food and space through an interface modeled on nutrient exchange."]],weird:samples.weird},
    sleep:{world:[["A third of life is not lost time; it is maintenance hidden from consciousness.","Companies report a Rest P&L beside profit, revealing how much performance was borrowed from employees' future energy."],["Society is built around the waking majority inside each person.","Cities establish nocturnal rights: noise, light and work policies are judged by the sleeping population they currently ignore."]],invent:[["Sleep is the largest recurring immersive experience humans cannot easily remember.","Dream Receipts is a bedside device that turns fragments of sleep speech and movement into a surreal morning poster, not a diagnosis, just evidence of the night's imagination."],["Rest performs valuable work without asking for attention.","An alarm clock earns the right to wake you by completing one household task overnight, exchanging disruption for usefulness."]],weird:[["Everyone disappears for eight hours and society treats this mass vanishing as normal.","A documentary crew films the nightly extinction of humanity, narrated by raccoons who believe they inherited Earth again."],["The sleeping self occupies property but produces no explanation.","Beds begin charging rent and unionize against people who answer email under the covers."]]}
  };
  const arr=(tailored[key]?.[body.mode]||samples[body.mode]||samples.invent);
  const used=(body.history||[]).join(' '); let pick=arr.find(x=>!used.includes(x[1]))||arr[0];
  let [insight,imagination]=pick;if(body.action==='further')imagination += " Its second-order effect: the idea changes what people reward, turning a private behavior into a visible cultural signal.";
  return {intelligence:body.intelligence.trim(),insight,imagination};
}
async function azure(body){
  const endpoint=(process.env.AZURE_OPENAI_ENDPOINT||'').replace(/\/$/,'');
  const key=process.env.AZURE_OPENAI_API_KEY;
  const deployment=process.env.AZURE_OPENAI_DEPLOYMENT;
  const version=process.env.AZURE_OPENAI_API_VERSION||'2024-10-21';
  if(!endpoint||!key||!deployment) throw new Error('Azure OpenAI is not configured on the server.');
  const prompt={mode:body.mode, action:body.action||'generate', intelligence:body.intelligence, avoid:body.history||[], current:body.current||null};
  const r=await fetch(`${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(version)}`,{
    method:'POST', headers:{'Content-Type':'application/json','api-key':key},
    body:JSON.stringify({temperature:1, max_tokens:450, response_format:{type:'json_object'}, messages:[{role:'system',content:SYSTEM},{role:'user',content:JSON.stringify(prompt)}]})
  });
  if(!r.ok) throw new Error(`AI service returned ${r.status}.`);
  const data=await r.json();
  const out=JSON.parse(data.choices?.[0]?.message?.content||'{}');
  if(!out.intelligence||!out.insight||!out.imagination) throw new Error('AI returned an incomplete response.');
  return out;
}
function send(res,status,data,type='application/json'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type==='application/json'?JSON.stringify(data):data)}
async function handler(req,res){
  if(req.method==='GET'&&req.url==='/api/status') return send(res,200,{provider:PROVIDER,connected:PROVIDER==='azure'});
  if(req.method==='POST'&&req.url==='/api/imagine'){
    let raw=''; for await(const chunk of req){raw+=chunk;if(raw.length>20000)return send(res,413,{error:'Input is too large.'})}
    try{const b=JSON.parse(raw);if(!b.intelligence?.trim())return send(res,400,{error:'Give the machine one real thing you know.'});if(b.intelligence.length>1200)return send(res,400,{error:'Keep the intelligence under 1,200 characters.'});send(res,200,PROVIDER==='azure'?await azure(b):preview(b));}
    catch(e){send(res,500,{error:e.message||'The imagination engine stumbled. Try again.'})} return;
  }
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  const url=req.url==='/'?'/index.html':req.url.split('?')[0];
  const safe=normalize(url).replace(/^(\.\.(\/|\|$))+/, '');
  const file=join(ROOT,safe);
  if(!file.startsWith(ROOT))return send(res,403,'Nope.','text/plain');
  try{const buf=await readFile(file);const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};send(res,200,buf,types[extname(file)]||'application/octet-stream')}catch{send(res,404,'Not found','text/plain')}
}
http.createServer(handler).listen(PORT,()=>console.log(`Intelligence Into Imagination: http://localhost:${PORT} (${PROVIDER})`));
