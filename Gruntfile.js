module.exports = function (grunt) {
	grunt.initConfig({

		watch: {
			files: ['src/**/*'],
			tasks: ['concat:cobia']
		},

		concat: {
			options: {
				separator: '\n\n'
			},

			cobia: {
				src: ['src/head.js', 'src/utils-path.js', 
					'src/utils-inherit.js', 'src/loader.js', 
					'src/class-event.js', 'src/class-module.js',
					'src/functions.js', 'src/tail.js'],
				dest: 'dist/cobia.js'	
			}
		},

		gcc: {
			cobia: {
				src: ['dist/cobia.js'],
				dest: 'dist/cobia.min.js'
			}
		}

	}); 

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-gcc');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['concat:cobia', 'gcc:cobia']);

    grunt.event.on('watch', function (action, filename) {
    	grunt.log.writeln(action + ' ' + filename);
    });

};