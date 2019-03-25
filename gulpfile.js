const gulp = require('gulp');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
// const concat = require('gulp-concat');
const babel = require('gulp-babel');
const del = require('del');

const clean = () => del(['dist/*']);

const build = () => {
    return gulp.src('./src/count-up.js')
        .pipe(eslint())
        .pipe(babel({presets:['@babel/env']}))  // uglify 不能压缩ES6，所以要使用babel转换成ES5
        // .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
}

// const buildLegacy = () => {
//   return gulp.src([
//       './requestAnimationFrame.polyfill.js',
//       './dist/countUp.js'
//     ])
//     .pipe(concat('countUp.withPolyfill.min.js'))
// 		.pipe(uglify())
// 		.pipe(gulp.dest('dist'));
// }

gulp.task('clean', clean);
// const build = gulp.series(buildNormal, buildLegacy);
gulp.task('build', build);

gulp.watch('./src/*', build);

exports.clean = clean;
exports.default = build;

// gulp.task('build', () => {

// })