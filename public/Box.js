function Box(id) {
  this.id = id;
  this.files = null;

  this.onClick = this.onClick.bind(this);
  this.onDragEnter = this.onDragEnter.bind(this);
  this.onDragLeave = this.onDragLeave.bind(this);
  this.onDrop = this.onDrop.bind(this);
  this.onFileDelete = this.onFileDelete.bind(this);

  this.elem = document.getElementById(id);
  this.elem.addEventListener("dragenter", this.onDragEnter.bind(this), false);
  this.elem.addEventListener("dragleave", this.onDragLeave.bind(this), false);
  this.elem.addEventListener("dragover", Box.stop, false);
  this.elem.addEventListener("drop", this.onDrop.bind(this), false);

  this.fileListElem = new FileList("file-list");
  this.fileListElem.onFileDelete = this.onFileDelete;
  this.nextFileId = 0;

  this.addOnClick();
}

Box.prototype.onDragEnter = function(e) {
  this.elem.classList.add(this.id+"-drag-over");
};


Box.prototype.onDragLeave = function(e) {
  this.elem.classList.remove(this.id+"-drag-over");
};

Box.prototype.onDrop = function(e) {
  Box.stop(e);
  this.elem.classList.remove(this.id+"-drag-over");
  this.handleFiles(e.dataTransfer.files);
};

Box.prototype.onClick = function(e) {
  if(e.target.id != this.id) {
    if(!e.target.classList.contains("dropbox"))
      return;
  }
  var hiddenInput = document.getElementById("file-input");
  hiddenInput.addEventListener("change", function changeListener(event) {
    this.handleFiles(event.target.files);
    event.target.removeEventListener("change", changeListener, false);
  }.bind(this), false);
  hiddenInput.click();
};

Box.prototype.removeOnClick = function() {
  this.elem.removeEventListener("click", this.onClick, false);
};

Box.prototype.addOnClick = function() {
  this.elem.addEventListener("click", this.onClick, false);
};

Box.prototype.handleFiles = function(files) {
  if(!files) return;

  if(!this.files)
    this.files = [];

  //convert to array (probably a better way to do this)
  for(var i = 0; i < files.length; i++) {
    files[i].id = "" + this.nextFileId++;
    this.files.push(files[i]);
    this.fileListElem.addFile(files[i]);
  }

  if(this.onFilesAdded) {
    this.onFilesAdded();
  }
};

Box.prototype.onFileDelete = function(fileId) {
  this.files = this.files.filter(function(f) {
    return f.id !== fileId;
  });
};

Box.stop = function(e) {
  e.stopPropagation();
  e.preventDefault();
};

