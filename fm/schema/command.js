var _ = require('lodash');

/*
 * Command that will be visible on client
 * */
exports.ClientCommand = function (id, text, op) {
    var that = this;
    op = op ? op : {};

    return {
        type: 'general',
        id: id,
        text: text,
        category: 'main',
        style: op.style,
        icon: op.icon,
        visible : true,// or condition
        enable: true,// or condition
        handleOnClient: false
    };
};

exports.LinkClientCommand = function (id, text, op) {
    var that = this;
    op = op ? op : {};

    return {
        type: 'link',
        id: id,
        text: text,
        uri: '',// formattable
        target: 'current',//current, model

        category: 'main',
        style: op.style,
        icon: op.icon,
        visible : true,// or condition
        enable: true,// or condition
        handleOnClient: false,

    };
};
