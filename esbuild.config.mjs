import esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
    entryPoints: ['src/starterIndex.ts'],
    bundle: true,
    external: [
        'obsidian',
        'electron',
        '@codemirror/*',
        '@lezer/*'
    ],
    format: 'cjs',
    target: 'es2018',
    outfile: 'main.js',
    sourcemap: prod ? false : 'inline',
    minify: prod,
    plugins: [
        sveltePlugin({
            preprocess: sveltePreprocess(),
            compilerOptions: { css: 'injected' }
        }),
    ],
});

if (prod) {
    await context.rebuild();
    await context.dispose();
    console.log('✅ Build completed');
    process.exit(0);
} else {
    await context.watch();
    console.log('👀 Watching for changes...');
}