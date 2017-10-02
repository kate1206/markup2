var gulp = require('gulp');
var $    = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence');

var sassPaths = [
  'bower_components/foundation-sites/scss',
  'bower_components/motion-ui/src'
];

// SASS Processor
gulp.task('sass', function() {
  return gulp.src('scss/app.scss')
    .pipe(sourcemaps.init())
    .pipe($.sass({
      includePaths: sassPaths
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'));
});


// Concat/Minify and package files to 'dist' folder
gulp.task('useref', function(){
  return gulp.src('**/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});


// Optimize Images
gulp.task('images', function(){
  return gulp.src('img/**/*.+(png|jpg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/img'))
});


// Copy fonts
gulp.task('fonts', function() {
  return gulp.src('css/webfont/**/*')
  .pipe(gulp.dest('dist/css/webfont'))
})

// Cleanup dist files
gulp.task('clean:dist', function() {
  return del.sync('dist');
})

// Broswer Sync
gulp.task('browser-sync', function() {
  browserSync.init(["css/*.css", "js/*.js", "**/*.html"], {
    server: {
      baseDir: "./"
    }
  });
});


// Default Gulp Task
gulp.task('default', ['sass','browser-sync'], function() {
  gulp.watch(['scss/**/*.scss'], ['sass']);
});

// Build Files for production
gulp.task('build', function (callback) {
  runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'], callback)
});
