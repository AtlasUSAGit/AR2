const originalStringify = JSON.stringify;
JSON.stringify = function(obj) {
  try {
    return originalStringify.apply(this, arguments);
  } catch (err) {
    if (err.message.includes("cyclic")) {
      console.error("Cyclic structure detected in JSON.stringify:", err);
      // Try to find the cycle
      const cache = new Set();
      const findCycle = (o, path) => {
        if (typeof o === 'object' && o !== null) {
          if (cache.has(o)) {
            console.error("CYCLE FOUND AT PATH:", path);
            return;
          }
          cache.add(o);
          for (let key in o) {
            findCycle(o[key], path + "." + key);
          }
        }
      };
      findCycle(obj, "root");
      
      console.error("Original object:", obj);
      console.error("Stack trace:", new Error().stack);
    }
    throw err;
  }
};
