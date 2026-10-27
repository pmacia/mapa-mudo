import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});page.setDefaultTimeout(5000);
 const base=process.env.BASE_URL||'http://localhost:3002';await page.goto(base);
 assert.equal(await page.locator('link[rel="icon"][type="image/svg+xml"]').count(),1,'Browser needs an explicit scalable favicon');
 for(const path of ['/icons/favicon.svg','/favicon.ico','/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon.png']){
  const response=await page.request.get(base+path);assert.equal(response.ok(),true,path);const body=await response.body();assert.ok(body.length>100,path);assert.ok(response.headers()['content-type'].includes(path.endsWith('.svg')?'image/svg+xml':path.endsWith('.ico')?'image/':'image/png'),path);if(path.endsWith('.png')){const size=path.includes('192')?192:path.includes('512')?512:180;assert.equal(body.readUInt32BE(16),size);assert.equal(body.readUInt32BE(20),size);}if(path.endsWith('.ico'))assert.equal(body.readUInt16LE(2),1);
 }
 const openManual=async()=>{await page.getByRole('button',{name:'Más herramientas',exact:true}).click();await page.getByRole('button',{name:/Manual de juego/}).click();};
 await openManual();await page.getByRole('button',{name:'Interfaz y controles',exact:true}).click();
 const manual=page.getByRole('dialog',{name:'Manual del Juego y Guía Didáctica',exact:true});
 assert.ok(await manual.getByText(/ojo tachado.*todos/i).count()>0);assert.ok(await manual.getByText(/arrastr/i).count()>0);
 await manual.getByRole('button',{name:'Capas y Cartografía',exact:true}).click();assert.ok(await manual.getByText(/Textos por tipo de accidente/).count()>0);
 await manual.getByRole('button',{name:'Edición y atajos',exact:true}).click();assert.ok(await manual.getByText('Ctrl / Cmd + S',{exact:true}).count()>0);
 await page.keyboard.press('Escape');assert.equal(await manual.count(),0,'Escape closes the manual');await page.getByRole('button',{name:'Modo Ubicar en el mapa',exact:true}).click();
 assert.ok((await page.getByRole('button',{name:'Pista',exact:true}).getAttribute('title')).includes('10'));
 assert.equal(await page.getByRole('button',{name:'Mover panel reto',exact:true}).getAttribute('title'),'Arrastra para mover · Flechas del teclado para ajustar');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByRole('button',{name:'60 segundos contrarreloj',exact:true}).click();
 const attempts=()=>page.locator('.timed-stats [title="Aciertos"],.timed-stats [title="Fallos"]').allInnerTexts().then(items=>items.map(t=>Number(t.match(/\d+/)?.[0])).reduce((a,b)=>a+b,0));
 const beforeHelp=await attempts();await openManual();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(100);assert.equal(await attempts(),beforeHelp,'Reading the manual must not submit timed answers with arrow keys');
 await page.keyboard.press('Escape');
 console.log('PASS favicon assets, current manual sections, editor shortcuts and accurate contextual hint help');
}finally{await browser.close();}
