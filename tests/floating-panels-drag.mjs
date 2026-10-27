import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const page=await browser.newPage({viewport:{width:1200,height:900},hasTouch:true,reducedMotion:'reduce'});page.setDefaultTimeout(5000);
 await page.goto(process.env.BASE_URL||'http://localhost:3002');
 const panel=page.locator('.companion-region');const toolbar=panel.locator('.region-toolbar');
 const start=await panel.boundingBox();const title=await toolbar.boundingBox();const map=page.locator('[data-map-canvas]');const framing=await map.getAttribute('viewBox');
 await page.mouse.move(title.x+60,title.y+20);await page.mouse.down();await page.mouse.move(title.x-140,title.y+50,{steps:4});await page.mouse.up();
 const moved=await panel.boundingBox();assert.ok(moved.x<start.x-150,'Dragging the panel header must move the entire panel');assert.equal(await map.getAttribute('viewBox'),framing);
 await page.getByRole('button',{name:'Ocultar Atlas',exact:true}).click();await page.getByRole('button',{name:'Subopciones de visibilidad',exact:true}).click();await page.getByRole('dialog',{name:'Visibilidad',exact:true}).getByRole('button',{name:'Atlas',exact:true}).click();await page.keyboard.press('Escape');assert.ok(Math.abs((await panel.boundingBox()).x-moved.x)<1);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
 const mobile=await panel.boundingBox();const grip=page.getByRole('button',{name:'Mover panel Atlas',exact:true});const handle=await grip.boundingBox();const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:handle.x+30,y:handle.y+20}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:handle.x+30,y:handle.y-70}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok((await panel.boundingBox()).y<mobile.y-60);
 await page.getByRole('button',{name:'Subir ficha de exploración',exact:true}).click();await page.waitForTimeout(100);
 const fit=await panel.boundingBox();assert.ok(fit.x>=10&&fit.y>=10&&fit.x+fit.width<=380&&fit.y+fit.height<=834,'Expanding a moved panel must keep its controls on screen');
 await page.getByRole('button',{name:'Quiz Curricular con opciones',exact:true}).click();const options=page.locator('[aria-label="Opciones de respuesta"] button');await options.first().waitFor();
 const questionBody=page.locator('[data-challenge="identificar"]');const panelBeforeScroll=await panel.boundingBox();const bodyBox=await questionBody.boundingBox();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bodyBox.x+80,y:bodyBox.y+bodyBox.height-35}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bodyBox.x+80,y:bodyBox.y+80}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);
 assert.ok(await questionBody.evaluate(el=>el.scrollTop)>0,'Swiping panel content must still scroll');assert.deepEqual(await panel.boundingBox(),panelBeforeScroll,'Content scrolling cannot drag the panel');
 await options.last().scrollIntoViewIfNeeded();await options.last().click();
 await page.getByRole('button',{name:'60 segundos contrarreloj',exact:true}).click();const clock=()=>page.getByTestId('game-timer').innerText();const before=await clock();
 await page.getByRole('button',{name:'Mover panel reto',exact:true}).focus();const questionStart=await panel.boundingBox();await page.keyboard.press('ArrowUp');assert.ok((await panel.boundingBox()).y<questionStart.y);
 await page.waitForTimeout(1100);assert.notEqual(await clock(),before);assert.equal(await page.locator('[data-challenge="contrarreloj"]').count(),1);
 await page.setViewportSize({width:1200,height:900});await page.getByRole('button',{name:'Mapa Mudo Exploratorio',exact:true}).click();await page.getByRole('button',{name:'Activar modo edición vectorial',exact:true}).click();await page.keyboard.press('Control+n');
 const name=page.locator('.vector-editor input[type="text"]').nth(1);await name.fill('Edición flotante');const editorGrip=await page.getByRole('button',{name:'Mover panel editor',exact:true}).boundingBox();const editorStart=await panel.boundingBox();
 await page.mouse.move(editorGrip.x+60,editorGrip.y+20);await page.mouse.down();await page.mouse.move(editorGrip.x-90,editorGrip.y+20,{steps:4});await page.mouse.up();assert.ok((await panel.boundingBox()).x<editorStart.x-100);assert.equal(await name.inputValue(),'Edición flotante','Moving editor retains dirty draft');
 console.log('PASS floating panels: mouse/touch/keyboard dragging, stable map, retained position, expansion bounds, quiz scrolling and timer continuity');
}finally{await browser.close();}
