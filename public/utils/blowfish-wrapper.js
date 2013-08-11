var Blowfish = {
  initialize: function() {
    this.wrappedCrypt = Module.cwrap('crypt', 'void', ['string', 'number', 'number', 'number', 'number']);
    this.free = Module._free ? Module._free : _free;
  },
  crypt: function(key, input, encrypt) {
    var length = input.length;
    var inputPtr  = Module.allocate(input, 'i8', ALLOC_NORMAL);
    var outputPtr = Module.allocate(length, 'i8', ALLOC_NORMAL);
    //var keyPtr = Module.allocate(key, 'i8', ALLOC_NORMAL);
    this.wrappedCrypt(key, inputPtr, outputPtr, length, encrypt ? 1 : 0);
    /*if(encrypt)
      this.wrappedEncrypt(key, inputPtr, outputPtr, length);
    else
      this.wrappedDecrypt(key, inputPtr, outputPtr, length - 1);*/
    //console.log(Module.HEAPU8.subarray(inputPtr, inputPtr + length).toSource());
    //console.log(Module.HEAPU8.subarray(outputPtr, outputPtr + length).toSource());
    this.free(inputPtr);
    //this.free(keyPtr);
    return Module.HEAPU8.subarray(outputPtr, outputPtr + length);
  },
  decrypt: function(key, input) {
    return this.crypt(key, input, false);
  },
  encrypt: function(key, input) {
    return this.crypt(key, input, true);
  }
};
Blowfish.initialize();
/*
function test(key, secret) {
  var key = new Uint8Array(Module.intArrayFromString(key));
  var data = new Uint8Array(Module.intArrayFromString(secret));
  var out = Blowfish.encrypt(key, data);
  var outer = Blowfish.decrypt(key, out);
  console.log(intArrayToString(data)+":"+data.length
         +" "+intArrayToString(outer)+":"+outer.length);
  return outer;
}

function safefail() {
  var data = new Uint8Array(Module.intArrayFromString("argle bargle fargle"));
  var inputPtr = Module.allocate(data, 'i8', ALLOC_NORMAL);
  var outputPtr = Module.allocate(12, 'i8', ALLOC_NORMAL);
  var outerputPtr = Module.allocate(12, 'i8', ALLOC_NORMAL);
  Module._crypt(4240, inputPtr, outputPtr, 12, 1);
  //Module._crypt(4240, outputPtr, outerputPtr, 12, 0);
  var peshul = Module.HEAPU8.subarray(outputPtr, outputPtr + 12);
  var peshuler = Module.allocate(peshul, 'i8', ALLOC_NORMAL);
  for(var i = 0; i < 12; i++) {
    console.log(Module.HEAPU8[peshuler+i]+" "+peshul[i]+" "+Module.HEAPU8[outputPtr+i]);
  }
  Module._crypt(4240, peshuler, outerputPtr, 12, 0);
  console.log("outer: "+Pointer_stringify(outerputPtr)+" {asdf} "+String.fromCharCode.apply(null, Module.HEAPU8.subarray(outerputPtr, outerputPtr + 12)));
}

var testStr = "hello world";
for(var i = 0; i < testStr.length; i++) {
//  test("asdf", testStr.substr(0,i));
}



  var secret = "hello world!";

  var key = Module.allocate(
      Module.intArrayFromString("asdf"),
      'i8',
      Module.ALLOC_NORMAL
  );
  var start = Module.allocate(Module.intArrayFromString("hello world!"), 'i8', Module.ALLOC_NORMAL);
  var out = Module._malloc(secret.length+1);
  var outer = Module._malloc(secret.length+1);
  crypt(key, start, out, secret.length + 1, 1);
  crypt(key, out, outer, secret.length + 1, 0);
  alert(Module.Pointer_stringify(start)+" "+Module.Pointer_stringify(outer));
}
*/
