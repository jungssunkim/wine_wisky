const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const KEY='wine-wisky:cabinet:v1';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [360,390,412,430]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await page.evaluate(key=>{
   const b={brand:'Test',category:'wine',country:'France',abv:12,volumeMl:750,price:0,note:'',shape:'wine',tone:'ruby',status:'owned',pairings:['치즈']};
   localStorage.setItem(key,JSON.stringify({version:1,bottles:[
    {...b,id:'c',name:'C 와인',shortName:'C 와인',price:30,rating:3},
    {...b,id:'a',name:'A 와인',shortName:'A 와인',price:0,rating:0},
    {...b,id:'b',name:'B 와인',shortName:'B 와인',priceIsUnknown:true},
    {...b,id:'h',name:'기록 와인',shortName:'기록 와인',status:'finished',finishedAt:'2026.10.03',tastingNote:'살구 향'}
   ]}));
  },KEY);
  await page.reload();
  const order=()=>page.locator('.shelf .bottle-item').evaluateAll(els=>els.map(e=>e.getAttribute('aria-label')));
  await page.getByLabel('정렬',{exact:true}).selectOption('name');
  assert.deepEqual(await order(),['A 와인','B 와인','C 와인']);
  await page.getByLabel('정렬',{exact:true}).selectOption('price-low');
  assert.deepEqual(await order(),['A 와인','C 와인','B 와인']);
  await page.getByLabel('정렬',{exact:true}).selectOption('price-high');
  assert.deepEqual(await order(),['C 와인','A 와인','B 와인']);
  await page.getByLabel('정렬',{exact:true}).selectOption('rating');
  assert.deepEqual(await order(),['C 와인','A 와인','B 와인']);
  await page.getByRole('button',{name:'A 와인',exact:true}).click();
  await page.getByRole('button',{name:'술 정보 수정',exact:true}).click();
  await page.getByLabel('구매일',{exact:true}).fill('2024-02-29');
  await page.getByLabel('구매처',{exact:true}).fill('동네 와인 가게');
  await page.getByLabel('숙성 연수 (년)',{exact:true}).fill('12');
  await page.getByLabel('빈티지 (연도)',{exact:true}).fill('2020');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'변경사항 저장',exact:true}).click();
  await page.getByText('동네 와인 가게',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'A 와인',exact:true}).click();
  await page.getByText('2024-02-29',{exact:true}).waitFor();
  const checks=await page.evaluate(async key=>{
   const {serializeBackup,parseBackup}=await import('/src/lib/cabinetData.ts');
   const bottles=JSON.parse(localStorage.getItem(key)).bottles;
   const saved=parseBackup(serializeBackup(bottles)).find(b=>b.id==='a');
   const invalid=['2023-02-29','2024-13-01','not-a-date'].every(purchaseDate=>{
    try{parseBackup(JSON.stringify({version:1,bottles:[{...saved,purchaseDate}]}));return false;}catch{return true;}
   });
   return {saved,invalid};
  },KEY);
  assert.equal(checks.saved.ageYears,12);assert.equal(checks.saved.vintage,2020);assert(checks.invalid);
  await page.getByRole('button',{name:'술 정보 수정',exact:true}).click();
  await page.getByLabel('숙성 연수 (년)',{exact:true}).fill('');
  await page.getByLabel('빈티지 (연도)',{exact:true}).fill('');
  await page.getByRole('button',{name:'변경사항 저장',exact:true}).click();
  const blank=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).bottles.find(b=>b.id==='a'),KEY);
  assert.equal(blank.ageYears,undefined);assert.equal(blank.vintage,undefined);
  await page.getByRole('button',{name:'잘못 등록한 병 삭제',exact:true}).click();
  await page.getByRole('button',{name:'삭제 취소',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'사진·기록까지 삭제',exact:true}).count(),0);
  await page.getByRole('button',{name:'잘못 등록한 병 삭제',exact:true}).click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('Full','QuotaExceededError')};});
  await page.getByRole('button',{name:'사진·기록까지 삭제',exact:true}).click();
  await page.getByText('삭제하지 못했어요. 기존 병과 기록은 유지됩니다.',{exact:true}).waitFor();
  assert(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).bottles.some(b=>b.id==='a'),KEY));
  await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem;});
  await page.getByRole('button',{name:'사진·기록까지 삭제',exact:true}).click();
  await page.getByRole('heading',{name:'나의 술장',exact:true}).waitFor();
  await page.reload();assert.equal(await page.getByRole('button',{name:'A 와인',exact:true}).count(),0);
  await page.getByRole('button',{name:'기록',exact:true}).click();
  await page.getByLabel('기록 검색',{exact:true}).fill('살구');
  assert.equal(await page.locator('.empty-card').count(),1);
  await page.getByLabel('기록 검색',{exact:true}).fill('없는 술');
  await page.getByText('검색에 맞는 기록이 없어요.',{exact:true}).waitFor();
  await page.getByLabel('기록 검색',{exact:true}).fill('');
  await page.getByRole('button',{name:'기록 와인',exact:true}).click();
  await page.getByRole('button',{name:'잘못 등록한 병 삭제',exact:true}).click();
  // Concurrent-tab changes must prevent deletion.
  await page.evaluate(key=>{const d=JSON.parse(localStorage.getItem(key));d.bottles[0].note='other tab';localStorage.setItem(key,JSON.stringify(d));},KEY);
  await page.getByRole('button',{name:'사진·기록까지 삭제',exact:true}).click();
  await page.getByText('삭제하지 못했어요. 기존 병과 기록은 유지됩니다.',{exact:true}).waitFor();
  await page.reload();await page.getByRole('button',{name:'기록',exact:true}).click();
  await page.getByRole('button',{name:'기록 와인',exact:true}).click();
  await page.getByRole('button',{name:'잘못 등록한 병 삭제',exact:true}).click();
  await page.getByRole('button',{name:'사진·기록까지 삭제',exact:true}).click();
  await page.getByRole('heading',{name:'비워낸 기록',exact:true}).waitFor();
  await page.getByText('아직 비워낸 병이 없어요.',{exact:false}).waitFor();
  assert.deepEqual(errors,[]);
  console.log(width+'px: metadata persistence/backup, validation, clear optional fields, sorting, History search, confirmed deletion/cancel/quota/stale-write PASS');
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
