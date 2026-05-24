import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['assets/script.src.js'],
  bundle: true,
  minify: true,
  outfile: 'assets/script.js',
  format: 'iife',
  target: 'es2015',
});

console.log('Build complete!');
