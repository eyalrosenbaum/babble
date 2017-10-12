'use strict';

const apiUrl = "http://localhost:9000/";
window.Babble = {

    /*Babble fields*/
    /*************************************************************************************** */
    /*************************************************************************************** */

    currentMessage: '',
    userInfo: {
        name: '',
        email: '',
        clientKey: '',
        counter: 0
    },

    /*Babble functions*/
    /*************************************************************************************** */
    /*************************************************************************************** */

    /*callback is updateStats*/
    getStats: function (callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('xhr.responseText is ' + xhr.responseText);
                if (xhr.responseText != '') {
                    callback(JSON.parse(xhr.responseText));
                }
                window.Babble.getStats(updateStats);
            }
        };
        xhr.open('GET', '' + apiUrl + 'stats');
        xhr.setRequestHeader('X-Request-ID', window.Babble.userInfo.clientKey);
        xhr.send();
    },

    /*callback is showMessages*/
    getMessages: function (counter, callback) {
        console.log(JSON.stringify(counter));
        console.log(counter);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('xhr.responseText is ' + xhr.responseText);
                if (xhr.responseText != '') {
                    callback(JSON.parse(xhr.responseText));
                    window.Babble.userInfo.counter = JSON.parse(xhr.responseText).count;
                    localStorage.setItem('babble', JSON.stringify(window.Babble));
                    console.log('counter is ' + window.Babble.userInfo.counter);
                    window.Babble.getMessages(window.Babble.userInfo.counter, callback);
                } else {
                    window.Babble.getMessages(counter, callback);
                }
            }
        };
        xhr.open('GET', '' + apiUrl + 'messages?counter=' + counter);
        xhr.setRequestHeader('X-Request-ID', window.Babble.userInfo.clientKey);
        xhr.send();
    },
    register: function (details) {
        window.Babble.userInfo.email = details.email;
        window.Babble.userInfo.name = details.name;
        localStorage.setItem('babble', JSON.stringify(Babble));
        window.Babble.getStats(updateStats);
        var options = {
            method: 'GET',
            action: apiUrl + 'register'
        };

        var promise = request(options);
        promise.then(function (response) {
            if (response) {
                console.log(response);
                window.Babble.userInfo.clientKey = response;
                window.Babble.registered = true;
                localStorage.setItem('babble', JSON.stringify(Babble));
                document.querySelector('.Mask').classList.add('is-hidden');
                document.querySelector('.Modal').classList.add('is-hidden');
                setTimeout(function () {
                    document.querySelector('.Mask').classList.add('is-in-background');
                    document.querySelector('.Modal').classList.add('is-in-background');
                    // removeMaskModalFromDom();
                    setTimeout(function () {
                        // console.log("origin");
                        window.Babble.getMessages(0, showMessages);

                    }, 200);
                }, 1400);
            }
        });
    },
    /*callback is getMessages*/
    postMessage: function (messageData, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('xhr.responseText is ' + xhr.responseText);
                callback(JSON.parse(xhr.responseText), showMessages);
                document.querySelector('.NewMessageArea textarea').value = '';
                window.Babble.currentMessage = '';
            }
        };
        xhr.open('POST', '' + apiUrl + 'messages');
        xhr.send(JSON.stringify(messageData));
    },
    /*callback is getMessages*/
    deleteMessage: function (id, callback) {
        console.log(id);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            console.log('xhr.responseText is ' + xhr.responseText);
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(xhr.responseText), showMessages);
                var ol = document.querySelector('ol.MainMessageArea-messageList');
                var li = document.querySelector('li#message' + id);
                console.log(ol);
                console.log(li);
                if (li) {
                    ol.removeChild(li);
                }
            }
        };
        xhr.open('DELETE', '' + apiUrl + 'messages/' + id);
        xhr.send();
    }
};


/*functions that run as page starts*/
/*************************************************************************************** */
/*************************************************************************************** */

/*case user has registered already*/
if (localStorage.getItem('babble')) {
    console.log('user has already registered');
    console.log('previous user: ' + localStorage.getItem('babble'));
    setTimeout(function () {
        window.Babble.userInfo = JSON.parse(localStorage.getItem('babble')).userInfo;
        window.Babble.currentMessage = JSON.parse(localStorage.getItem('babble')).currentMessage;
        console.log(window.Babble);
        window.Babble.getStats(updateStats);
        var options = {
            method: 'GET',
            action: apiUrl + 'login',
        };
        var promise = request(options);
        promise.then(window.Babble.getMessages(0, showMessages));
        document.querySelector('.NewMessageArea textarea').value = JSON.parse(localStorage.getItem('babble')).currentMessage;
    }, 300);
} else {
    console.log('user has not registered');
    localStorage.setItem('babble', JSON.stringify({
        currentMessage: '',
        userInfo: {
            name: '',
            email: '',
            clientKey: '',
            counter: 0
        }
    }));
    setTimeout(function () {
        document.querySelector('.Mask').classList.remove('is-hidden');
        document.querySelector('.Modal').classList.remove('is-hidden');
        document.querySelector('.Mask').classList.remove('is-in-background');
        document.querySelector('.Modal').classList.remove('is-in-background');
    }, 1000);
}

//cleaning everything on page unload
window.addEventListener('beforeunload', function (e) {
    console.log('unload event triggered');
    console.log(e);
    var credentials = {
        key: Babble.userInfo.clientKey
    };
    navigator.sendBeacon(apiUrl + 'logout', JSON.stringify(credentials));
    // var options = {
    //     method: 'POST',
    //     action: 'logout',
    //     data: JSON.stringify(credentials)
    // };

    // request(options);
}, false);

// window.addEventListener('unload',function(e){
//     window.localStorage.clear();
// });


// checking if first load or not, if so pop up modal and mask
// if (!JSON.parse(localStorage.getItem('babble')).registered) {
//     setTimeout(function () {
//         document.querySelector('.Mask').classList.remove('is-hidden');
//         document.querySelector('.Modal').classList.remove('is-hidden');
//     }, 1000);
// }
// } else {
//     removeMaskModalFromDom();
// }

//adding click event handlers to modal buttons
// if (document.querySelector('.Modal')) {
document.querySelector('.AnonymousSignInButton').addEventListener('click', anonymousSignIn);
document.querySelector('.IdentifiedSignInButton').addEventListener('click', identifiedSignIn);
// }

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
// function removeMaskModalFromDom() {
//     var mask = document.querySelector('.Mask');
//     var modal = document.querySelector('.Modal');
//     var body = document.querySelector('body');
//     // body.removeChild(mask);
//     // body.removeChild(modal);
//     mask.classList.add('is-hidden');
//     modal.classList.add('is-hidden');
// }
//sending data to server, after signing in either as anonymous or identified user, we remove modal and mask
// function signIn() {
//     console.log('signIn');
//     getStats(updateStats);
//     var promise = register();

//     // register(Babble.userInfo).then(function (response) {
//     // console.log('response from server is ' + response);

//     // });
// }

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
    window.Babble.register({ name: '', email: '' });
}

//function to handle user request to sign in with his name and email
function identifiedSignIn(e) {
    e.preventDefault();
    errorReset();
    var emailInput = document.querySelector('.Modal-emailInput>input').value;
    var nameInput = document.querySelector('.Modal-fullNameInput>input').value;
    if (emailInput !== '' && nameInput !== '') {
        window.Babble.register({ name: nameInput, email: emailInput });
    } else {
        //handling errors - blank inputs
        if (emailInput === '') {
            var emailErrorMessage = document.querySelector('.Modal-errorEmail');
            emailErrorMessage.classList.remove('no-show');
            emailErrorMessage.classList.add('show');
        }
        if (nameInput === '') {
            var nameErrorMessage = document.querySelector('.Modal-errorName');
            nameErrorMessage.classList.remove('no-show');
            nameErrorMessage.classList.add('show');
        }
    }
}

function createMessage(message) {
    var li = document.createElement('li');
    li.setAttribute('id', message.id);

    li.classList.add('Message');
    /*adding gravatar*/
    var img = document.createElement('img');
    if (message.name != '') {
        img.setAttribute('src', message.gravatar);
    } else {
        img.setAttribute('src', '../../images/anonymous.png');
    }
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
    var messageSenderText;
    if (message.name != '') {
        messageSenderText = document.createTextNode(message.name);
    } else {
        messageSenderText = document.createTextNode('Anonymous');
    };
    messageSender.appendChild(messageSenderText);
    messageTextHeader.appendChild(messageSender);
    /*adding time to header*/
    var messageTime = document.createElement('time');
    messageTime.classList.add('Message-time');
    var messageDate = new Date(message.times);
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
    if ((message.name === window.Babble.userInfo.name)/* && (messagesArr[i].header === window.Babble.userInfo.clientKey)*/) {
        var deleteButton = document.createElement('button');
        deleteButton.setAttribute('aria-label', 'delete');
        deleteButton.setAttribute('id', 'delete' + message.id);
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
    var messageTextBodyText = document.createTextNode(message.message);
    messageTextBody.appendChild(messageTextBodyText);
    messageBody.appendChild(messageTextBody);
    /*adding message body text to message body end*/
    li.appendChild(messageBody);
    /*adding message body end*/
    return li;

}

function showMessages(messagesObject) {
    console.log('messageObject = ' + messagesObject);
    console.log('messageObject = ' + JSON.stringify(messagesObject));
    console.log('showMessages');
    console.log(messagesObject.append);
    var messagesArr = messagesObject.append;
    if (messagesArr === undefined) {
        return;
    }
    console.log(messagesArr.length);
    var messagesList = document.querySelector('ol.MainMessageArea-messageList');
    for (var i = 0; i < messagesArr.length; i++) {
        if (!document.querySelector('li#' + messagesArr[i].id)) {
            messagesList.appendChild(createMessage(messagesArr[i]));

        }
    };
    document.querySelector('li#' + (messagesArr[messagesArr.length - 1].id)).scrollIntoView();
}

function handleDelete(e) {
    e.preventDefault();
    var element = e.target;
    console.log(element);
    var id = element.id.substr(13);
    console.log(id);
    window.Babble.deleteMessage(id, function () {
        /*updateStats(document.querySelector('.js-users').textContent, document.querySelector('.js-messages').textContent - 1);*/
    });
}

function updateStats(information) {
    console.log(information);
    console.log('num of users is ' + information.users);
    console.log('num of messages is ' + information.messages);
    document.querySelector('.js-users').textContent = information.users;
    document.querySelector('.js-messages').textContent = information.messages;
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
    window.Babble.currentMessage = textArea.value;
}

function sendMessage(e) {
    e.preventDefault();
    var messageData = {
        name: window.Babble.userInfo.name,
        email: window.Babble.userInfo.email,
        message: window.Babble.currentMessage,
        times: new Date().getTime()
    };

    // var promise = 
    window.Babble.postMessage(messageData, function () { });
    // promise.then(function (response) {
    //     document.querySelector('.NewMessageArea textarea').value = '';
    //     window.Babble.currentMessage = '';
    // });
}


function request(options) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.action);
        if (options.method === 'post') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.setRequestHeader('X-Request-ID', window.Babble.userInfo.clientKey);
        // xhr.timeout = 30000;
        // xhr.ontimeout = function(){
        //     console.log('timeout occured');
        // };
        xhr.addEventListener('load', e => {
            // console.log(options);
            // console.log(e);
            // console.log(xhr);
            console.log(xhr.status);
            console.log(e);
            resolve(e.target.responseText);
        });
        xhr.addEventListener('abort', e => {
            console.log(e);
        });
        xhr.addEventListener('error', e => {
            // console.log(e);
            // console.log(xhr);
            // console.log(xhr.status);
            if (xhr.status === 0)
                request(options);
        });
        try {
            xhr.send(options.data);
        } catch (error) {
            // console.log(error);
            // console.log('error.name is ' + error.name);
            // console.log('error message is ' + error.message);
        }

    });
}
