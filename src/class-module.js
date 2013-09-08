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