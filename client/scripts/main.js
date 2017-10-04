'use strict';

var counter = 0;

var Babble = {
    currentMessage: '',
    userInfo: {
        name: '',
        email: '',
        clientKey: ''
    }
};

var historyBabble = localStorage.getItem('babble');
if (historyBabble){
    console.log(historyBabble);
    Babble = JSON.parse(historyBabble);
}

// checking if first load or not, if so pop up modal and mask
if (!localStorage.getItem('babble')) {
    setTimeout(function () {
        document.querySelector('.mask').classList.remove('hidden');
        document.querySelector('.Modal').classList.remove('hidden');
    }, 1400);
} else {
    removeMaskModalFromDom();
}

//adding click event handlers to modal buttons
if (document.querySelector('.Modal')) {
    document.querySelector('.anonymous-sign-in-btn').addEventListener('click', anonymousSignIn);
    document.querySelector('.identified-sign-in-btn').addEventListener('click', identifiedSignIn);
}

document.querySelector('.Growable textarea').addEventListener('keyup', handleTextAreaInput);
//serge's code to make textarea growable
makeGrowable(document.querySelector('.js-growable'));

function makeGrowable(container) {
    var area = container.querySelector('textarea');
    var clone = container.querySelector('span');
    area.addEventListener('input', function (e) {
        clone.textContent = area.value;
    });
}

//function to remove modal and mask from dom after we are finished with it
function removeMaskModalFromDom() {
    var mask = document.querySelector('.mask');
    var modal = document.querySelector('.Modal');
    var body = document.querySelector('body');
    body.removeChild(mask);
    body.removeChild(modal);
}
//sending data to server, after signing in either as anonymous or identified user, we remove modal and mask
function signIn() {
    var promise = register();
    promise.then(function (response) {
        console.log(response);
        Babble.userInfo.clientKey = response;
        localStorage.setItem('babble',JSON.stringify(Babble));
        document.querySelector('.mask').classList.add('hidden');
        document.querySelector('.Modal').classList.add('hidden');
        setTimeout(function () {
            removeMaskModalFromDom();
            setTimeout(function () {
                getMessages(0, showMessages);
            }, 200);
        }, 1400);
    });
    // register(Babble.userInfo).then(function (response) {
    // console.log('response from server is ' + response);

    // });
}

//a function to erase errors in identified sign in from screen after the user tries again to sign in
function errorReset() {
    var emailErrorMessage = document.querySelector('.error-email');
    emailErrorMessage.classList.remove('show');
    emailErrorMessage.classList.add('no-show');
    var nameErrorMessage = document.querySelector('.error-name');
    nameErrorMessage.classList.remove('show');
    nameErrorMessage.classList.add('no-show');
}

//function to handle user request to sign in as anonymous
function anonymousSignIn(e) {
    e.preventDefault();
    errorReset();
    Babble.userInfo.email = 'anonymous';
    Babble.userInfo.name = 'anonymous';
    localStorage.setItem('babble', JSON.stringify(Babble));
    signIn();
}

//function to handle user request to sign in with his name and email
function identifiedSignIn(e) {
    e.preventDefault();
    errorReset();
    var email = document.querySelector('.email-input>input').value;
    console.log('email is ' + email);
    var name = document.querySelector('.full-name-input>input').value;
    console.log('name is ' + name);
    if (email !== '' && name !== '') {
        Babble.userInfo.email = email;
        Babble.userInfo.name = name;
        localStorage.setItem('babble', JSON.stringify(Babble));
        console.log('Babble.userInfo.email: ' + Babble.userInfo.email);
        console.log('Babble.userInfo.name: ' + Babble.userInfo.name);
        console.log('from storage: ' + localStorage.getItem('babble'));
        signIn();
    } else {
        //handling errors - blank inputs
        if (email === '') {
            var emailErrorMessage = document.querySelector('.error-email');
            emailErrorMessage.classList.remove('no-show');
            emailErrorMessage.classList.add('show');
        }
        if (name === '') {
            var nameErrorMessage = document.querySelector('.error-name');
            nameErrorMessage.classList.remove('no-show');
            nameErrorMessage.classList.add('show');
        }
    }
}

function showMessages(messagesArr) {
    if (messagesArr === undefined) {
        return;
    }
    console.log('function showMessages');
    console.log('messagesArr:\n' + messagesArr);
    var messagesList = document.querySelector('ol.message-list');
    for (var i = 0; i < messagesArr.length; i++) {
        var li = document.createElement('li');
        li.setAttribute('id', messagesArr[i].id);
        li.classList.add('message');
        /*adding gravatar*/
        var img = document.createElement('img');
        img.setAttribute('src', messagesArr[i].gravatar);
        img.setAttribute('alt', '');
        img.classList.add('message-img');
        li.appendChild(img);
        /*adding gravatar end*/
        /*adding message body*/
        var messageBody = document.createElement('div');
        messageBody.classList.add('message-body');
        /*adding header to message body*/
        var messageTextHeader = document.createElement('div');
        messageTextHeader.classList.add('message-text-header');
        /*adding cite to header*/
        var messageSender = document.createElement('cite');
        messageSender.classList.add('message-sender');
        var messageSenderText = document.createTextNode(messagesArr[i].author);
        messageSender.appendChild(messageSenderText);
        messageTextHeader.appendChild(messageSender);
        /*adding time to header*/
        var messageTime = document.createElement('span');
        messageTime.classList.add('message-time');
        var messageTimeText = document.createTextNode(messagesArr[i].timestamp);
        messageTime.appendChild(messageTimeText);
        messageTextHeader.appendChild(messageTime);
        /*adding delete buttom to message - only if it is the users message*/
        if (messagesArr[i].author === Babble.userInfo.name) {
            var deleteButton = document.createElement('span');
            deleteButton.classList.add('delete-button');
            messageTextHeader.appendChild(deleteButton);
        }
        messageBody.appendChild(messageTextHeader);
        /*adding header to message body end*/
        /*adding message body text to message body*/
        var messageTextBody = document.createElement('div');
        messageTextBody.classList.add('message-body-text');
        var messageTextBodyText = document.createTextNode(messagesArr[i].body);
        messageTextBody.appendChild(messageTextBodyText);
        messageBody.appendChild(messageTextBody);
        /*adding message body text to message body end*/
        li.appendChild(messageBody);
        /*adding message body end*/
        messagesList.appendChild(li);
    };
}

function updateStats(numOfUsers, numOfMessages) {
    document.querySelector('.purpleman-writing').textContent = numOfUsers;
    document.querySelector('.green-writing').textContent = numOfMessages;
}

function handleTextAreaInput(e) {
    e.preventDefault();
    if (e.keyCode == 13) {
        sendMessage();
    } else {
        Babble.currentMessage = document.querySelector('.growable textarea').value;
        console.log('message is ' + Babble.currentMessage);
    }
}

function updateMessage() {
    var textArea = document.querySelector('.growable textarea');
    Babble.currentMessage = textArea.value;
    console.log(Babble.currentMessage);
}

function sendMessage() {
    console.log('sendMessage()');
    var promise = postMessage(Babble.currentMessage, getMessages);
    promise.then(function (response) {
        console.log('response is ' + response);
        document.querySelector('.Growable textarea').value = '';
        Babble.currentMessage = '';
    });
    return false;
}

function register() {
    var options = {
        method: 'GET',
        action: 'register'
    };

    return request(options);
}

function getMessages(counter, callback) {
    var options = {
        method: 'GET',
        action: 'messages?counter=' + counter
    };
    var promise = request(options);
    promise.then(function (response) {
        console.log('calling callback now');
        console.log('response is ' + response);
        callback(response.data);
        if (response.data !== undefined) {
            getMessages(response.data.count, callback);
        }
    });
}

function postMessage(message, callback) {
    console.log('name is '+ Babble.userInfo.name);
    console.log('email is '+Babble.userInfo.email);
    console.log('message is '+message);
    var messageData = {
        name: Babble.userInfo.name,
        email: Babble.userInfo.email,
        message: message,
        times: new Date().getTime()
    };
    console.log('messageData is ' + messageData);
    var options = {
        method: 'POST',
        action: 'messages',
        data: JSON.stringify(messageData)
    };
    console.log('messageData is: ' + options.data);
    return request(options);
}

function deleteMessage(id, callback) {
    var options = {
        method: 'DELETE',
        action: 'messages/' + id
    };

    var promise = request(options);
    promise.then(function (response) {
        console.log(response);
        if (response) {
            var list = document.querySelector('ol');
            var element = document.querySelector('li#' + id);
            ol.removeChild(element);
        };
    });
    callback(updateStats);
}

function getStats(callback) {
    var options = {
        method: 'GET',
        action: 'stats'
    };
    var promise = request(options);
    promise.then(function (response) {
        var object = JSON.parse(response);
        callback(object.users, object.messages);
    });
}

function request(options) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.action);
        if (options.method === 'post') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        console.log('Babble.userInfo.clientKey is: '+Babble.userInfo.clientKey);
        xhr.setRequestHeader('X-Request-ID', Babble.userInfo.clientKey);
        xhr.addEventListener('load', e => {
            resolve(e.target.responseText);
        });
        xhr.send(options.data);
    });
}

getMessages(0, showMessages);
getStats(updateStats);