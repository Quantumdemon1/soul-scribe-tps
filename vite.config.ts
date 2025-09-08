import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  define: {
    // React Router v7 future flags
    'process.env.REACT_ROUTER_FUTURE_V7_SKIP_ACTION_ERROR_REVALIDATION': JSON.stringify(true),
    'process.env.REACT_ROUTER_FUTURE_V7_NORMALIZE_FORM_METHOD': JSON.stringify(true),
    'process.env.REACT_ROUTER_FUTURE_V7_PARTIAL_HYDRATION': JSON.stringify(true),
    'process.env.REACT_ROUTER_FUTURE_V7_RELATIVE_SPLAT_PATH': JSON.stringify(true)
  }
}));
