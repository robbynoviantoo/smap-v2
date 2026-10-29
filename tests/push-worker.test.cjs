const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');

function worker(){
 const events={},shown=[],actions=[];let background;
 const client={url:'https://app.example.test/assets',navigate:async url=>actions.push(['navigate',url]),focus:async()=>actions.push(['focus'])};
 const self={location:{origin:'https://app.example.test',search:'?apiKey=test&projectId=test&messagingSenderId=1&appId=test'},navigator:{setAppBadge:async count=>actions.push(['badge',count]),clearAppBadge:async()=>actions.push(['clearBadge'])},registration:{showNotification:async(title,options)=>shown.push({title,...options})},clients:{matchAll:async()=>[client],openWindow:async url=>actions.push(['open',url]),claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(readFileSync('public/sw.js','utf8'),{self,URL,URLSearchParams,Promise,importScripts:()=>{},firebase:{initializeApp:()=>{},messaging:()=>({onBackgroundMessage:fn=>background=fn})}});
 return {events,shown,actions,background};
}
test('data-only background push displays once and resets zero badge',async()=>{
 const w=worker();await w.background({messageId:'one',data:{title:'Approval',body:'Review required',badge_count:'0',url:'/approvals/asset-pendings'}});
 assert.equal(w.shown.length,1);assert.equal(w.shown[0].title,'Approval');assert.equal(w.shown[0].body,'Review required');assert.equal(w.actions[0][0],'clearBadge');
});
test('click navigates and focuses app; external payload URL cannot open another origin',async()=>{
 for(const [url,target] of [['/approvals','https://app.example.test/approvals'],['https://evil.example/','https://app.example.test/'],['http://','https://app.example.test/']]){
 const w=worker();let done;w.events.notificationclick({notification:{data:{url},close:()=>{}},waitUntil:p=>done=p});await done;assert.equal(w.actions[0][1],target);assert.equal(w.actions[1][0],'focus');
 }
});
