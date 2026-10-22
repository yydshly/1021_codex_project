import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '../web');
await mkdir(output, { recursive: true });
await build({ entryPoints: [path.join(here, 'main.js')], bundle: true, minify: true, format: 'esm', target: 'es2022', outfile: path.join(output, 'main.js'), legalComments: 'eof' });
for (const file of ['index.html', 'style.css']) await copyFile(path.join(here, file), path.join(output, file));
let licenses = 'THIRD-PARTY NOTICES\n\n';
for (const name of ['three', 'three-freecam']) {
  const pkg = JSON.parse(await readFile(path.join(here, 'node_modules', name, 'package.json'), 'utf8'));
  licenses += `${name} ${pkg.version}\n${await readFile(path.join(here, 'node_modules', name, 'LICENSE'), 'utf8')}\n\n`;
}
await writeFile(path.join(output, 'THIRD-PARTY-NOTICES.txt'), licenses);
console.log('Built ../web with local dependencies and license notices.');
