// OpenTelemetry stub for edge runtime compatibility
// This provides no-op implementations of OpenTelemetry APIs

module.exports = {
  trace: {
    getTracer: () => ({
      startSpan: (name, options) => ({
        end: () => {},
        setAttributes: () => {},
        setStatus: () => {},
        recordException: () => {},
        addEvent: () => {},
        setAttribute: () => {},
        updateName: () => {},
        isRecording: () => false,
        spanContext: () => ({ traceId: '', spanId: '', traceFlags: 0 })
      }),
      startActiveSpan: (name, optionsOrFn, contextOrFn, fn) => {
        const span = {
          end: () => {},
          setAttributes: () => {},
          setStatus: () => {},
          recordException: () => {},
          addEvent: () => {},
          setAttribute: () => {},
          updateName: () => {},
          isRecording: () => false,
          spanContext: () => ({ traceId: '', spanId: '', traceFlags: 0 })
        };
        
        if (typeof optionsOrFn === 'function') {
          return optionsOrFn(span);
        } else if (typeof contextOrFn === 'function') {
          return contextOrFn(span);
        } else if (typeof fn === 'function') {
          return fn(span);
        }
        return span;
      }
    }),
    getActiveSpan: () => null,
    setSpan: () => {},
    deleteSpan: () => {},
    getSpan: () => null,
    setSpanContext: () => {}
  },
  context: {
    active: () => ({}),
    with: (context, fn) => fn(),
    bind: (context, target) => target
  },
  propagation: {
    inject: () => {},
    extract: () => ({}),
    fields: () => [],
    getBaggage: () => undefined,
    setBaggage: () => {},
    deleteBaggage: () => {}
  },
  metrics: {
    getMeter: () => ({
      createCounter: () => ({ add: () => {} }),
      createHistogram: () => ({ record: () => {} }),
      createGauge: () => ({ record: () => {} }),
      createUpDownCounter: () => ({ add: () => {} })
    })
  },
  baggage: {
    createBaggage: () => ({}),
    getBaggage: () => undefined,
    setBaggage: () => {},
    deleteBaggage: () => {}
  },
  // Core exports
  createTracer: () => module.exports.trace.getTracer(),
  createMeter: () => module.exports.metrics.getMeter(),
  // Common constants
  SpanStatusCode: {
    UNSET: 0,
    OK: 1,
    ERROR: 2
  },
  SpanKind: {
    INTERNAL: 0,
    SERVER: 1,
    CLIENT: 2,
    PRODUCER: 3,
    CONSUMER: 4
  },
  // Version info
  VERSION: '1.0.0-stub'
};