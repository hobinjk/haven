// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 4168;
/* memory initializer */ allocate([136,106,63,36,211,8,163,133,46,138,25,19,68,115,112,3,34,56,9,164,208,49,159,41,152,250,46,8,137,108,78,236,230,33,40,69,119,19,208,56,207,102,84,190,108,12,233,52,183,41,172,192,221,80,124,201,181,213,132,63,23,9,71,181,217,213,22,146,27,251,121,137,166,11,49,209,172,181,223,152,219,114,253,47,183,223,26,208,237,175,225,184,150,126,38,106,69,144,124,186,153,127,44,241,71,153,161,36,247,108,145,179,226,242,1,8,22,252,142,133,216,32,105,99,105,78,87,113,163,254,88,164,126,61,147,244,143,116,149,13,88,182,142,114,88,205,139,113,238,74,21,130,29,164,84,123,181,89,90,194,57,213,48,156,19,96,242,42,35,176,209,197,240,133,96,40,24,121,65,202,239,56,219,184,176,220,121,142,14,24,58,96,139,14,158,108,62,138,30,176,193,119,21,215,39,75,49,189,218,47,175,120,96,92,96,85,243,37,85,230,148,171,85,170,98,152,72,87,64,20,232,99,106,57,202,85,182,16,171,42,52,92,204,180,206,232,65,17,175,134,84,161,147,233,114,124,17,20,238,179,42,188,111,99,93,197,169,43,246,49,24,116,22,62,92,206,30,147,135,155,51,186,214,175,92,207,36,108,129,83,50,122,119,134,149,40,152,72,143,59,175,185,75,107,27,232,191,196,147,33,40,102,204,9,216,97,145,169,33,251,96,172,124,72,50,128,236,93,93,93,132,239,177,117,133,233,2,35,38,220,136,27,101,235,129,62,137,35,197,172,150,211,243,111,109,15,57,66,244,131,130,68,11,46,4,32,132,164,74,240,200,105,94,155,31,158,66,104,198,33,154,108,233,246,97,156,12,103,240,136,211,171,210,160,81,106,104,47,84,216,40,167,15,150,163,51,81,171,108,11,239,110,228,59,122,19,80,240,59,186,152,42,251,126,29,101,241,161,118,1,175,57,62,89,202,102,136,14,67,130,25,134,238,140,180,159,111,69,195,165,132,125,190,94,139,59,216,117,111,224,115,32,193,133,159,68,26,64,166,106,193,86,98,170,211,78,6,119,63,54,114,223,254,27,61,2,155,66,36,215,208,55,72,18,10,208,211,234,15,219,155,192,241,73,201,114,83,7,123,27,153,128,216,121,212,37,247,222,232,246,26,80,254,227,59,76,121,182,189,224,108,151,186,6,192,4,182,79,169,193,196,96,159,64,194,158,92,94,99,36,106,25,175,111,251,104,181,83,108,62,235,178,57,19,111,236,82,59,31,81,252,109,44,149,48,155,68,69,129,204,9,189,94,175,4,208,227,190,253,74,51,222,7,40,15,102,179,75,46,25,87,168,203,192,15,116,200,69,57,95,11,210,219,251,211,185,189,192,121,85,10,50,96,26,198,0,161,214,121,114,44,64,254,37,159,103,204,163,31,251,248,233,165,142,248,34,50,219,223,22,117,60,21,107,97,253,200,30,80,47,171,82,5,173,250,181,61,50,96,135,35,253,72,123,49,83,130,223,0,62,187,87,92,158,160,140,111,202,46,86,135,26,219,105,23,223,246,168,66,213,195,255,126,40,198,50,103,172,115,85,79,140,176,39,91,105,200,88,202,187,93,163,255,225,160,17,240,184,152,61,250,16,184,131,33,253,108,181,252,74,91,211,209,45,121,228,83,154,101,69,248,182,188,73,142,210,144,151,251,75,218,242,221,225,51,126,203,164,65,19,251,98,232,198,228,206,218,202,32,239,1,76,119,54,254,158,126,208,180,31,241,43,77,218,219,149,152,145,144,174,113,142,173,234,160,213,147,107,208,209,142,208,224,37,199,175,47,91,60,142,183,148,117,142,251,226,246,143,100,43,18,242,18,184,136,136,28,240,13,144,160,94,173,79,28,195,143,104,145,241,207,209,173,193,168,179,24,34,47,47,119,23,14,190,254,45,117,234,161,31,2,139,15,204,160,229,232,116,111,181,214,243,172,24,153,226,137,206,224,79,168,180,183,224,19,253,129,59,196,124,217,168,173,210,102,162,95,22,5,119,149,128,20,115,204,147,119,20,26,33,101,32,173,230,134,250,181,119,245,66,84,199,207,53,157,251,12,175,205,235,160,137,62,123,211,27,65,214,73,126,30,174,45,14,37,0,94,179,113,32,187,0,104,34,175,224,184,87,155,54,100,36,30,185,9,240,29,145,99,85,170,166,223,89,137,67,193,120,127,83,90,217,162,91,125,32,197,185,229,2,118,3,38,131,169,207,149,98,104,25,200,17,65,74,115,78,202,45,71,179,74,169,20,123,82,0,81,27,21,41,83,154,63,87,15,214,228,198,155,188,118,164,96,43,0,116,230,129,181,111,186,8,31,233,27,87,107,236,150,242,21,217,13,42,33,101,99,182,182,249,185,231,46,5,52,255,100,86,133,197,93,45,176,83,161,143,159,169,153,71,186,8,106,7,133,110,233,112,122,75,68,41,179,181,46,9,117,219,35,38,25,196,176,166,110,173,125,223,167,73,184,96,238,156,102,178,237,143,113,140,170,236,255,23,154,105,108,82,100,86,225,158,177,194,165,2,54,25,41,76,9,117,64,19,89,160,62,58,24,228,154,152,84,63,101,157,66,91,214,228,143,107,214,63,247,153,7,156,210,161,245,48,232,239,230,56,45,77,193,93,37,240,134,32,221,76,38,235,112,132,198,233,130,99,94,204,30,2,63,107,104,9,201,239,186,62,20,24,151,60,161,112,106,107,132,53,127,104,134,226,160,82,5,83,156,183,55,7,80,170,28,132,7,62,92,174,222,127,236,68,125,142,184,242,22,87,55,218,58,176,13,12,80,240,4,31,28,240,255,179,0,2,26,245,12,174,178,116,181,60,88,122,131,37,189,33,9,220,249,19,145,209,246,47,169,124,115,71,50,148,1,71,245,34,129,229,229,58,220,218,194,55,52,118,181,200,167,221,243,154,70,97,68,169,14,3,208,15,62,199,200,236,65,30,117,164,153,205,56,226,47,14,234,59,161,187,128,50,49,179,62,24,56,139,84,78,8,185,109,79,3,13,66,111,191,4,10,246,144,18,184,44,121,124,151,36,114,176,121,86,175,137,175,188,31,119,154,222,16,8,147,217,18,174,139,179,46,63,207,220,31,114,18,85,36,113,107,46,230,221,26,80,135,205,132,159,24,71,88,122,23,218,8,116,188,154,159,188,140,125,75,233,58,236,122,236,250,29,133,219,102,67,9,99,210,195,100,196,71,24,28,239,8,217,21,50,55,59,67,221,22,186,194,36,67,77,161,18,81,196,101,42,2,0,148,80,221,228,58,19,158,248,223,113,85,78,49,16,214,119,172,129,155,25,17,95,241,86,53,4,107,199,163,215,59,24,17,60,9,165,36,89,237,230,143,242,250,251,241,151,44,191,186,158,110,60,21,30,112,69,227,134,177,111,233,234,10,94,14,134,179,42,62,90,28,231,31,119,250,6,61,78,185,220,101,41,15,29,231,153,214,137,62,128,37,200,102,82,120,201,76,46,106,179,16,156,186,14,21,198,120,234,226,148,83,60,252,165,244,45,10,30,167,78,247,242,61,43,29,54,15,38,57,25,96,121,194,25,8,167,35,82,182,18,19,247,110,254,173,235,102,31,195,234,149,69,188,227,131,200,123,166,209,55,127,177,40,255,140,1,239,221,50,195,165,90,108,190,133,33,88,101,2,152,171,104,15,165,206,238,59,149,47,219,173,125,239,42,132,47,110,91,40,182,33,21,112,97,7,41,117,71,221,236,16,21,159,97,48,168,204,19,150,189,97,235,30,254,52,3,207,99,3,170,144,92,115,181,57,162,112,76,11,158,158,213,20,222,170,203,188,134,204,238,167,44,98,96,171,92,171,156,110,132,243,178,175,30,139,100,202,240,189,25,185,105,35,160,80,187,90,101,50,90,104,64,179,180,42,60,213,233,158,49,247,184,33,192,25,11,84,155,153,160,95,135,126,153,247,149,168,125,61,98,154,136,55,248,119,45,227,151,95,147,237,17,129,18,104,22,41,136,53,14,214,31,230,199,161,223,222,150,153,186,88,120,165,132,245,87,99,114,34,27,255,195,131,155,150,70,194,26,235,10,179,205,84,48,46,83,228,72,217,143,40,49,188,109,239,242,235,88,234,255,198,52,97,237,40,254,115,60,124,238,217,20,74,93,227,183,100,232,20,93,16,66,224,19,62,32,182,226,238,69,234,171,170,163,21,79,108,219,208,79,203,250,66,244,66,199,181,187,106,239,29,59,79,101,5,33,205,65,158,121,30,216,199,77,133,134,106,71,75,228,80,98,129,61,242,161,98,207,70,38,141,91,160,131,136,252,163,182,199,193,195,36,21,127,146,116,203,105,11,138,132,71,133,178,146,86,0,191,91,9,157,72,25,173,116,177,98,20,0,14,130,35,42,141,66,88,234,245,85,12,62,244,173,29,97,112,63,35,146,240,114,51,65,126,147,141,241,236,95,214,219,59,34,108,89,55,222,124,96,116,238,203,167,242,133,64,110,50,119,206,132,128,7,166,158,80,248,25,85,216,239,232,53,151,217,97,170,167,105,169,194,6,12,197,252,171,4,90,220,202,11,128,46,122,68,158,132,52,69,195,5,103,213,253,201,158,30,14,211,219,115,219,205,136,85,16,121,218,95,103,64,67,103,227,101,52,196,197,216,56,62,113,158,248,40,61,32,255,109,241,231,33,62,21,74,61,176,143,43,159,227,230,247,173,131,219,104,90,61,233,247,64,129,148,28,38,76,246,52,41,105,148,247,32,21,65,247,212,2,118,46,107,244,188,104,0,162,212,113,36,8,212,106,244,32,51,183,212,183,67,175,97,0,80,46,246,57,30,70,69,36,151,116,79,33,20,64,136,139,191,29,252,149,77,175,145,181,150,211,221,244,112,69,47,160,102,236,9,188,191,133,151,189,3,208,109,172,127,4,133,203,49,179,39,235,150,65,57,253,85,230,71,37,218,154,10,202,171,37,120,80,40,244,41,4,83,218,134,44,10,251,109,182,233,98,20,220,104,0,105,72,215,164,192,14,104,238,141,161,39,162,254,63,79,140,173,135,232,6,224,140,181,182,214,244,122,124,30,206,170,236,95,55,211,153,163,120,206,66,42,107,64,53,158,254,32,185,133,243,217,171,215,57,238,139,78,18,59,247,250,201,29,86,24,109,75,49,102,163,38,178,151,227,234,116,250,110,58,50,67,91,221,247,231,65,104,251,32,120,202,78,245,10,251,151,179,254,216,172,86,64,69,39,149,72,186,58,58,83,85,135,141,131,32,183,169,107,254,75,149,150,208,188,103,168,85,88,154,21,161,99,41,169,204,51,219,225,153,86,74,42,166,249,37,49,63,28,126,244,94,124,49,41,144,2,232,248,253,112,47,39,4,92,21,187,128,227,44,40,5,72,21,193,149,34,109,198,228,63,19,193,72,220,134,15,199,238,201,249,7,15,31,4,65,164,121,71,64,23,110,136,93,235,81,95,50,209,192,155,213,143,193,188,242,100,53,17,65,52,120,123,37,96,156,42,96,163,232,248,223,27,108,99,31,194,180,18,14,158,50,225,2,209,79,102,175,21,129,209,202,224,149,35,107,225,146,62,51,98,11,36,59,34,185,190,238,14,162,178,133,153,13,186,230,140,12,114,222,40,247,162,45,69,120,18,208,253,148,183,149,98,8,125,100,240,245,204,231,111,163,73,84,250,72,125,135,39,253,157,195,30,141,62,243,65,99,71,10,116,255,46,153,171,110,111,58,55,253,248,244,96,220,18,168,248,221,235,161,76,225,27,153,13,107,110,219,16,85,123,198,55,44,103,109,59,212,101,39,4,232,208,220,199,13,41,241,163,255,0,204,146,15,57,181,11,237,15,105,251,159,123,102,156,125,219,206,11,207,145,160,163,94,21,217,136,47,19,187,36,173,91,81,191,121,148,123,235,214,59,118,179,46,57,55,121,89,17,204,151,226,38,128,45,49,46,244,167,173,66,104,59,43,106,198,204,76,117,18,28,241,46,120,55,66,18,106,231,81,146,183,230,187,161,6,80,99,251,75,24,16,107,26,250,237,202,17,216,189,37,61,201,195,225,226,89,22,66,68,134,19,18,10,110,236,12,217,42,234,171,213,78,103,175,100,95,168,134,218,136,233,191,190,254,195,228,100,87,128,188,157,134,192,247,240,248,123,120,96,77,96,3,96,70,131,253,209,176,31,56,246,4,174,69,119,204,252,54,215,51,107,66,131,113,171,30,240,135,65,128,176,95,94,0,60,190,87,160,119,36,174,232,189,153,66,70,85,97,46,88,191,143,244,88,78,162,253,221,242,56,239,116,244,194,189,137,135,195,249,102,83,116,142,179,200,85,242,117,180,185,217,252,70,97,38,235,122,132,223,29,139,121,14,106,132,226,149,95,145,142,89,110,70,112,87,180,32,145,85,213,140,76,222,2,201,225,172,11,185,208,5,130,187,72,98,168,17,158,169,116,117,182,25,127,183,9,220,169,224,161,9,45,102,51,70,50,196,2,31,90,232,140,190,240,9,37,160,153,74,16,254,110,29,29,61,185,26,223,164,165,11,15,242,134,161,105,241,104,40,131,218,183,220,254,6,57,87,155,206,226,161,82,127,205,79,1,94,17,80,250,131,6,167,196,181,2,160,39,208,230,13,39,140,248,154,65,134,63,119,6,76,96,195,181,6,168,97,40,122,23,240,224,134,245,192,170,88,96,0,98,125,220,48,215,158,230,17,99,234,56,35,148,221,194,83,52,22,194,194,86,238,203,187,222,182,188,144,161,125,252,235,118,29,89,206,9,228,5,111,136,1,124,75,61,10,114,57,36,124,146,124,95,114,227,134,185,157,77,114,180,91,193,26,252,184,158,211,120,85,84,237,181,165,252,8,211,124,61,216,196,15,173,77,94,239,80,30,248,230,97,177,217,20,133,162,60,19,81,108,231,199,213,111,196,78,225,86,206,191,42,54,55,200,198,221,52,50,154,215,18,130,99,146,142,250,14,103,224,0,96,64,55,206,57,58,207,245,250,211,55,119,194,171,27,45,197,90,158,103,176,92,66,55,163,79,64,39,130,211,190,155,188,153,157,142,17,213,21,115,15,191,126,28,45,214,123,196,0,199,107,27,140,183,69,144,161,33,190,177,110,178,180,110,54,106,47,171,72,87,121,110,148,188,210,118,163,198,200,194,73,101,238,248,15,83,125,222,141,70,29,10,115,213,198,77,208,76,219,187,57,41,80,70,186,169,232,38,149,172,4,227,94,190,240,213,250,161,154,81,45,106,226,140,239,99,34,238,134,154,184,194,137,192,246,46,36,67,170,3,30,165,164,208,242,156,186,97,192,131,77,106,233,155,80,21,229,143,214,91,100,186,249,162,38,40,225,58,58,167,134,149,169,75,233,98,85,239,211,239,47,199,218,247,82,247,105,111,4,63,89,10,250,119,21,169,228,128,1,134,176,135,173,230,9,155,147,229,62,59,90,253,144,233,151,215,52,158,217,183,240,44,81,139,43,2,58,172,213,150,125,166,125,1,214,62,207,209,40,45,125,124,207,37,159,31,155,184,242,173,114,180,214,90,76,245,136,90,113,172,41,224,230,165,25,224,253,172,176,71,155,250,147,237,141,196,211,232,204,87,59,40,41,102,213,248,40,46,19,121,145,1,95,120,85,96,117,237,68,14,150,247,140,94,211,227,212,109,5,21,186,109,244,136,37,97,161,3,189,240,100,5,21,158,235,195,162,87,144,60,236,26,39,151,42,7,58,169,155,109,63,27,245,33,99,30,251,102,156,245,25,243,220,38,40,217,51,117,245,253,85,177,130,52,86,3,187,60,186,138,17,119,81,40,248,217,10,194,103,81,204,171,95,146,173,204,81,23,232,77,142,220,48,56,98,88,157,55,145,249,32,147,194,144,122,234,206,123,62,251,100,206,33,81,50,190,79,119,126,227,182,168,70,61,41,195,105,83,222,72,128,230,19,100,16,8,174,162,36,178,109,221,253,45,133,105,102,33,7,9,10,70,154,179,221,192,69,100,207,222,108,88,174,200,32,28,221,247,190,91,64,141,88,27,127,1,210,204,187,227,180,107,126,106,162,221,69,255,89,58,68,10,53,62,213,205,180,188,168,206,234,114,187,132,100,250,174,18,102,141,71,111,60,191,99,228,155,210,158,93,47,84,27,119,194,174,112,99,78,246,141,13,14,116,87,19,91,231,113,22,114,248,93,125,83,175,8,203,64,64,204,226,180,78,106,70,210,52,132,175,21,1,40,4,176,225,29,58,152,149,180,159,184,6,72,160,110,206,130,59,63,111,130,171,32,53,75,29,26,1,248,39,114,39,177,96,21,97,220,63,147,231,43,121,58,187,189,37,69,52,225,57,136,160,75,121,206,81,183,201,50,47,201,186,31,160,126,200,28,224,246,209,199,188,195,17,1,207,199,170,232,161,73,135,144,26,154,189,79,212,203,222,218,208,56,218,10,213,42,195,57,3,103,54,145,198,124,49,249,141,79,43,177,224,183,89,158,247,58,187,245,67,255,25,213,242,156,69,217,39,44,34,151,191,42,252,230,21,113,252,145,15,37,21,148,155,97,147,229,250,235,156,182,206,89,100,168,194,209,168,186,18,94,7,193,182,12,106,5,227,101,80,210,16,66,164,3,203,14,110,236,224,59,219,152,22,190,160,152,76,100,233,120,50,50,149,31,159,223,146,211,224,43,52,160,211,30,242,113,137,65,116,10,27,140,52,163,75,32,113,190,197,216,50,118,195,141,159,53,223,46,47,153,155,71,111,11,230,29,241,227,15,84,218,76,229,145,216,218,30,207,121,98,206,111,126,62,205,102,177,24,22,5,29,44,253,197,210,143,132,153,34,251,246,87,243,35,245,35,118,50,166,49,53,168,147,2,205,204,86,98,129,240,172,181,235,117,90,151,54,22,110,204,115,210,136,146,98,150,222,208,73,185,129,27,144,80,76,20,86,198,113,189,199,198,230,10,20,122,50,6,208,225,69,154,123,242,195,253,83,170,201,0,15,168,98,226,191,37,187,246,210,189,53,5,105,18,113,34,2,4,178,124,207,203,182,43,156,118,205,192,62,17,83,211,227,64,22,96,189,171,56,240,173,71,37,156,32,56,186,118,206,70,247,197,161,175,119,96,96,117,32,78,254,203,133,216,141,232,138,176,249,170,122,126,170,249,76,92,194,72,25,140,138,251,2,228,106,195,1,249,225,235,214,105,248,212,144,160,222,92,166,45,37,9,63,159,230,8,194,50,97,78,183,91,226,119,206,227,223,143,87,230,114,195,58], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  Module["_strlen"] = _strlen;
  Module["_memset"] = _memset;
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  function _free() {
  }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=+env.NaN;var n=+env.Infinity;var o=0;var p=0;var q=0;var r=0;var s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0,A=0.0;var B=0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=global.Math.floor;var M=global.Math.abs;var N=global.Math.sqrt;var O=global.Math.pow;var P=global.Math.cos;var Q=global.Math.sin;var R=global.Math.tan;var S=global.Math.acos;var T=global.Math.asin;var U=global.Math.atan;var V=global.Math.atan2;var W=global.Math.exp;var X=global.Math.log;var Y=global.Math.ceil;var Z=global.Math.imul;var _=env.abort;var $=env.assert;var aa=env.asmPrintInt;var ab=env.asmPrintFloat;var ac=env.min;var ad=env.invoke_ii;var ae=env.invoke_v;var af=env.invoke_iii;var ag=env.invoke_vi;var ah=env._malloc;var ai=env._free;
// EMSCRIPTEN_START_FUNCS
function an(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function ao(){return i|0}function ap(a){a=a|0;i=a}function aq(a,b){a=a|0;b=b|0;if((o|0)==0){o=a;p=b}}function ar(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function as(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function at(a){a=a|0;B=a}function au(a){a=a|0;C=a}function av(a){a=a|0;D=a}function aw(a){a=a|0;E=a}function ax(a){a=a|0;F=a}function ay(a){a=a|0;G=a}function az(a){a=a|0;H=a}function aA(a){a=a|0;I=a}function aB(a){a=a|0;J=a}function aC(a){a=a|0;K=a}function aD(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=a+4|0;e=c[b>>2]^c[a>>2];f=c[b+4>>2]^c[d>>2]^((c[b+72+((e>>>16&255|256)<<2)>>2]|0)+(c[b+72+(e>>>24<<2)>>2]|0)^c[b+72+((e>>>8&255|512)<<2)>>2])+(c[b+72+((e&255|768)<<2)>>2]|0);g=c[b+8>>2]^e^((c[b+72+((f>>>16&255|256)<<2)>>2]|0)+(c[b+72+(f>>>24<<2)>>2]|0)^c[b+72+((f>>>8&255|512)<<2)>>2])+(c[b+72+((f&255|768)<<2)>>2]|0);e=c[b+12>>2]^f^((c[b+72+((g>>>16&255|256)<<2)>>2]|0)+(c[b+72+(g>>>24<<2)>>2]|0)^c[b+72+((g>>>8&255|512)<<2)>>2])+(c[b+72+((g&255|768)<<2)>>2]|0);f=c[b+16>>2]^g^((c[b+72+((e>>>16&255|256)<<2)>>2]|0)+(c[b+72+(e>>>24<<2)>>2]|0)^c[b+72+((e>>>8&255|512)<<2)>>2])+(c[b+72+((e&255|768)<<2)>>2]|0);g=c[b+20>>2]^e^((c[b+72+((f>>>16&255|256)<<2)>>2]|0)+(c[b+72+(f>>>24<<2)>>2]|0)^c[b+72+((f>>>8&255|512)<<2)>>2])+(c[b+72+((f&255|768)<<2)>>2]|0);e=c[b+24>>2]^f^((c[b+72+((g>>>16&255|256)<<2)>>2]|0)+(c[b+72+(g>>>24<<2)>>2]|0)^c[b+72+((g>>>8&255|512)<<2)>>2])+(c[b+72+((g&255|768)<<2)>>2]|0);f=c[b+28>>2]^g^((c[b+72+((e>>>16&255|256)<<2)>>2]|0)+(c[b+72+(e>>>24<<2)>>2]|0)^c[b+72+((e>>>8&255|512)<<2)>>2])+(c[b+72+((e&255|768)<<2)>>2]|0);g=c[b+32>>2]^e^((c[b+72+((f>>>16&255|256)<<2)>>2]|0)+(c[b+72+(f>>>24<<2)>>2]|0)^c[b+72+((f>>>8&255|512)<<2)>>2])+(c[b+72+((f&255|768)<<2)>>2]|0);e=c[b+36>>2]^f^((c[b+72+((g>>>16&255|256)<<2)>>2]|0)+(c[b+72+(g>>>24<<2)>>2]|0)^c[b+72+((g>>>8&255|512)<<2)>>2])+(c[b+72+((g&255|768)<<2)>>2]|0);f=c[b+40>>2]^g^((c[b+72+((e>>>16&255|256)<<2)>>2]|0)+(c[b+72+(e>>>24<<2)>>2]|0)^c[b+72+((e>>>8&255|512)<<2)>>2])+(c[b+72+((e&255|768)<<2)>>2]|0);g=c[b+44>>2]^e^((c[b+72+((f>>>16&255|256)<<2)>>2]|0)+(c[b+72+(f>>>24<<2)>>2]|0)^c[b+72+((f>>>8&255|512)<<2)>>2])+(c[b+72+((f&255|768)<<2)>>2]|0);e=c[b+48>>2]^f^((c[b+72+((g>>>16&255|256)<<2)>>2]|0)+(c[b+72+(g>>>24<<2)>>2]|0)^c[b+72+((g>>>8&255|512)<<2)>>2])+(c[b+72+((g&255|768)<<2)>>2]|0);f=c[b+52>>2]^g^((c[b+72+((e>>>16&255|256)<<2)>>2]|0)+(c[b+72+(e>>>24<<2)>>2]|0)^c[b+72+((e>>>8&255|512)<<2)>>2])+(c[b+72+((e&255|768)<<2)>>2]|0);g=c[b+56>>2]^e^((c[b+72+((f>>>16&255|256)<<2)>>2]|0)+(c[b+72+(f>>>24<<2)>>2]|0)^c[b+72+((f>>>8&255|512)<<2)>>2])+(c[b+72+((f&255|768)<<2)>>2]|0);e=c[b+60>>2]^f^((c[b+72+((g>>>16&255|256)<<2)>>2]|0)+(c[b+72+(g>>>24<<2)>>2]|0)^c[b+72+((g>>>8&255|512)<<2)>>2])+(c[b+72+((g&255|768)<<2)>>2]|0);f=c[b+68>>2]^e;c[d>>2]=c[b+64>>2]^g^((c[b+72+((e>>>16&255|256)<<2)>>2]|0)+(c[b+72+(e>>>24<<2)>>2]|0)^c[b+72+((e>>>8&255|512)<<2)>>2])+(c[b+72+((e&255|768)<<2)>>2]|0);c[a>>2]=f;return}function aE(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;l=i;i=i+8|0;m=l|0;n=c[j>>2]|0;o=(f|0)==0;if((k|0)==0){if(o){p=n;c[j>>2]=p;i=l;return}k=h+1|0;q=h+2|0;r=h+3|0;s=h+4|0;t=m|0;u=h+5|0;v=h+6|0;w=h+7|0;x=m+4|0;y=e;z=b;A=n;B=f;while(1){C=B-1|0;if((A|0)==0){c[t>>2]=(d[k]|0)<<16|(d[h]|0)<<24|(d[q]|0)<<8|(d[r]|0);c[x>>2]=(d[u]|0)<<16|(d[s]|0)<<24|(d[v]|0)<<8|(d[w]|0);aD(t,g);D=c[t>>2]|0;a[h]=D>>>24&255;a[k]=D>>>16&255;a[q]=D>>>8&255;a[r]=D&255;D=c[x>>2]|0;a[s]=D>>>24&255;a[u]=D>>>16&255;a[v]=D>>>8&255;a[w]=D&255}D=a[z]|0;E=h+A|0;F=a[E]|0;a[E]=D;a[y]=F^D;D=A+1&7;if((C|0)==0){p=D;break}else{y=y+1|0;z=z+1|0;A=D;B=C}}c[j>>2]=p;i=l;return}else{if(o){p=n;c[j>>2]=p;i=l;return}o=h+1|0;B=h+2|0;A=h+3|0;z=h+4|0;y=m|0;w=h+5|0;v=h+6|0;u=h+7|0;s=m+4|0;m=e;e=b;b=n;n=f;while(1){f=n-1|0;if((b|0)==0){c[y>>2]=(d[o]|0)<<16|(d[h]|0)<<24|(d[B]|0)<<8|(d[A]|0);c[s>>2]=(d[w]|0)<<16|(d[z]|0)<<24|(d[v]|0)<<8|(d[u]|0);aD(y,g);x=c[y>>2]|0;a[h]=x>>>24&255;a[o]=x>>>16&255;a[B]=x>>>8&255;a[A]=x&255;x=c[s>>2]|0;a[z]=x>>>24&255;a[w]=x>>>16&255;a[v]=x>>>8&255;a[u]=x&255}x=h+b|0;r=a[x]^a[e];a[m]=r;a[x]=r;r=b+1&7;if((f|0)==0){p=r;break}else{m=m+1|0;e=e+1|0;b=r;n=f}}c[j>>2]=p;i=l;return}}function aF(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+8|0;g=f|0;h=a;aH(h|0,8,4168)|0;h=e+((b|0)>72?72:b)|0;b=0;j=e;k=608135816;while(1){l=j+1|0;m=l>>>0<h>>>0?l:e;l=m+1|0;n=l>>>0<h>>>0?l:e;l=n+1|0;o=l>>>0<h>>>0?l:e;l=o+1|0;c[a+(b<<2)>>2]=((((d[j]|0)<<8|(d[m]|0))<<8|(d[n]|0))<<8|(d[o]|0))^k;o=b+1|0;if((o|0)>=18){break}b=o;j=l>>>0<h>>>0?l:e;k=c[a+(o<<2)>>2]|0}k=g|0;c[k>>2]=0;e=g+4|0;c[e>>2]=0;aD(k,a);c[a>>2]=c[k>>2];c[a+4>>2]=c[e>>2];aD(k,a);c[a+8>>2]=c[k>>2];c[a+12>>2]=c[e>>2];aD(k,a);c[a+16>>2]=c[k>>2];c[a+20>>2]=c[e>>2];aD(k,a);c[a+24>>2]=c[k>>2];c[a+28>>2]=c[e>>2];aD(k,a);c[a+32>>2]=c[k>>2];c[a+36>>2]=c[e>>2];aD(k,a);c[a+40>>2]=c[k>>2];c[a+44>>2]=c[e>>2];aD(k,a);c[a+48>>2]=c[k>>2];c[a+52>>2]=c[e>>2];aD(k,a);c[a+56>>2]=c[k>>2];c[a+60>>2]=c[e>>2];aD(k,a);c[a+64>>2]=c[k>>2];c[a+68>>2]=c[e>>2];g=0;do{aD(k,a);c[a+72+(g<<2)>>2]=c[k>>2];c[a+72+((g|1)<<2)>>2]=c[e>>2];g=g+2|0;}while((g|0)<1024);i=f;return}function aG(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;i=i+4184|0;h=g|0;j=g+4168|0;k=g+4176|0;aF(h,aI(a|0)|0,a);c[j>>2]=0;c[j+4>>2]=0;c[k>>2]=0;aE(b,d,e,h,j,k,f);i=g;return}function aH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function aI(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function aJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function aK(a,b){a=a|0;b=b|0;return aj[a&1](b|0)|0}function aL(a){a=a|0;ak[a&1]()}function aM(a,b,c){a=a|0;b=b|0;c=c|0;return al[a&1](b|0,c|0)|0}function aN(a,b){a=a|0;b=b|0;am[a&1](b|0)}function aO(a){a=a|0;_(0);return 0}function aP(){_(1)}function aQ(a,b){a=a|0;b=b|0;_(2);return 0}function aR(a){a=a|0;_(3)}
// EMSCRIPTEN_END_FUNCS
var aj=[aO,aO];var ak=[aP,aP];var al=[aQ,aQ];var am=[aR,aR];return{_memcpy:aH,_strlen:aI,_crypt:aG,_memset:aJ,stackAlloc:an,stackSave:ao,stackRestore:ap,setThrew:aq,setTempRet0:at,setTempRet1:au,setTempRet2:av,setTempRet3:aw,setTempRet4:ax,setTempRet5:ay,setTempRet6:az,setTempRet7:aA,setTempRet8:aB,setTempRet9:aC,dynCall_ii:aK,dynCall_v:aL,dynCall_iii:aM,dynCall_vi:aN}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_vi": invoke_vi, "_malloc": _malloc, "_free": _free, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _crypt = Module["_crypt"] = asm["_crypt"];
var _memset = Module["_memset"] = asm["_memset"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
