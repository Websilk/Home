'use strict';

//includes
var gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    config = require('./config.json');
    
//get config variables from config.json
var environment = config.environment;

//determine environment
var prod = false;
if (environment != 'dev' && environment != 'development' && environment != null) {
    //using staging or production environment
    prod = true;
}

//paths
var paths = {
    scripts: './Scripts/',
    css: './CSS/',
    components: './App/Components/',
    themes: './Content/themes/',
    vendor: {
        root: './Vendor/**/'
    },
    webroot: './wwwroot/',
};

//working paths
paths.working = {
    js: {
        platform: [
            paths.scripts + 'core/selector.js',
            paths.scripts + 'core/platform.js',
            paths.scripts + 'platform/[^_]*.js',
            paths.scripts + 'platform/_init.js'
        ],
        editor: [
            paths.scripts + 'core/editor.js',
            paths.scripts + 'editor/[^_]*.js',
            paths.scripts + 'utility/rangy.js',
            paths.scripts + 'utility/dropzone.js',
            paths.scripts + 'editor/_init.js'
        ],
        components: paths.components + '**/*.js'
    },

    css: {
        platform: paths.css + 'platform.less',
        colors: paths.css + 'colors/*.less',
        editor: paths.css + 'editor.less',
        utility: paths.css + 'utility/**/*.css',
        tapestry: paths.css + 'tapestry/tapestry.less',
        themes: paths.themes + '**/*.css'
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
    editor: paths.webroot + 'js/editor.js',
    components: paths.webroot + 'js/components/',
    themes: paths.webroot + 'css/themes/'
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
    var p = gulp.src(paths.working.js.platform, { base: '.' })
            .pipe(concat(paths.compiled.platform));
    if (prod == true) { p = p.pipe(uglify()); }
    return p.pipe(gulp.dest('.'));
});

gulp.task('js:editor', function () {
    return gulp.src(paths.working.js.editor, { base: '.' })
        .pipe(concat(paths.compiled.editor))
        .pipe(gulp.dest('.'));
});

gulp.task('js:components', function () {
    return gulp.src(paths.working.js.components)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.toLowerCase();
            path.basename = path.basename.toLowerCase();
            path.extname = path.extname.toLowerCase();
        }))
        .pipe(gulp.dest(paths.compiled.components));
});

gulp.task('js', ['clean:js', 'js:platform', 'js:editor', 'js:components']);

//tasks for compiling LESS & CSS /////////////////////////////////////////////////////////////////////
gulp.task('less:platform', function () {
    return gulp.src(paths.working.css.platform)
        .pipe(less())
        .pipe(gulp.dest(paths.compiled.css));
});

gulp.task('less:colors', function () {
    return gulp.src(paths.working.css.colors)
        .pipe(less())
        .pipe(gulp.dest(paths.compiled.css + 'colors'));
});

gulp.task('less:editor', function () {
    var editor = gulp.src(paths.working.css.editor).pipe(less());
    var util = gulp.src(paths.working.css.utility);
    return merge(editor, util).pipe(gulp.dest(paths.compiled.css));
});

gulp.task('css:themes', function () {
    return gulp.src(paths.working.css.themes)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.toLowerCase();
            path.basename = path.basename.toLowerCase();
            path.extname = path.extname.toLowerCase();
        }))
        .pipe(gulp.dest(paths.compiled.themes));
});

gulp.task('less', ['clean:css', 'less:platform', 'less:colors', 'less:editor', 'css:themes']);

//tasks for compiling vendor app dependencies /////////////////////////////////////////////////


//default task
gulp.task('default', ['js', 'less']);

//watch task
gulp.task('watch', function () {
    //watch platform JS
    gulp.watch([
        paths.scripts + 'core/selector.js',
        paths.scripts + 'core/platform.js',
        paths.scripts + 'platform/*.js'
    ], ['js:platform']);

    //watch editor JS
    gulp.watch([
        paths.scripts + 'core/editor.js',
        paths.scripts + 'editor/*.js'
    ], ['js:editor']);

    //watch components JS
    gulp.watch([paths.components + '**/*.js'], ['js:components']);

    //watch platform LESS
    gulp.watch([
        paths.working.css.platform,
        paths.working.css.tapestry
    ], ['less:platform']);

    //watch themes LESS
    gulp.watch([
        paths.working.css.themes
    ], ['css:themes']);

    //watch colors LESS
    gulp.watch([
        paths.working.css.colors
    ], ['less:colors']);

    //watch editor LESS
    gulp.watch([
        paths.working.css.editor,
        paths.working.css.utility
    ], ['less:editor']);

});