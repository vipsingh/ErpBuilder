var _ = require("lodash");
var path = require('path');
var fs = require("fs");
var i18n = require("./i18n");

var Init = function () {
    var that = this;

    that.init = function () {
        //i18n.init();
    };
};

module.exports = new Init();
