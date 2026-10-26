import { access, copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const pages = ['index.html', 'styles.css', 'script.js'];

// Check inputs before replacing the generated output directory.
await Promise.all([...pages, 'assets'].map(file => access(join(root, file))));
if (dirname(output) !== root || basename(output) !== 'dist') {
  throw new Error('La salida debe ser la carpeta dist de este proyecto.');
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(pages.map(file => copyFile(join(root, file), join(output, file))));
await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });

console.log('Web estática preparada en dist/: HTML, CSS, JavaScript e imágenes.');
