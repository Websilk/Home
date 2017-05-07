'use strict';

//includes
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    compile = require('google-closure-compiler-js').gulp(),
    cleancss = require('gulp-clean-css'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    config = require('./App/config.json');
    
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
    scripts: './App/Scripts/',
    css: './App/CSS/',
    app: './App/',
    components: './App/Components/',
    themes: './App/Content/themes/',
    vendor: {
        root: './App/Vendor/**/'
    },
    webroot: './App/wwwroot/',
};

//working paths
paths.working = {
    js: {
        platform: [
            paths.webroot + 'js/selector.js',
            paths.scripts + 'core/velocity.min.js',
            paths.scripts + 'core/platform.js',
            paths.scripts + 'platform/[^_]*.js',
            paths.scripts + 'platform/_init.js'
        ],
        editor: [
            paths.scripts + 'core/editor.js',
            paths.scripts + 'editor/[^_]*.js',
            paths.scripts + 'utility/rangy.js',
            paths.scripts + 'editor/_init.js'
        ],
        app: paths.app + '**/*.js'
    },

    less:{
        platform: paths.css + 'platform.less',
        app: [
            paths.app + '**/*.less',
            '!' + paths.app + 'CSS/editor.less'
        ],
        colors: paths.css + 'colors/**/**/*.less',
        editor: paths.css + 'editor.less',
        tapestry: paths.css + 'tapestry/tapestry.less',
    },

    css: {
        utility: paths.css + 'utility/**/*.css',
        themes: paths.themes + '**/*.css',
        app: paths.app + '**/*.css'
    },

    vendor: {
        js: paths.vendor.root + 'js/*.js',
        css: paths.vendor.root + 'css/*.css',
        less: paths.vendor.root + 'css/app.less'
    },

    exclude: {
        app: [
            '!' + paths.app + 'wwwroot/**/',
            '!' + paths.app + 'Content/**/',
            '!' + paths.app + 'CSS/**/',
            '!' + paths.app + 'CSS/',
            '!' + paths.app + 'Scripts/**/'
        ]
    }
};

//compiled paths
paths.compiled = {
    platform: paths.webroot + 'js/platform.js',
    editor: paths.webroot + 'js/editor.js',
    js: paths.webroot + 'js/',
    css: paths.webroot + 'css/',
    app: paths.webroot + 'css/',
    components: paths.webroot + 'js/components/',
    themes: paths.webroot + 'css/themes/'
};

//tasks for compiling javascript //////////////////////////////////////////////////////////////
gulp.task('js:app', function () {
    var pathlist = paths.working.exclude.app.slice(0);
    pathlist.unshift(paths.working.js.app);
    var p = gulp.src(pathlist)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.toLowerCase();
            path.basename = path.basename.toLowerCase();
            path.extname = path.extname.toLowerCase();
        }));

    if (prod == true) { p = p.pipe(uglify()); }
    return p.pipe(gulp.dest(paths.compiled.js, { overwrite: true }));
});

gulp.task('js:platform', ['js:selector'], function () {
    var p = gulp.src(paths.working.js.platform, { base: '.' })
        .pipe(concat(paths.compiled.platform));
    if (prod == true) { p = p.pipe(uglify()); }
    return p.pipe(gulp.dest('.', { overwrite: true }));
});

gulp.task('js:selector', function () {
    var p = gulp.src(paths.scripts + 'selector/selector.js', { base: '.' })
            .pipe(concat('selector.js'));
    if (prod == true) { 
        //p = p
        //    .pipe(compile({
        //        compilationLevel: 'SIMPLE',
        //        warningLevel: 'VERBOSE',
        //        jsOutputFile: 'selector.js',  // outputs single file
        //        createSourceMap: true
        //    }));
        p = p.pipe(uglify());
    }
    return p.pipe(gulp.dest(paths.compiled.js, { overwrite: true }));
});

gulp.task('js:editor', function () {
    var p = gulp.src(paths.working.js.editor, { base: '.' })
            .pipe(concat(paths.compiled.editor));
    if (prod == true) { p = p.pipe(uglify()); }
    return p.pipe(gulp.dest('.', { overwrite: true }));
});

gulp.task('js', function () {
    gulp.start('js:app');
    gulp.start('js:platform');
    gulp.start('js:editor');
});

//tasks for compiling LESS & CSS /////////////////////////////////////////////////////////////////////
gulp.task('less:app', function () {
    var pathlist = paths.working.exclude.app.slice(0);
    for (var x = paths.working.less.app.length - 1; x >= 0; x--) {
        pathlist.unshift(paths.working.less.app[x]);
    }
    var p = gulp.src(pathlist)
        .pipe(less())
        .pipe(rename(function (path) {
            path.dirname = path.dirname.toLowerCase();
            path.basename = path.basename.toLowerCase();
            path.extname = path.extname.toLowerCase();
        }));
    if(prod == true){ p = p.pipe(cleancss({compatibility: 'ie8'})); }
    return p.pipe(gulp.dest(paths.compiled.app, { overwrite: true }));
});

gulp.task('less:platform', function () {
    var p = gulp.src(paths.working.less.platform)
        .pipe(less());
    if (prod == true) { p = p.pipe(cleancss({ compatibility: 'ie8' })); }
    return p.pipe(gulp.dest(paths.compiled.css, { overwrite: true }));
});

gulp.task('less:colors', function () {
    var p = gulp.src(paths.working.less.colors)
        .pipe(less());
    if (prod == true) { p = p.pipe(cleancss({ compatibility: 'ie8' })); }
    return p.pipe(gulp.dest(paths.compiled.css + 'colors', { overwrite: true }));
});

gulp.task('less:editor', function () {
    var editor = gulp.src(paths.working.less.editor).pipe(less());
    var util = gulp.src(paths.working.css.utility);
    var p = merge(editor, util);
    if (prod == true) { p = p.pipe(cleancss({ compatibility: 'ie8' })); }
    return p.pipe(gulp.dest(paths.compiled.css, { overwrite: true }));
});

gulp.task('css:themes', function () {
    var p = gulp.src(paths.working.css.themes)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.toLowerCase();
            path.basename = path.basename.toLowerCase();
            path.extname = path.extname.toLowerCase();
        }));
    if (prod == true) { p = p.pipe(cleancss({ compatibility: 'ie8' })); }
    return p.pipe(gulp.dest(paths.compiled.themes, { overwrite: true }));
});

gulp.task('css:app', function () {
    var pathlist = paths.working.exclude.app.slice(0);
    pathlist.unshift(paths.working.css.app);
    var p = gulp.src(pathlist)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.toLowerCase();
            path.basename = path.basename.toLowerCase();
            path.extname = path.extname.toLowerCase();
        }));
    if (prod == true) { p = p.pipe(cleancss({ compatibility: 'ie8' })); }
    return p.pipe(gulp.dest(paths.compiled.app, { overwrite: true }));
});

gulp.task('less', function () {
    gulp.start('less:platform');
    gulp.start('less:app');
    gulp.start('less:colors');
    gulp.start('less:editor');
});

gulp.task('css', function () {
    gulp.start('css:themes');
    gulp.start('css:app');
});

//tasks for compiling vendor app dependencies /////////////////////////////////////////////////


//default task
gulp.task('default', ['js', 'less', 'css']);

//watch task
gulp.task('watch', function () {
    //watch platform JS
    gulp.watch([
        paths.scripts + 'selector/selector.js',
        paths.scripts + 'core/platform.js',
        paths.scripts + 'platform/*.js'
    ], ['js:platform']);

    //watch app JS
    var pathjs = paths.working.exclude.app.slice(0);
    for (var x = 0; x < pathjs.length; x++) {
        pathjs[x] += '*.js';
    }
    pathjs.unshift(paths.working.js.app);
    gulp.watch(pathjs, ['js:app']);

    //watch editor JS
    gulp.watch([
        paths.scripts + 'core/editor.js',
        paths.scripts + 'editor/*.js'
    ], ['js:editor']);

    //watch platform LESS
    gulp.watch([
        paths.working.less.platform,
        paths.working.less.tapestry
    ], ['less:platform']);

    //watch app LESS
    var pathless = paths.working.exclude.app.slice(0);
    for (var x = 0; x < pathless.length; x++) {
        pathless[x] += '*.less';
    }
    for (var x = paths.working.less.app.length - 1; x >= 0; x--) {
        pathless.unshift(paths.working.less.app[x]);
    }
    gulp.watch(pathless, ['less:app']);

    //watch editor LESS
    gulp.watch([
        paths.working.less.editor,
        paths.working.css.utility
    ], ['less:editor']);

    //watch colors LESS
    gulp.watch([
        paths.working.less.colors
    ], ['less:colors']);

    //watch app CSS
    var pathcss = paths.working.exclude.app.slice(0);
    for (var x = 0; x < pathcss.length; x++) {
        pathcss[x] += '*.css';
    }
    pathcss.unshift(paths.working.css.app);
    gulp.watch(pathcss, ['css:app']);

    //watch themes CSS
    gulp.watch([
        paths.working.css.themes
    ], ['css:themes']);

});