'use strict'

var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    queryUtil = require('querystring'),
    crypto = require('crypto'),
    messagesUtil = require('./messages-util'),
    randomKey = require('random-key');

var clients = [];
// var users = [];

// http.createServer(function(req,res){
//     res.end("Hello world");
// }).listen(8080,'localhost');
// console.log('server running');

function createHash(emailAddress) {
    if (emailAddress === 'anonymous') {
        return '/client/images/anonymous.png';
    } else {
        var trimmedAddress = emailAddress.trim().toLowerCase();
        var url = 'https://www.gravatar.com/avatar/';
        return (url + (crypto.createHash('md5').update(trimmedAddress).digest('hex')).toString());
    }
}

function handleRegister() {
    // console.log(userInfoString);
    // console.log(JSON.parse(userInfoString));
    // var userInfo = JSON.parse(userInfoString);
    // console.log(userInfo);
    // var userGravatar;
    // if (userInfo.email !== 'anonymous') {
    //     userGravatar = createHash(userInfo.email);
    // } else {
    //     userGravatar = '/client/images/anonymous.png';
    // }
    // console.log('userGravatar: ' + userGravatar);
    // var user = {
    //     info: userInfo,
    //     gravatar: userGravatar
    // };
    // users.push(user);
    var clientKey = randomKey.generate();
    return clientKey;
}

/*function that goes over the clients array and returns only unique entries - to find out how many clients are connected*/
function uniqueIDsHelper(clientsArr) {
    var result = [];
    for (var i = 0; i < clientsArr.length; i++) {
        var idToCheck = clientsArr[i].getHeader('x-request-id')
        if (idToCheck) {
            if (!result.includes(idToCheck)) {
                result.push(idToCheck);
            };
        };
    };
    console.log('found ' + result.length + ' unique user requests');
    return result;
}

var server = http.createServer(function (req, res) {
    var url_parts = url.parse(req.url);
    console.log('url parts: ' + JSON.stringify(url_parts));
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'GET') {
        //parse URL
        // console.log('req.url: ' + req.url);
        var url_parts = url.parse(req.url);
        // console.log('url parts: ' + JSON.stringify(url_parts));
        //polling handling
        if (url_parts.pathname === '/messages') {
            /*handling 400 status code error*/
            console.log(url_parts);
            if ((url_parts.path.substr(0, 18) !== '/messages?counter=') || (isNaN(url_parts.path.substr(19)))) {
                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                console.log('url_parts.path.substr(0, 18) === ' + url_parts.path.substr(0, 18));
                console.log('url_parts.path.substr(0, 18) !== "/messages?counter=" is' + (url_parts.path.substr(0, 18) !== '/messages?counter='));
                console.log('isNaN(url_parts.path.substr(19)) is ' + isNaN(url_parts.path.substr(19)));
                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                res.writeHead(400);
                res.end();
            } else {
                var count = url_parts.path.replace(/[^0-9]*/, '');
                console.log('count is ' + count);
                if (messagesUtil.messages.length > count) {
                    res.end(JSON.stringify({
                        count: messagesUtil.messages.length,
                        append: messagesUtil.getMessages(count)
                    }));
                } else {
                    //we will store the Response object into the clients array, 
                    //our server goes back to waiting for a new message to arrive, 
                    //while the client request remains open
                    console.log('pushing client request to array because there are no messages');
                    res.setHeader('X-Request-ID', '' + req.headers['x-request-id']);
                    clients.push(res);
                };
            }
        }
        else if (url_parts.pathname === '/stats') {
            var count;
            server.getConnections(function (err, count) {
                console.log("Number of connections : " + count);
            });
            var numOfClients = uniqueIDsHelper(clients);
            var reply = {
                users: numOfClients.length,
                messages: messagesUtil.messages.length
            };
            res.end(JSON.stringify(reply));
        }
        else if (url_parts.pathname === '/register') {
            var clientCode = handleRegister();
            res.end(clientCode);
        }
        else {
            switch (url_parts.pathname) {
                case '/client/styles/main.css':
                    fs.readFile('client/styles/main.css', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'text/css' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/scripts/main.js':
                    fs.readFile('client/scripts/main.js', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'text/javascript' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/Babble-logo.png':
                    fs.readFile('client/images/Babble-logo.png', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/msg-send.png':
                    fs.readFile('client/images/msg-send.png', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/msg-wrap.png':
                    fs.readFile('client/images/msg-wrap.png', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/eyal.jpg':
                    fs.readFile('client/images/eyal.jpg', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/jpg' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/styles/NunitoSans-Regular.ttf':
                    fs.readFile('client/styles/NunitoSans-Regular.ttf', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'application/x-font-ttf' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/close.png':
                    fs.readFile('client/images/close.png', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/green.png':
                    fs.readFile('client/images/green.png', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/purpleman.png':
                    fs.readFile('client/images/purpleman.png', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/client/images/anonymous.png':
                    fs.readFile('client/images/anonymous.png', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data);
                        res.end();
                    });
                    break;
                case '/':
                case 'client/index.html':

                    fs.readFile('client/index.html', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(data);
                        res.end();
                    });
                    break;
                default:
                    console.log('*************************************************************************************');
                    console.log('the url_parts.pathname that led to default was: ' + url_parts.pathname);
                    console.log('*************************************************************************************');
                    res.writeHead(404)
                    res.end();
                    break;
            }
        }
    } else if (req.method === 'POST') {
        console.log('req:' + req);
        // console.log('req explained '+JSON.stringify(req));
        console.log('req' + req.url);
        var requestBody = '';
        req.on('data', function (chunk) {
            requestBody += chunk.toString();
        });
        req.on('end', function () {
            console.log('requestBody: ' + JSON.stringify(requestBody));
            var data2 = JSON.parse(requestBody);
            var data = queryUtil.parse(requestBody);
            console.log('we have all the data ', data);
            console.log('we have all the data ', data2);
            switch (req.url) {
                case '/messages':
                    var message = JSON.parse(requestBody);
                    if ((message.email === undefined) || (message.name === undefined) || (message.message === undefined) || (message.times === undefined)) {
                        res.writeHead(400);
                        res.end();
                    } else {
                        console.log('message.email is ' + message.email);
                        if (message.email === 'anonymous') {
                            message.gravatar = '/client/images/anonymous.png'
                        } else {
                            message.gravatar = createHash(message.email);
                        }
                        messagesUtil.addMessage(message);
                        console.log('----------------------------------------------------------------------------------');
                        console.log('there are now ' + clients.length + ' clients');
                        console.log('here they are:');
                        console.log(clients);
                        console.log('----------------------------------------------------------------------------------');
                        while (clients.length > 0) {
                            var client = clients.pop();
                            console.log('*************************************************************************');
                            console.log('pop was made');
                            console.log('client response is ' + client);
                            console.log('*************************************************************************');
                            client.end(JSON.stringify({
                                count: messagesUtil.messages.length,
                                append: messagesUtil.getMessages(count - 1)
                            }));
                        }
                        res.end(JSON.stringify({
                            count: messagesUtil.messages.length,
                            append: messagesUtil.messages[messagesUtil.messages.length - 1]
                        }));

                    }
                    break;
                case '/logout':
                    console.log('*****************************************************************************************');
                    console.log('*****************************************************************************************');
                    console.log('logout was called by: ' + req.url);
                    console.log('number of client responses before logout is ' + clients.length);
                    var key = (JSON.parse(requestBody)).key;
                    var i = 0;
                    while (i < clients.length) {
                        var idToCheck = clients[i].getHeader('x-request-id');
                        if (idToCheck) {
                            if (idToCheck === key) {
                                console.log('erasing id ' + idToCheck);
                                clients.splice(i, 1);
                            } else {
                                i++;
                            }
                        };
                    }

                    console.log('number of client responses after logout is ' + clients.length);
                    res.writeHead(200);
                    res.write('hello');
                    res.end();
                    console.log('*****************************************************************************************');
                    console.log('*****************************************************************************************');
                    break;
                case '/stats':
                case '/register':
                    res.writeHead(405);
                    res.end();
                    break;
                default:
                    res.writeHead(404);
                    res.end();
                    break;

            }
        });
    } else if (req.method === 'DELETE') {
        console.log('req:' + req);
        console.log('req' + req.url);
        var url_parts = url.parse(req.url);
        console.log(url_parts);
        console.log('//////////////////////////////////////////////////////////////////////////////////');
        console.log('url_parts.pathname.substr(0, 9) is ' + url_parts.pathname.substr(0, 9));
        console.log("url_parts.path.substr(0, 17) !== '/messages/message' is " + (url_parts.path.substr(0, 17) !== '/messages/message'));
        console.log('url_parts.path.substr(17) is ' + url_parts.path.substr(17));
        console.log('!isNaN(url_parts.path.substr(17)) is ' + !isNaN(url_parts.path.substr(17)));
        console.log('//////////////////////////////////////////////////////////////////////////////////');
        if (url_parts.pathname.substr(0, 9) === '/messages') {
            if ((url_parts.path.substr(0, 17) !== '/messages/message') || (isNaN(url_parts.path.substr(17)))) {
                res.writeHead(400);
                res.end();
            } else {
                messagesUtil.deleteMessage(url_parts.path.substr(10));
                res.end('message deleted - thank you');
            };
        } else {
            switch (url_parts.pathname) {
                case '/stats':
                case '/register':
                    res.writeHead(405);
                    res.end();
                    break;
                default:
                    res.writeHead(404);
                    res.end();
                    break;
            }
        }
    }
    else if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
    } else {
        res.writeHead(405);
        res.end();
    };

    // res.end();
    // if (url_parts.pathname == '/') {
    //             //serving index.html
    //             fs.readFile('../client/index.html', function (err, data) {
    //                 res.end(data);
    //             });
    //         } else {
    //             console.log('something else');
    //         }
    // res.writeHead(200,{
    //     'Content-type':'text/html'
    // });


    // fs.readFile('../client/index.html',function(err,data){
    //     res.write(data);
    //     res.end(/*data*/);
    // });
}).listen(8080, 'localhost');
console.log('server running');

setInterval(function () {
    server.getConnections(function (err, count) {
        console.log("Number of connections : " + count);
    });
}, 60000);

setInterval(function () {
    for (var i = 0; i < clients.length; i++) {
        var client = clients.pop();
        client.end();
    }
}, 200000);