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
  return; //ooooooh this is shiny
}

keyEntry.submit.style.display = "none";
keyEntry.input.style.display = "none";
statusText.style.display = "inline-block";

updateStatus("Downloading");

xhr.addEventListener("progress", function(e) {
  if(e.lengthComputable)
    updateStatus("Downloading", e.loaded/e.total);
}, false);

xhr.open("GET", "/files/"+uid, true);
xhr.responseType = "arraybuffer";

xhr.onload = function (event) {
  var buffer = xhr.response;
  if (!buffer) {
    alert("File not found");
  }
  fetchedData = new Uint8Array(buffer);
  reset();
};

xhr.send(null);

keyEntry.onSubmit = function onKeyEntrySubmit(e) {
  e.stopPropagation();
  e.preventDefault();

  key = keyEntry.input.value;

  if(!fetchedData) {
    alert("Data must be downloaded");
    return;
  }

  statusText.style.display = "inline-block";
  keyEntry.input.style.display = "none";
  keyEntry.submit.value = "Cancel";
  keyEntry.onSubmit = function() {
    alert("I'm sorry Dave, I can't let you do that");
  };


  updateStatus("Decrypting");
  var decrypted = Blowfish.crypt(key, fetchedData, false);

  updateStatus("Expanding");
  var files = new Untarifier(decrypted).untar();
  if(files) {
    for(var i = 0; i < files.length; i++) {
      updateStatus("Expanding", i/files.length);
      var blob = new Blob([files[i].array]);
      var url = window.URL.createObjectURL(blob);
      fileList.addFile(files[i], url);
    }
    updateStatus("Expanded");
    keyEntry.submit.style.display = "none";
  } else {
    reset();
    alert("Incorrect password");
  }
};

function updateStatus(step, fractionComplete) {
  statusText.textContent = step;
  if(typeof(fractionComplete) !== "undefined") {
    statusText.textContent += " ("+Math.floor(100*fractionComplete)+"%)";
  }
}


function reset() {
  statusText.style.display = "none";
  keyEntry.input.style.display = "inline-block";
  keyEntry.submit.style.display = "";
  keyEntry.submit.value = "View Files";
}

})();



