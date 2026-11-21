import {readFile, writeFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));
let page=await readFile(path.join(dist,'index.html'),'utf8');
const script=page.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const style=page.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if(!script || !style) throw new Error('The build must contain a JS entry and stylesheet.');
const js=await readFile(path.join(dist,script[1]),'utf8');
const css=await readFile(path.join(dist,style[1]),'utf8');
const media={};
for(const [folder,type] of [['art','image/webp'],['audio','audio/mpeg']]){
  for(const name of await readdir(path.join(dist,folder))){
    if(!name.endsWith(folder==='art'?'.webp':'.mp3'))continue;
    const bytes=await readFile(path.join(dist,folder,name));
    media[folder+'/'+name]='data:'+type+';base64,'+bytes.toString('base64');
  }
}
const bootstrap='const rescueFiles='+JSON.stringify(media)+';window.rescueAsset=k=>rescueFiles[k];';
page=page.replace(style[0],()=>'<style>'+css+'</style>').replace(script[0],'');
page=page.replace('</body>',()=>'<script>'+bootstrap+'</script><script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script></body>');
await writeFile(path.join(dist,'开始救援.html'),page);
