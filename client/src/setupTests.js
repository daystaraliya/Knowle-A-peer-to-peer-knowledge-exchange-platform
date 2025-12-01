import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(window, 'ENV', {
  writable: true,
  value: {
    API_URL: 'http://localhost:5000',
  },
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
