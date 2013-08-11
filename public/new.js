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
  if(!dropBox.files) {
    alert("You must specify some files");
    return;
  }

  var downloadLink = document.createElement("a");
  statusText.style.display = "inline-block";
  keyEntry.input.style.display = "none";
  keyEntry.submit.value = "Cancel Upload";
  keyEntry.onSubmit = function() {
    alert("I'm sorry Dave, I can't let you do that");
  };

  updateStatus("Compressing", 0);
  new Tarifier(dropBox.files).tar(
    function(tar) {
      updateStatus("Encrypting", 0);
      var encrypted = Blowfish.crypt(key, tar, true);
      updateStatus("Sending", 0);
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/files/", false);
      xhr.onload = function(event) {
        updateStatus("Uploaded", 100);
        console.dir(event);
        keyEntry.submit.value = "View";
        keyEntry.onSubmit = function() {
          window.location = "stuff";
        };
      };
      xhr.send(encrypted);
    }
  );
  /*
      var blob = new Blob([tar], {"type": "application/tar"});
      var url = window.URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.textContent = "hello world";
      downloadLink.download = "something.tar";
      document.getElementById("splash").appendChild(downloadLink);
    }
  );*/
};

function updateStatus(step, percentComplete) {
  statusText.textContent = step;
}


})();
