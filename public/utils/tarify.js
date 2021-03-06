//expects array of file objects
//everything will be 0 levels deep

function Tarifier(files) {
  this.files = files;
}

Tarifier.prototype.tar = function() {
  var files = this.files;

  var size = 512*files.length;
  for(var i = 0; i < files.length; i++) {
    size += Math.ceil(files[i].size/512)*512;
  }

  var arrayBuffer = new ArrayBuffer(size);
  var array = new Uint8Array(arrayBuffer);

  var offset = 0;
  for(i = 0; i < files.length; i++) {
    if(typeof(postMessage) !== "undefined") {
      postMessage({
        type: "status",
        message: "Compressing",
        fraction: i/files.length
      });
    }
    this.putHeader(files[i], array, offset);
    offset += 512;
    var alignedSize = Math.ceil(files[i].size/512)*512;
    this.putFile(files[i], array, offset);
    offset += alignedSize;
  }
  return array;
};

Tarifier.prototype.putHeader = function(file, array, base) {
  this.putString(file.name, array, base);

  var offset;

  for(offset = file.name.length; offset < 100; offset++)
    array[base+offset] = 0;

  this.putString("000644 \0", array,base+100); //file mode
  this.putString("000000 \0", array,base+108); //UID
  this.putString("000000 \0", array,base+116); //GID
  var octalSize = file.size.toString(8);
  while(octalSize.length < 11)
    octalSize = "0"+octalSize; //inefficient, but whatever

  octalSize += " ";
  this.putString(octalSize, array, base+124);
  this.putString("00000000000 ", array, base+136); //last modified time
  this.putString("        ", array, base+148); //checksum placeholder
  this.putString("0", array, base+156);

  for(offset = 157; offset < 512; offset++)
    array[base+offset] = 0;

  var sum = 0;
  for(offset = 0; offset < 512; offset++)
    sum += array[base+offset];
  sum = sum.toString(8);
  while(sum.length < 6)
    sum = "0"+sum;
  sum += " \0";
  this.putString(sum, array, base+148); //calculated checksum
};

Tarifier.prototype.putFile = function(file, array, base) {
  if(file.size === 0) {
    return;
  }

  var fileReader = new FileReaderSync();
  var self = this;

  var buf = fileReader.readAsArrayBuffer(file);
  var data = new Uint8Array(buf);
  for(var offset = 0; offset < data.length; offset++) {
    array[base+offset] = data[offset];
  }
  var alignedLength = Math.ceil(data.length/512)*512;
  for(offset = data.length; offset < alignedLength; offset++) {
    array[base+offset] = 0;
  }
};

Tarifier.prototype.putString = function(str, array, base) {
  var offset;
  for(offset = 0; offset < str.length; offset++) {
    array[offset+base] = str.charCodeAt(offset);
  }
  return base + str.length;
};

