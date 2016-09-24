'use strict';

const gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var sprity = require('sprity');
var svgSprite = require('gulp-svg-sprite');
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


gulp.task('sass', function () {
  return gulp.src('frontend/scss/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(autoprefixer({
          browsers: ['last 3 versions'],
          cascade: false
      }))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest('frontend/css'))
      .pipe(browserSync.reload({
        stream: true
      }))
});


gulp.task('watch', ['browserSync', 'sass'], function () {
  gulp.watch('frontend/scss/**/*.scss', ['sass']);
  gulp.watch('frontend/*.html', browserSync.reload);
  gulp.watch('frontend/js/**/*.js', browserSync.reload);
});


gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'frontend'
    }
  })
});


gulp.task('useref', function () {
  return gulp.src('frontend/*.html')
      .pipe(useref())
      // Minifies only if it's a JavaScript file
      .pipe(gulpIf('*.js', uglify()))
      // Minifies only if it's a CSS file
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('public'))
});


gulp.task('images', function () {
  return gulp.src('frontend/images/**/*.+(png|jpg|gif|svg)')
      .pipe(cache(imagemin({
        interlaced: true
      })))
      .pipe(gulp.dest('public/images'))
});


gulp.task('fonts', function() {
    return gulp.src('frontend/fonts/**/*')
        .pipe(gulp.dest('public/fonts'))
});


gulp.task('clean:public', function() {
    return del.sync('public');
});


gulp.task('cache:clear', function (callback) {
    return cache.clearAll(callback)
});


gulp.task('build', function (callback) {
    runSequence('clean:public',
        'sass', 'useref', ['images', 'fonts'],
        callback
    )
});


gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'],
        callback
    )
});


// generate sprite.png and _sprite.scss
gulp.task('sprites', function () {
    return sprity.src({
        src: './img/sprite/**/*.{png,jpg}',
        style: './sprite.css',
        // ... other optional options
        // for example if you want to generate scss instead of css
        //processor: 'sass', // make sure you have installed sprity-sass
    })
        .pipe(gulpif('*.png', gulp.dest('./public/img/'), gulp.dest('./public/css/sprite')))
});


gulp.task('svg-sprites', function () {
  return gulp.src('sprite/*.svg')
      .pipe(svgSprite(config))
      .pipe(gulp.dest('frontend/img'))
});
