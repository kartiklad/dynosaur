"use strict";

import del from 'del';
import path from 'path';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import {Instrumenter} from 'isparta'

// Load all of our Gulp plugins
const $ = loadPlugins();

function _registerBabel() {
    require('babel-core/register');
}

function lint(files) {
    return gulp.src(files)
        .pipe($.plumber())
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failOnError());
}

function test() {
    return gulp.src(['./tests/*.spec.js'], {read: false})
        .pipe($.mocha({
            reporter: process.env.MOCHA_REPORTER || 'nyan',
            globals: ["sinon", "chai", "expect"],
            require: ['./tests/test-helper.js']
        }));
}


// Clean up
gulp.task('clean', function(){
    del.sync(['dist']);
});

// Lint our source code
gulp.task('lint-src', () => {
    lint(['src/*.js']);
});

// Lint our test code
gulp.task('lint-test', () => {
    lint(['tests/*.js']);
});

// Lint Source and test
gulp.task('lint', ['lint-src', 'lint-test']);

// Run tests
gulp.task('test', ['lint', 'clean'], () => {
    _registerBabel();
    return test();
});

// Build Source
gulp.task('build',['lint-src', 'clean'], function () {
  return gulp.src("src/*.js")
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

// Run coverage
gulp.task('coverage', ['lint'], (done) => {
    _registerBabel();
    gulp.src(['src/*.js'])
        .pipe($.istanbul({instrumenter: Instrumenter}))
        .pipe($.istanbul.hookRequire())
        .on('finish', function () {
            return test()
                .pipe($.istanbul.writeReports())
                .on('end', done);
        });
});

// Run coveralls
gulp.task('coveralls', () => {
    if (!process.env.CI) {
        return;
    }
    gulp.src('./coverage/lcov.info')
        .pipe($.coveralls());
});

// Watch files
gulp.task('watch', ['test'], () => {
    gulp.watch(['src/*', 'tests/*'], ['test']);
});

gulp.task('default', ['watch']);