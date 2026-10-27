import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const page=await browser.newPage({viewport:{width:1200,height:800},hasTouch:true,reducedMotion:'reduce'});page.setDefaultTimeout(5000);
 await page.goto(process.env.BASE_URL||'http://localhost:3002');await page.getByRole('button',{name:'Buscar accidentes',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Búsqueda de accidentes',exact:true});
 const title=dialog.locator('.header-menu-title');const before=await dialog.boundingBox();const handle=await title.boundingBox();
 await page.mouse.move(handle.x+70,handle.y+12);await page.mouse.down();await page.mouse.move(handle.x-130,handle.y+112,{steps:5});await page.mouse.up();
 const moved=await dialog.boundingBox();assert.ok(moved.x<before.x-150&&moved.y>before.y+70,'Dragging the Atlas title must move the search window');
 await page.getByRole('textbox',{name:'Buscar accidentes geográficos',exact:true}).fill('río');
 await page.getByRole('button',{name:'Mover búsqueda del Atlas',exact:true}).focus();await page.keyboard.press('ArrowLeft');assert.ok((await dialog.boundingBox()).x<moved.x);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
 const mobile=await dialog.boundingBox();assert.ok(mobile.x>=10&&mobile.y>=10&&mobile.x+mobile.width<=380&&mobile.y+mobile.height<=834,`Resizing must keep the movable search window on screen: ${JSON.stringify(mobile)}`);
 const grip=await page.getByRole('button',{name:'Mover búsqueda del Atlas',exact:true}).boundingBox();const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:grip.x+50,y:grip.y+20}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:grip.x+50,y:grip.y+90}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.ok((await dialog.boundingBox()).y>mobile.y+40,'Touch dragging must move the search window');
 const input=page.getByRole('textbox',{name:'Buscar accidentes geográficos',exact:true});await input.fill('Ebro');
 await dialog.getByRole('button',{name:/^Río Ebro/}).click();assert.equal(await dialog.count(),0,'Selecting search results still works after dragging');
 console.log('PASS movable Atlas search with mouse, touch, keyboard, viewport constraints and result selection');
}finally{await browser.close();}
