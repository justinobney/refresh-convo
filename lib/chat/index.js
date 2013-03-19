var express = require('express');
var app = module.exports = express();

app.use(app.router);

var messageCache = [];

function addMessage(messageObj){
    messageCache.push(messageObj);

    var arrLen = messageCache.length;
    var resize = arrLen > 10;
    var howMany = (resize) ? arrLen - 10 : 0;

    messageCache.splice(0, howMany);
}

function init(context){
    app.post('/chat/sendMessage', function(req, res){
        var message = {
            time: new Date(),
            body: req.body['chat-message'],
            user: req.user
        };

        addMessage(message);

        context.io.sockets.emit('chat:messageReceived', {
            chat: message
        });

        res.send();
    });
}

module.exports.init = init;
module.exports.getChats = function(){ return messageCache.reverse(); };
