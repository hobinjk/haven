importScripts('tarify.js');

onmessage = function(event) {
  var key = event.data.key;
  var files = event.data.files;
  if(!files || (files.length === 0)) {
    postMessage({
      type: "error",
      message: "You must specify some files"
    });
    return;
  }

  postMessage({
    type: "status",
    message: "Compressing"
  });
  var tar = new Tarifier(files).tar();

  postMessage({
    type: "status",
    message: "Encrypting"
  });
  if(tar.length > 33554432 - 2000) {
    if(typeof(Module) === "undefined")
      Module = {};
    Module.TOTAL_MEMORY = 1 << Math.ceil(Math.log2(tar.length + 2000));
    Module.test = "test";
  }

  importScripts('blowfish.js');
  importScripts('blowfish-wrapper.js');

  var encrypted = Blowfish.crypt(key, tar, true);

  if(!encrypted) {
    postMessage({
      type: "error",
      message: "Encryption failed (try fewer files)"
    });
    return;
  }
  if(encrypted.length > 10*1024*1024) {
    postMessage({
      type: "error",
      message: "Sorry, file uploads are limited to 10 MB (the server is tiny)"
    });
    return;
  }
  postMessage({
    type: "status",
    message: "Sending"
  });
  var xhr = new XMLHttpRequest();

  xhr.upload.addEventListener("progress", function(e) {
    if(!e.lengthComputable) {
      return;
    }

    postMessage({
      type: "status",
      message: "Sending",
      fraction: e.loaded / e.total
    });
  }, false);

  xhr.open("POST", "/files/", true);

  xhr.onload = function(event) {
    postMessage({
      type: "done",
      message: "Uploaded",
      url: xhr.responseText || xhr.response
    });
  };

  xhr.send(new Blob([encrypted]));
};
