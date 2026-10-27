import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const page=await browser.newPage({viewport:{width:1200,height:800},hasTouch:true,reducedMotion:'reduce'});page.setDefaultTimeout(5000);
 await page.goto(process.env.BASE_URL||'http://localhost:3002');await page.getByRole('button',{name:'60 segundos contrarreloj',exact:true}).click();
 const hud=page.locator('.timed-hud');const start=await hud.boundingBox();
 const map=page.locator('[data-map-canvas]');const framing=await map.getAttribute('viewBox');
 await page.mouse.move(start.x+25,start.y+25);await page.mouse.down();await page.mouse.move(start.x+125,start.y+125,{steps:5});await page.mouse.up();
 const moved=await hud.boundingBox();assert.ok(moved.x>start.x+70&&moved.y>start.y+70,`Timed scoreboard must be draggable: ${JSON.stringify({start,moved})}`);
 assert.equal(await map.getAttribute('viewBox'),framing,'Moving HUD cannot pan the map');
 const readTime=async()=>Number((await page.getByTestId('game-timer').innerText()).match(/00:(\d+)/)[1]);const time=await readTime();await page.waitForTimeout(1100);assert.ok(await readTime()<time,'Timer must continue counting while HUD moves');
 const grip=page.getByRole('button',{name:'Mover marcador de contrarreloj',exact:true});await grip.focus();
 const answerCount=()=>page.locator('[title="Aciertos"],[title="Fallos"]').allInnerTexts().then(t=>t.map(s=>Number(s.match(/\d+/)?.[0])).reduce((a,b)=>a+b,0));
 const answered=await answerCount();await page.keyboard.press('ArrowLeft');assert.ok((await hud.boundingBox()).x<moved.x);assert.equal(await answerCount(),answered,'Moving HUD with keyboard cannot submit a game answer');
 await page.getByRole('button',{name:'Subopciones de visibilidad',exact:true}).click();await page.getByRole('dialog',{name:'Visibilidad',exact:true}).getByRole('button',{name:'Marcador',exact:true}).click();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Subopciones de visibilidad',exact:true}).click();await page.getByRole('dialog',{name:'Visibilidad',exact:true}).getByRole('button',{name:'Marcador',exact:true}).click();await page.keyboard.press('Escape');
 assert.ok((await hud.boundingBox()).y>start.y+70,'Hiding and showing HUD retains its position');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
 const mobile=await hud.boundingBox();assert.ok(mobile.x>=10&&mobile.x+mobile.width<=380&&mobile.y>=10&&mobile.y+mobile.height<=834);
 const handle=await grip.boundingBox();const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:handle.x+20,y:handle.y+20}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:handle.x+20,y:handle.y+100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.ok((await hud.boundingBox()).y>mobile.y+50,'Touch dragging moves the timer');
 for(const width of [360,390]){
  await page.setViewportSize({width,height:844});await page.waitForTimeout(100);
  const chips=await page.locator('.timed-stats [title]').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect();return {x:b.x,right:b.right};}));
  for(const chip of chips)assert.ok(chip.x>=0&&chip.right<=width,`All scoreboard values must fit at ${width}px: ${JSON.stringify(chip)}`);
 }
 assert.equal(await page.locator('[data-challenge="contrarreloj"]').count(),1);
 console.log('PASS draggable timed scoreboard: pointer, touch, keyboard, timer continuity, hide/show and viewport limits');
}finally{await browser.close();}
