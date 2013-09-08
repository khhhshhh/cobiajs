module(function (require) {
	console.log('---------Thing in a.js')
	var b = require('b.js');
	var dir2a = require('dir1/dir2/dir2a.js');
	console.log(b);
	console.log(dir2a);

	return {
		name: 'a.js',
		b: b,
		dir2a: dir2a
	}
});