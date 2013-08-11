function FileList(id) {
  this.elem = document.getElementById(id);
}

FileList.prototype.addFile = function(file, href) {
  var elt = document.createElement("tr");
  elt.classList.add("file-row");

  var name = document.createElement("td");
  name.classList.add("file-row-name");
  if(!href) {
    name.textContent = file.name;
  } else {
    var a = document.createElement("a");
    a.href = href;
    a.download = file.name;
    a.textContent = file.name;
    name.appendChild(a);
  }

  var size = document.createElement("td");
  size.classList.add("file-row-size");
  size.textContent = FileList.humanReadableSize(file.size);

  elt.appendChild(name);
  elt.appendChild(size);

  this.elem.appendChild(elt);
};

FileList.humanReadableSize = function(size) {
  var suffixes = ["B", "KB", "MB", "GB"];
  var log = Math.round(Math.log(size)/Math.log(1024)-0.4);
  if(log < 0) log = 0;
  if(log > suffixes.length - 1) {
    log = suffixes.length - 1;
  }
  var factor = Math.pow(1024, log);
  var scaled = Math.round(100*(size / factor))/100;
  return scaled + suffixes[log];
};

