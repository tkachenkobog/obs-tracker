import path from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import autoPreprocess from 'svelte-preprocess';
import builtins from 'builtin-modules';

const prod = (process.argv[2] === 'production');

export default defineConfig(() => {
    return {
        plugins: [
            svelte({
                preprocess: autoPreprocess()
            })
        ],
        watch: !prod,
        build: {
            sourcemap: prod ? false : 'inline',
            minify: prod,
            commonjsOptions: {
                ignoreTryCatch: false,
            },
            lib: {
                entry: path.resolve(__dirname, './src/starterIndex.ts'),
                formats: ['cjs'],
            },
            rollupOptions: {
                output: {
                    entryFileNames: 'main.js',
                    assetFileNames: 'styles.css',
                },
                external: [
                    'obsidian',
                    'electron',
                    ...builtins,
                ],
            },
            emptyOutDir: false,
            outDir: '.'
        },
        root: '.',              // Корінь проекту (де manifest.json)
    }
});
