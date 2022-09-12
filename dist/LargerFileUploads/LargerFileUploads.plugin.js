/**
 * @name LargerFileUploads
 * @version 0.0.1
 * @author dylan-dang
 * @description Allows you to upload larger files to Discord.
 * @authorId 316707214075101200
 */
'use strict';

module.exports = () => exports;

Object.defineProperty(exports, '__esModule', {
    value: true,
});
var bdapi = BdApi;
const { before: bruh } = bdapi.Patcher;

function start() {
    console.log(bruh);
}

function stop() {}

exports.start = start;
exports.stop = stop;
