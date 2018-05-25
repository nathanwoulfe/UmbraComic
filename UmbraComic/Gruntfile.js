module.exports = grunt => {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    //cant load this with require
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-banner');

    if (grunt.option('target') && !grunt.file.isDir(grunt.option('target'))) {
        grunt.fail.warn('The --target option specified is not a valid directory');
    }

    grunt.initConfig({
        packageVersion: () => {
            var buildVersion = grunt.option('buildversion') || '1.0.0.1',
                packageSuffix = grunt.option('packagesuffix') || 'build',
                buildBranch = grunt.option('buildbranch') || 'master';

            var findPoint = buildVersion.lastIndexOf('.');
            var basePackageVer = buildVersion.substring(0, findPoint);
            var buildNumber = buildVersion.substring(findPoint + 1, buildVersion.length);
            if (buildBranch.toLowerCase() !== 'release') {
                return basePackageVer + '-build' + buildNumber;
            } else if (packageSuffix !== 'build' && packageSuffix.length > 0) {
                return basePackageVer + '-' + packageSuffix;
            } else {
                return basePackageVer;
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        dest: grunt.option('target') || '../dist',
        basePath: 'App_Plugins/UmbraComic',
        banner:
            '*! <%= pkg.title || pkg.name %> - v<%= packageVersion() %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n' +
            ' * Licensed <%= pkg.license %>\n *',

       

        //Compile the less file into a CSS file
        sass: {
            dist: {
                files: {
                    '<%= basePath %>/style.css': ['<%= basePath %>/style.scss']
                },
            }
        },

        watch: {

            // dev watches everything, copies everything
            dev: {
                files: ['<%= basePath %>/**/*'],
                tasks: ['sass:dist', 'copy:dev'],
                options: {
                    livereload: true
                }
            },

            css: {
                files: ['<%= basePath %>/style.scss'],
                tasks: ['sass:dist']
            },
           
            config: {
                files: ['<%= basePath %>/package.manifest'],
                tasks: ['copy:config']
            }
        },

        copy: {
            dev: {
                expand: true,
                cwd: '<%= basePath %>/',
                src: '**/*',
                dest: '../umbracomic.site/<%= basePath %>/',
            },

            config: {
                src: '<%= basePath %>/package.manifest',
                dest: '<%= dest %>/<%= basePath %>/package.manifest',
            },

            css: {
                src: '<%= basePath %>/style.css',
                dest: '<%= dest %>/<%= basePath %>/style.css'
            },

            nuget: {
                expand: true,
                cwd: '<%= dest %>',
                src: '<%= basePath %>/**',
                dest: 'tmp/nuget/content/'
            },

            umbraco: {
                expand: true,
                cwd: '<%= dest %>/',
                src: '<%= basePath %>/**',
                dest: 'tmp/umbraco/'
            },

            umbracoBin: {
                expand: true,
                cwd: 'bin/Debug/',
                src: 'UmbraComic.*',
                dest: 'tmp/umbraco/bin'
            }
        },

        template: {
            nuspec: {
                options: {
                    data: {
                        name: '<%= pkg.name %>',
                        version: '<%= pkg.version %>',
                        author: '<%= pkg.author.name %>',
                        description: '<%= pkg.description %>'
                    }
                },
                files: {
                    'tmp/nuget/<%= pkg.name %>.nuspec': 'config/package.nuspec'
                }
            }
        },

        mkdir: {
            pkg: {
                options: {
                    create: ['pkg/nuget', 'pkg/umbraco']
                },
            },
        },

        nugetpack: {
            dist: {
                src: 'tmp/nuget/<%= pkg.name %>.nuspec',
                dest: 'pkg/nuget/'
            }
        },

        umbracoPackage: {
            dist: {
                src: 'tmp/umbraco',
                dest: 'pkg/umbraco',
                options: {
                    name: '<%= pkg.name %>',
                    version: '<%= pkg.version %>',
                    url: '<%= pkg.url %>',
                    license: '<%= pkg.license %>',
                    licenseUrl: '<%= pkg.licenseUrl %>',
                    author: '<%= pkg.author.name %>',
                    authorUrl: '<%= pkg.author.url %>'
                }
            }
        },

        clean: {
            dist: '[object Object]',
            test: 'test/assets'
        }
    });

    grunt.registerTask('default', ['sass', 'copy:css', 'copy:config']);
    grunt.registerTask('nuget', ['clean', 'default', 'copy:nuget', 'template:nuspec', 'mkdir:pkg', 'nugetpack']);
    grunt.registerTask('package', ['clean', 'default', 'copy:umbraco', 'copy:umbracoBin', 'mkdir:pkg', 'umbracoPackage']);

    grunt.registerTask('dev', ['watch:dev']);
};