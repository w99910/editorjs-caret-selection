import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "./index.js",
            name: "",
            formats: ["es", "cjs"],
            fileName: (format) => `editorjs-caret-selection.${format === 'es' ? 'js' : 'cjs'}`,
        },
        outDir: "./dist/",
        emptyOutDir: true,
    },
    server: {
        host: '0.0.0.0'  // or 'localhost'
    }
});