window.__ModuleLoader__.load({
  id:'@local/dsh-local-settings',
  factory:require=>{
    const React=require('react'),h=React.createElement;
    const ROUTE='/api/plugins/dsh-local-settings';
    const PACKAGES=[['@local/dsh-bilibili','B站账号与视频阅读'],['@local/dsh-seeit-video','Seeit 视频理解'],['@local/dsh-kasumi-websearch','Kasumi 网页搜索'],['@local/dsh-kasumi','Kasumi 适配'],['dsh-session-md-export','Markdown 导出']];
    const TITLES={'bilibili-account':'账号与监测','seeit-video':'模型、音频与视频来源','hiagent-websearch':'搜索服务','session-md-export':'导出默认选项','hiagent-observability':'性能观测','hiagent-global':'全局适配与工具预算','hiagent-global-compaction':'历史压缩','hiagent-recovery':'恢复保护','hiagent-query-budget':'请求预算网关'};
    const css=`.dls-page{max-width:820px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.6}.dls-page h2{font-size:20px;margin:0 0 6px}.dls-muted{color:var(--dsw-alias-label-tertiary);font-size:12px}.dls-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}.dls-button,.dls-tab{font:inherit;color:inherit;cursor:pointer;border:1px solid var(--dsw-alias-border-l2,#555);background:transparent;border-radius:8px;padding:7px 12px}.dls-button:disabled{opacity:.45;cursor:default}.dls-button:focus-visible,.dls-tab:focus-visible,.dls-input:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#5588f5);outline-offset:2px}.dls-tab[aria-selected=true],.dls-primary{background:var(--dsw-alias-state-business-primary,#4470dc);color:white;border-color:transparent}.dls-card{padding:20px;border:1px solid var(--dsw-alias-border-l2,#555);border-radius:12px;margin:12px 0 20px}.dls-card h3{font-size:15px;margin:0 0 6px}.dls-field{display:grid;grid-template-columns:minmax(140px,1fr) minmax(160px,1.4fr);gap:8px 18px;padding:12px 0;border-top:1px solid var(--dsw-alias-border-l3,#444)}.dls-input{width:100%;box-sizing:border-box;font:inherit;background:var(--dsw-alias-surface-l1,transparent);color:inherit;border:1px solid var(--dsw-alias-border-l2,#555);border-radius:7px;padding:8px;min-width:0}.dls-input option{background:var(--dsw-alias-surface-l1,#202020);color:var(--dsw-alias-label-primary,#eee)}textarea.dls-input{min-height:80px;resize:vertical}.dls-field label{align-self:center;overflow-wrap:anywhere}.dls-field small{display:block;color:var(--dsw-alias-label-tertiary);font-size:11px}.dls-field input[type=checkbox]{width:17px;height:17px;accent-color:var(--dsw-alias-state-business-primary,#4470dc)}.dls-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px}.dls-error{color:var(--dsw-alias-state-error-primary,#ef7474);white-space:pre-wrap;overflow-wrap:anywhere}.dls-success{color:var(--dsw-alias-state-success-primary,#59b98c)}.dls-qr{display:block;width:230px;height:230px;background:white;padding:8px;border-radius:8px;margin:16px 0}.dls-hint{padding:10px 12px;border-radius:8px;background:var(--dsw-alias-surface-l2,rgba(120,120,120,.08));margin:12px 0}.dls-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.dls-row .dls-input{flex:1}.dls-card details{margin:8px 0}.dls-card summary{cursor:pointer}.dls-badge{font-size:11px;border:1px solid var(--dsw-alias-border-l2,#555);padding:1px 6px;border-radius:10px;margin-left:6px}@media(max-width:580px){.dls-field{grid-template-columns:1fr}.dls-card{padding:14px}}`;
    async function api(path,body,signal){
      const response=await fetch(ROUTE+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal});
      let data;try{data=await response.json();}catch{throw new Error('设置服务暂不可用，请重启 DSH 后重试。');}
      if(!response.ok)throw new Error(data.error||`操作失败（${response.status}）`);return data;
    }
    const key=field=>JSON.stringify(field.path);
    function display(field){if(field.value===undefined)return '';if(field.kind==='strings')return field.value.join('\n');if(field.kind==='json')return JSON.stringify(field.value,null,2);return field.value;}
    function typed(field,value){
      if(field.kind==='number'){if(String(value).trim()==='')throw new Error(`${field.label} 需要填写数字；若要恢复请点“恢复默认”。`);const n=Number(value);if(!Number.isFinite(n))throw new Error(`${field.label} 需要有效数字。`);return n;}
      if(field.kind==='strings')return String(value).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      if(field.kind==='json'){try{return JSON.parse(value);}catch{throw new Error(`${field.label} 的 JSON 格式不正确。`);}}
      if(field.kind==='choice')return field.choices.find(v=>String(v)===String(value));
      return value;
    }
    function ConfigurationCard({row,reload}){
      const [changes,setChanges]=React.useState({}),[busy,setBusy]=React.useState(false),[error,setError]=React.useState(''),[notice,setNotice]=React.useState('');
      const edit=(field,value)=>{setNotice('');setChanges(c=>({...c,[key(field)]:{op:'set',path:field.path,value}}));};
      const reset=field=>{setNotice('');setChanges(c=>({...c,[key(field)]:{op:'reset',path:field.path}}));};
      async function save(){setBusy(true);setError('');setNotice('');try{
        const ops=Object.values(changes).map(op=>op.op==='set'?{...op,value:typed(row.fields.find(f=>key(f)===JSON.stringify(op.path)),op.value)}:op);
        await api('/configuration',{id:row.id,revision:row.revision,changes:ops});setChanges({});await reload();setNotice('已保存并应用');
      }catch(e){setError(e.message);}finally{setBusy(false);}}
      return h('section',{className:'dls-card','data-local-entry':row.id},
        h('h3',null,TITLES[row.id]||row.id),
        !row.active?h('p',{className:'dls-muted'},'组件当前未运行。请在插件页启用对应组件后配置。'):
        h(React.Fragment,null,
          h('p',{className:'dls-muted'},'点击保存后生效；恢复默认会在保存时移除对应覆盖。'),
          row.fields.map(field=>{
            const op=changes[key(field)],value=op?.op==='set'?op.value:op?.op==='reset'?field.base:display(field),id=`dls-${row.id}-${field.path.join('-')}`;
            const common={id,disabled:busy||field.secret,className:'dls-input','aria-label':field.label,onChange:e=>edit(field,field.kind==='boolean'?e.target.checked:e.target.value)};
            let control;
            if(field.secret)control=h('p',{className:'dls-muted'},field.configured?'已配置，密钥请在模型凭据设置中管理。':'未配置，密钥请在模型凭据设置中管理。');
            else if(field.kind==='boolean')control=h('input',{...common,type:'checkbox',checked:Boolean(value)});
            else if(field.kind==='choice')control=h('select',{...common,value:value??''},field.choices.map(v=>h('option',{key:String(v),value:String(v)},String(v))));
            else if(['json','strings'].includes(field.kind))control=h('textarea',{...common,value:typeof value==='string'?value:field.kind==='strings'?(value||[]).join('\n'):JSON.stringify(value??null,null,2),rows:3});
            else control=h('input',{...common,type:field.kind==='number'?'number':'text',value:value??'',min:field.minimum,max:field.maximum,step:field.step||'any'});
            return h('div',{className:'dls-field',key:key(field)},
              h('label',{htmlFor:id},field.label,field.overridden?h('span',{className:'dls-badge'},'已覆盖'):null,field.kind==='strings'?h('small',null,'每行一项'):null,field.kind==='json'?h('small',null,'JSON 格式'):null),
              h('div',null,control,!field.secret?h('button',{className:'dls-button',type:'button',disabled:busy,onClick:()=>reset(field),style:{marginTop:6,padding:'2px 7px',fontSize:11}},op?.op==='reset'?'待恢复默认':'恢复默认'):null));
          }),
          h('div',{className:'dls-actions'},h('button',{className:'dls-button dls-primary',disabled:busy||!Object.keys(changes).length,onClick:save},busy?'保存中…':'保存'),h('button',{className:'dls-button',disabled:busy||!Object.keys(changes).length,onClick:()=>{setChanges({});setError('');}},'放弃更改'),notice?h('span',{className:'dls-success',role:'status'},notice):null),
          error?h('p',{className:'dls-error',role:'alert'},error):null));
    }
    function BilibiliAccount({autoMonitor}){
      const [status,setStatus]=React.useState(null),[error,setError]=React.useState(''),[busy,setBusy]=React.useState(false),[qr,setQr]=React.useState(null),[session,setSession]=React.useState(''),[message,setMessage]=React.useState('');
      const generation=React.useRef(0),selection=React.useRef(session);selection.current=session;
      const refresh=React.useCallback(async signal=>{const data=await api('/bilibili/status',undefined,signal);setStatus(data);setSession(previous=>previous||data.monitors[0]?.sessionId||'');return data;},[]);
      React.useEffect(()=>{const abort=new AbortController();refresh(abort.signal).catch(e=>{if(!abort.signal.aborted)setError(e.message);});return()=>abort.abort();},[refresh]);
      async function action(path,body={}){setBusy(true);setError('');setMessage('');try{await api(path,body);await refresh();}catch(e){setError(e.message);}finally{setBusy(false);}}
      async function startLogin(){generation.current++;setBusy(true);setError('');setMessage('');setQr(null);try{setQr(await api('/bilibili/login/start',{}));}catch(e){setError(e.message);}finally{setBusy(false);}}
      React.useEffect(()=>{
        if(!qr?.token)return;const abort=new AbortController(),stamp=generation.current;let timer;
        const poll=async()=>{try{
          const result=await api('/bilibili/login/poll',{token:qr.token},abort.signal);if(abort.signal.aborted||stamp!==generation.current)return;
          if(result.status==='success'){
            setQr(null);setMessage(`已登录：${result.name||result.uid}`);await refresh(abort.signal);
            if(autoMonitor&&selection.current){await api('/bilibili/monitor/start',{sessionId:selection.current},abort.signal);await refresh(abort.signal);setMessage('已登录，并已开启 @视频定时阅读。');}
            else if(autoMonitor)setMessage('已登录。请选择通知会话，然后点击“开启监测”。');
            return;
          }
          if(['expired','failed'].includes(result.status)){setQr(null);setMessage('二维码已失效，请重新生成。');return;}
          setMessage(result.status==='scanned'?'已扫码，请在 B站手机端确认登录。':'等待扫码…');timer=setTimeout(poll,3000);
        }catch(e){if(!abort.signal.aborted){setError(e.message);setQr(null);}}};
        timer=setTimeout(poll,2500);return()=>{abort.abort();clearTimeout(timer);};
      },[qr?.token,refresh,autoMonitor]);
      return h('section',{className:'dls-card','data-bilibili-login':true},
        h('h3',null,'B站账号'),h('p',null,status?.loggedIn?`已登录：${status.name} · UID ${status.uid}`:status?'尚未登录':'正在读取账号状态…'),
        h('p',{className:'dls-muted'},'使用专门给 DSH 准备的 B站账号扫码。登录信息单独保存在本机，页面不会显示 Cookie。'),
        h('div',{className:'dls-actions'},h('button',{className:'dls-button dls-primary',disabled:busy,onClick:startLogin},busy?'处理中…':status?.loggedIn?'更换账号':'扫码登录'),h('button',{className:'dls-button',disabled:busy,onClick:()=>refresh().catch(e=>setError(e.message))},'刷新状态'),status?.loggedIn?h('button',{className:'dls-button',disabled:busy,onClick:()=>{generation.current++;setQr(null);action('/bilibili/logout');}},'退出账号'):null),
        qr?h('div',null,h('img',{className:'dls-qr',src:qr.image,alt:'B站登录二维码'}),h('p',{className:'dls-muted'},'用 B站 App 扫码并确认，页面将自动完成登录。')):null,
        h('div',{className:'dls-hint'},
          h('label',{htmlFor:'dls-notification-session'},'视频阅读结果通知到'),
          h('select',{id:'dls-notification-session',className:'dls-input',value:session,onChange:e=>setSession(e.target.value),disabled:busy,style:{marginTop:8}},h('option',{value:''},'请选择一个 DSH 会话'),(status?.sessions||[]).map(s=>h('option',{key:s.id,value:s.id},s.title))),
          h('p',{className:'dls-muted'},status?.monitors?.length?`监测已开启，共 ${status.monitors.length} 个任务；当前间隔 ${Math.round(status.monitors[0].everySeconds/60)} 分钟。`:'监测尚未开启；没有新消息时保持安静，读完只在 DSH 通知。'),
          status&&!status.scheduleAvailable?h('p',{className:'dls-error'},'请先在插件页启用官方“自动化任务”。'):null,
          h('div',{className:'dls-actions'},h('button',{className:'dls-button',disabled:busy||!status?.loggedIn||!session||!status?.scheduleAvailable,onClick:()=>action('/bilibili/monitor/start',{sessionId:session})},status?.monitors?.length?'应用监测间隔':'开启监测'),h('button',{className:'dls-button',disabled:busy||!status?.monitors?.length,onClick:()=>action('/bilibili/monitor/stop')},'停止监测'))),
        message?h('p',{className:'dls-success',role:'status'},message):null,error?h('p',{className:'dls-error',role:'alert'},error):null);
    }
    function Page({only}){
      const [data,setData]=React.useState(null),[error,setError]=React.useState(''),[active,setActive]=React.useState(only||PACKAGES[0][0]);
      const reload=React.useCallback(async()=>{const result=await api('/configuration');setData(result);setError('');},[]);
      React.useEffect(()=>{reload().catch(e=>setError(e.message));},[reload]);
      const rows=(data?.rows||[]).filter(row=>row.packageName===active),auto=rows.find(row=>row.id==='bilibili-account')?.fields.find(f=>f.path[0]==='autoMonitor')?.value!==false;
      return h('div',{className:'dls-page'},!only?h(React.Fragment,null,h('h2',null,'本地插件'),h('p',{className:'dls-muted'},'管理本地开发插件的账号和配置。'),h('div',{className:'dls-tabs',role:'tablist','aria-label':'本地插件'},PACKAGES.map(([id,label])=>h('button',{key:id,className:'dls-tab',role:'tab','aria-selected':active===id,onClick:()=>setActive(id)},label)))):null,
        error?h('p',{className:'dls-error',role:'alert'},error):null,!data&&!error?h('p',null,'正在读取配置…'):null,
        data&&active==='@local/dsh-bilibili'?h(BilibiliAccount,{autoMonitor:auto}):null,
        rows.map(row=>h(ConfigurationCard,{key:row.id,row,reload})),
        data&&!rows.length?h('p',{className:'dls-muted'},'当前没有可配置组件，请确认该插件已启用。'):null);
    }
    function apply(ctx){
      const tag=document.createElement('style');tag.textContent=css;document.head.appendChild(tag);ctx.effect(()=>()=>tag.remove());
      ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'local-plugins',order:60,label:()=> '本地插件'},()=>h(Page,{})));
      for(const [id]of PACKAGES)ctx.slots.inject('plugins.bundle.config',()=>ctx.slots.register({name:'plugins.bundle.config',key:id},()=>h(Page,{only:id})));
    }
    return {apply,inject:['slots']};
  },
});
