import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'},{name:'prefers-reduced-motion',value:'reduce'}]});
  await page.goto(process.env.BASE_URL||'http://localhost:3002');
  for(const theme of ['Clásico · Claro','Relieve Moderno · Claro','Modo Nocturno']){
    await page.getByRole('button',{name:'Cambiar tema visual del mapa',exact:true}).click();
    await page.getByRole('button',{name:theme,exact:true}).click();
    const surfaces=await page.locator('.immersive-header,.mobile-dock,.companion-region').evaluateAll(els=>els.map(el=>({color:getComputedStyle(el).backgroundColor,blur:getComputedStyle(el).backdropFilter})));
    for(const surface of surfaces){assert.ok(!surface.color.startsWith('rgba('),`${theme}: ${surface.color}`);assert.equal(surface.blur,'none',`${theme}: transparency preference must disable blur`);}
  }
  console.log('PASS reduced transparency for all floating surfaces in all three themes');
}finally{await browser.close();}
