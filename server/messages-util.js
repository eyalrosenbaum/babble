'use strict';

var messages = [];
var id = 0;

module.exports = {
    messages: messages,

    addMessage: function (message) {
        message.id = id++;
        messages.push(message);
    },

    getMessages: function (counter) {
        return (messages.slice(counter));
    },

    deleteMessage: function (id) {
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].id === id) {
                messages.splice(i, 1);
            }
        }
    }


};

