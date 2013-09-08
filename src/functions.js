function module(factory) {

	moduleData = {
		id: '',
		uri: '',
		factory: factory,
		dependencies: parseDependencies(factory.toString())
	};

}