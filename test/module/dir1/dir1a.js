module(function (require) {
	console.log('---------Thing in dir1a.js')
	var a = require('../a.js');
	console.log(a);
	return {
		name: 'dir1a.js',
		a: a
	}
});