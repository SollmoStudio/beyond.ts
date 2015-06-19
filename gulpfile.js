var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var naming = require("gulp-check-file-naming-convention");
var shell = require('gulp-shell');
var ts = require('gulp-typescript');
var tslint = require("gulp-tslint");

gulp.task('build', function () {
  return gulp.src([
      './**/*.ts',
      '!./node_modules/**/*.ts'
    ])
    .pipe(ts({
      module: 'commonjs',
      noImplicitAny: true,
      target: 'ES5',
      removeComments: true,
      sourceMap: true,
      typescript: require('typescript')
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('run', [ 'build' ], shell.task([
  'NODE_PATH=$NODE_PATH:./lib node main.js ' + process.argv.slice(3).join(' ')
]));

gulp.task('start', shell.task([
  'NODE_PATH=$NODE_PATH:./lib node main.js ' + process.argv.slice(3).join(' ')
]));

gulp.task("test", ["build"], function (cb) {
  gulp.src([ './core/**/*.js', './lib/**/*.js' ])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src([ './test/**/*.js' ])
      .pipe(mocha({
        reporter: 'spec',
        timeout: 10000
      }))
      .pipe(istanbul.writeReports())
      .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
      .on('end', cb);
    });
});

gulp.task("lint", function () {
  return gulp.src([
      './**/*.ts',
      '!./node_modules/**/*.ts',
      '!./lib.d/**/*.d.ts'
    ])
    .pipe(tslint({configuration: require('./.tslintrc')}))
    .pipe(tslint.report('prose'));
});

gulp.task("naming", function () {
  return gulp.src([
    "**/*.ts",
    "!**/*.d.ts",
    "!node_modules/**/*"
  ])
  .pipe(naming({caseName: 'paramCase'}));
});

gulp.task("default", ["naming", "lint", "test"]);
