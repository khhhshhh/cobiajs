/* Cobia's Loader  
------------------------------------------------------------------------------*/
var currentScript;
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
		return interactiveScript;
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
	var rageScript = doc.getElementById('ragenode'); 
	var scripts = document.getElementsByTagName('script');
	rageScript = rageScript || scripts[scripts.length - 1];
	return rageScript;
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
