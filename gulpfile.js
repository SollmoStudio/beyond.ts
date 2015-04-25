var gulp = require('gulp');
var shell = require('gulp-shell');
var ts = require('gulp-typescript');

gulp.task('build', function () {
  return gulp.src([
      './**/*.ts',
      '!./node_modules/**/*.ts'
    ])
    .pipe(ts({
      module: 'commonjs',
      target: 'ES5',
      removeComments: true,
      sourceMap: true,
      typescript: require('typescript')
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('run', [ 'build' ], shell.task([
  'NODE_PATH=$NODE_PATH:./lib node main.js'
]));
