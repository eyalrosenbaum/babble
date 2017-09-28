'use strict';

var Babble = {
    currentMessage: '',
    userInfo: {
        name: '',
        email: ''
    }
};

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
//after signing in either as anonymous or identified user, we remove modal and mask
function signIn() {
    document.querySelector('.mask').classList.add('hidden');
    document.querySelector('.Modal').classList.add('hidden');
    setTimeout(function () {
        removeMaskModalFromDom();
    }, 1400);
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
    var name = document.querySelector('.full-name-input>input').value;
    if (email !== '' && name !== '') {
        Babble.userInfo.email = email;
        Babble.userInfo.name = name;
        localStorage.setItem('babble', JSON.stringify(Babble));
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

function register(userInfo) {

}

function getMessages(counter, callback) {

}

function postMessage(message, callback) {

}

function deleteMessage(id, callback) {

}

function getStats(callback) {

}
