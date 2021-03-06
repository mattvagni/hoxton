'use strict';

const path = require('path');

const options = require('commander');

const config = require('../lib/config');
const builder = require('../lib/builder');
const watcher = require('../lib/watcher');
const server = require('../lib/server');

options
    .version(require('../../package.json').version)
    .option('-d, --debug', 'Turn on debug logging')
    .option('-c, --config [file]', 'The location of your .yaml config file', 'config.yml')
    .option('-o, --outputDir [folder]', 'Where you\'d like to ouput your site to', '_site')
    .option('-s, --serve', 'If you\d like hoxton to serve you site.')
    .option('-p, --port [number]', 'The port you\'d like to serve your site on', (s) => parseInt(s, 10), '3000')
    .option('-w, --watch', 'If you want to watch for changes and rebuild')
    .parse(process.argv);

if (options.debug) {
    process.env.DEBUG = true;
}

let outputDir = path.join(process.cwd(), options.outputDir);
let parsedConfig;


function parseConfig() {
    parsedConfig = config.parse(path.join(process.cwd(), options.config));
}

function build(callback) {
    builder.build(parsedConfig, outputDir, callback);
}

function getFilesToWatch() {
    let filesToWatch = parsedConfig.pages.map((page) => page.markdown);
    filesToWatch.push(parsedConfig.theme);
    filesToWatch.push(options.config);
    filesToWatch = filesToWatch.concat(parsedConfig.include);
    return filesToWatch;
}

parseConfig();
build(() => {

    if (options.watch) {
        watcher.watch(getFilesToWatch(), () => {
            // On watch, re-parse the config & rebuild.
            watcher.add(getFilesToWatch());
            parseConfig();
            build();
        });
    }

    if (options.serve) {
        server.serve(outputDir, options.port);
    }
});
