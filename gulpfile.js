var gulp = require('gulp');
var shell = require('gulp-shell');
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
    .pipe(gulp.dest('.'));
});

gulp.task('run', [ 'build' ], shell.task([
  'NODE_PATH=$NODE_PATH:./lib node main.js'
]));
