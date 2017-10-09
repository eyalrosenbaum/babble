'use strict';

var counter = 0;

var Babble = {
    currentMessage: '',
    userInfo: {
        name: '',
        email: '',
        clientKey: '',
        counter: 0
    }
};

var historyBabble = localStorage.getItem('babble');
if (historyBabble) {
    Babble = JSON.parse(historyBabble);
    getStats(updateStats);
    /*first logging in*/
    // var options = {
    //     method: 'GET',
    //     action: 'login',
    // };

    // var promise = request(options);
    /*updating info for logged user*/
    // promise.then(function () {

    // console.log("origin");

    var options = {
        method: 'GET',
        action: 'login',
    };
    var promise = request(options);
    promise.then(getMessages(0, showMessages));
    // getStats(updateStats);
    // console.log('origin2');
    document.querySelector('.NewMessageArea textarea').value = Babble.currentMessage;
    // });
}


//cleaning everything on page unload
window.addEventListener('unload', function (e) {
    console.log('unload event triggered');
    var credentials = {
        key: Babble.userInfo.clientKey
    };
    navigator.sendBeacon('logout',JSON.stringify(credentials));
    // var options = {
    //     method: 'POST',
    //     action: 'logout',
    //     data: JSON.stringify(credentials)
    // };

    // request(options);
});

// window.addEventListener('unload',function(e){
//     window.localStorage.clear();
// });


// checking if first load or not, if so pop up modal and mask
if (!localStorage.getItem('babble')) {
    setTimeout(function () {
        document.querySelector('.Mask').classList.remove('is-hidden');
        document.querySelector('.Modal').classList.remove('is-hidden');
    }, 1400);
} else {
    removeMaskModalFromDom();
}

//adding click event handlers to modal buttons
if (document.querySelector('.Modal')) {
    document.querySelector('.AnonymousSignInButton').addEventListener('click', anonymousSignIn);
    document.querySelector('.IdentifiedSignInButton').addEventListener('click', identifiedSignIn);
}

document.querySelector('.NewMessageArea textarea').addEventListener('keyup', handleTextAreaInput);
document.querySelector('#submitBtn').addEventListener('click', sendMessage);
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
    var mask = document.querySelector('.Mask');
    var modal = document.querySelector('.Modal');
    var body = document.querySelector('body');
    body.removeChild(mask);
    body.removeChild(modal);
}
//sending data to server, after signing in either as anonymous or identified user, we remove modal and mask
function signIn() {
    getStats(updateStats);
    var promise = register();
    promise.then(function (response) {
        Babble.userInfo.clientKey = response;
        localStorage.setItem('babble', JSON.stringify(Babble));
        document.querySelector('.Mask').classList.add('is-hidden');
        document.querySelector('.Modal').classList.add('is-hidden');
        setTimeout(function () {
            removeMaskModalFromDom();
            setTimeout(function () {
                // console.log("origin");
                getMessages(0, showMessages);
                // getStats(updateStats);
            }, 200);
        }, 1400);
    });
    // register(Babble.userInfo).then(function (response) {
    // console.log('response from server is ' + response);

    // });
}

//a function to erase errors in identified sign in from screen after the user tries again to sign in
function errorReset() {
    var emailErrorMessage = document.querySelector('.Modal-errorEmail');
    emailErrorMessage.classList.remove('show');
    emailErrorMessage.classList.add('no-show');
    var nameErrorMessage = document.querySelector('.Modal-errorName');
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
    var email = document.querySelector('.Modal-emailInput>input').value;
    var name = document.querySelector('.Modal-fullNameInput>input').value;
    if (email !== '' && name !== '') {
        Babble.userInfo.email = email;
        Babble.userInfo.name = name;
        localStorage.setItem('babble', JSON.stringify(Babble));
        signIn();
    } else {
        //handling errors - blank inputs
        if (email === '') {
            var emailErrorMessage = document.querySelector('.Modal-errorEmail');
            emailErrorMessage.classList.remove('no-show');
            emailErrorMessage.classList.add('show');
        }
        if (name === '') {
            var nameErrorMessage = document.querySelector('.Modal-errorName');
            nameErrorMessage.classList.remove('no-show');
            nameErrorMessage.classList.add('show');
        }
    }
}

function showMessages(messagesArr) {
    console.log(messagesArr);
    if (messagesArr === undefined) {
        return;
    }
    var messagesList = document.querySelector('ol.MainMessageArea-messageList');
    for (var i = 0; i < messagesArr.length; i++) {
        if (!document.querySelector('li#' + messagesArr[i].id)) {
            var li = document.createElement('li');
            li.setAttribute('id', messagesArr[i].id);

            li.classList.add('Message');
            /*adding gravatar*/
            var img = document.createElement('img');
            img.setAttribute('src', messagesArr[i].gravatar);
            img.setAttribute('alt', '');
            img.classList.add('Message-image');
            li.appendChild(img);
            /*adding gravatar end*/
            /*adding message body*/
            var messageBody = document.createElement('div');
            messageBody.classList.add('Message-body');
            messageBody.setAttribute('tabindex', 0);
            /*adding header to message body*/
            var messageTextHeader = document.createElement('div');
            messageTextHeader.classList.add('Message-textHeader');
            /*adding cite to header*/
            var messageSender = document.createElement('cite');
            messageSender.classList.add('Message-sender');
            var messageSenderText = document.createTextNode(messagesArr[i].name);
            messageSender.appendChild(messageSenderText);
            messageTextHeader.appendChild(messageSender);
            /*adding time to header*/
            var messageTime = document.createElement('time');
            messageTime.classList.add('Message-time');
            var messageDate = new Date(messagesArr[i].times);
            messageTime.setAttribute('datetime', messageDate);
            var messageTimeText;
            var minutes = messageDate.getMinutes();
            if (minutes > 10) {
                messageTimeText = document.createTextNode(messageDate.getHours() + ':' + messageDate.getMinutes());
            } else {
                messageTimeText = document.createTextNode(messageDate.getHours() + ':0' + messageDate.getMinutes());
            }
            messageTime.appendChild(messageTimeText);
            messageTextHeader.appendChild(messageTime);
            /*adding delete buttom to message and adding class to change background color - only if it is the users message*/
            if ((messagesArr[i].name === Babble.userInfo.name) && (messagesArr[i].header === Babble.userInfo.clientKey)) {
                var deleteButton = document.createElement('button');
                deleteButton.setAttribute('aria-label', 'delete');
                deleteButton.setAttribute('id', 'delete' + messagesArr[i].id);
                deleteButton.classList.add('Message-deleteButton');
                deleteButton.addEventListener('click', handleDelete);
                deleteButton.setAttribute('tabindex', 0);
                messageTextHeader.appendChild(deleteButton);
                messageBody.classList.add('is-mine');
            }
            messageBody.appendChild(messageTextHeader);
            /*adding header to message body end*/
            /*adding message body text to message body*/
            var messageTextBody = document.createElement('div');
            messageTextBody.classList.add('Message-bodyText');
            var messageTextBodyText = document.createTextNode(messagesArr[i].message);
            messageTextBody.appendChild(messageTextBodyText);
            messageBody.appendChild(messageTextBody);
            /*adding message body text to message body end*/
            li.appendChild(messageBody);
            /*adding message body end*/
            messagesList.appendChild(li);

        }
    };
    document.querySelector('li#' + (messagesArr[messagesArr.length - 1].id)).scrollIntoView();
}

function handleDelete(e) {
    e.preventDefault();
    var element = e.target;
    var id = element.id.substr(6);
    deleteMessage(id, function () {
        updateStats(document.querySelector('.js-users').textContent, document.querySelector('.js-messages').textContent - 1);
    });
}

function updateStats(numOfUsers, numOfMessages) {
    console.log('num of users is ' + numOfUsers);
    console.log('num of messages is ' + numOfMessages);
    document.querySelector('.js-users').textContent = numOfUsers;
    document.querySelector('.js-messages').textContent = numOfMessages;
}

function handleTextAreaInput(e) {
    e.preventDefault();
    if (e.keyCode == 13) {
        sendMessage(e);
    } else {
        Babble.currentMessage = document.querySelector('.NewMessageArea textarea').value;
        localStorage.setItem('babble', JSON.stringify(Babble));
    }
}

function updateMessage() {
    var textArea = document.querySelector('.NewMessageArea textarea');
    Babble.currentMessage = textArea.value;
}

function sendMessage(e) {
    e.preventDefault();
    var promise = postMessage(Babble.currentMessage, getMessages);
    promise.then(function (response) {
        document.querySelector('.NewMessageArea textarea').value = '';
        Babble.currentMessage = '';
        console.log("origin");
        // getMessages(JSON.parse(response).count, showMessages);
    });
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
        console.log(response);
        if ((response !== undefined) && (response != '')) {
            callback(JSON.parse(response).append);
            if (JSON.parse(response) !== undefined) {
                // console.log("origin");
                getMessages(JSON.parse(response).count, callback);
                // getStats(updateStats);
            }
        } else {
            // console.log("origin");
            getMessages(counter, callback);
        }
    });
}

function postMessage(message, callback) {
    var messageData = {
        name: Babble.userInfo.name,
        email: Babble.userInfo.email,
        message: message,
        times: new Date().getTime()
    };

    var options = {
        method: 'POST',
        action: 'messages',
        data: JSON.stringify(messageData)
    };

    return request(options);

}

function deleteMessage(id, callback) {

    var options = {
        method: 'DELETE',
        action: 'messages/' + id
    };

    var promise = request(options);
    promise.then(function (response) {

        if (response) {
            var list = document.querySelector('ol');
            var element = document.querySelector('li#' + id);
            list.removeChild(element);
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
        if ((response !== undefined) && (response != '')) {
            var object = JSON.parse(response);
            console.log(object);
            callback(object.users, object.messages);
            getStats(callback);
        } else {
            getStats(callback);
        }
    });
}

function request(options) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.action);
        if (options.method === 'post') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.setRequestHeader('X-Request-ID', Babble.userInfo.clientKey);
        // xhr.timeout = 30000;
        // xhr.ontimeout = function(){
        //     console.log('timeout occured');
        // };
        xhr.addEventListener('load', e => {
            console.log(options);
            console.log(e);
            console.log(xhr);
            console.log(xhr.status);
            resolve(e.target.responseText);
        });
        xhr.addEventListener('abort', e => {
            console.log(e);
        });
        xhr.addEventListener('error', e => {
            console.log(e);
            console.log(xhr);
            console.log(xhr.status);
            if (xhr.status === 0)
                request(options);
        });
        try {
            xhr.send(options.data);
        } catch (error) {
            console.log(error);
            console.log('error.name is ' + error.name);
            console.log('error message is ' + error.message);
        }

    });
}
