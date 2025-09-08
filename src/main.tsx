import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MobileOptimizationProvider } from './utils/mobileOptimization'
import { PerformanceMonitor } from './components/ui/performance-monitor'
import { logger } from './utils/structuredLogging'
import './utils/productionOptimization'

// Initialize performance monitoring
logger.info('Application starting', {
  component: 'Main',
  action: 'initialize',
  metadata: {
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight }
  }
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MobileOptimizationProvider
      options={{
        enableTouchOptimization: true,
        optimizeImages: true,
        preloadCriticalContent: true
      }}
    >
      <App />
      {/* <PerformanceMonitor enabled={true} showDetails={import.meta.env.DEV} /> */}
    </MobileOptimizationProvider>
  </React.StrictMode>,
)
