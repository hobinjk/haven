function Box(id) {
  this.id = id;
  this.files = null;

  this.elem = document.getElementById(id);
  this.elem.addEventListener("dragenter", this.onDragEnter(this), false);
  this.elem.addEventListener("dragleave", this.onDragLeave(this), false);
  this.elem.addEventListener("dragover", Box.stop, false);
  this.elem.addEventListener("drop", this.onDrop(this), false);
  this.fileListElem = new FileList("file-list");

  this._onClickListener = this.onClick(this);
  this.addOnClick();
}

Box.prototype.onDragEnter = function(self) {
  return function(e) {
    //Box.stop(e);
    console.log("ondragenter");
    self.elem.classList.add(this.id+"-drag-over");
  };
};


Box.prototype.onDragLeave = function(self) {
  return function(e) {
    //Box.stop(e);
    console.log("ondragleave");
    self.elem.classList.remove(this.id+"-drag-over");
  };
};

Box.prototype.onDrop = function(self) {
  return function(e) {
    Box.stop(e);
    self.elem.classList.remove(this.id+"-drag-over");
    self.handleFiles(e.dataTransfer.files);
  };
};

Box.prototype.onClick = function(self) {
  return function(e) {
    if(e.target.id != self.id) {
      if(!e.target.classList.contains("dropbox"))
        return;
    }
    var hiddenInput = document.getElementById("file-input");
    hiddenInput.addEventListener("change", function changeListener(event) {
      self.handleFiles(event.target.files);
      event.target.removeEventListener("change", changeListener, false);
    }, false);
    hiddenInput.click();
  };
};

Box.prototype.removeOnClick = function() {
  this.elem.removeEventListener("click", this._onClickListener, false);
};

Box.prototype.addOnClick = function() {
  this.elem.addEventListener("click", this._onClickListener, false);
};

Box.prototype.handleFiles = function(files) {
  if(!files) return;

  if(!this.files)
    this.files = [];

  //convert to array (probably a better way to do this)
  for(var i = 0; i < files.length; i++) {
    this.files.push(files[i]);
  }

  console.log(this+" is receiving "+files.length+" files");

  for(i = 0; i < files.length; i++) {
    this.fileListElem.addFile(files[i]);
  }

  var prompt = document.getElementById("prompt");
  if(prompt) {
    prompt.parentNode.removeChild(prompt);
  }

  if(this.onFilesAdded) {
    this.onFilesAdded();
  }
};

Box.stop = function(e) {
  e.stopPropagation();
  e.preventDefault();
};

