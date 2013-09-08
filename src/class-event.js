/* class-Event
------------------------------------------------------------------------------*/
function Event () {
	this.events = {};
}

Event.prototype.on = function (eventName, handler) {
	var events = this.events;
	if (eventName && handler) {
		var handlers = events[eventName]; 
		handlers ? handlers.push(handler) : events[eventName] = [handler];
	}
};

Event.prototype.off = function(eventName, handler) {

	// eventName and handler are not specificed
	// remove all handlers of all events
	if (!(eventName && handler)) {
		this.events = {};
		return ;
	}

	var events = this.events;
	var handlers = events[eventName];

	if (handlers) {
		if (handler) {
			for (var i = handlers.length - 1; i >= 0; i--) {
				if (handler === handlers[i]) {
					handlers.splice(i, 1);
				}
			}
		} else { 
			// handler is not specificed, then remvoe all handlers from that event
			delete events[eventName];
		}
	} 
};


Event.prototype.emit = function(eventName) {
	var events = this.events;
	var handlers = events[eventName];

	// passing arguments to handler
	var args = arguments;
	Array.prototype.shift.apply(args); 	

	if (handlers) {
		for (var i = handlers.length - 1; i >= 0; i--) {
			var handler = handlers[i];
			handler.apply(this, args);
		}
	}
};