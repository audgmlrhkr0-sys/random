import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: 저장소 이름이 random 이면 /random/
// Vercel 등 다른 호스팅: 기본값 /
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
});
