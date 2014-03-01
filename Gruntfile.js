module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  pkg: grunt.file.readJSON('package.json'),
  grunt.initConfig({
    sass: {
      dist: {
        files: {
          'source/_base.css': 'source/base.scss'
        }
      }
    },

    // Concatenate CSS files
    concat: {
      dist: {
        src: [
          // _base.css required for .animated helper class
          'source/_base.css',
          'source/**/*.css'
        ],
        dest: 'ng-animate.css'
      }
    },

    // Auto-prefix CSS properties using Can I Use?
    autoprefixer: {
      options: {
        browsers: ['last 3 versions', 'bb 10', 'android 3']
      },
      no_dest: {
        // File to output
        src: 'ng-animate.css'
      },
    },

    // Minify CSS
    cssmin: {
      minify: {
        src: ['ng-animate.css'],
        dest: 'ng-animate.min.css',
      },
    },

    // Watch files for changes
    watch: {
      css: {
        files: [
          'source/**/*',
          '!node_modules',
          'animate-config.json'
        ],
        // Run Sass, autoprefixer, and CSSO
        tasks: ['concat-anim', 'autoprefixer', 'cssmin'],
      }
    }

  });

  // Register our tasks
  grunt.registerTask('default', ['concat-anim', 'autoprefixer', 'cssmin', 'watch']);

  grunt.registerTask('concat-anim', 'Concatenates activated animations', function () {
    var config = grunt.file.readJSON('animate-config.json'),
    target = [ 'source/_base.css' ],
    enterAnimation = [],
    leaveAnimation = [],
    count = 0

    for (var ani in config) {
      for (var cat in config[ani]) {
        for (var file in config[ani][cat]) {
          if (config[ani][cat][file]) {
            var fileName = 'source/' + ani + '/' + cat + '/' + file;
            if (ani == "enter_animations") {
              enterAnimation.push(file);
            } else {
              leaveAnimation.push(file);
            }
            target.push(fileName + '.scss');
            count++
          }
        }
      }
    }
    var writeFile = function(file,content) {
      var fs = require('fs');
      fs.writeFile(file, content, function(err) {
        if(err) {
          grunt.log.writeln(err);
        } else {
          grunt.log.writeln("Generate file:" + file);
        }
      });
    }

    var content = "$enter-animations:\n"
    content = content + enterAnimation.join(', ') + ';'
    writeFile('source/_enter_animations.scss', content);
    content = "$leave-animations:\n"
    content = content + leaveAnimation.join(', ') + ';'
    writeFile('source/_leave_animations.scss', content);

    if (!count) {
      grunt.log.writeln('No animations activated.')
    }

    grunt.log.writeln(count + (count > 1 ? ' animations' : ' animation') + ' activated.')

    grunt.task.run('sass')
    grunt.config('concat', { 'ng-animate.css': target })
    grunt.task.run('concat')
  });
};
