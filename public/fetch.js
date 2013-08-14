(function() {

var key = "";

var statusText = document.getElementById("status-text");
var fileList = new FileList("file-list");

var keyEntry = new KeyEntry("key-entry", "view-button");

var fetchedData;
var xhr = new XMLHttpRequest();
var uid = window.location.pathname.split("/")[2];

if(typeof(uid) === "undefined") {
  alert("File not found");
  window.location = "/";
  return; //ooooooh this is shiny
}

keyEntry.submit.style.display = "none";
keyEntry.input.style.display = "none";
statusText.style.display = "inline-block";

updateStatus("Downloading");

xhr.addEventListener("progress", function(e) {
  if(e.lengthComputable) {
    updateStatus({
      type: "status",
      message: "Downloading",
      fraction: e.loaded/e.total
    });
  }
}, false);

xhr.open("GET", "/files/"+uid, true);
xhr.responseType = "arraybuffer";

xhr.onload = function (event) {
  var buffer = xhr.response;
  if (!buffer) {
    alert("File not found");
    window.location = "/";
    return;
  }
  fetchedData = new Uint8Array(buffer);
  reset();
};

xhr.send(null);

keyEntry.onSubmit = onKeyEntrySubmit;
function onKeyEntrySubmit(e) {
  e.stopPropagation();
  e.preventDefault();

  key = keyEntry.input.value;
  if(!fetchedData) {
    alert("Data must be downloaded");
    return;
  }
  var worker = new Worker("/utils/fetch-worker.js");

  worker.onmessage = function(event) {
    updateStatus(event.data);
  };

  worker.postMessage({
    key: key,
    data: fetchedData
  });


  statusText.style.display = "inline-block";
  keyEntry.input.style.display = "none";
  keyEntry.submit.value = "Cancel";
  keyEntry.onSubmit = function() {
    worker.terminate();
    updateStatus({
      type: "error",
      message: "Canceled"
    });
  };
}

function updateStatus(statusData) {
  statusText.textContent = statusData.message;
  if(typeof(statusData.fraction) !== "undefined") {
    statusText.textContent += " ("+Math.floor(100*statusData.fraction)+"%)";
  }

  if(statusData.type === "error") {
    keyEntry.onSubmit = reset;
    keyEntry.submit.value = "Reset";
  } else if(statusData.type === "file") {
    fileList.addFile(statusData.file, statusData.url);
  } else if(statusData.type === "done") {
    statusText.parentNode.style.display = "none";
  }
}


function reset() {
  statusText.style.display = "none";
  keyEntry.input.style.display = "inline-block";
  keyEntry.submit.style.display = "";
  keyEntry.submit.value = "View Files";
  keyEntry.onSubmit = onKeyEntrySubmit;
}

})();



