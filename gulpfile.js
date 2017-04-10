var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

//---------------------------------------------------
var inputBase = 'public/src';
var outputBase = 'public/build';

//***************************************************
// LINT & HINT
//***************************************************
gulp.task('check-json', function () {
    gulp.src(jsonSrc)
        .pipe(plugins.jsonlint())
        .pipe(plugins.jsonlint.reporter());
    // .pipe(plugins.jsonlint.failAfterError());
});

gulp.task('check-js', function () {
    gulp.src(jsSrc)
        .pipe(plugins.jshint({ esversion: 6 }))
        .pipe(plugins.jshint.reporter('default'));
    // .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('check', ['check-json', 'check-js']);

//***************************************************
// IMAGES
//***************************************************
var imgSrc = [inputBase + '/images/**/*.{gif,jpeg,jpg,png,svg,ico}', '!' + inputBase + '/images/favicon/*'],
    imgDst = outputBase + '/images';

gulp.task('build-img', ['clean-img'], function () {
    gulp.src(imgSrc)
        .pipe(plugins.changed(imgDst)) // Already clean images directory, no need to check for changes
        .pipe(plugins.imagemin({verbose: true}))
        .pipe(gulp.dest(imgDst));
});

gulp.task('debug-build-img', ['clean-img'], function () {
    gulp.src(imgSrc)
        .pipe(plugins.changed(imgDst))
        .pipe(gulp.dest(imgDst));
});

//***************************************************
// HTML
//***************************************************
var htmlSrc = [inputBase + '/*.{htm,html}', inputBase + '/partials/**/*.{htm,html}'],
    htmlDst = outputBase;

gulp.task('build-html', ['clean-html'], function () {
    gulp.src(htmlSrc, { base: inputBase })
        .pipe(plugins.changed(htmlDst))
        .pipe(plugins.minifyHtml())
        .pipe(gulp.dest(htmlDst));
});

gulp.task('debug-build-html', ['clean-html'], function () {
    gulp.src(htmlSrc, { base: inputBase })
        .pipe(plugins.changed(htmlDst))
        .pipe(gulp.dest(htmlDst));
});

//***************************************************
// JAVASCRIPT
//***************************************************
var jsSrc = [inputBase + '/js/**/*.js'],
    jsDst = outputBase + '/js';

gulp.task('build-js', ['clean-js'], function () {
    gulp.src(jsSrc)
        .pipe(plugins.concat('app.js'))
        .pipe(plugins.stripDebug())
        .pipe(plugins.babel({ presets: ['es2015'] }))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(jsDst));
});

gulp.task('debug-build-js', ['check-js', 'clean-js'], function () {
    gulp.src(jsSrc)
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest(jsDst));
});

//***************************************************
// CSS
//***************************************************
var cssSrc = [inputBase + '/css/**/*.css'],
    cssDst = outputBase + '/css';

gulp.task('build-css', ['clean-css'], function () {
    gulp.src(cssSrc)
        .pipe(plugins.concat('app.css'))
        .pipe(plugins.autoprefixer('last 2 versions'))
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(cssDst));
});

gulp.task('debug-build-css', ['clean-css'], function () {
    gulp.src(cssSrc)
        .pipe(plugins.concat('app.css'))
        .pipe(plugins.autoprefixer('last 2 versions'))
        .pipe(gulp.dest(cssDst));
});

//***************************************************
// JSON
//***************************************************
var jsonSrc = [inputBase + '/data/**/*.{json}'],
    jsonDst = outputBase + '/data';

gulp.task('build-json', ['clean-json'], function () {

    gulp.src(jsonSrc)
        .pipe(plugins.jsonminify())
        .pipe(gulp.dest(jsonDst));
});

gulp.task('debug-build-json', ['check-json', 'clean-json'], function () {

    gulp.src(jsonSrc)
        .pipe(gulp.dest(jsonDst));
});

//***************************************************
// Fonts
//***************************************************
var fontsSrc = [inputBase + '/fonts/**/*.{ttf,otf}'],
    fontsDst = outputBase + '/fonts';

gulp.task('build-fonts', ['clean-fonts'], function () {

    gulp.src(fontsSrc)
        .pipe(gulp.dest(fontsDst));
});

gulp.task('debug-build-fonts', ['clean-fonts'], function () {

    gulp.src(fontsSrc)
        .pipe(gulp.dest(fontsDst));
});

//***************************************************
// Favicons
//***************************************************
var faviconSrc = [inputBase + '/images/favicon/**/*'],
    faviconDst = outputBase;

gulp.task('build-favicon', ['clean-favicon'], function () {

    gulp.src(faviconSrc)
        .pipe(gulp.dest(faviconDst));
});

gulp.task('debug-build-favicon', ['clean-favicon'], function () {

    gulp.src(faviconSrc)
        .pipe(gulp.dest(faviconDst));
});

//***************************************************
// BUILD
//***************************************************
gulp.task('build', ['build-img', 'build-html', 'build-js', 'build-css', 'build-json', 'build-fonts', 'build-favicon']);
gulp.task('debug-build', ['debug-build-img', 'debug-build-html', 'debug-build-js', 'debug-build-css', 'debug-build-json', 'debug-build-fonts', 'debug-build-favicon']);

gulp.task('clean-build', ['clean'], () => gulp.start('build'));
gulp.task('clean-debug-build', ['clean'], () => gulp.start('debug-build'));


//***************************************************
// CLEAN
//***************************************************
var cleanSrc = outputBase;

gulp.task('clean', function () {
    return gulp.src(cleanSrc)
        .pipe(plugins.clean({ read: false }));
});

gulp.task('clean-img', function () {
    return gulp.src(imgDst)
        .pipe(plugins.clean({ read: false }));
});

gulp.task('clean-html', function () {
    return gulp.src(htmlSrc.map((s) => s.replace(inputBase, outputBase).replace(/partials.*$/, 'partials')))
        .pipe(plugins.clean({ read: false }));
});

gulp.task('clean-js', function () {
    return gulp.src(jsDst)
        .pipe(plugins.clean({ read: false }));
});

gulp.task('clean-css', function () {
    return gulp.src(cssDst)
        .pipe(plugins.clean({ read: false }));
});

gulp.task('clean-json', function () {
    return gulp.src(jsDst)
        .pipe(plugins.clean({ read: false }));
});

gulp.task('clean-fonts', function () {
    return gulp.src(fontsDst)
        .pipe(plugins.clean({ read: false }));
});

gulp.task('clean-favicon', function () {
    return gulp.src([faviconDst + '/*.*', '!' + faviconDst + '/*.{htm,html}'])
        .pipe(plugins.clean({ read: false }));
});

//***************************************************
// WATCH
//***************************************************
gulp.task('watch', function () {
    gulp.watch(imgSrc, ['build-img']);
    gulp.watch(htmlSrc, ['build-html']);
    gulp.watch(jsSrc, ['build-js']);
    gulp.watch(cssSrc, ['build-css']);
    gulp.watch(jsonSrc, ['build-json']);
    gulp.watch(fontsSrc, ['build-fonts']);
    gulp.watch(faviconSrc, ['build-favicon']);
});

gulp.task('debug-watch', function () {
    gulp.watch(imgSrc, ['debug-build-img']);
    gulp.watch(htmlSrc, ['debug-build-html']);
    gulp.watch(jsSrc, ['debug-build-js']);
    gulp.watch(cssSrc, ['debug-build-css']);
    gulp.watch(jsonSrc, ['debug-build-json']);
    gulp.watch(fontsSrc, ['debug-build-fonts']);
    gulp.watch(faviconSrc, ['debug-build-favicon']);    
});

//***************************************************
// NODEMON
//***************************************************
gulp.task('nodemon', ['default'], function () {

    var nodemon = plugins.nodemon({
        script: 'index.js',
        watch: ['.'],
        ignore: ['build', 'src', 'gulpfile.js'],
        ext: 'js',
        env: { 'NODE_ENV': 'development' }
    });

    nodemon.on('crash', function () {
        var delay = 3;
        nodemon.emit('restart', delay);
    });

    return nodemon;
});

gulp.task('nodemon-debug', ['debug'], function () {

    var nodemon = plugins.nodemon({
        script: 'index.js',
        watch: ['.'],
        ignore: ['build', 'src', 'gulpfile.js'],
        ext: 'js',
        env: { 'NODE_ENV': 'development' }
    });

    nodemon.on('crash', function () {
        var delay = 3;
        nodemon.emit('restart', delay);
    });

    return nodemon;
});

//***************************************************
// DEFAULT
//***************************************************
gulp.task('default', ['build', 'watch']);
gulp.task('debug', ['debug-build', 'debug-watch']);