const fs = require("fs-extra");
const path = require("path");
const postcss = require("postcss");
const cssnested = require("postcss-nested");
const cssCustomMedia = require("postcss-custom-media");
const autoprefixer = require("autoprefixer");
const uglifycss = require("uglifycss");
const babel = require("@babel/core");
const watch = require("node-watch");
const isProd = process.argv[2] == "--prod" ? true : false;

const src = "src/";
const dist = "cordova/www/";
let slug;


const page = (literal, args) => eval("`" + fs.readFileSync(`${__dirname}/src/pages/${literal}/index.html`, "utf8") + "`");

const tpl = (literal, args) => `<template class="tpl-${literal}"><div>${fs.readFileSync(`${__dirname}/src/views/${literal}/${literal}.html`, "utf8")}</div></template>`;

const view = (literal, args) => eval("`" + fs.readFileSync(`${__dirname}/src/views/${literal}/${literal}.html`, "utf8") + "`");

const core = {
    styles: [],
    commonjs: [],
    viewsjs: [],
    initTime: new Date(),
    compileAssets(file, dist_name, ext) {
        if (ext == ".js") this.babel(fs.readFileSync(file, "utf8"), dist_name);
        else if (ext == ".css") {
        } else fs.copySync(file, dist_name);
    },
    compilePage(file) {
        const name = path.basename(file);
        const slug0 = path.dirname(file).replace(__dirname + "/src/pages", "") + "/";
        slug = slug0.substring(1);
        fs.ensureDirSync(dist + slug);
        fs.writeFileSync(
            dist + slug + name,
            eval("`" + fs.readFileSync(file, "utf8") + "`")
        );
    },
    dirPage(dir) {
        const recursive = (dir) => {
            fs.readdirSync(dir).forEach((res) => {
                const file = path.resolve(dir, res);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) recursive(file);
                else if (!/.DS_Store$/.test(file)) {
                    if (/.html/.test(file)) {
                        core.compilePage(file);
                    }
                }
            });
        };
        recursive(dir);
    },
    dirViews(dir) {
        const recursive = (dir) => {
            fs.readdirSync(dir).forEach((res) => {
                const file = path.resolve(dir, res);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) recursive(file);
                else if (!/.DS_Store$/.test(file)) {
                    if (/.css$/.test(file)) {
                        core.styles.push(file);
                    }
                    else if (/.js$/.test(file)) {
                        if (/\/views\//.test(file)) {
                            core.viewsjs.push(file);
                        }
                    }
                }
            });
        }
        recursive(dir);
    },
    dirScan(dir) {
        const recursive = (dir) => {
            fs.readdirSync(dir).forEach((res) => {
                const file = path.resolve(dir, res);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) recursive(file);
                else if (!/.DS_Store$/.test(file)) {
                    if (/.css$/.test(file)) {
                        core.styles.push(file);
                    }
                    else if (/.js$/.test(file)) {
                        if (/\/js\//.test(file)) {
                            core.commonjs.push(file);
                        }
                        if (/\/modules\//.test(file)) {
                            core.viewsjs.push(file);
                        }
                        if (/index.js/.test(file)) {
                            const name = file.replace(`${__dirname}/src/`, "");
                            const filename = path.parse(name).base;
                            const ext = path.extname(filename);
                            core.compileAssets(file, dist + name, ext);
                        }
                    }
                    else if (/\/img\//.test(file)) {
                        const name = file.replace(`${__dirname}/src/`, "");
                        const filename = path.parse(name).base;
                        const ext = path.extname(filename);
                        core.compileAssets(file, dist + name, ext);
                    }
                    else if (/\/fonts\//.test(file)) {
                        const name = file.replace(`${__dirname}/src/`, "");
                        const filename = path.parse(name).base;
                        const ext = path.extname(filename);
                        core.compileAssets(file, dist + name, ext);
                    }
                    else if (/\/mp3\//.test(file)) {
                        const name = file.replace(`${__dirname}/src/`, "");
                        const filename = path.parse(name).base;
                        const ext = path.extname(filename);
                        core.compileAssets(file, dist + name, ext);
                    }
                }
            });
        };
        recursive(dir);
    },
    rmDir(dirPath, removeSelf) {
        if (removeSelf === undefined) removeSelf = true;
        try {
            var files = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }
        for (let file of files) {
            const filePath = `${dirPath}/${file}`;
            fs.statSync(filePath).isFile()
                ? fs.unlinkSync(filePath)
                : core.rmDir(filePath);
        }
        removeSelf && fs.rmdirSync(dirPath);
    },
    time: () => (time = (new Date() - core.initTime) / 1000),
    babel(result, dest) {
        result = babel.transform(result, {
            minified: isProd ? true : false,
            comments: false,
            presets: isProd ? [["minify", { builtIns: "entry" }]] : [],
        }).code;
        fs.ensureDirSync(path.dirname(dest));
        fs.writeFileSync(dest, result);
    },
    postcss(result, dest) {
        postcss([
            cssnested,
            cssCustomMedia({ importFrom: `${src}assets/styles/customMedias.css` }), autoprefixer({ add: true }),])
            .process(result, { from: "undefined" })
            .then((result) => {
                const minify = isProd
                    ? uglifycss.processString(result.css)
                    : result.css;
                fs.ensureDirSync(path.dirname(dest));
                fs.writeFileSync(dest, minify);
            });
    },
    console(folder, filename, evt) {
        let status;
        if (evt == "remove") status = `31mremoved`;
        if (evt == "update") status = `32mupdated`;
        if (evt == "add") status = `36madded`;
        console.log(
            `\x1b[90m\x1b[3m(${folder})\x1b[39m\x1b[23m`,
            `\x1b[1m${filename}\x1b[22m`,
            `\x1b[${status}\x1b[39m`,
            `\x1b[3m${core.time()}s\x1b[23m`
        );
    },
    compile_syles() {
        let str = "";
        for (let file of core.styles) {
            str += fs.readFileSync(`${file}`, "utf8");
        }
        core.postcss(str, `${dist}assets/styles.css`);
    },
    compile_js() {
        //common
        let common = "";
        for (let file of core.commonjs) {
            common += fs.readFileSync(`${file}`, "utf8");
        }

        //views
        let modules = '';
        for (let file of core.viewsjs) {
            modules += fs.readFileSync(`${file}`, "utf8");
        }

        core.babel(modules + common, `${dist}assets/app.js`);
    }
};

core.rmDir(`${dist}`);
core.dirPage("src/pages/");
core.dirScan(`${src}assets/`);
core.dirViews(`${src}views/`);
core.compile_syles();
core.compile_js();

console.log(`${core.time()}s`);

if (isProd) return;
/*
watch(["assets/", "pages/"], { recursive: true }, (evt, file) => {
    if (/.DS_Store$/.test(file)) return;

    core.initTime = new Date();
    const isFile = file.indexOf(".") > 0 ? true : false;
    const filename = path.basename(file);
    const ext = path.extname(filename);
    const dist_file = dist + file;
    const folder = file.split("/")[1]; // module, view, styles, img, fonts ..
    const view = file.split("/")[2]; // footer, header, strate-intro ..

    if (/^pages\//.test(file)) {
        core.compilePage(__dirname + "/" + file);
    } else {
        if (evt == "update" || evt == "add") core.compileAssets(file, dist_file, ext);

        if (ext === ".css") core.compile_syles();

        if (folder === "views" && ext === ".html") {
            core.dirPage("pages/");
        }
    }

    isFile && evt == "remove" ? fs.unlinkSync(dist_file) : core.rmDir(dist_file);
    core.console(`${folder}-${view}`, filename, evt);
});
*/

console.log(`I'm Watching you...`);
