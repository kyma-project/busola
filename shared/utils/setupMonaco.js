import { monaco } from '@monaco-editor/react';

export function setupMonaco() {
  // monaco editor - load from static files instead of from CDN
  monaco.config({ paths: { vs: '/vs' } });
}
