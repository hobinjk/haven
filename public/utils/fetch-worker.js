importScripts('untarify.js');

onmessage = function(event) {
  var key = event.data.key;
  var data = event.data.data;

  postMessage({
    type: "status",
    message: "Decrypting"
  });

  if(data.length > 33554432 - 2000) {
    if(typeof(Module) === "undefined")
      Module = {};
    Module.TOTAL_MEMORY = 1 << Math.ceil(Math.log2(data.length + 2000));
    Module.test = "test";
  }

  importScripts('blowfish.js');
  importScripts('blowfish-wrapper.js');

  var decrypted = Blowfish.crypt(key, data, false);

  postMessage({
    type: "status",
    message: "Expanding"
  });
  var files = new Untarifier(decrypted).untar();

  Blowfish.cleanup();

  if(files) {
    postMessage({
      type: "done",
      message: "Expanded"
    });
    for(var i = 0; i < files.length; i++) {
      var blob = new Blob([files[i].array]);
      var url = URL.createObjectURL(blob);
      postMessage({
        type: "file",
        file: {
          name: files[i].name,
          size: files[i].size
        },
        url: url
      });
    }
  } else {
    postMessage({
      type: "error",
      message: "Incorrect password"
    });
  }
};

