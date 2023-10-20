module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                useBuiltIns: "entry",
                corejs: "3.32.2",
                modules: false,
            },
        ],
    ],
};
