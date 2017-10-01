var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    queryUtil = require('querystring'),
    crypto = require('crypto');

var messages = ["testing"];
var clients = [];

// http.createServer(function(req,res){
//     res.end("Hello world");
// }).listen(8080,'localhost');
// console.log('server running');

function createHash(emailAddress) {
    var trimmedAddress = emailAddress.trim().toLowerCase();
    var url = 'https://www.gravatar.com/avatar/';
    return (url + (crypto.createHash('md5').update(trimmedAddress).digest('hex')).toString());
}

function handleRegister(userInfoString) {
    console.log(userInfoString);
    console.log(JSON.parse(userInfoString));
    var userInfo = JSON.parse(userInfoString);
    console.log(userInfo);
    var userGravatar = createHash(userInfo.email);
    console.log('userGravatar: ' + userGravatar);
    var user = {
        info: userInfo,
        gravatar: userGravatar
    };
    clients.push(user);
}

http.createServer(function (req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'GET') {
        //parse URL
        var url_parts = url.parse(req.url);
        console.log(url_parts);
        //polling handling
        if (url_parts.pathname.substr(0, 5) == '/poll') {
            var count = url_parts.pathname.replace(/[^0-9]*/, '');
            console.log(count);
            if (messages.length > count) {
                res.end(JSON.stringify({
                    count: messages.length,
                    append: messages.slice(count).join('\n') + '\n'
                }));
            } else {
                clients.push(res);
            }
            //handling sending other resources as needed
        } else if (url_parts.pathname.substr(0, 5) == '/msg/') {
            // message receiving
            var msg = unescape(url_parts.pathname.substr(5));
            messages.push(msg);
            while (clients.length > 0) {
                var client = clients.pop();
                client.end(JSON.stringify({
                    count: messages.length,
                    append: msg + '\n'
                }));
            }
            res.end();
        } else {
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
                default:
                    fs.readFile('client/index.html', function (err, data) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(data);
                        res.end();
                    });
                    break;
            }
        }
    } else if (req.method === 'POST') {
        console.log('req:' + req);
        console.log('req' + req.url);
        var requestBody = '';
        req.on('data', function (chunk) {
            requestBody += chunk.toString();
        });
        req.on('end', function () {
            var data2 = JSON.parse(requestBody);
            var data = queryUtil.parse(requestBody);
            console.log('we have all the data ', data);
            console.log('we have all the data ', data2);
            switch (req.url) {
                case '/register.html':
                    handleRegister(requestBody);
                    res.end('client registered - thank you');
                    break;
            }
            // res.end('thank you');
        });
    } else {
        res.writeHead(405);
        res.end();
    }

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