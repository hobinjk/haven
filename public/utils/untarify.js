function Untarifier(array) {
  this.array = array;
}

Untarifier.prototype.untar = function() {
  var files = [];
  var array = this.array;
  var offset = 0;
  while(offset < array.length) {
    var header = this.readHeader(array, offset);
    if(!header) return;
    console.log("read file: "+header.name);
    offset += 512;

    var fileData = this.readFile(array, offset, header.size);
    var alignedSize = Math.ceil(header.size/512)*512;
    offset += alignedSize;

    files.push({
      "name": header.name,
      "array": fileData,
      "size": header.size
    });
  }

  return files;
};

Untarifier.prototype.readHeader = function(array, base) {
  var fileName = this.readString(array, base, 100);
  var octalSizeStr = this.readString(array, base + 124, 100);
  var size = parseInt(octalSizeStr, 8);
  var checkSumStr = this.readString(array, base+148, 8);
  var checkSum = parseInt(checkSumStr, 8);

  for(var i = base+148; i < base+156; i++) {
    array[i] = ' '.charCodeAt(0);
  }

  for(i = base; i < base + 512; i++) {
    checkSum -= array[i];
  }
  if(checkSum !== 0) {
    console.log("ERROR: Invalid Checksum "+checkSumStr+" ("+checkSum+")");
    return;
  }

  return {name: fileName, size: size};
};

Untarifier.prototype.readFile = function(array, base, size) {
  return array.subarray(base, base+size);
};

Untarifier.prototype.readString = function(array, base, len) {
  var str = "";
  for(var i = base; i < base + len; i++) {
    if(array[i] === 0) break;
    str += String.fromCharCode(array[i]);
  }
  return str;
};

