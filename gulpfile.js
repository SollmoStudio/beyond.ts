var gulp = require('gulp');
var tsc = require('gulp-tsc');

gulp.task('build', function () {
  return gulp.src([
      './**/*.ts',
      '!./node_modules/**/*.ts'
    ])
    .pipe(tsc({
      target: 'ES5',
      removeComments: true,
      sourceMap: true
    }))
    .pipe(gulp.dest('./build'));
});
