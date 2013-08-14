(function() {
/*if(typeof(window.URL) === "undefined") {
  window.URL = window.webkitURL;
}*/

var dropBox = new Box("container");

document.body.addEventListener("drop", Box.stop, false);

var key = "";

var statusText = document.getElementById("status-text");

var keyEntry = new KeyEntry("key-entry", "upload-button");

keyEntry.onSubmit = function onKeyEntrySubmit(e) {
  e.stopPropagation();
  e.preventDefault();
  key = keyEntry.input.value;
  if(!dropBox.files || (dropBox.files.length === 0)) {
    alert("You must specify some files");
    return;
  }
  var worker = new Worker("utils/new-worker.js");
  worker.onmessage = function(event) {
    onProgress(event.data);
  }

  var downloadLink = document.createElement("a");
  statusText.style.display = "inline-block";
  keyEntry.input.style.display = "none";
  keyEntry.submit.value = "Cancel Upload";
  keyEntry.onSubmit = function() {
    onProgress({type: "error", message:"Canceled"});
    worker.terminate();
  };

  worker.postMessage({
    key: key,
    files: dropBox.files
  });
};

function updateStatus(step, fractionComplete) {
  statusText.textContent = step;
  if(typeof(fractionComplete) !== "undefined") {
    statusText.textContent += " ("+Math.floor(100*fractionComplete)+"%)";
  }
}

function onProgress(data) {
  updateStatus(data.message, data.fraction);
  if(data.type === "error") {
    keyEntry.submit.value = "Reset";
    keyEntry.onSubmit = function() {
      statusText.style.display = "none";
      keyEntry.input.style.display = "inline-block";
      keyEntry.submit.value = "Begin Upload";
    };
  } else if(data.type === "done") {
    keyEntry.submit.value = "View";
    keyEntry.onSubmit = function() {
      window.location = data.url;
    };
  }
}

})();
