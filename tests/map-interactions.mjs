import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const failures=[];
try {
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});
  page.setDefaultTimeout(5000);
  await page.goto(process.env.BASE_URL||'http://localhost:3002');
  // Verified western Portugal extent in the source map, converted by sourceScale=.625.
  const portugal=await page.locator('[data-map-canvas]').evaluate(svg=>new DOMPoint(367.117,280).matrixTransform(svg.getScreenCTM()).x);
  if(portugal<15)failures.push(`Western Portugal needs a full initial margin, got x=${portugal}`);
  await page.getByRole('button',{name:'Quiz Curricular con opciones',exact:true}).click();
  await page.locator('[aria-label="Opciones de respuesta"] button').first().waitFor();
  for(const name of ['Acercar mapa','Alejar mapa']){
    const hit=await page.getByRole('button',{name,exact:true}).evaluate(el=>{const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));});
    if(!hit)failures.push(`${name} must be reachable above the portrait quiz`);
  }
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('button',{name:'Activar modo edición vectorial',exact:true}).click();
  await page.keyboard.press('Control+n');
  await page.getByRole('button',{name:'Subopciones de visibilidad',exact:true}).click();
  await page.getByRole('dialog',{name:'Visibilidad',exact:true}).getByRole('button',{name:'Editor',exact:true}).click();await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Acercar mapa',exact:true}).click();
  const canvas=page.locator('[data-map-canvas]');const before=await canvas.getAttribute('viewBox');
  await page.mouse.move(110,260);await page.mouse.down();await page.mouse.move(170,290,{steps:4});await page.mouse.up();
  if(await canvas.getAttribute('viewBox')===before)failures.push('Blank-map drag must pan while editing');
  const centered=page.locator('#vector-editor-overlay g.cursor-move.group').first();
  const shape=page.locator('#vector-editor-overlay path.cursor-move');
  const shapeBefore=await shape.getAttribute('d');const panBefore=await canvas.getAttribute('viewBox');
  const center=await centered.boundingBox();assert.ok(center);
  await page.mouse.move(center.x+center.width/2,center.y+center.height/2);await page.mouse.down();await page.mouse.move(center.x+center.width/2+20,center.y+center.height/2+10,{steps:4});await page.mouse.up();
  assert.equal(await canvas.getAttribute('viewBox'),panBefore,'Dragging an editor handle must not pan the background');
  assert.notEqual(await shape.getAttribute('d'),shapeBefore,'Editor translation still updates geometry');
  for(const failure of failures)console.error('FAIL '+failure);
  assert.equal(failures.length,0,'Review regressions must be resolved');
  console.log('PASS Portugal framing, portrait zoom hit targets and editor background/handle dragging');
}finally{await browser.close();}
