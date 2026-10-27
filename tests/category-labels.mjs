import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});page.setDefaultTimeout(5000);
 await page.goto(process.env.BASE_URL||'http://localhost:3002');
 const map=page.locator('[data-map-canvas]');const labels=()=>map.locator('text').allTextContents();
 assert.ok((await labels()).some(t=>t.includes('Río Ebro')));
 const openLayers=()=>page.getByRole('button',{name:'Capas del Mapa',exact:true}).click();
 const closeLayers=()=>page.getByRole('button',{name:'Aplicar y Volver al Mapa',exact:true}).click();
 await openLayers();
 const river=page.getByRole('checkbox',{name:'Textos: Ríos de España',exact:true});
 assert.equal(await river.count(),1,'Category labels need an individual control');
 await river.uncheck();await closeLayers();
 assert.equal((await labels()).some(t=>t.includes('Río Ebro')),false);
 assert.ok((await labels()).some(t=>t.includes('Río Sil')),'Tributary labels are independent of rivers');
 assert.ok((await labels()).some(t=>t.includes('Pirineos')),'Hiding river labels must retain relief names');
 await openLayers();await page.getByRole('button',{name:/^Afluentes Ríos que/}).click();
 const tributary=page.getByRole('checkbox',{name:'Textos: Afluentes',exact:true});assert.equal(await tributary.isDisabled(),true);
 await page.getByRole('button',{name:/^Afluentes Ríos que/}).click();assert.equal(await tributary.isDisabled(),false);
 const master=page.getByRole('button',{name:'Mostrar textos en el mapa',exact:true});await master.click();await closeLayers();assert.equal(await map.locator('text').count(),0);
 await openLayers();await page.getByRole('button',{name:'Mostrar textos en el mapa',exact:true}).click();assert.equal(await river.isChecked(),false);await closeLayers();
 assert.equal((await labels()).some(t=>t.includes('Río Ebro')),false);assert.ok((await labels()).some(t=>t.includes('Río Sil')));
 await page.getByRole('button',{name:'Ocultar Atlas',exact:true}).click();assert.equal(await page.locator('.explore-panel').isVisible(),false);
 await page.getByRole('button',{name:'Subopciones de visibilidad',exact:true}).click();await page.getByRole('dialog',{name:'Visibilidad',exact:true}).getByRole('button',{name:'Atlas',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('.explore-panel').isVisible(),true);
 await page.getByRole('button',{name:'60 segundos contrarreloj',exact:true}).click();assert.equal(await map.locator('text').filter({hasText:/Río Ebro|Pirineos/}).count(),0,'Games still start without geographic names');
 console.log('PASS category label selection, disabled layers, global mute memory, direct panel hide and timed blank map');
}finally{await browser.close();}
