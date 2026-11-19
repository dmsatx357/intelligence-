const SYSTEM = `You are the creative intelligence behind Intelligence Into Imagination.
MISSION
Turn one piece of real-world intelligence into an imaginative possibility that feels impossible to have generated without that exact intelligence.
NON-NEGOTIABLE RULE
The submitted fact is the causal engine of the output. If the same output could plausibly have been generated from a different fact, reject it and try again.
REASONING PROCESS — DO THIS SILENTLY
1. Parse the fact precisely. Identify the distinctive mechanism, relationship, constraint, anomaly, behavior, scale, or tradeoff.
2. Generate 4 candidate underlying insights that are meaningfully different.
3. Judge them for dependence on this exact fact, non-obviousness, transferability, and creative potential.
4. Choose the strongest. Prefer mechanisms and tensions over metaphors and wordplay.
5. Transfer the mechanism into a different domain without losing the original logic.
6. Generate the imaginative leap.
7. Run a substitution test. If an unrelated fact could produce basically the same idea, discard it and regenerate.
MODE RULES
world: Apply the principle to behavior, culture, institutions, infrastructure, economics, relationships, or society.
brand: Invent a distinctive product, service, experience, business model, ritual, system, object, interface, or organization from the mechanism.
wild: Push toward surreal, absurd, or funny consequences while preserving impeccable internal logic.
ANOTHER LEAP
For action again, keep the intelligence fixed but do not reuse the prior insight, metaphor, domain, mechanism framing, category, joke structure, title concept, or creative territory.
TAKE IT FURTHER
For action further, generate a surprising second-order behavior, ritual, industry, conflict, status signal, unintended consequence, or cultural norm caused by the current idea.
STYLE
Surprising, specific, playful, concise, vivid, occasionally funny, sometimes profound. No corporate jargon or generic innovation language.
OUTPUT
Title: 3–9 words.
Body: 55–100 words.
Insight: 18–40 words.
Leap: 20–45 words connecting the insight to the possibility.`;

const schema={type:'object',additionalProperties:false,properties:{title:{type:'string'},body:{type:'string'},insight:{type:'string'},leap:{type:'string'}},required:['title','body','insight','leap']};

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed.'});
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:'OPENAI_API_KEY is missing in Vercel.'});
  const {fact,mode,action,attempt,depth,previous}=req.body||{};
  if(typeof fact!=='string'||fact.trim().length<12||fact.length>500||!['world','brand','wild'].includes(mode)||!['new','again','further'].includes(action)) return res.status(400).json({error:'Enter a fact of 12–500 characters and choose a creative direction.'});
  const actionBrief=action==='again'?`ANOTHER LEAP. Previous result: ${JSON.stringify(previous)}. Find a materially different truth inside the same fact.`:action==='further'?`TAKE IT FURTHER. Current result: ${JSON.stringify(previous)}. Generate a surprising second-order consequence.`:`FIRST LEAP. Perform the full candidate-insight selection and substitution test.`;
  try{
    const upstream=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||'gpt-4.1-mini',
        instructions:SYSTEM,
        input:JSON.stringify({submitted_intelligence:fact.trim(),mode,action,actionBrief,attempt:Number(attempt)||0,depth:Number(depth)||0}),
        max_output_tokens:1600,
        text:{format:{type:'json_schema',name:'creative_leap',strict:true,schema}}
      })
    });
    const result=await upstream.json();
    if(!upstream.ok){console.error('OpenAI error',result);return res.status(502).json({error:'AI service error. Check OpenAI billing/key and Vercel logs.'});}
    let output=typeof result.output_text==='string'?result.output_text:'';
    if(!output&&Array.isArray(result.output)){
      for(const item of result.output){
        for(const part of (item.content||[])){
          if(typeof part.text==='string'&&part.text.trim()) output+=part.text;
        }
      }
    }
    if(!output){
      console.error('No output text',JSON.stringify({status:result.status,incomplete_details:result.incomplete_details,output:result.output},null,2));
      return res.status(502).json({error:result.status==='incomplete'?'The AI response was incomplete. Try again.':'OpenAI returned an empty response. Try again.'});
    }
    try{return res.status(200).json(JSON.parse(output));}
    catch(e){console.error('Unexpected OpenAI output',output);return res.status(502).json({error:'OpenAI returned an unexpected response. Try again.'});}
  }catch(e){console.error(e);return res.status(502).json({error:'Could not generate a result. Check Vercel logs.'});}
}
