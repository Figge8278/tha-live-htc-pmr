(() => {
  const SESSIONS='tha-walkthrough-sessions';
  const CURRENT='tha-current-walkthrough-id';
  const SIDECARS='tha-v357-snapshot-sidecars';
  const STORE='tha-v357-required-home-references';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const obj=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  function apply(){const sessions=read(SESSIONS,{});const id=localStorage.getItem(CURRENT)||'';if(!id||!sessions[id]?.data)return;const refs=obj(read(STORE,{})[id]);if(!Object.keys(refs).length)return;const data=sessions[id].data;data.intake={...obj(data.intake),...refs};data.administration={...obj(data.administration),requiredHomeReferences:{electricalPanel:{value:refs.electricalPanel||'',status:refs.electricalPanel?'Recorded':'Not acknowledged'},waterShutoff:{value:refs.waterShutoff||'',status:refs.waterShutoff?'Recorded':'Not acknowledged'},gasService:{value:refs.gasService||'',status:/not applicable|no gas|all electric/i.test(refs.gasService||'')?'Not applicable acknowledged':refs.gasService?'Recorded':'Not acknowledged'}}};write(SESSIONS,sessions);const sidecars=read(SIDECARS,{});const original=sidecars[id]?.originalSnapshot;if(original?.data){original.data.intake={...obj(original.data.intake),...refs};original.data.administration={...obj(original.data.administration),requiredHomeReferences:data.administration.requiredHomeReferences};original.updatedAt=new Date().toISOString();sidecars[id].updatedAt=original.updatedAt;write(SIDECARS,sidecars)}}
  document.addEventListener('click',event=>{const button=event.target.closest('button,a');if(!button)return;if(/save local session|save drive package|download.*snapshot|download pmr|print pmr/i.test(button.textContent||''))apply()},true);
  window.addEventListener('pagehide',apply);
})();
