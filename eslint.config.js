import antfu from '@antfu/eslint-config'

export default antfu({
  // Specify that this is a Vue.js project
  vue: true,
  // Since this is a JavaScript project, disable TypeScript
  typescript: false,

  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/.output/**',
    '**/build/**',
    '**/*.md', // Ignore all Markdown files
    '**/*d.ts', // Ignore all TypeScript declaration files
    '**/data/**.json', // Ignore JSON files in data directory
  ],

  // Vue.js specific settings
  settings: {
    'import/core-modules': ['vue-router/auto-routes'],
  },

  // Global variables for your Vue.js project
  globals: {
    definePage: 'readonly',
  },

  rules: {
    // Keep the no-console rule
    'no-console': 'error',

    // Enable import sorting for better formatting
    'perfectionist/sort-imports': 'error',

    // Vue.js specific rules adjustments
    'vue/multi-word-component-names': 'off', // Allow single-word component names
    'vue/no-unused-vars': 'error',

    // Disable the self-closing rule for Vue.js templates
    'vue/html-self-closing': 'off',
  },
})
