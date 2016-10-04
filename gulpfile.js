'use strict';

const gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
// var autoprefixer = require('gulp-autoprefixer');
// var sourcemaps = require('gulp-sourcemaps');
// var sprity = require('sprity');
// var svgSprite = require('gulp-svg-sprite');
// var useref = require('gulp-useref');
// var uglify = require('gulp-uglify');
// var gulpIf = require('gulp-if');
// var cssnano = require('gulp-cssnano');
// var imagemin = require('gulp-imagemin');
// var cache = require('gulp-cache');
// var del = require('del');

var config = {
    "mode": {
        css: { // Create a «css» sprite
            render: {
                scss: true // Render a Sass stylesheet
            }
        },
        "defs": true,
        "symbol": true
    }
};
// var $ = require('gulp-load-plugins')();

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/,
    lazy: true,
    camelize: true
});

gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({
            // includePaths: require('node-normalize-scss').with('other/path', 'another/path')
            // - or -
            includePaths: require('node-normalize-scss').includePaths
        }))
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe($.autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});


gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});


gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    })
});


gulp.task('useref', function() {
    return gulp.src('app/*.html')
        .pipe($.useref())
        // Minifies only if it's a JavaScript file
        .pipe($.gulpIf('*.js', $.uglify()))
        // Minifies only if it's a CSS file
        .pipe($.gulpIf('*.css', $.cssnano()))
        .pipe(gulp.dest('dist'))
});


gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
        .pipe($.cache($.imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});


gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
});


gulp.task('clean:dist', function() {
    return $.del.sync('dist');
});


gulp.task('cache:clear', function(callback) {
    return $.cache.clearAll(callback)
});


gulp.task('build', function(callback) {
    $.runSequence('clean:dist',
        'sass', 'useref', ['images', 'fonts'],
        callback
    )
});


gulp.task('default', function(callback) {
    runSequence(['sass', 'browserSync', 'watch'],
        callback
    )
});


// generate sprite.png and _sprite.scss
gulp.task('sprites', function() {
    return $.sprity.src({
            src: './img/sprite/**/*.{png,jpg}',
            style: './sprite.css',
            // ... other optional options
            // for example if you want to generate scss instead of css
            //processor: 'sass', // make sure you have installed sprity-sass
        })
        .pipe(gulpif('*.png', gulp.dest('./dist/img/'), gulp.dest('./dist/css/sprite')))
});


gulp.task('svgSpriteBuild', function() {
    return gulp.src('app/assets/sprite/*.svg')
        // minify svg
        .pipe($.svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // remove all fill and style declarations in out shapes
        .pipe($.cheerio({
            run: function($) {
                $('[fill]').removeAttr('fill');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        // cheerio plugin create unnecessary string '>', so replace it.
        .pipe($.replace('&gt;', '>'))
        // build svg sprite
        .pipe($.svgSprite(config))
        .pipe(gulp.dest('app/img'))
});


gulp.task('lint', () =>
    gulp.src('app/scripts/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!$.browserSync.active, $.eslint.failOnError()))
);
