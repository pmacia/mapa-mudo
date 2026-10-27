// Render the SVG source into browser/install assets. No product dependencies are added.
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const icons=new URL('../public/icons/',import.meta.url);
await mkdir(icons,{recursive:true});
const svg=await readFile(new URL('favicon.svg',icons),'utf8');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const pngs=[];
 for(const [size,name] of [[16,'favicon-16.png'],[32,'favicon-32.png'],[48,'favicon-48.png'],[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png']]){
  const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
  await page.setContent('<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{display:block;width:100%;height:100%}</style>'+svg);
  const png=await page.screenshot({path:fileURLToPath(new URL(name,icons))});if(size<=48)pngs.push({size,png});
  await page.close();
 }
 const header=Buffer.alloc(6+16*pngs.length);header.writeUInt16LE(1,2);header.writeUInt16LE(pngs.length,4);let offset=header.length;
 for(const [index,{size,png}] of pngs.entries()){
  const entry=6+index*16;header[entry]=size;header[entry+1]=size;header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);header.writeUInt32LE(png.length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=png.length;
 }
 await writeFile(new URL('../favicon.ico',icons),Buffer.concat([header,...pngs.map(x=>x.png)]));
 for(const name of ['icon-192.png','icon-512.png','apple-touch-icon.png'])await copyFile(new URL(name,icons),new URL('../'+name,icons));
 console.log('Generated SVG-derived favicon, ICO and installation icons');
}finally{await browser.close();}
