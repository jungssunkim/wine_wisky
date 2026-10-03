const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const KEY = 'wine-wisky:cabinet:v1';
(async () => {
 const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
 for (const width of [360,390,412,430]) {
  const page = await browser.newPage({viewport:{width,height:844}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await page.evaluate(key => {
   const base={brand:'Test',category:'wine',country:'France',abv:12,volumeMl:750,price:0,note:'',shape:'wine',tone:'ruby',status:'owned'};
   const bottles=Array.from({length:4},(_,i)=>({...base,id:'pair-'+i,name:'테스트 와인 '+i,shortName:'와인 '+i,pairings:[i===0?'Cheese':'치즈','삼 겹 살']}));
   bottles.push({...base,id:'finished',name:'빈 병',shortName:'빈 병',status:'finished',pairings:['치즈','피자']});
   localStorage.setItem(key,JSON.stringify({version:1,bottles}));
  },KEY);
  await page.reload();
  await page.getByRole('button',{name:'페어링',exact:true}).click();
  assert.equal(await page.locator('.pairing-card').count(),4);
  assert.equal(await page.locator('.food-chip').count(),2);
  assert.equal(await page.getByRole('button',{name:'피자',exact:true}).count(),0);
  const search=async value=>{
   await page.getByRole('textbox',{name:'페어링할 음식'}).fill(value);
   await page.getByRole('button',{name:'추천',exact:true}).click();
  };
  await search('  ＣＨＥＥＳＥ  ');
  assert.equal(await page.locator('.pairing-card').count(),4);
  await page.locator('.pairing-card').first().getByText('등록한 음식: Cheese').waitFor();
  await search('즈'); assert.equal(await page.locator('.pairing-card').count(),0);
  await search('치즈케이크'); assert.equal(await page.locator('.pairing-card').count(),0);
  await search('  '); await page.getByText('음식 이름을 입력해 주세요.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Cheese',exact:true}).click();
  assert.equal(await page.locator('.pairing-card').count(),4);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const small=await page.locator('.food-chip').evaluateAll(els=>els.some(e=>e.getBoundingClientRect().height<44));
  assert.equal(small,false);
  await page.locator('.pairing-card').first().click();
  await page.getByRole('heading',{name:'테스트 와인 0',exact:true}).waitFor();
  await page.getByRole('button',{name:'뒤로',exact:true}).click();
  await page.getByRole('heading',{name:'음식과 한 잔'}).waitFor();
  await page.evaluate(key=>{
   const d=JSON.parse(localStorage.getItem(key)); d.bottles=d.bottles.filter(b=>b.status==='owned').map(b=>({...b,pairings:[]}));
   localStorage.setItem(key,JSON.stringify(d));
  },KEY);
  await page.reload(); await page.getByRole('button',{name:'페어링',exact:true}).click();
  await page.getByText('등록된 페어링 음식이 없어요.',{exact:false}).waitFor();
  await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:1,bottles:[]})),KEY);
  await page.reload(); await page.getByRole('button',{name:'페어링',exact:true}).click();
  await page.getByText('보유 중인 술이 없어요.',{exact:false}).waitFor();
  assert.deepEqual(errors,[]);
  console.log(width+'px: food aliases, all matches, partial-name rejection, owned-only chips, empty states and detail navigation PASS');
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
