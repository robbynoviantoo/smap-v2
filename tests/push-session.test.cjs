const {test}=require('node:test');const assert=require('node:assert/strict');const ts=require('typescript');const vm=require('node:vm');const fs=require('node:fs');
function load(file,modules,globals={}){
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,require:name=>{if(!(name in modules))throw Error(name);return modules[name]},...globals});return exports;
}
function harness(vapidKey='B'+'a'.repeat(86)){
 const map=new Map([['token','session-a']]);const calls=[];let session='session-a';
 const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const cookies={get:()=>session,remove:()=>{session=null},set:()=>{}};
 const api={post:async(path,data)=>{calls.push({path,data})}};
 const worker={};const navigator={serviceWorker:{register:async()=>worker,ready:Promise.resolve(worker),getRegistration:async()=>({getNotifications:async()=>[]})}};
 const sdk={isSupported:async()=>true,getMessaging:()=>({}),getToken:async()=> 'device-one',deleteToken:async()=>{calls.push({deleted:true})}};
 const modules={'@/lib/api-client':api,'js-cookie':cookies,'firebase/app':{getApps:()=>[],initializeApp:()=>({})},'firebase/messaging':sdk};
 const push=load('src/services/pushService.ts',modules,{process:{env:{NEXT_PUBLIC_FIREBASE_API_KEY:'public',NEXT_PUBLIC_FIREBASE_PROJECT_ID:'test',NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:'1',NEXT_PUBLIC_FIREBASE_APP_ID:'app',NEXT_PUBLIC_FIREBASE_VAPID_KEY:vapidKey}},navigator,localStorage:storage,URLSearchParams});
 const auth=load('src/services/authService.ts',{'@/lib/api-client':api,'js-cookie':cookies,'./pushService':push},{localStorage:storage,window:{}}).authService;
 return {push,auth,calls,map,api,sdk,cookies};
}
test('token sync cannot attach to inactive/unmounted session',async()=>{const h=harness();assert.equal(await h.push.syncPushToken(()=>false),false);assert.equal(h.calls.length,0);assert.equal(await h.push.syncPushToken(()=>true),true);assert.equal(h.calls[0].path,'/fcm/save-token');assert.equal(h.calls[0].data.token,'device-one');});
test('logout includes device token before clearing local session',async()=>{const h=harness();h.map.set('smap_fcm_token','device-one');await h.auth.logout();assert.equal(h.calls[0].path,'/auth/logout');assert.equal(h.calls[0].data.fcm_token,'device-one');assert.equal(h.map.has('token'),false);assert.equal(h.map.has('smap_fcm_token'),false);});
test('failed server logout retains session so device detachment can be retried',async()=>{const h=harness();h.map.set('smap_fcm_token','device-one');h.api.post=async()=>{throw Error('offline')};await assert.rejects(h.auth.logout());assert.equal(h.map.get('token'),'session-a');assert.equal(h.map.get('smap_fcm_token'),'device-one');});
test('local Firebase cleanup failure after successful server logout still clears session',async()=>{const h=harness();h.sdk.deleteToken=async()=>{throw Error('offline')};await h.auth.logout();assert.equal(h.map.has('token'),false);});

test('Analytics measurement ID cannot be used as the Web Push key',async()=>{const h=harness('G-EXAMPLE123');assert.equal(h.push.pushConfigured,false);assert.equal(h.push.pushConfigurationError,'invalid-vapid');await assert.rejects(h.push.syncPushToken(()=>true),/push-configuration/);assert.equal(h.calls.length,0);});

test('activation memory belongs to the current account and is cleared on logout',async()=>{const h=harness();h.map.set('smap_fcm_token','device-one');h.push.rememberPushEnabled(1);assert.equal(h.push.wasPushEnabled(1),true);assert.equal(h.push.wasPushEnabled(2),false);await h.auth.logout();assert.equal(h.push.wasPushEnabled(1),false);});
