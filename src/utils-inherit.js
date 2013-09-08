/* utils-inherit
------------------------------------------------------------------------------*/
function inherit (superClass, subClass) {
	var Fn = function () {};
	Fn.prototype = superClass.prototype;

	var proto = subClass.prototype = new Fn;
	proto.constructor = superClass;
	proto._super_ = superClass;
};
