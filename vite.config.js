import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Component from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const RouteGenerateExclude = ['**/components/**', '**/data/**']

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // File-based routing otomatis dari folder pages (auto-route src/pages)
    VueRouter({
      routesFolder: 'src/pages',
      exclude: RouteGenerateExclude,
      dts: false,
    }),

    vue(),
    tailwindcss(),
    vueDevTools(),

    // Untuk analisa visual ukuran bundle hasil build
    visualizer({ gzipSize: true, brotliSize: true }),

    // Otomatis import fungsi (ref, computed, dsb) tanpa import manual
    AutoImport({
      include: [
        /\.[tj]sx?$/,
        /\.vue$/,
        /\.md$/,
      ],
      imports: [
        'vue',
        // Preset auto-import fungsi dari vue-router (useRoute, useRouter, dsb)
        VueRouterAutoImports,
      ],
      dirs: [
        'src/composables/**/*.ts',
        'src/store/**/*.ts',
      ],
      defaultExportByFilename: true,
      dts: false,
    }),

    // Otomatis import komponen Vue dari folder tertentu
    Component({
      dirs: [
        'src/components',
      ],
      collapseSamePrefixes: true,
      directoryAsNamespace: true,
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  esbuild: {
    drop: ['debugger'], // Hapus statement debugger saat build
    pure: ['console.log'], // Hapus console.log saat build
  },
})
