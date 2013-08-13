function KeyEntry(inputId, submitId) {
  this.input = document.getElementById(inputId);
  this.submit = document.getElementById(submitId);
  this.onSubmit = null;
  var self = this;
  this._inputKeypressListener = function(e) {
    if(e.keyCode && e.keyCode == 13)
      self.submit.click(); //wooo laziness
    var passLen = self.input.value.length;
    //10 chars is a good password or whatever
    var sat = passLen*10;
    if(sat > 100) sat = 100;
    self.submit.style.background = "hsl(240,"+sat+"%,97.1%)";

  };

  this._submitClickListener = function(e) {
    if(self.onSubmit) self.onSubmit(e);
  };

  this.input.addEventListener("keypress", this._inputKeypressListener, false);
  this.submit.addEventListener("click", this._submitClickListener, false);

  this.hide = function() {
    this.input.style.display = "none";
    this.submit.style.display = "none";
    this.input.removeEventListener("keypress", this._inputKeypressListener, false);
    this.submit.removeEventListener("click", this._submitClickListener, false);
  };
  this.show = function() {
    this.input.value = "";
    this.input.style.display = "inline";
    this.submit.style.display = "inline";
    this.input.addEventListener("keypress", this._inputKeypressListener, false);
    this.submit.addEventListener("click", this._submitClickListener, false);
  };

}

