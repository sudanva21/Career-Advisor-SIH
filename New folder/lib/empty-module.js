// Mock troika-worker-utils for SSR and browser compatibility
// This provides stub implementations for the functions that troika-three-text expects

function defineWorkerModule(options) {
  // Return a mock worker module that runs synchronously on main thread
  return function(...args) {
    if (typeof options === 'object' && options !== null) {
      // Return a promise that resolves with proper structure expected by troika-three-text
      const mockResult = {
        glyphIds: [],
        glyphPositions: new Float32Array(0),
        glyphData: {},
        caretPositions: new Float32Array(0),
        caretHeight: 1,
        chunkedBounds: [],
        fontSize: 1,
        topBaseline: 1,
        blockBounds: [0, 0, 0, 0],
        visibleBounds: [0, 0, 0, 0],
        timings: {}
      };
      return Promise.resolve(mockResult);
    }
    return {
      glyphIds: [],
      glyphPositions: new Float32Array(0),
      glyphData: {},
      caretPositions: new Float32Array(0),
      caretHeight: 1,
      chunkedBounds: [],
      fontSize: 1,
      topBaseline: 1,
      blockBounds: [0, 0, 0, 0],
      visibleBounds: [0, 0, 0, 0],
      timings: {}
    };
  };
}

function terminateWorker(workerId) {
  // No-op for mock worker
}

// Export for both CommonJS and ES6 modules
const exports = {
  defineWorkerModule,
  terminateWorker,
};

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exports;
}

// ES6 export
if (typeof window !== 'undefined') {
  window.__troika_worker_utils_mock = exports;
}

// Also support direct exports
export { defineWorkerModule, terminateWorker };
export default exports;