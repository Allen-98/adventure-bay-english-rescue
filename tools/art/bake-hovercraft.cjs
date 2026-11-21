// Run from the project directory. An installed Three.js and Playwright are used only while baking.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const project = path.resolve(__dirname, '../..');
const games = path.dirname(project);
const threeRoot = process.env.THREE_ROOT || path.join(games, '潮线抢修队/node_modules/three');
const playwrightRoot = process.env.PLAYWRIGHT_MODULE || path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium } = require(playwrightRoot);
const sourceDog = path.join(games,'paw-rescue/public/assets/zuma.webp');
const files = new Map([
  ['/model.js', path.join(__dirname, 'model-hovercraft.js')],
  ['/dog.webp', sourceDog],
  ['/three.js',path.join(threeRoot,'build/three.module.js')],
  ['/three.core.js',path.join(threeRoot,'build/three.core.js')],
  ['/room.js',path.join(threeRoot,'examples/jsm/environments/RoomEnvironment.js')],
  ['/rounded.js',path.join(threeRoot,'examples/jsm/geometries/RoundedBoxGeometry.js')]
]);
const html = '<!doctype html><meta charset="utf-8"><script type="importmap">{"imports":{"three":"/three.js"}}</script><script type="module" src="/model.js"></script>';
const server = http.createServer((req,res) => {
  if(req.url === '/') {res.setHeader('Content-Type','text/html'); return res.end(html);}
  const file = files.get(req.url);
  if (!file) {res.writeHead(404); return res.end();}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'image/webp');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  try {
    const page = await browser.newPage();
    page.on('pageerror',e=>console.error(e));
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.waitForFunction(()=>typeof window.bakedImage === 'string',null,{timeout:90000});
    const data = await page.evaluate(()=>window.bakedImage.split(',')[1]);
    const output = path.join(project,'public/art/zuma-boat.webp');
    fs.writeFileSync(output,Buffer.from(data,'base64'));
    console.log('Baked',output,fs.statSync(output).size,'bytes');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
