const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const KEY = 'wine-wisky:cabinet:v1';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [360,390,412,430]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  // Unknown OCR candidate must remain visible AND exportable.
  await page.getByRole('button',{name:'술 추가',exact:true}).click();
  await page.getByRole('button',{name:'사진으로 술 찾기 · 영문 라벨',exact:true}).click();
  await page.getByRole('textbox',{name:'라벨 글자 확인·수정',exact:true}).fill('UNKNOWN BOTTLE 40% 700ml');
  await page.getByRole('button',{name:'글자로 제품 후보 찾기',exact:true}).click();
  await page.getByRole('button',{name:'직접 입력으로 진행',exact:true}).click();
  await page.getByRole('button',{name:'내 술장에 저장',exact:true}).click();
  await page.getByRole('heading',{name:'나의 술장',exact:true}).waitFor();
  const saved=await page.evaluate(async key=>{
   const bottles=JSON.parse(localStorage.getItem(key)).bottles;
   const {serializeBackup,parseBackup}=await import('/src/lib/cabinetData.ts');
   return parseBackup(serializeBackup(bottles)).at(-1);
  },KEY);
  assert.equal(saved.shortName,'UNKNOWN BOTTLE 40% 700ml');
  // Reproduce legacy broken shortName; reading repairs it without losing the bottle.
  await page.evaluate(key=>{const d=JSON.parse(localStorage.getItem(key));d.bottles.at(-1).shortName='';localStorage.setItem(key,JSON.stringify(d));},KEY);
  await page.reload();
  await page.getByRole('button',{name:'UNKNOWN BOTTLE 40% 700ml',exact:true}).getByText('UNKNOWN BOTTLE 40% 700ml',{exact:true}).last().waitFor();
  await page.getByRole('button',{name:'백업·복원',exact:true}).click();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'백업 파일 저장',exact:true}).click();
  assert((await downloadPromise).suggestedFilename().endsWith('.json'));
  await page.getByRole('button',{name:'술장으로 돌아가기',exact:true}).click();
  // Cabinet filter/sort/query survive the detail roundtrip.
  await page.getByRole('button',{name:'위스키',exact:true}).click();
  await page.getByRole('textbox',{name:'술 검색',exact:true}).fill('Balvenie');
  await page.getByRole('combobox',{name:'정렬',exact:true}).selectOption('rating');
  await page.getByRole('button',{name:'The Balvenie DoubleWood 12',exact:true}).click();
  // Editing journal then leaving is explicitly rejectable.
  await page.getByRole('textbox',{name:'시음 메모',exact:true}).fill('완병과 함께 저장할 메모');
  await page.getByRole('spinbutton',{name:'내 평점 (0~5)',exact:true}).fill('4.8');
  page.once('dialog',d=>d.dismiss());
  await page.getByRole('button',{name:'뒤로',exact:true}).click();
  await page.getByRole('heading',{name:'한 병의 이야기',exact:true}).waitFor();
  await page.getByRole('button',{name:'다 마신 술로 기록',exact:true}).click();
  await page.getByRole('button',{name:'네, 다 마셨어요',exact:true}).click();
  let record=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).bottles.find(b=>b.name==='The Balvenie DoubleWood 12'),KEY);
  assert.equal(record.tastingNote,'완병과 함께 저장할 메모');assert.equal(record.rating,4.8);assert.equal(record.status,'finished');
  await page.getByRole('button',{name:'뒤로',exact:true}).click();
  assert.equal(await page.getByRole('textbox',{name:'술 검색',exact:true}).inputValue(),'Balvenie');
  assert.equal(await page.getByRole('combobox',{name:'정렬',exact:true}).inputValue(),'rating');
  assert.equal(await page.getByRole('button',{name:'위스키',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'기록',exact:true}).click();
  await page.getByRole('textbox',{name:'기록 검색',exact:true}).fill('완병과 함께');
  await page.getByRole('combobox',{name:'정렬',exact:true}).selectOption('name');
  await page.getByRole('button',{name:'The Balvenie DoubleWood 12',exact:true}).click();
  await page.getByRole('button',{name:'뒤로',exact:true}).click();
  assert.equal(await page.getByRole('textbox',{name:'기록 검색',exact:true}).inputValue(),'완병과 함께');
  assert.equal(await page.getByRole('combobox',{name:'정렬',exact:true}).inputValue(),'name');
  await page.getByRole('button',{name:'페어링',exact:true}).click();
  await page.getByRole('textbox',{name:'페어링할 음식',exact:true}).fill('치즈');
  await page.getByRole('button',{name:'추천',exact:true}).click();
  await page.locator('.pairing-card').first().click();
  await page.getByRole('button',{name:'뒤로',exact:true}).click();
  assert.equal(await page.getByRole('textbox',{name:'페어링할 음식',exact:true}).inputValue(),'치즈');
  assert(await page.locator('.pairing-card').count()>0);
  // Register draft -> reject leaving -> draft stays -> accept leaving -> discarded.
  await page.getByRole('button',{name:'술 추가',exact:true}).click();
  await page.getByRole('button',{name:'내 술 직접 등록 · 사진 첨부',exact:true}).click();
  await page.getByRole('textbox',{name:'제품명 *',exact:true}).fill('작성 중인 병');
  page.once('dialog',d=>d.dismiss());
  await page.getByRole('button',{name:'술장',exact:true}).click();
  assert.equal(await page.getByRole('textbox',{name:'제품명 *',exact:true}).inputValue(),'작성 중인 병');
  assert(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;}));
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:'술장',exact:true}).click();
  await page.getByRole('heading',{name:'나의 술장',exact:true}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log(width+'px: unknown OCR backup/legacy repair, leave guard, atomic finish journal, retained search/filter/sort/pairing PASS');
  await page.close();
 }
 // Native worker ownership must allow termination while *any* stage is pending.
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5173');
 const workerChecks=await page.evaluate(async()=>{
  const {readLabel}=await import('/src/lib/labelOcr.ts');
  const Native=window.Worker;
  const results=[];
  for(const stage of ['load','loadLanguage','initialize','recognize']){
   for(const failure of [false,true]){
    let created=0,terminated=0,resolveStage;
    const reached=new Promise(resolve=>{resolveStage=resolve;});
    window.Worker=class {
     constructor(){created++;}
     terminate(){terminated++;}
     postMessage(packet){
      queueMicrotask(()=>{
       if(packet.action===stage){
        resolveStage();
        if(failure)this.onmessage?.({data:{...packet,status:'reject',data:'network failure'}});
       }else this.onmessage?.({data:{...packet,status:'resolve',data:{}}});
      });
     }
    };
    const task=readLabel('data:image/jpeg;base64,AAAA',()=>{});
    const outcome=task.promise.then(()=>false,()=>true);
    await reached;
    if(!failure)task.cancel();
    const rejected=await outcome;
    results.push({stage,failure,created,terminated,rejected});
   }
  }
  window.Worker=Native;
  return results;
 });
 for(const r of workerChecks){assert.equal(r.created,1);assert.equal(r.terminated,1);assert(r.rejected);}
 console.log('OCR cancellation/failure terminates native workers during load, model download, initialization and recognition PASS');
 await page.close();await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
