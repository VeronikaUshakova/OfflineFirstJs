const gulp = require("gulp");

const minify = require('gulp-minify');
const concat = require('gulp-concat');

const cssmin = require('gulp-cssmin');
const autoprefixer = require('gulp-autoprefixer');
const rename = require("gulp-rename");

const eslint = require('gulp-eslint');
const gulpif = require('gulp-if');

const clean = require('gulp-clean');

let check = true;

gulp.task('bundle', function() {
    return gulp.src('./src/js/*.js')
      .pipe(concat('bundle.js'))
      .pipe(minify())
      .pipe(gulp.dest('./dist/js/'));
});

gulp.task('css', function() {
    return gulp.src('./src/css/*.css')
      .pipe(autoprefixer())
      .pipe(concat('storage.css'))
      .pipe(cssmin())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./dist/css/'));
});

gulp.task('lint', function() {
    return gulp.src('./src/js/*.js')
      .pipe(eslint({
        "parser": "babel-eslint",
        rules: {
            'quotes': ["error", "double"],
            'space-before-blocks': "error",
            'no-var': "error",
            'max-len': ["error", { "code": 60 }]
        }
      }))
      .pipe(eslint.format())
      .pipe(eslint.results(results => {
        if(results.errorCount > 0){
            check = false;
        } else {
            check = true;
        }
      }))
      .pipe(gulpif(check, gulp.dest('./dist/js/eslint/')));
})

gulp.task('clean', function () {
    return gulp.src('./dist/', {read: false})
      .pipe(clean());
});

gulp.task('default', gulp.series('clean', 'lint', 'css', 'bundle'));


