module(function (require) {
	console.log('---------------Things in dir2a.js');
	var c = require('../../c.js');
	return {
		name: 'dir2a.js',
		c: c
	};
});