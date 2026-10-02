import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const files=await walk('dist');const htmlFiles=files.filter(f=>f.endsWith('.html'));const content=JSON.parse(await readFile('src/content.json','utf8'));assert.equal(htmlFiles.length,10+content.projects.length);
for(const file of htmlFiles){const html=await readFile(file,'utf8');assert.match(html,/<html lang="ja">/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${file}: one h1`);assert.match(html,/name="description"/);assert.match(html,/noindex,nofollow/);for(const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){const target=match[1];await readFile('dist'+target+(target.endsWith('/')?'index.html':''));}if(!file.endsWith('company/index.html'))assert.doesNotMatch(html,/<dt>代表者<\/dt>/);}
const data=JSON.parse(await readFile('src/content.json','utf8'));assert.equal(new Set(data.projects.map(p=>p.slug)).size,data.projects.length);for(const p of data.projects){assert.match(p.slug,/^[a-z0-9-]+$/);for(const photo of p.photos){assert.ok(photo.alt);assert.ok(photo.src.startsWith('/images/'));}}
console.log(`PASS: ${htmlFiles.length} pages; internal links, assets, SEO metadata, representative visibility and content structure.`);
