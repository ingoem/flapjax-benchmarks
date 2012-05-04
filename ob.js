var Observable = function() {
	this.value = null;
	this.observers = [];
};

Observable.prototype.addOb = function(ob) {
	for (var i = 0; i < this.observers.length; i++) {
    	if (this.observers[i] == ob) {
      		return;
    	}
  	}
	this.observers.push(ob); 
};

Observable.prototype.removeOb = function(ob) {
  	for (var i = 0; i < this.observers.length; i++) {
    	if (this.observers[i] == ob) {
      		this.observers.splice(i, 1);
      		return;
    	}
  	}
};

Observable.prototype.sendEvent = function(v) {
  	for (var i = 0; i < this.observers.length; i++) {
		this.observers[i](v);
	}
};

Observable.prototype.setValue = function(v) {
    value = v;
    this.sendEvent(v);
};