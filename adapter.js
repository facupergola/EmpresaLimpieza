// Capa que reemplaza claude.use("user"/"db") por Supabase (login real + base de datos + realtime).
(function(){
const C=window.APP_CONFIG,sb=supabase.createClient(C.url,C.key);let session=null,admin=false;
const boot=(async()=>{const{data}=await sb.auth.getSession();session=data.session;
 if(session){const r=await sb.rpc("is_admin");admin=r.data===true}})();
const chk=r=>{if(r.error)throw r.error;if(r.data&&!r.data.length)throw new Error("Sin permiso")};
const live=(name,t,run)=>sb.channel(name+Math.random()).on("postgres_changes",{event:"*",schema:"public",table:t},run).subscribe();
function coll(t,o={}){return{
 orderBy:(f,d)=>coll(t,{...o,f,d}),limit:n=>coll(t,{...o,n}),
 add:async v=>{const r=await sb.from(t).insert(v);if(r.error)throw r.error},
 onSnapshot(cb){const run=async()=>{let q=sb.from(t).select("*");if(o.f)q=q.order(o.f,{ascending:o.d==="asc"});if(o.n)q=q.limit(o.n);
  const{data}=await q;cb({docs:(data||[]).map(r=>({id:r.id,data:()=>r}))})};run();live(t,t,run)}}}
function docRef(p){const[t,id]=p.split("/");return{
 set:async v=>{const r=await sb.from(t).upsert({id,...v});if(r.error)throw r.error},
 update:async v=>chk(await sb.from(t).update(v).eq("id",id).select()),
 delete:async()=>chk(await sb.from(t).delete().eq("id",id).select()),
 onSnapshot(cb){const run=async()=>{const{data}=await sb.from(t).select("*").eq("id",id).maybeSingle();cb({data:()=>data})};run();live(p,t,run)}}}
window.claude={use:async k=>{await boot;
 if(k==="user")return session?{id:async()=>session.user.id,canEdit:()=>admin}:null;
 if(k==="db"){if(!session)throw new Error("no session");return{collection:coll,doc:docRef}}}};
window.doLogin=async()=>{const m=document.getElementById("lg_m"),e=document.getElementById("lg_e").value.trim(),p=document.getElementById("lg_p").value;
 const{error}=await sb.auth.signInWithPassword({email:e,password:p});
 if(error)m.innerHTML='<div class="msg err">Email o contraseña incorrectos.</div>';else location.reload()};
window.doLogout=async()=>{await sb.auth.signOut();location.reload()};
})();
