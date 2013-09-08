(function (global, doc) {

var previousCobia = global.Cobia;
var Cobia = global.Cobia = {};

Cobia.noConflict = function () {
	window.Cobia = previousCobia;
};



/* utils-inherit
------------------------------------------------------------------------------*/
function inherit (superClass, subClass) {
	var Fn = function () {};
	Fn.prototype = superClass.prototype;

	var proto = subClass.prototype = new Fn;
	proto.constructor = superClass;
	proto._super_ = superClass;
};



/* utils-path
------------------------------------------------------------------------------*/


var path = Cobia.path = {};

path.basename = function (pathName) {
	var lastIndexOfDot = pathName.lastIndexOf('/');
	return pathName.substr(lastIndexOfDot + 1);
};

path.nomalize = function (pathName) {
	var DOT_RE = /\/\.\//;
	var TWO_DOT_RE = /\/[^\/]+\/\.\.\//;

	while (pathName.match(DOT_RE)) {	
		pathName = pathName.replace(DOT_RE, '/')
	}

	while (pathName.match(TWO_DOT_RE)) {
		pathName = pathName.replace(TWO_DOT_RE, '/')
	}


	return pathName;
};

path.extname = function (pathName) {
	var lastIndexOfDot = pathName.lastIndexOf('.');
	return pathName.substr(lastIndexOfDot);
};

path.dirname = function (pathName) {
	return pathName.match(/[^?#]*\//)[0];
};



/* Cobia's Loader  
------------------------------------------------------------------------------*/
var currentlyAddingScript;
var interactiveScript;

function loadScript (url, callback) {
	var script = doc.createElement('script')
	head = doc.getElementsByTagName('head')[0];
	script.src = url;

	currentScript = script;

	script.onreadystatechange = function () {
		if (this.readyState == 'loaded') {
			if (callback) callback();
			head.removeChild(script);
		}
	};

	script.onload = function () {
		if (callback) callback();
		head.removeChild(script);
	};

	head.appendChild(script);
	currentScript = null;
}



function getCurrentScript() {
	if (currentScript) {
		return currentScript;
	}

	if (interactiveScript && interactiveScript.readyState === 'interactive') {
		return interactiveScript
	}

	var scripts = doc.getElementsByTagName('script')[0];
	for (var i = scripts.len; i >= 0; i--) {
		var script = scripts[i];
		if (script.readyState === 'interactive') {
			interactiveScript = script;
			return interactiveScript;
		}
	}
}




var location = window.location;
var head = doc.getElementsByTagName('head')[0];
var root = location.origin;
var cwd = path.dirname(location.pathname);

function getCobiaScriptNode () {
	var cobiaScript = doc.getElementById('cobianode'); 
	var scripts = document.getElementsByTagName('script');
	cobiaScript = cobiaScript || scripts[scripts.length - 1];
	return cobiaScript;
}	

function path2Uri (cwd, pathName) {
	var ABSOLUTE_PATH_RE = /^\//; 
	if (pathName.match(ABSOLUTE_PATH_RE)) {
		return path.nomalize(root + pathName);
	} else {
		return path.nomalize(cwd + pathName);
	}
}

function uri2Id (uri) {
	var REPLACE_ROOT_RE = new RegExp('^' + root);
	return uri.replace(REPLACE_ROOT_RE, ''); 
}

// parse dependencies from a function's toString string
function parseDependencies (functionStr) {
	var COMMENT_RE =/(\/\*[^n]*?\*\/)|(\/\/\s*.*)/g;
	var REQUIRE_RE = /require\(("|')(.+?)("|')\)/g;

	var functionStr = functionStr.replace(COMMENT_RE, '');

	var dependencies = functionStr.match(REQUIRE_RE);

	if(!dependencies) return [];

	for (i = dependencies.length - 1; i >= 0; i--) {
		var dependency = dependencies[i];
		var REPLACE_RE = /(require)|'|"|\(|\)/g;
		dependency = dependency.replace(REPLACE_RE, '');
		dependencies[i] = dependency;
	}

	return dependencies;
}

function id2Uri (id) {
	return root + id;
}




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







/* class-Module
------------------------------------------------------------------------------*/
var WAITING = 0;
var LOADING = 1;
var LOADED = 2;
var READY = 3;

var modules = {};

var moduleData;

function Module (uri) {
	Event.apply(this, arguments);

	this.uri = uri || '';
	this.id = uri2Id(uri);
	this.dependencies = null;
	this.exports = null;
	this.status = WAITING;

	modules[this.id] = this;
}

// inherit prototype from Event
inherit(Event, Module);

Module.modules = modules;

Module.prototype.set = function (dataToset) {
	for (toSetName in dataToset) {
		var toSetValue = dataToset[toSetName];
		if (toSetValue) {
			this[toSetName] = toSetValue;
		}
	} 
};

Module.prototype.load = function () {
	var dependencies = this.dependencies;
	var uri = this.uri;
	var id = this.id;
	var module = this;

	this.status = LOADING;

	loadScript(uri, saveAfterLoad);

	// When `define` has run, then script containing `define`
	// will immediately fire the event `onload`, which will call 
	// the function below. The `define` will set the `moduleData` 
	// at the end of execution. when `onload` accurs, we can use 
	// the function below to get moduleData and get information 
	// such as `uri` by using closure, then we can composite with those
	// information and moduleData together.
	function saveAfterLoad () {
		if (moduleData) {
			module.set(moduleData);
			moduleData = null;

			module._remains_ = module.dependencies.length;
			module.status = LOADED;
			module.emit('loaded', this);
			module.loadDependencies();
		} 
	}
};

Module.prototype.loadDependencies = function () {
	var dependencies = this.dependencies;
	var cwd = path.dirname(this.uri);
	var module = this;

	if (dependencies.length === 0) {
		tryToExecuteCurrentModule();
		return;
	}

	for (var i = dependencies.length -1; i >= 0; i--) {
		var dependency = dependencies[i];
		var dependencyUri = path2Uri(cwd, dependency);
		var dependencyId = uri2Id(dependencyUri);
		var depenModule = modules[dependencyId];

		// replace the dependency's path in array with its real id 
		dependencies[i] = dependencyId;

		// If dependency has been already created
		if(depenModule) {

			if (depenModule.status === READY) {
				tryToExecuteCurrentModule();
			} else {
				// try to execute current module while dependendy has ready
				depenModule.on('ready', tryToExecuteCurrentModule);
			}

			continue;
		}

		// Dependency has not been not loaded, then create it.
		depenModule = new Module(dependencyUri);
		depenModule.load();
		depenModule.on('ready', tryToExecuteCurrentModule);
	}

	function tryToExecuteCurrentModule(depenModule) {
		if (module._remains_ > 0) module._remains_--;

		module.tryToExecute();

		if (depenModule) {
			depenModule.off('ready', tryToExecuteCurrentModule);
		}
	}
};

Module.prototype.tryToExecute = function () {
	var _remains_ = this._remains_;
	var factory = this.factory;
	var cwd = path.dirname(this.uri);
	var module = this;

	if (_remains_ === 0 && factory) {
		var exports;
		exports = factory(require, module.exports = {}, module);
		module.exports = exports ? exports : module.exports;
		module.status = READY;
		module.emit('ready', module);

		delete module.factory;
	} 

	function require (pathName) {
		var uri = path2Uri(cwd, pathName);
		return modules[uri2Id(uri)].exports;
	}
};


Module.init = function () {
	var cobiaScript = getCobiaScriptNode(); 
	var mainScriptPath = cobiaScript.getAttribute('data-main'); 
	var mainUri = path2Uri(cwd, mainScriptPath);  
	var mainModule = new Module(mainUri);
	mainModule.load();
};

function module(factory) {

	moduleData = {
		id: '',
		uri: '',
		factory: factory,
		dependencies: parseDependencies(factory.toString())
	};

}

Cobia.module = window.module = module;

Module.init();

Cobia.seajsSyntax = function () {
	window.define = module;
};

})(window, document);