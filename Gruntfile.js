const image_sizes = {
  small: 320,
  medium: 640,
  large: 1024,
  small_x: function(x) { return this.small * x; },
  medium_x: function(x) { return this.medium * x; },
  large_x: function(x) { return this.large * x; },
};

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [
            {
              width: image_sizes.small,
              name: 'small',
              quality: 80
            }, {
              width: image_sizes.medium,
              name: 'medium',
              quality: 70
            }, {
              width: image_sizes.large,
              name: 'large',
              quality: 70
            }, {
              width: image_sizes.small_x(2),
              name: 'small',
              suffix: '_x2',
              quality: 70
            }, {
              width: image_sizes.medium_x(2),
              name: 'medium',
              suffix: '_x2',
              quality: 50
            }, {
              width: image_sizes.large_x(2),
              name: 'large',
              suffix: '_x2',
              quality: 50
            }, {
              width: image_sizes.small_x(3),
              name: 'small',
              suffix: '_x3',
              quality: 50
            }, {
              width: image_sizes.medium_x(3),
              name: 'medium',
              suffix: '_x3',
              quality: 30
            }, {
              width: image_sizes.large_x(3),
              name: 'large',
              suffix: '_x3',
              quality: 30
            }
          ]
        },

        files: [
          {
            expand: true,
            src: ['*.{gif,jpg,jpeg,png}'],
            cwd: 'src/img_source/',
            dest: 'src/img/'
          }
        ]
      }
    },

    clean: {
      dev: {
        src: ['src/img']
      }
    },

    mkdir: {
      dev: {
        options: {
          create: ['src/img']
        }
      }
    },

    copy: {
      dev: {
        files: [
          {
            expand: true,
            src: ['*.{gif,jpg,jpeg,png}'],
            cwd : 'src/img_source/fixed/',
            dest: 'src/img/'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('images', ['clean', 'mkdir', 'responsive_images']);
};
