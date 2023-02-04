const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");
const pug = require("gulp-pug");

//--- Сборка pug
function pugRun() {
    return src("app/pug/**/*.pug")
        .pipe(pug())
        .pipe(dest("app/"))
        .pipe(browserSync.stream());
}

//--- Очищаем dist перед сборкой
function cleanDist() {
    return del("dist");
}

//--- Сжимаем изображения
function images() {
    return src("app/images/**/*")
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ])
        )
        .pipe(dest("dist/images"));
}

//--- Синхронизация всех браузеров, подключенных к одному wifi, для теста верстки
function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/",
        },
    });
}

//--- Действия над скриптами (for ex. сжатие)
function scripts() {
    return src(["app/js/main.js"])
        .pipe(concat("main.min.js"))
        .pipe(uglify())
        .pipe(dest("app/js"))
        .pipe(browserSync.stream());
}

//--- Действия над стилями (for ex. сжатие)
function styles() {
    return src("app/scss/style.scss")
        .pipe(scss({ outputStyle: "expanded" }))
        .pipe(concat("style.min.css"))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 10 version"],
                grid: true,
            })
        )
        .pipe(dest("app/css"))
        .pipe(browserSync.stream());
}

//--- Создание билда
function build() {
    return src(
        [
            "app/css/style.min.css",
            "app/fonts/**/*",
            "app/js/main.min.js",
            "app/*.html",
        ],
        { base: "app" }
    ).pipe(dest("dist"));
}

//--- Отслеживание изменений, чтобы отображать в live preview всегда актуальную информацию (watching)
function watching() {
    watch(["app/pug/**/*.pug"], pugRun);
    watch(["app/scss/**/*.scss"], styles);
    watch(["app/js/**/*.js", "!app/js/main.min.js"], scripts);
    watch(["app/*.html"]).on("change", browserSync.reload);
}

//--- Задания для gulp
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.cleanDist = cleanDist;
exports.images = images;
exports.pugRun = pugRun;

//--- Задание, запускающее сборку
exports.build = series(cleanDist, images, build);

//--- Параллельный запуск задач на слежение и прочих
exports.default = parallel(pugRun, styles, scripts, browsersync, watching);
