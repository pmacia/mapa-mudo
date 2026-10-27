import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});
  await page.goto(process.env.BASE_URL||'http://localhost:3002');
  await page.getByRole('button',{name:'Quiz Curricular con opciones',exact:true}).click();
  const options=page.locator('[aria-label="Opciones de respuesta"] button');
  await options.first().waitFor();
  const bounds=await page.locator('.companion-region').evaluate(el=>({outer:el.getBoundingClientRect().bottom,inner:el.querySelector('.region-body').getBoundingClientRect().bottom}));
  assert.ok(bounds.inner<=bounds.outer+1,'Mobile quiz content must fit inside its floating panel');
  await options.last().scrollIntoViewIfNeeded();
  const answer=await options.last().boundingBox();
  const dock=await page.locator('.mobile-dock').boundingBox();
  assert.ok(answer.y+answer.height<dock.y,'Last quiz answer must be reachable above navigation');
  await options.last().click();
  console.log('PASS mobile quiz contains scrolling content and all answers remain reachable');
}finally{await browser.close();}
