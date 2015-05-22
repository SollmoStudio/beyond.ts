var gulp = require('gulp');
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

gulp.task("test", ["build"], function () {
  return gulp.src([
      'test/*.js',
    ], {read: false})
    .pipe(mocha({
      reporter: 'spec',
      timeout: 10000
    }));
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
