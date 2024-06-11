'use strict';

const usernamePage = document.querySelector('#username-page');
const usernameForm = document.querySelector('#username-form');
const chatPage = document.querySelector('#chat-page');
const loadingElement = document.querySelector('#loading');
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient;
let nickname;
let name;
let selectedUserId;

/** EVENT LISTENERS */
usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);
window.onbeforeunload = () => onLogout();

function onLogout() {
    stompClient.send('/app/user.disconnectUser', {},
        JSON.stringify({nickname, name, status: 'OFFLINE'}));
    window.location.reload();
}

function connect(event) {
    nickname = document.querySelector('#nickname').value.trim();
    name = document.querySelector('#name').value.trim();

    if (nickname && name) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

// fires on stomp client connect error
function onError() {
    window.location.reload();
}

// fires when stomp client is connected
function onConnected() {
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/topic/public`, onMessageReceived);

    // register the connected user
    stompClient.send('/app/user.addUser',
        {},
        JSON.stringify({nickname, name, status: 'ONLINE'}),
    );
    document.querySelector('#connected-user-fullname').textContent = name;
    findAndDisplayUsers().then();
}

async function onMessageReceived(payload) {
    await findAndDisplayUsers();
    const message = JSON.parse(payload.body);

    // display message and scroll if message is from selected user
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const numberMsg = notifiedUser.querySelector('.nbr-msg');
        numberMsg.classList.remove('hidden');
        numberMsg.textContent = '';
    }
}

async function findAndDisplayUsers() {
    const res = await fetch('/users');
    let connectedUsers = await res.json();

    connectedUsers = connectedUsers.filter(user => user.nickname !== nickname);

    const connectedUsersList = document.querySelector('#connected-users');
    connectedUsersList.innerHTML = '';

    connectedUsers.forEach((user, i) => {
        appendUserElement(user, connectedUsersList);
        if (i !== connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickname;

    const statusSpan = document.createElement('span');

    if (user.status === 'ONLINE') {
        statusSpan.classList.add('status', 'online');
        statusSpan.textContent = 'ONLINE';
    } else {
        statusSpan.classList.add('status', 'offline');
        statusSpan.textContent = 'OFFLINE';
    }

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.name;

    const newMsgIcon = document.createElement('span');
    newMsgIcon.textContent = '';
    newMsgIcon.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(statusSpan);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(newMsgIcon);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });

    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const numberMessages = clickedUser.querySelector('.nbr-msg');
    numberMessages.classList.add('hidden');
    numberMessages.textContent = '';
}

async function fetchAndDisplayUserChat() {
    const res = await fetch(`/messages/${nickname}/${selectedUserId}`);
    const messages = await res.json();

    chatArea.innerHTML = '';
    messages.forEach(message => {
        displayMessage(message.senderId, message.content);
    });

    chatArea.scrollTop = chatArea.scrollHeight;
}

function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');

    if (senderId === nickname) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }

    const message = document.createElement('p');
    message.textContent = content;

    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

function sendMessage(event) {
    const content = messageInput.value.trim();

    if (content && stompClient) {
        const chatMessage = {senderId: nickname, recipientId: selectedUserId, content};
        stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
        displayMessage(nickname, content);
    }

    chatArea.scrollTop = chatArea.scrollHeight;
    // clears input
    messageInput.value = '';
    event.preventDefault();
}