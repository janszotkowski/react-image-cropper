import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { resolve } from 'path';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  server: {
    port: 8080
  },
  html: {
    title: 'React Image Cropper'
  },
  source: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
