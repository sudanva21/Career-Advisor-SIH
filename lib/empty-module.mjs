// Mock troika-worker-utils for SSR and browser compatibility
// This provides stub implementations for the functions that troika-three-text expects

function defineWorkerModule(options) {
  // Return a mock worker module that runs synchronously on main thread
  return function(...args) {
    const createMockResult = () => ({
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
      timings: {},
      // Additional properties that might be expected
      glyphs: [],
      // Make sure fontData is always an array for .map() calls
      fontData: [],
      metricsData: {},
      atlasData: new Uint8Array(0),
      // Add more properties that troika-three-text might expect
      typographic: {
        capHeight: 0.7,
        ascender: 1,
        descender: -0.2,
        lineHeight: 1.2,
        unitsPerEm: 1000
      },
      fontPath: '',
      unicodeFontsURL: '',
      sdfGlyphSize: 64,
      textAlign: 'left',
      textBaseline: 'alphabetic',
      fontSize: 0.1,
      letterSpacing: 0,
      lineHeight: 'normal',
      maxWidth: Infinity,
      whiteSpace: 'normal',
      direction: 'ltr',
      textIndent: 0,
      anchorX: 0,
      anchorY: 0,
      clipRect: null,
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 0,
      outlineWidth: 0,
      outlineOpacity: 1,
      outlineOffsetX: 0,
      outlineOffsetY: 0,
      outlineBlur: 0,
      strokeDasharray: null,
      strokeDashoffset: 0,
      curveRadius: 0,
      gpuAccelerateSDF: true,
      debugSDF: false
    });

    // Create a mock that handles text rendering calls correctly
    const mockTextResult = () => ({
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
      timings: {},
      // Ensure fontData is always an array
      fontData: [],
      glyphs: [],
      metricsData: {},
      atlasData: new Uint8Array(0),
      // Add geometry-related properties that troika-three-text may need
      geometry: {
        attributes: {
          position: { array: new Float32Array(0), count: 0, itemSize: 3 },
          normal: { array: new Float32Array(0), count: 0, itemSize: 3 },
          uv: { array: new Float32Array(0), count: 0, itemSize: 2 }
        }
      },
      // Add text mesh-related properties
      textRenderInfo: {
        glyphBounds: new Float32Array(0),
        glyphAtlasIndices: new Uint16Array(0),
        totalBounds: [0, 0, 0, 0],
        chunkedBounds: [],
        glyphColors: new Float32Array(0)
      }
    });

    if (typeof options === 'object' && options !== null) {
      return Promise.resolve(mockTextResult());
    }
    return mockTextResult();
  };
}

function terminateWorker(workerId) {
  // No-op for mock worker
}

// Mock additional functions that might be called
function createWorker() {
  return {
    postMessage: () => {},
    terminate: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

// Mock other possible functions from troika-worker-utils
function addWorkerMessageListener() {}
function removeWorkerMessageListener() {}
function callWorker() {
  return Promise.resolve({});
}

// Create a comprehensive mock for all possible exports
const mockExports = {
  defineWorkerModule,
  terminateWorker,
  createWorker,
  addWorkerMessageListener,
  removeWorkerMessageListener,
  callWorker,
  __esModule: true
};

// ES6 exports with all possible exports
export { 
  defineWorkerModule, 
  terminateWorker, 
  createWorker,
  addWorkerMessageListener,
  removeWorkerMessageListener,
  callWorker
};

// CommonJS fallback
export const __esModule = true;

// Handle any other possible property access
const handler = {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    // Return a safe fallback for any unknown property
    if (typeof prop === 'string') {
      return () => ({
        then: (resolve) => resolve({}),
        catch: () => {}
      });
    }
    return undefined;
  }
};

// Default export with Proxy to handle any unexpected access
export default new Proxy(mockExports, handler);