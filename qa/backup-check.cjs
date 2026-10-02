const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const KEY='wine-wisky:cabinet:v1';
const RECOVERY='wine-wisky:recovery:v1';
async function exported(page,button='백업 파일 저장') {
 const waiting=page.waitForEvent('download');
 await page.getByRole('button',{name:button,exact:true}).click();
 const download=await waiting;
 const stream=await download.createReadStream();
 const chunks=[]; for await (const chunk of stream) chunks.push(chunk);
 return Buffer.concat(chunks).toString('utf8');
}
async function select(page,data,name='cabinet.json') {
 await page.locator('input[aria-label="술장 백업 파일"]').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))});
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for (const width of [360,390,412,430]) {
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button',{name:'백업·복원',exact:true}).click();
  const seed=JSON.parse(await exported(page));
  assert.equal(seed.format,'wine-wisky-cabinet');assert.equal(seed.version,1);
  assert.equal(seed.bottles.length,8);
  await page.evaluate(({key,seed})=>{
   const canvas=document.createElement('canvas');canvas.width=20;canvas.height=40;
   const ctx=canvas.getContext('2d');ctx.fillStyle='#ba8c55';ctx.fillRect(0,0,20,40);
   seed.bottles[0].bottleImageUrl=canvas.toDataURL('image/png');
   seed.bottles[0].rating=0;seed.bottles[0].tastingNote='내 백업 메모';
   seed.bottles[0].priceIsUnknown=true;seed.bottles[0].entrySource='manual';
   localStorage.setItem(key,JSON.stringify({version:1,bottles:seed.bottles}));
  },{key:KEY,seed});
  await page.reload();
  await page.getByRole('button',{name:'백업·복원',exact:true}).click();
  const original=JSON.parse(await exported(page));
  assert.equal(original.bottles[0].rating,0);
  assert.equal(original.bottles[0].tastingNote,'내 백업 메모');
  assert(original.bottles[0].bottleImageUrl.startsWith('data:image/png;base64,'));
  const incoming={...original,bottles:[...original.bottles.map((b,i)=>i?b:{...b,name:'덮어쓰면 안 되는 이름'}),{...original.bottles[0],id:'import-new',name:'새로 가져올 술',shortName:'새로 가져올 술'}]};
  await select(page,incoming);
  await page.getByRole('heading',{name:'복원 미리보기'}).waitFor();
  assert(await page.getByRole('radio',{name:'현재 술장에 추가',exact:true}).isChecked());
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).bottles.length,KEY),8);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const small=await page.locator('button,.restore-options label,.restore-confirm').evaluateAll(els=>els.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.width<44||r.height<44)}).map(e=>e.textContent));
  assert.deepEqual(small,[]);
  await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).click();
  await page.getByText('1병을 추가했어요.',{exact:true}).waitFor();
  const merged=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).bottles,KEY);
  assert.equal(merged.length,9);assert.equal(merged[0].name,original.bottles[0].name);
  await select(page,incoming);
  await page.getByRole('heading',{name:'복원 미리보기'}).waitFor();
  assert(await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).isDisabled());
  await page.getByRole('button',{name:'복원 취소',exact:true}).click();
  const single={...original,bottles:[{...original.bottles[0],unexpected:'discard this'}]};
  await select(page,single);
  await page.getByRole('radio',{name:'백업 내용으로 교체',exact:true}).check();
  assert(await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).isDisabled());
  await page.getByRole('checkbox',{name:'현재 데이터가 교체되는 것을 확인했습니다'}).check();
  await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).click();
  await page.getByText('1병으로 술장을 복원했어요.',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'백업·복원',exact:true}).click();
  assert.deepEqual(JSON.parse(await exported(page)).bottles,[original.bottles[0]]);
  const empty={...original,bottles:[]};
  await select(page,empty);
  await page.getByRole('radio',{name:'백업 내용으로 교체',exact:true}).check();
  await page.getByRole('button',{name:'복원 취소',exact:true}).click();
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).bottles.length,KEY),1);
  await select(page,empty);
  await page.getByRole('radio',{name:'백업 내용으로 교체',exact:true}).check();
  await page.getByRole('checkbox',{name:'현재 데이터가 교체되는 것을 확인했습니다'}).check();
  await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).click();
  await page.getByText('0병으로 술장을 복원했어요.',{exact:true}).waitFor();
  const unchanged=await page.evaluate(key=>localStorage.getItem(key),KEY);
  for (const bad of ['{broken',{...original,version:99},{...original,format:'other-app'},
    {...original,bottles:[original.bottles[0],original.bottles[0]]},
    {...original,bottles:[{...original.bottles[0],abv:'forty'}]},
    {...original,bottles:[{...original.bottles[0],bottleImageUrl:'https://example.com/photo.jpg'}]}]) {
   await select(page,bad);
   await page.locator('.form-error').waitFor();
   assert.equal(await page.locator('.backup-preview').count(),0);
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),unchanged);
  }
  await page.locator('input[aria-label="술장 백업 파일"]').setInputFiles({name:'too-large.json',mimeType:'application/json',buffer:Buffer.alloc(10*1024*1024+1)});
  await page.getByText('10MB 이하의 백업 파일을 선택해 주세요.',{exact:true}).waitFor();
  await select(page,original);
  await page.getByRole('heading',{name:'복원 미리보기'}).waitFor();
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Full','QuotaExceededError')};});
  await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).click();
  await page.getByText('복원하지 못했어요. 기존 술장은 그대로입니다. 저장 공간과 상단 안내를 확인해 주세요.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),unchanged);
  await page.reload();
  await page.evaluate(key=>localStorage.setItem(key,'{broken original'),KEY);
  await page.reload();
  await page.getByRole('button',{name:'백업·복원',exact:true}).click();
  assert(await page.getByRole('button',{name:'백업 파일 저장',exact:true}).isDisabled());
  assert.equal(await exported(page,'읽지 못한 원본 파일 저장'),'{broken original');
  await select(page,original);
  await page.getByRole('heading',{name:'복원 미리보기'}).waitFor();
  assert(await page.getByRole('radio',{name:'현재 술장에 추가',exact:true}).isDisabled());
  await page.getByRole('checkbox',{name:'현재 데이터가 교체되는 것을 확인했습니다'}).check();
  await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).click();
  await page.getByText('8병으로 술장을 복원했어요.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),RECOVERY),'{broken original');
  assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).bottles,KEY),original.bottles);
  await select(page,incoming);
  await page.getByRole('heading',{name:'복원 미리보기'}).waitFor();
  const otherTab=JSON.stringify({version:1,bottles:[]});
  await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:KEY,value:otherTab});
  await page.getByRole('button',{name:'이 내용으로 복원',exact:true}).click();
  await page.locator('.storage-alert').waitFor();
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),otherTab);
  assert.deepEqual(errors,[]);
  console.log(width+'px: backup photo/journal roundtrip, merge/dedup, confirmed replace/cancel/empty, invalid files, quota, damaged-data recovery and stale-write protection PASS');
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
