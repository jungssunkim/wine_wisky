const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve('dist');
const prefix = '/wine_wisky/';
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
(async()=>{
 const server=http.createServer(async(req,res)=>{
  try {
   const pathname=new URL(req.url,'http://127.0.0.1').pathname;
   if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
   const relative=decodeURIComponent(pathname.slice(prefix.length)) || 'index.html';
   const file=path.resolve(root,relative);
   if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   const body=await fs.readFile(file);
   res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream'});res.end(body);
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const width of [360,390,412,430]){
   const page=await browser.newPage({viewport:{width,height:844}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status());});
   await page.goto('http://127.0.0.1:4173'+prefix);
   await page.getByRole('heading',{name:'나의 술장',exact:true}).waitFor();
   assert(await page.locator('.shelf .bottle-item').count()>0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'/tmp/wine-production-'+width+'.png',fullPage:true});
   await page.getByRole('button',{name:'기록',exact:true}).click();
   await page.getByRole('heading',{name:'비워낸 기록',exact:true}).waitFor();
   await page.getByRole('button',{name:'페어링',exact:true}).click();
   await page.getByRole('heading',{name:'음식과 한 잔',exact:true}).waitFor();
   await page.getByRole('button',{name:'술 추가',exact:true}).click();
   await page.getByRole('button',{name:'내 술 직접 등록 · 사진 첨부',exact:true}).waitFor();
   await page.reload();
   await page.getByRole('heading',{name:'나의 술장',exact:true}).waitFor();
   assert.deepEqual(errors,[]);
   console.log(width+'px: production assets, repository subpath, navigation, refresh and overflow PASS');
   await page.close();
  }
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exit(1)});
