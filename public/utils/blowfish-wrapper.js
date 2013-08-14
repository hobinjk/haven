var Blowfish = {
  initialize: function() {
    this.wrappedCrypt = Module.cwrap('crypt', 'void', ['string', 'number', 'number', 'number', 'number']);
    this.free = Module._free ? Module._free : _free;
    this._ptr = -1;
  },
  crypt: function(key, input, encrypt) {
    var length = input.length;
    var inputPtr  = Module.allocate(input, 'i8', ALLOC_NORMAL);
    var outputPtr = inputPtr;//Module.allocate(length, 'i8', ALLOC_NORMAL);
    //var keyPtr = Module.allocate(key, 'i8', ALLOC_NORMAL);
    this.wrappedCrypt(key, inputPtr, outputPtr, length, encrypt ? 1 : 0);
    /*if(encrypt)
      this.wrappedEncrypt(key, inputPtr, outputPtr, length);
    else
      this.wrappedDecrypt(key, inputPtr, outputPtr, length - 1);*/
    //console.log(Module.HEAPU8.subarray(inputPtr, inputPtr + length).toSource());
    //console.log(Module.HEAPU8.subarray(outputPtr, outputPtr + length).toSource());

    //this.free(inputPtr);

    //this.free(keyPtr);
    this._ptr = outputPtr;
    return Module.HEAPU8.subarray(outputPtr, outputPtr + length);
  },
  decrypt: function(key, input) {
    return this.crypt(key, input, false);
  },
  encrypt: function(key, input) {
    return this.crypt(key, input, true);
  },
  cleanup: function() {
    if(this._ptr >= 0)
      this.free(this._ptr);
  }
};
Blowfish.initialize();
