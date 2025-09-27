import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/org': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            console.log(`[Vite Proxy] Rewriting path: ${path}`);
            return path; // Keep the path as-is since backend expects /api/org/...
          },
          configure: (proxy) => {
            console.log(`[Vite Proxy] Configuring /api/org proxy`);
            console.log(`[Vite Proxy] Target: http://localhost:3001`);
            console.log(`[Vite Proxy] Routes: /api/org/* -> http://localhost:3001/api/org/*`);
            
            proxy.on('proxyReq', (_, req) => {
              const targetUrl = `http://localhost:3001${req.url}`;
              console.log(`[Vite Proxy] Proxying ${req.method} ${req.url} to ${targetUrl}`);
            });
            
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log(`[Vite Proxy] Response ${proxyRes.statusCode} for ${req.url}`);
            });
            
            proxy.on('error', (err, req) => {
              console.error(`[Vite Proxy] Error for ${req.url}:`, err.message);
            });
          }
        },
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          configure: () => {
            console.log(`[Vite Proxy] Proxying /api to ${env.VITE_API_BASE_URL || 'http://localhost:3000'}`);
          }
        }
      }
    }
  }
})
