'use strict';

//includes
var gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    merge = require('merge-stream');

//paths
var paths = {
    scripts: './Scripts/',
    css: './CSS/',
    vendor: {
        root: './Vendor/**/'
    },
    webroot: './wwwroot/',
};

//working paths
paths.working = {
    js: {
        platform: [
            paths.scripts + 'utility/jquery/jquery-2*.js',
            paths.scripts + 'utility/global.js',
            paths.scripts + 'core/platform.js',
            paths.scripts + 'platform/[^_]*.js',
            paths.scripts + 'platform/_init.js'
        ],
        editor: [
            paths.scripts + 'core/editor.js',
            paths.scripts + 'editor/[^_]*.js',
            paths.scripts + 'utility/rangy.js',
            paths.scripts + 'utility/dropzone.js',
            paths.scripts + 'utility/jquery/jquery-ui-*.js',
            paths.scripts + 'editor/_init.js'
        ],
        dashboard: paths.scripts + 'dashboard/**.*.js'
    },

    css: {
        platform: paths.css + 'platform.less',
        colors: paths.css + 'colors/',
        editor: paths.css + 'editor.less',
        utility: [paths.css + 'utility/**/*.css']
    },

    vendor: {
        js: paths.vendor.root + 'js/*.js',
        css: paths.vendor.root + 'css/*.css',
        less: paths.vendor.root + 'css/app.less'
    }
};

//compiled paths
paths.compiled = {
    js: paths.webroot + 'js/',
    css: paths.webroot + 'css/',
    platform: paths.webroot + 'js/platform.js',
    editor: paths.webroot + 'js/editor.js'
};

//tasks for cleaning compiled paths ///////////////////////////////////////////////////////////
gulp.task('clean:js', function (cb) {
    rimraf(paths.webroot + 'js', cb);
});

gulp.task('clean:css', function (cb) {
    rimraf(paths.webroot + 'css', cb);
});

gulp.task('clean', ['clean:js', 'clean:css']);

//tasks for compiling javascript //////////////////////////////////////////////////////////////
gulp.task('js:platform', function () {
    return gulp.src(paths.working.js.platform, { base: '.' })
        .pipe(concat(paths.compiled.platform))
        .pipe(gulp.dest('.'));
});

gulp.task('min:js:platform', ['js'], function () {
    return gulp.pipe(uglify())
        .pipe(gulp.dest(paths.compiled.platform));
});

gulp.task('js:editor', function () {
    return gulp.src(paths.working.js.editor, { base: '.' })
        .pipe(concat(paths.compiled.editor))
        .pipe(gulp.dest('.'));
});

gulp.task('js', ['js:platform', 'js:editor']);

//tasks for compiling LESS & CSS /////////////////////////////////////////////////////////////////////
gulp.task('less:platform', function () {
    return gulp.src(paths.working.css.platform)
        .pipe(less())
        .pipe(gulp.dest(paths.compiled.css));
});

gulp.task('less:colors', function () {
    return gulp.src(paths.working.css.colors + '*.less')
        .pipe(less())
        .pipe(gulp.dest(paths.compiled.css + 'colors'));
});

gulp.task('less:editor', function () {
    var editor = gulp.src(paths.working.css.editor).pipe(less());
    var util = gulp.src(paths.working.css.utility);
    return merge(editor, util).pipe(gulp.dest(paths.compiled.css));
});

gulp.task('less', ['less:platform', 'less:colors', 'less:editor']);

//tasks for compiling vendor app dependencies /////////////////////////////////////////////////


//default task
gulp.task('default', ['clean', 'js', 'less']);