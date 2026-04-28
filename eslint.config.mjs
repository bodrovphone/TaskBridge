import nextConfig from 'eslint-config-next/core-web-vitals'

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      'public/**',
      'supabase/functions/**',
    ],
  },
  ...nextConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
      'react/display-name': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]
