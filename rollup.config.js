import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/components/cookie/CookieGenerator.ts',
  output: {
    file: 'dist/index.js',
    format: 'iife',
  },
  plugins: [terser(), typescript()],
};
