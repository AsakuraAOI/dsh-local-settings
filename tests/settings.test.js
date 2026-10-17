import test from 'node:test';
import assert from 'node:assert/strict';
import { describeConfiguration,saveConfiguration,fieldsFor } from '../src/configuration.js';
import { createHandler,ROUTE } from '../src/index.js';

const field=(type,label,extra={})=>({type,meta:{description:{zh:label},...extra}});
function fixture(){
  const schema={type:'object',meta:{},dict:{enabled:field('boolean','启用'),timeout:field('number','超时',{min:100}),key:field('string','密钥',{role:'secret'})}};
  const entry={options:{id:'hiagent-websearch',name:'@local/dsh-kasumi-websearch',config:{enabled:true,timeout:1000,key:'TOP_SECRET'}},fiber:{uid:'fiber-1',state:2,runtime:{Config:schema},config:{enabled:true,timeout:1000,key:'TOP_SECRET'}}};
  const inherited={enabled:true,timeout:500,key:'BASE_SECRET'};
  const editor={configuration:()=>[{entry,inherited,override:{timeout:1000,key:'TOP_SECRET'}}],edit:async(row,fn)=>{const next=fn(row.options.config,inherited);if(next.timeout<100)throw new Error('timeout invalid');row.options.config=next;row.fiber.config=next;}};
  return{schema,entry,editor};
}
test('all declared config fields are projected, secret values never leave host',()=>{
  const f=fixture(),result=describeConfiguration(f.editor),raw=JSON.stringify(result);
  assert.equal(result.rows[0].fields.length,3);assert.equal(result.rows[0].fields[1].label,'超时');assert.doesNotMatch(raw,/TOP_SECRET|BASE_SECRET/);
  assert.equal(result.rows[0].fields[2].configured,true);
});
test('save delegates to editor, preserves untouched fields and resets inherited values',async()=>{
  const f=fixture();let row=describeConfiguration(f.editor).rows[0];
  await saveConfiguration(f.editor,{id:row.id,revision:row.revision,changes:[{op:'set',path:['enabled'],value:false}]});
  assert.equal(f.entry.options.config.enabled,false);assert.equal(f.entry.options.config.key,'TOP_SECRET');
  row=describeConfiguration(f.editor).rows[0];await saveConfiguration(f.editor,{id:row.id,revision:row.revision,changes:[{op:'reset',path:['timeout']}]});assert.equal(f.entry.options.config.timeout,500);
});
test('stale writes, undeclared fields, prototype paths and secret replacements are refused',async()=>{
  const f=fixture(),row=describeConfiguration(f.editor).rows[0];
  await assert.rejects(()=>saveConfiguration(f.editor,{id:row.id,revision:'stale',changes:[{op:'set',path:['enabled'],value:false}]}),{status:409});
  for(const path of [['arbitrary'],['__proto__','enabled'],['key']])await assert.rejects(()=>saveConfiguration(f.editor,{id:row.id,revision:row.revision,changes:[{op:'set',path,value:'x'}]}),{status:400});
  assert.equal(f.entry.options.config.enabled,true);
});
test('foreign plugins and hidden subtrees are excluded',()=>{
  const f=fixture();f.entry.options.name='@official/other';assert.equal(describeConfiguration(f.editor).rows.length,0);
  assert.deepEqual(fieldsFor({type:'object',meta:{hidden:true},dict:{x:field('string','hidden')}},{x:'secret'},{},{},['private']),[]);
});
test('settings routes enforce JSON and same-origin writes; GET is read-only',async()=>{
  const f=fixture(),handle=createHandler({configEditor:f.editor});
  const get=await handle(new Request('http://localhost'+ROUTE+'/configuration'));assert.equal(get.status,200);assert.doesNotMatch(await get.text(),/TOP_SECRET/);
  const bad=await handle(new Request('http://localhost'+ROUTE+'/configuration',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'}));assert.equal(bad.status,403);
  const media=await handle(new Request('http://localhost'+ROUTE+'/configuration',{method:'POST',body:'{}'}));assert.equal(media.status,415);
});
test('QR endpoints retain the actual key on host and do not return credentials',async()=>{
  const f=fixture();f.entry.options.id='bilibili-account';f.entry.options.name='@local/dsh-bilibili';
  class Client{constructor(){this.accountFile='local-account';}async startLogin(){return{key:'PRIVATE_POLL_KEY',url:'https://passport.bilibili.com/qr'};}async pollLogin(){return{status:'waiting'};}}
  const handle=createHandler({configEditor:f.editor},{Client,qr:{toDataURL:async()=> 'data:image/png;base64,FAKE'}});
  const start=await(await handle(new Request('http://localhost'+ROUTE+'/bilibili/login/start',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}))).json();
  assert.match(start.image,/data:image/);assert.ok(start.token);assert.doesNotMatch(JSON.stringify(start),/PRIVATE_POLL_KEY|SESSDATA/);
  const poll=await(await handle(new Request('http://localhost'+ROUTE+'/bilibili/login/poll',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:start.token})}))).json();assert.equal(poll.status,'waiting');
});
test('account status unwraps settled title snapshots and falls back for missing or rejected titles',async()=>{
  const f=fixture();f.entry.options.id='bilibili-account';f.entry.options.name='@local/dsh-bilibili';
  class Client{async status(){return{loggedIn:false};}}
  const sessionQuery={
    listSessions:async()=>['named','untitled','failed'].map(id=>({header:{id},live:true,persisted:true})),
    readTitleSnapshots:async()=>[
      {sessionId:'named',status:'fulfilled',value:{session:{id:'named'},title:{title:'视频阅读通知',source:'user'}}},
      {sessionId:'untitled',status:'fulfilled',value:{session:{id:'untitled'}}},
      {sessionId:'failed',status:'rejected',reason:new Error('unavailable')},
    ],
  };
  const handle=createHandler({configEditor:f.editor,sessionQuery},{Client});
  const response=await handle(new Request('http://localhost'+ROUTE+'/bilibili/status'));
  assert.equal(response.status,200);
  const data=await response.json();assert.equal(data.loggedIn,false);
  assert.deepEqual(data.sessions,[{id:'named',title:'视频阅读通知'},{id:'untitled',title:'untitled'},{id:'failed',title:'failed'}]);
});
test('title query failure does not break account status or the notification session picker',async()=>{
  const f=fixture();f.entry.options.id='bilibili-account';f.entry.options.name='@local/dsh-bilibili';
  class Client{async status(){return{loggedIn:true,uid:'42',name:'专用账号'};}}
  const sessionQuery={listSessions:async()=>[{header:{id:'session-1'}}],readTitleSnapshots:async()=>{throw new Error('title store unavailable');}};
  const handle=createHandler({configEditor:f.editor,sessionQuery},{Client});
  const response=await handle(new Request('http://localhost'+ROUTE+'/bilibili/status'));
  assert.equal(response.status,200);const data=await response.json();assert.equal(data.loggedIn,true);
  assert.deepEqual(data.sessions,[{id:'session-1',title:'session-1'}]);
});
