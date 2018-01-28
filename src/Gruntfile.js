module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  // grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-mocha-test');
  // grunt.loadNpmTasks('grunt-karma');
  
  var renameToCompiled = function(dest, src, config) {
    return dest +  src.substring(0, src.lastIndexOf('.')) + config.ext;
  };
  var appFiles = {
    coffee: {
      expand: true,
      cwd: 'coffee/',
      src: ['**/*.coffee'],
      dest: 'compiled/',
      ext: '.js',
      rename: renameToCompiled
    },
    js: {
      expand: true,
      flatten: false,
      cwd: 'compiled/public/app/',
      src: ['**/*.js'],
      dest: 'dist/js/'
    },
    less: {
      expand: true,
      flatten: false,
      cwd: 'compiled/public/app/less/',
      src: ['**/*.less'],
      dest: 'compiled/public/app/css/',
      ext: '.css',
      rename: renameToCompiled
    },
    css: {
      expand: true,
      flatten: false,
      cwd: 'compiled/public/css/',
      src: ['**/*.css'],
      dest: 'dist/css/'
    }
  };
  appFiles.watch = {
    coffee: appFiles.coffee.cwd + appFiles.coffee.src,
    less: appFiles.less.cwd + appFiles.less.src
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['dist/**/*', '!dist/.git', '!dist/Procfile',
      'compiled/public/app/**/*.js',
      'compiled/public/app/css/',
      'compiled/public/test/**/*.js',
      'compiled/server/**/*.js'
    ],
    // TODO Corrigir problema do require antes de habilitar
    uglify: {
      options : {
        mangle: {
          except: ['require']
        }
      },
      front: {
        files: [
        // {
        //     expand: true,
        //     cwd: 'src/public/app/js',
        //     src: '**/*.js',
        //     dest: 'dist/public/app/js'
        // },
        {
          expand: true,
          cwd: 'src/public/',
          src: [
            // 'app/css/**',
            // 'app/images/**',
            // 'app/templates/**',
            'app/js/**/*.js',
            // 'index.html',
            'libs/backbone/backbone.js',
            // 'libs/bootstrap/dist/**',
            // 'libs/bootstrap-datepicker/css/**',
            'libs/bootstrap-datepicker/js/bootstrap-datepicker.js',
            'libs/bootstrap-datepicker/js/locales/bootstrap-datepicker.pt-BR.js',
            // 'libs/jquery/dist/jquery.min.js',
            // 'libs/jquery.maskedinput/jquery.maskedinput.min.js',
            'libs/requirejs/require.js',
            'libs/text/text.js',
            'libs/underscore/underscore.js',
          ],
          dest: 'dist/public/'
        }]
      }
    },
    watch: {
      coffee: {
        files: [appFiles.watch.coffee],
        tasks : ['coffee'],
        options: {
          spawn: false
        }
      },
      less: {
        files: [appFiles.watch.less],
        tasks : ['less'],
        options: {
          spawn: false
        }
      }
    },
    coffee: {
      compile : {
        options: {
          // bare: true,
          preserve_dirs: true
        },
        files: [appFiles.coffee]
      }
    },
    less: {
      options: {
        compile: true,
        compress: true
      },
      // bootstrap: {
      //   src: ['src/public/libs/bootstrap/less/bootstrap.less'],
      //   dest: 'src/public/app/css/bootstrap.css'
      // },
      app: {
        // cwd: 'src/public/app/less/',
        // src: ['**/*.less'],
        src: ['compiled/public/app/less/style.less'],
        dest: 'compiled/public/app/css/style.css'
        // dest: 'src/public/app/css/',
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'compiled/public/',
            src: [
              'app/css/**',
              'app/images/**',
              'app/templates/**',
              // 'app/js/**/*.js',
              'index.html',
              // 'libs/backbone/backbone.js',
              'libs/bootstrap/dist/**',
              'libs/bootstrap-datepicker/css/**',
              // 'libs/bootstrap-datepicker/js/bootstrap-datepicker.js',
              // 'libs/bootstrap-datepicker/js/locales/bootstrap-datepicker.pt-BR.js',
              'libs/jquery/dist/jquery.min.js',
              'libs/jquery.maskedinput/jquery.maskedinput.min.js',
              // 'libs/requirejs/require.js',
              // 'libs/text/text.js',
              // 'libs/underscore/underscore.js',
            ],
            dest: 'dist/public/'
          },
          // {expand: true, cwd: 'src/', src: ['public/app/libs/bootstrap/dist/css/bootstrap.css'], dest: 'dist/'},
          // {expand: true, flatten: true, src: 'src/public/index.html', dest: 'dist/public/'},
          {expand: true, cwd: 'compiled/server/', src: ['**/*.js', '!test/**'], dest: 'dist/server/'},
          {expand: true, flatten: true, src: 'package.json', dest: 'dist/'},
          {expand: true, cwd: 'compiled/', src: ['*.js'], dest: 'dist/'}
        ]
      },
    },
    connect: {
      server: {
        options: {
          port: 9001,
          hostname: '*',
          base: 'compiled/public',
          // keepalive: true
        }
      }
    }
  });

  grunt.registerTask('default', ['clean', 'coffee', 'less', 'mochaTest', /*'karma',*/ 'copy', 'uglify']);
  grunt.registerTask('serverTest', ['clean', 'coffee', 'mochaTest']);
  grunt.registerTask('compile', ['clean', 'coffee', 'less', 'copy', 'uglify']);
  grunt.registerTask('server', function() {
    grunt.task.run(['clean', 'coffee']);
    require('./compiled/server.js');
    grunt.task.run('watch');
  });

  grunt.event.on('watch', function(action, filepath, target) {
    var configs = grunt.util._.extend({}, appFiles[target]);
    configs.src = filepath.substring(configs.cwd.length);
    var destFile = renameToCompiled(configs.dest, configs.src, configs);
    if (action == 'deleted') {
      grunt.file.delete(destFile);
      grunt.log.ok('File "'+ destFile +'" deleted.');
    } else {
      switch (target) {
        case 'coffee':
          grunt.config('coffee.compile.files', [configs]);
          break;
        case 'less':
          grunt.config('less.dev.files', [configs]);
          break;
      }
    }
    // if(destFile.match(/\\server\\/i))
    //   require('./src/run.js');
  });
};
