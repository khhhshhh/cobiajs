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
