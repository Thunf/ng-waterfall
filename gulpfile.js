var gulp = require("gulp");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var jshint = require("gulp-jshint");
var cssminify = require("gulp-minify-css");
var less = require("gulp-less");
var autoprefixer = require("gulp-autoprefixer");
var clean = require("gulp-clean");

// path
var oPath = {
    tmp : './.tmp/**/*.css',
    js  : './src/js/**/*.js',
    less: './src/less/**/*.less'
};

var uPath = {
    tmp: './.tmp/',
    js : './dist/js/',
    css: './dist/css/',
    dist: './dist/'
};

// js hint
gulp.task('jshint',function(){
    return gulp.src(oPath.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// js concat/uglify/minify
gulp.task('jsmini',['jshint'],function(){
    return gulp.src(oPath.js)
        .pipe(concat('ng-waterfall.js'))
        .pipe(gulp.dest(uPath.dist))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min',
            extname: '.js'
        }))
        .pipe(gulp.dest(uPath.dist));
});

// less
gulp.task('less',function(){
    return gulp.src(oPath.less)
        .pipe(less())
        .pipe(gulp.dest(uPath.tmp));
});

// css concat/minify
gulp.task('cssmini',['less'],function(){
    return gulp.src(oPath.tmp)
        .pipe(concat('ng-waterfall.css'))
        .pipe(autoprefixer({
            browsers: ['> 1%'],
            cascade: false
        }))
        .pipe(gulp.dest(uPath.dist))
        .pipe(cssminify())
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(gulp.dest(uPath.dist));
});

// clean
gulp.task("clean",function(){
    return gulp.src(uPath.tmp + '**/*.*',{read: false})
        .pipe(clean({force :true}));
});

// watch
gulp.task('watch',function(){
    gulp.watch(oPath.js, ['jsmini']);
    gulp.watch(oPath.less, ['cssmini']);
});

// default
gulp.task('default', ['cssmini','jsmini','watch'],function(){
    console.log("gulp start");
});