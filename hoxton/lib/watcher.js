'use strict';

const chokidar = require('chokidar');
const _ = require('lodash');

const log = require('../lib/log');
const utils = require('../lib/utils');

let watcher;
let isReady = false;

/**
 * Start watching and call the callback on
 * add change & delete of files and directories.
 *
 * @param {array} filesToWatch
 * @param {function} callback Called for each event.
 */
function startWatch(filesToWatch, callback) {

    callback = _.debounce(callback, 50, { trailing: true });

    watcher = chokidar.watch(filesToWatch, {
        persistent: true
    });

    watcher
    .on('add', (path) => {
        if (isReady) {
            log.info(`${path} was added`);
            callback();
        }
    })
    .on('change', (path) => {
        if (isReady) {
            log.info(`${path} was changed`);
            callback();
        }
    })
    .on('unlink', (path) => {
        if (isReady) {
            log.info(`${path} was deleted`);
            callback();
        }
    })
    .on('addDir', (path) => {
        if (isReady) {
            log.info(`${path} was added`);
            callback();
        }
    })
    .on('unlinkDir', (path) => {
        if (isReady) {
            log.info(`${path} was deleted`);
            callback();
        }
    })
    .on('error', (error) => {
        utils.raiseError('Error watching files.', error);
    })
    .on('ready', () => {
        log.success('Watching for file changes...');
        isReady = true;
    });
}

module.exports = {
    watch: startWatch,

    /**
     * Add files to watch
     */
    add(files) {
        watcher.add(files);
    }
};
