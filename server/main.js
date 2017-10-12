'use strict'

var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    queryUtil = require('querystring'),
    crypto = require('crypto'),
    messagesUtil = require('./messages-util'),
    randomKey = require('random-key');

var clients = [];
var stats = [];

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
    var clientKey = randomKey.generate();
    return clientKey;
}

/*function that goes over the clients array and returns only unique entries - to find out how many clients are connected*/
function uniqueIDsHelper(clientsArr, id) {
    console.log('clients length from uniqueIdsHelper is ' + clientsArr.length + ' id is ' + id);
    var result = [];
    for (var i = 0; i < clientsArr.length; i++) {
        var idToCheck = clientsArr[i].response.getHeader('x-request-id')
        if ((idToCheck) && (id) && (idToCheck !== id)) {
            if (!result.includes(idToCheck)) {
                result.push(idToCheck);
            };
        };
    };
    // console.log('*************************************************************************************');
    // console.log('found ' + result.length + ' unique user requests out of ' + clients.length + ' requests');
    // console.log('*************************************************************************************');
    return result;
}



var server = http.createServer(function (req, res) {
    var url_parts = url.parse(req.url);
    // console.log('url_parts.pathname = ' + url_parts.pathname);
    // console.log('url_parts.path = ' + url_parts.path);
    // console.log('url parts: ' + JSON.stringify(url_parts));
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Request-ID');
    res.setHeader("Access-Control-Allow-Methods", 'GET,OPTIONS,POST,DELETE');
    if (req.method === 'GET') {
        //parse URL
        // console.log('req.url: ' + req.url);
        var url_parts = url.parse(req.url);
        // console.log('url parts: ' + JSON.stringify(url_parts));
        //polling handling
        if (url_parts.pathname === '/messages') {
            console.log('***********************************************************');
            console.log(url_parts.path);
            console.log(url_parts.path.substr(0, 18));
            console.log(url_parts.path.substr(18));
            console.log('encountered messages request from ' + req.headers['x-request-id'] + ', counter is ' + url_parts.path.substr(18));
            /*handling 400 status code error*/
            // console.log(url_parts);
            if ((url_parts.path.substr(0, 18) !== '/messages?counter=') || (isNaN(url_parts.path.substr(18)))) {
                // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                // console.log('url_parts.path.substr(0, 18) === ' + url_parts.path.substr(0, 18));
                // console.log('url_parts.path.substr(0, 18) !== "/messages?counter=" is' + (url_parts.path.substr(0, 18) !== '/messages?counter='));
                // console.log('isNaN(url_parts.path.substr(19)) is ' + isNaN(url_parts.path.substr(19)));
                // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                res.writeHead(400);
                res.end();
            } else {
                var count = url_parts.path.replace(/[^0-9]*/, '');
                // console.log('count is ' + count);
                if (messagesUtil.messages.length > count) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({
                        count: messagesUtil.messages.length,
                        append: messagesUtil.getMessages(count)
                    }));
                } else {
                    //we will store the Response object into the clients array, 
                    //our server goes back to waiting for a new message to arrive, 
                    //while the client request remains open;
                    res.setHeader('X-Request-ID', '' + req.headers['x-request-id']);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    clients.push({ response: res, type: 'GET: /messages', timestamp: new Date().getTime() });
                    console.log('inserted GET: /messages message for ' + req.headers['x-request-id']);
                    console.log('number of get messages request is ' + clients.length + ' and ' + uniqueIDsHelper(clients, 'none').length + ' of those are unique');
                    console.log('***********************************************************');
                };
            }
        }
        else if (url_parts.pathname === '/stats') {
            console.log('***********************************************************');
            console.log('encountered stats request from ' + req.headers['x-request-id']);
            res.setHeader('X-Request-ID', '' + req.headers['x-request-id']);
            res.writeHead(200, { "Content-Type": "application/json" });
            stats.push({ response: res, type: 'GET: /stats', timestamp: new Date().getTime() });
            console.log('inserted GET: /stats message for ' + req.headers['x-request-id']);
            console.log('***********************************************************');
            // var count;
            // server.getConnections(function (err, count) {
            //     console.log("Number of connections : " + count);
            // });
            // var numOfClients = uniqueIDsHelper(clients);
            // var reply = {
            //     users: numOfClients.length,
            //     messages: messagesUtil.messages.length
            // };
            // res.end(JSON.stringify(reply));
        }
        else if (url_parts.pathname === '/register') {
            console.log('***********************************************************');
            console.log('encountered register request from ' + req.headers['x-request-id']);

            /*new stuff*/
            while (stats.length > 0) {
                var stat = stats.pop();
                console.log('popped stats request from id ' + stat.response.getHeader('x-request-id'));
                var numOfClients = uniqueIDsHelper(clients, req.headers['x-request-id']);
                console.log('sending ' + numOfClients.length + ' as num of users');
                stat.response.end(JSON.stringify({
                    //adding 1 to users because registered user and login user have no messages themselves in clients array
                    users: numOfClients.length + 1,
                    messages: messagesUtil.messages.length
                }));
            }
            /*new stuff end*/
            var clientCode = handleRegister();
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(clientCode);
            console.log('***********************************************************');

        }
        else if (url_parts.pathname === '/login') {
            console.log('***********************************************************');
            console.log('encountered login request from ' + req.headers['x-request-id']);
            /*new stuff*/
            while (stats.length > 0) {
                var stat = stats.pop();
                console.log('popped stats request from id ' + stat.response.getHeader('x-request-id'));
                var numOfClients = uniqueIDsHelper(clients, req.headers['x-request-id']);
                console.log('sending ' + numOfClients.length + ' as num of users');
                stat.response.end(JSON.stringify({
                    //adding 1 to users because registered user and login user have no messages themselves in clients array
                    users: numOfClients.length + 1,
                    messages: messagesUtil.messages.length
                }));
            }
            /*new stuff end*/
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end('');
            console.log('***********************************************************');
        }
        else {
            console.log('other requests:');
            console.log(url_parts.path);
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
                case '/client':
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
        // console.log('req:' + req);
        // console.log('req explained '+JSON.stringify(req));
        // console.log('req' + req.url);
        var requestBody = '';
        req.on('data', function (chunk) {
            requestBody += chunk.toString();
        });
        req.on('end', function () {
            // console.log('requestBody: ' + JSON.stringify(requestBody));
            var data2 = JSON.parse(requestBody);
            var data = queryUtil.parse(requestBody);
            console.log('we have all the data ', data);
            console.log('we have all the data ', data2);
            console.log('**********************' + req.url + '*************************');
            switch (req.url) {
                case '/messages':
                    console.log('***********************************************************');
                    console.log('encountered post message request from ' + req.headers['x-request-id']);
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
                        if (req.headers['x-request-id']) {
                            message.header = req.headers['x-request-id'];
                        } else {
                            message.header = 'none';
                        }
                        messagesUtil.addMessage(message);
                        // console.log('----------------------------------------------------------------------------------');
                        // console.log('there are now ' + clients.length + ' clients');
                        // console.log('here they are:');
                        // console.log(clients);
                        // console.log('----------------------------------------------------------------------------------');
                        /*sending responses to getstats requests*/
                        while (stats.length > 0) {
                            var stat = stats.pop();
                            console.log('popped stats request from id ' + stat.response.getHeader('x-request-id'));
                            var numOfClients = uniqueIDsHelper(clients, 'none');
                            console.log('sending ' + numOfClients.length + ' as num of users');
                            stat.response.end(JSON.stringify({
                                users: numOfClients.length,
                                messages: messagesUtil.messages.length
                            }));
                        }
                        /*sending responses to getmessages requests*/
                        while (clients.length > 0) {
                            var client = clients.pop();
                            console.log('popped message request from id ' + client.response.getHeader('x-request-id'));
                            // console.log('*************************************************************************');
                            // console.log('pop was made');
                            // console.log('client response is ' + client);
                            // console.log('*************************************************************************');
                            client.response.end(JSON.stringify({
                                count: messagesUtil.messages.length,
                                append: messagesUtil.getMessages(count - 1)
                            }));
                        }

                        res.end(JSON.stringify(
                            messagesUtil.messages.length));

                    }
                    console.log('***********************************************************');
                    break;
                case '/logout':
                    var key = (JSON.parse(requestBody)).key;
                    console.log('***********************************************************');
                    console.log('encountered logout request from ' + key);
                    console.log('clients message requests before were:');
                    for (var i = 0; i < clients.length; i++) {
                        console.log('' + i + '.' + clients[i].response.getHeader('x-request-id'));
                    };
                    console.log('stats responses before logout is: ');
                    for (var i = 0; i < stats.length; i++) {
                        console.log('' + i + '.' + stats[i].response.getHeader('x-request-id'));
                    };

                    console.log('' + key + ' wants to logout');

                    //removing messages requests of the logout user
                    var i = 0;
                    while (i < clients.length) {
                        var idToCheck = clients[i].response.getHeader('x-request-id');
                        if ((idToCheck) && (idToCheck === key)) {
                            console.log('type of request was ' + clients[i].type);
                            console.log('erasing messsages request of id ' + idToCheck);
                            clients.splice(i, 1);
                        } else {
                            i++;
                        };
                    };

                    //removing stats requests of logout user and sending stats responses to the rest of the users
                    while (stats.length > 0) {
                        var stat = stats.pop();
                        var idToCheck = stat.response.getHeader('x-request-id');
                        if ((idToCheck) && (idToCheck === key)) {
                            console.log('type of request was ' + stat.type);
                            console.log('erasing stat request id of ' + idToCheck);
                        } else {
                            console.log('popped stats request from id ' + stat.response.getHeader('x-request-id'));
                            var numOfClients = uniqueIDsHelper(clients, 'none');
                            console.log('sending ' + numOfClients.length + ' as num of users');
                            stat.response.end(JSON.stringify({
                                users: numOfClients.length,
                                messages: messagesUtil.messages.length
                            }));
                        }
                    }

                    console.log('client responses after logout is: ');
                    for (var i = 0; i < clients.length; i++) {
                        console.log('' + i + '.' + clients[i].response.getHeader('x-request-id'));
                    };
                    console.log('stats responses after logout is: ');
                    for (var i = 0; i < stats.length; i++) {
                        console.log('' + i + '.' + stats[i].response.getHeader('x-request-id'));
                    };

                    /*new stuff end*/
                    // console.log('number of client responses after logout is ' + clients.length);
                    // res.writeHead(200, { "Content-Type": "text/plain" });
                    // res.end();
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
        // console.log('req:' + req);
        // console.log('req' + req.url);
        var url_parts = url.parse(req.url);
        // console.log(url_parts);
        // console.log('//////////////////////////////////////////////////////////////////////////////////');
        // console.log('url_parts.pathname.substr(0, 9) is ' + url_parts.pathname.substr(0, 9));
        // console.log("url_parts.path.substr(0, 17) !== '/messages/message' is " + (url_parts.path.substr(0, 17) !== '/messages/message'));
        // console.log('url_parts.path.substr(17) is ' + url_parts.path.substr(17));
        // console.log('!isNaN(url_parts.path.substr(17)) is ' + !isNaN(url_parts.path.substr(17)));
        // console.log('//////////////////////////////////////////////////////////////////////////////////');
        if (url_parts.pathname.substr(0, 9) === '/messages') {
            console.log('***********************************************************');
            console.log('encountered delete message request from ' + req.headers['x-request-id']);
            if ((url_parts.path.substr(0, 10) !== '/messages/') || (isNaN(url_parts.path.substr(10)))) {
                res.writeHead(400);
                res.end();
            } else {
                messagesUtil.deleteMessage('message'+url_parts.path.substr(10));
                /*sending responses to all getstats messages*/
                while (stats.length > 0) {
                    var stat = stats.pop();
                    console.log('popped stats request from id ' + stat.response.getHeader('x-request-id'));
                    var numOfClients = uniqueIDsHelper(clients, 'none');
                    console.log('sending ' + numOfClients.length + ' as num of users');
                    stat.response.end(JSON.stringify({
                        users: numOfClients.length,
                        messages: messagesUtil.messages.length
                    }));
                }
                /*new stuff end*/
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(JSON.stringify(messagesUtil.messages.length));
                console.log('***********************************************************');
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
}).listen(9000, 'localhost');
console.log('server running');

// setInterval(function () {
//     for (var i = 0; i < clients.length; i++) {
//         var client = clients.pop();
//    console.log('geee');
//         client.end();
//     }
// }, 200000);

setInterval(function () {
    // close out requests older than 30 seconds
    var expiration = new Date().getTime() - 30000;
    var response;
    for (var i = clients.length - 1; i >= 0; i--) {
        if (clients[i].timestamp < expiration) {
            response = clients[i].response;
            clients.splice(i, 1);
            response.end("");
        }
    }
}, 1000);

setInterval(function () {
    // close out requests older than 30 seconds
    var expiration = new Date().getTime() - 30000;
    var response;
    for (var i = stats.length - 1; i >= 0; i--) {
        if (stats[i].timestamp < expiration) {
            response = stats[i].response;
            stats.splice(i, 1);
            response.end("");
        }
    }
}, 1000);


// setInterval(function () {
//     console.log('+++++++++++++++++++++++++++++++++++++++++++');
//     console.log('number of clients responses: ' + clients.length);
//     for (var i = 0; i < clients.length; i++) {
//         console.log(clients[i].response.getHeader('x-request-id'));
//     }
//     console.log('number of stat responses: ' + stats.length);
//     for (var i = 0; i < stats.length; i++) {
//         console.log(stats[i].response.getHeader('x-request-id'));
//     }
//     console.log('+++++++++++++++++++++++++++++++++++++++++++');

// }, 10000)