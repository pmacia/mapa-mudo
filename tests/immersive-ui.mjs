import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const baseURL = process.env.BASE_URL || 'http://localhost:3002';
try {
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto(baseURL);
  await page.getByRole('button',{name:'Ocultar interfaz',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Mostrar interfaz',exact:true}).isVisible(),true);
  await page.getByRole('button',{name:'Mostrar interfaz',exact:true}).click();
  await page.getByRole('button',{name:'60 segundos contrarreloj',exact:true}).click();
  const game=page.locator('[data-challenge="contrarreloj"]');
  await game.waitFor();
  assert.equal(await game.count(),1);
  const time=()=>page.locator('[data-testid="game-timer"]').innerText().then(s=>Number(s.match(/00:(\d+)/)?.[1]));
  const before=await time();
  await page.getByRole('button',{name:'Ocultar interfaz',exact:true}).click();
  await page.waitForTimeout(1100);
  await page.getByRole('button',{name:'Mostrar interfaz',exact:true}).click();
  const after=await time();
  assert.ok(after<before && after>=before-4,`${before} -> ${after}`);
  await page.setViewportSize({width:1200,height:800});
  await page.waitForTimeout(250);
  assert.equal(await game.count(),1);
  assert.ok(await time()<=after);
  for(const [width,height] of [[360,640],[390,844],[430,932],[768,1024],[1023,900],[1024,900],[844,390]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(150);
    const yes=page.getByRole('button',{name:'SÍ, ES',exact:true});
    const no=page.getByRole('button',{name:'NO ES',exact:true});
    for(const button of [yes,no]){
      const box=await button.boundingBox();
      assert.ok(box && box.width>=44 && box.height>=44 && box.y>=0 && box.y+box.height<=height,`${width}x${height}: ${JSON.stringify(box)}`);
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await page.setViewportSize({width:390,height:844});
  const countAnswers=async()=>Promise.all(['Aciertos','Fallos'].map(title=>page.locator(`[title="${title}"]`).innerText().then(s=>Number(s.match(/\d+/)?.[0])))).then(numbers=>numbers.reduce((a,b)=>a+b,0));
  const answeredBefore=await countAnswers();
  await page.getByRole('button',{name:'SÍ, ES',exact:true}).click();
  await page.waitForTimeout(900);
  assert.equal(await game.count(),1);
  assert.equal(await countAnswers(),answeredBefore+1);
  console.log('PASS timed game: viewport continuity, hide/restore, response, portrait and landscape targets');
  assert.deepEqual(errors,[]);
} finally {await browser.close();}

// Touch targets, all retained tools, clear/light themes and dirty editor recovery.
const browser2 = await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
  const page=await browser2.newPage({viewport:{width:1440,height:1000},hasTouch:true,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.clock.install();
  await page.goto(baseURL);
  const openTools=()=>page.getByRole('button',{name:'Más herramientas',exact:true}).click();
  await openTools();
  for(const name of ['Capas y filtros','Logros e insignias','Imprimir mapa','Manual de juego','Silenciar sonidos','Pantalla completa']){
    assert.equal(await page.getByRole('dialog',{name:'Herramientas',exact:true}).getByRole('button',{name:new RegExp(name)}).isVisible(),true,name);
  }
  await page.getByRole('button',{name:'Silenciar sonidos',exact:false}).click();
  await openTools();assert.equal(await page.getByRole('button',{name:/Activar sonidos/}).isVisible(),true);
  await page.getByRole('button',{name:'Cerrar herramientas',exact:true}).click();
  for(const name of ['Clásico · Claro','Relieve Moderno · Claro','Modo Nocturno']){
    await page.getByRole('button',{name:'Cambiar tema visual del mapa',exact:true}).click();
    await page.getByRole('button',{name,exact:true}).click();
    assert.equal(await page.locator('.immersive-shell').getAttribute('data-theme'),name==='Modo Nocturno'?'nocturno':name==='Clásico · Claro'?'clasico':'fisico_moderno');
    assert.equal(await page.locator('main [data-map-canvas]').isVisible(),true);
  }
  await page.getByRole('button',{name:'Ocultar barra superior',exact:true}).click();
  await page.getByRole('button',{name:'Mostrar barra superior',exact:true}).click();
  await page.getByRole('button',{name:'Ocultar controles del mapa',exact:true}).click();
  await page.getByRole('button',{name:'Mostrar controles del mapa',exact:true}).click();
  await page.getByRole('button',{name:'Activar modo edición vectorial',exact:true}).click();
  await page.keyboard.press('Control+n');
  const nameInput=page.locator('.vector-editor input[type="text"]').nth(1);
  await nameInput.fill('Borrador conservado');
  await page.getByRole('button',{name:'Ocultar editor',exact:true}).click();
  await page.getByRole('button',{name:'Mostrar editor',exact:true}).click();
  assert.equal(await nameInput.inputValue(),'Borrador conservado');
  await page.keyboard.press('Control+s');
  await page.getByRole('button',{name:'Ayuda de atajos de edición',exact:true}).click();
  await page.getByRole('heading',{name:'Atajos de edición',exact:true}).waitFor();
  await page.keyboard.press('Escape');
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Exportar configuración',exact:true}).click();
  assert.match((await download).suggestedFilename(),/\.zip$/);
  await nameInput.fill('Cambios pendientes');
  await page.getByRole('button',{name:'Cancelar modo edición',exact:true}).click();
  await page.getByRole('dialog').filter({has:page.getByText('Cambios sin guardar',{exact:true})}).waitFor();
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  await page.keyboard.press('Control+s');
  await page.getByRole('button',{name:'Cancelar modo edición',exact:true}).click();
  await openTools();await page.getByRole('button',{name:/Imprimir mapa/}).click();
  await page.getByRole('button',{name:'Cerrar ficha imprimible',exact:true}).waitFor();
  assert.ok(await page.locator('#printable-content path').count()>20);
  await page.getByRole('button',{name:'Cerrar ficha imprimible',exact:true}).click();
  await openTools();await page.getByRole('button',{name:/Manual de juego/}).click();
  await page.getByRole('button',{name:'Cerrar manual',exact:true}).click();
  await page.getByRole('button',{name:'Modo Ubicar en el mapa',exact:true}).click();
  await page.locator('[data-challenge="localizar"]').waitFor();
  await page.getByRole('button',{name:'Quiz Curricular con opciones',exact:true}).click();
  await page.locator('[data-challenge="identificar"]').waitFor();
  const option=page.locator('[data-challenge="identificar"] [aria-label="Opciones de respuesta"] button');
  await option.first().waitFor();
  assert.equal(await option.count(),4);
  await option.first().click();
  await page.waitForTimeout(150);
  await page.getByRole('button',{name:'Mapa Mudo Exploratorio',exact:true}).click();
  await page.setViewportSize({width:360,height:640});
  await page.getByRole('button',{name:'60 segundos contrarreloj',exact:true}).click();
  for(const button of [page.getByRole('button',{name:'SÍ, ES',exact:true}),page.getByRole('button',{name:'NO ES',exact:true})]){
    const box=await button.boundingBox();assert.ok(box&&box.height>=44&&box.y+box.height<=640);
    const hit=await button.evaluate(el=>{const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));});assert.ok(hit);
  }
  await page.getByRole('button',{name:'Ocultar reto',exact:true}).click();
  await page.getByRole('button',{name:'Mostrar reto',exact:true}).click();
  await page.getByRole('button',{name:'Ocultar marcador',exact:true}).click();
  await page.getByRole('button',{name:'Mostrar marcador',exact:true}).click();
  await page.getByRole('button',{name:'Ocultar navegación',exact:true}).click();
  await page.getByRole('button',{name:'Mostrar navegación',exact:true}).click();
  await page.clock.runFor(61000);
  await page.locator('[data-challenge="results"]').waitFor();
  console.log('PASS all themes, tools, editor retention/export/shortcuts, locate/quiz, touch controls and timed results');
  assert.deepEqual(errors,[]);
}finally{await browser2.close();}
