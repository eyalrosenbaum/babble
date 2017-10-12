'use strict';

var messages = [];
var id = 0;

module.exports = {
    messages: messages,

    addMessage: function (message) {
        message.id = 'message' + id++;
        messages.push(message);
        return message.id;
    },

    getMessages: function (counter) {
        if (messages.length === 0) {
            return [];
        } else {
            return (messages.slice(counter));
        }
    },

    deleteMessage: function (id) {
        console.log('id to remove is ' + id);
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].id === id) {
                console.log('found id in array');
                messages.splice(i, 1);
            }
        }
    }


};

