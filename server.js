// DUO Konvooi-quiz: kleine server zonder externe packages (Node 18+).
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000, PIN=process.env.HOST_PIN||'2cv', DATA=process.env.DATA_FILE||path.join(__dirname,'data.json');
const QUESTIONS=JSON.parse(fs.readFileSync(path.join(__dirname,'questions.json'),'utf8'));
let db={state:{q:-1,rev:false,ans:'',custom:null,pause:null},subs:{},marks:{}};
try{db=JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(e){}
function save(){try{fs.writeFileSync(DATA,JSON.stringify(db))}catch(e){console.error(e.message)}}
const clients=new Set();
function pub(){return JSON.stringify({state:db.state,subs:db.subs,marks:db.marks})}
function broadcast(){const m='data: '+pub()+'\n\n';for(const c of clients)c.write(m)}
function body(req){return new Promise(r=>{let b='';req.on('data',d=>{b+=d;if(b.length>1e5)req.destroy()});req.on('end',()=>{try{r(JSON.parse(b||'{}'))}catch(e){r({})}})})}
const json=(res,o,c=200)=>{res.writeHead(c,{'content-type':'application/json'});res.end(JSON.stringify(o))};
http.createServer(async(req,res)=>{
 const url=req.url.split('?')[0];
 if(req.method==='GET'&&url==='/events'){
  res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive','x-accel-buffering':'no'});
  res.write('retry: 2000\n\ndata: '+pub()+'\n\n');clients.add(res);
  const ka=setInterval(()=>res.write(': ka\n\n'),20000);
  req.on('close',()=>{clearInterval(ka);clients.delete(res)});return;
 }
 if(req.method==='GET'&&url==='/api/questions')return json(res,QUESTIONS.map(({r,q})=>({r,q})));
 if(req.method==='POST'&&url==='/api/sub'){
  const b=await body(req);const key=String(b.key||'');
  if(!/^(q\d\d|x\d+)_t[123]$/.test(key)||typeof b.text!=='string')return json(res,{error:'bad'},400);
  const old=db.subs[key];db.subs[key]={text:b.text.slice(0,200),ms:typeof b.ms==='number'?b.ms:(old&&old.ms)};
  save();broadcast();return json(res,{ok:true});
 }
 if(req.method==='POST'&&url.startsWith('/api/host/')){
  const b=await body(req);
  if(b.pin!==PIN)return json(res,{error:'pin'},403);
  const act=url.slice(10);
  if(act==='check')return json(res,{ok:true});
  if(act==='answers'){const o={};QUESTIONS.forEach((x,i)=>o['q'+String(i).padStart(2,'0')]=x.a);return json(res,o)}
  if(act==='state'){db.state={...db.state,...b.patch};}
  else if(act==='mark'){db.marks[String(b.key)]={ok:!!b.ok}}
  else if(act==='reset'){db={state:{q:-1,rev:false,ans:'',custom:null,pause:null},subs:{},marks:{}}}
  else return json(res,{error:'?'},404);
  save();broadcast();return json(res,{ok:true});
 }
 if(req.method==='GET'){
  const f=url==='/'?'index.html':url.slice(1);const p=path.join(__dirname,'public',path.normalize(f).replace(/^(\.\.[\/\\])+/,''));
  if(p.startsWith(path.join(__dirname,'public'))&&fs.existsSync(p)&&fs.statSync(p).isFile()){
   const t={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png'}[path.extname(p)]||'application/octet-stream';
   res.writeHead(200,{'content-type':t});return fs.createReadStream(p).pipe(res)}
 }
 res.writeHead(404);res.end('niet gevonden');
}).listen(PORT,()=>console.log('DUO Konvooi-quiz op poort '+PORT+' (quizmaster-pin: '+PIN+')'));
