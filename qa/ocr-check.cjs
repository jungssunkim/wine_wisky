const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for (const width of [360,390,412,430]) {
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button',{name:'술 추가',exact:true}).click();
  await page.getByRole('button',{name:'사진으로 술 찾기 · 영문 라벨',exact:true}).click();
  const label=page.getByRole('textbox',{name:'라벨 글자 확인·수정',exact:true});
  if(width===360) {
   const png=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=1200;c.height=420;
    const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);
    x.fillStyle='black';x.font='bold 64px Arial';x.fillText('JOHNNIE WALKER',70,110);
    x.fillText('BLACK LABEL',70,220);x.fillText('40% 700ml',70,330);
    return c.toDataURL('image/png').split(',')[1];
   });
   await page.locator('input[aria-label="라벨 사진 파일"]').setInputFiles({name:'label.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
   await page.locator('.scan-photo').waitFor();
   await page.getByRole('button',{name:'영문 라벨 읽기',exact:true}).click();
   // This is the real CDN engine and model, with no mocked OCR output.
   await page.waitForFunction(()=>/JOHNNIE/i.test(document.querySelector('.scan-query textarea')?.value??''),{},{timeout:120000});
   await page.getByRole('button',{name:'이 후보 확인 · Johnnie Walker Black Label',exact:true}).waitFor({timeout:10000});
   console.log('Real browser OCR recognised the generated English label and produced the correct candidate.');
  }
  await label.fill('Johnnie Walker Double Black');
  await page.getByRole('button',{name:'글자로 제품 후보 찾기',exact:true}).click();
  assert.equal(await page.locator('.scan-candidate').count(),0);
  await label.fill('Macallan Double Cask 12');
  await page.getByRole('button',{name:'글자로 제품 후보 찾기',exact:true}).click();
  assert.equal(await page.locator('.scan-candidate').count(),0);
  await label.fill('BALVENIE DOUBLEWOOD 17');
  await page.getByRole('button',{name:'글자로 제품 후보 찾기',exact:true}).click();
  assert.equal(await page.locator('.scan-candidate').count(),0);
  await label.fill('JOHNNIE WALKER BLACK LABEL 40% 700ml');
  await page.getByRole('button',{name:'글자로 제품 후보 찾기',exact:true}).click();
  assert.equal(await page.locator('.scan-candidate').count(),1);
  assert((await page.locator('.scan-candidate a').getAttribute('href')).startsWith('https://www.johnniewalker.com/'));
  await page.getByRole('button',{name:'이 후보 확인 · Johnnie Walker Black Label',exact:true}).click();
  assert(await page.getByRole('button',{name:'내 술장에 저장',exact:true}).isDisabled());
  assert.equal(await page.getByRole('spinbutton',{name:'도수 (%) *',exact:true}).inputValue(),'40');
  assert.equal(await page.getByRole('spinbutton',{name:'용량 (ml) *',exact:true}).inputValue(),'700');
  assert.equal(await page.getByRole('spinbutton',{name:'구매 가격 (원)',exact:true}).inputValue(),'');
  await page.getByRole('checkbox',{name:'라벨과 비교했고 이 제품이 맞습니다',exact:true}).check();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'내 술장에 저장',exact:true}).click();
  await page.getByRole('heading',{name:'나의 술장',exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'Johnnie Walker Black Label',exact:true}).last().click();
  await page.locator('.source-preview .source-link').waitFor();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('wine-wisky:cabinet:v1')).bottles.at(-1));
  assert(saved.id!=='scan-draft');assert(saved.priceIsUnknown);assert.equal(saved.sourceLinks.length,1);
  if(width===360) assert(saved.bottleImageUrl);
  const backup=await page.evaluate(async bottle=>{
   const data=await import('/src/lib/cabinetData.ts');
   let unsafeRejected=false;
   try { data.parseBackup(JSON.stringify({version:1,bottles:[{...bottle,sourceLinks:[{title:'unsafe',url:'javascript:alert(1)'}]}]})); } catch { unsafeRejected=true; }
   return {links:data.parseBackup(data.serializeBackup([bottle]))[0].sourceLinks,unsafeRejected};
  },saved);
  assert.deepEqual(backup.links,saved.sourceLinks);assert(backup.unsafeRejected);
  // Renaming to another product must not retain misleading source attribution.
  await page.getByRole('button',{name:'술 정보 수정',exact:true}).click();
  await page.getByRole('textbox',{name:'제품명 *',exact:true}).fill('다른 위스키');
  await page.getByRole('button',{name:'변경사항 저장',exact:true}).click();
  assert.equal(await page.locator('.source-preview .source-link').count(),0);
  await page.getByRole('button',{name:'뒤로',exact:true}).click();
  await page.getByRole('button',{name:'술 추가',exact:true}).click();
  await page.getByRole('button',{name:'사진으로 술 찾기 · 영문 라벨',exact:true}).click();
  await label.fill('UNKNOWN BOTTLE');
  await page.getByRole('button',{name:'글자로 제품 후보 찾기',exact:true}).click();
  await page.getByRole('button',{name:'직접 입력으로 진행',exact:true}).click();
  assert.equal(await page.getByRole('textbox',{name:'제품명 *',exact:true}).inputValue(),'UNKNOWN BOTTLE');
  assert.equal(await page.getByRole('spinbutton',{name:'도수 (%) *',exact:true}).inputValue(),'');
  assert.equal(await page.getByRole('spinbutton',{name:'용량 (ml) *',exact:true}).inputValue(),'');
  assert.deepEqual(errors,[]);
  console.log(width+'px: candidate matching, variant rejection, confirmation, real sources, persistence and manual fallback PASS');
  await page.close();
 }
 // Network failure and cancellation are deterministic, isolated tests; the smoke test above uses actual OCR.
 for(const scenario of ['failure','cancel']) {
  const page=await browser.newPage({viewport:{width:360,height:844}});
  await page.route('**/tesseract.min.js',route=>scenario==='failure'?route.abort():new Promise(resolve=>setTimeout(()=>{route.abort().then(resolve).catch(resolve)},3000)));
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button',{name:'술 추가',exact:true}).click();
  await page.getByRole('button',{name:'사진으로 술 찾기 · 영문 라벨',exact:true}).click();
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;return c.toDataURL('image/png').split(',')[1]});
  await page.locator('input[aria-label="라벨 사진 파일"]').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.locator('.scan-photo').waitFor();
  await page.getByRole('button',{name:'영문 라벨 읽기',exact:true}).click();
  if(scenario==='failure') await page.locator('.form-error').waitFor();
  else await page.getByRole('button',{name:'인식 취소',exact:true}).click();
  await page.getByRole('textbox',{name:'라벨 글자 확인·수정',exact:true}).fill('GLENFIDDICH 12');
  await page.getByRole('button',{name:'글자로 제품 후보 찾기',exact:true}).click();
  await page.getByRole('button',{name:'이 후보 확인 · Glenfiddich 12 Year Old',exact:true}).waitFor();
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
