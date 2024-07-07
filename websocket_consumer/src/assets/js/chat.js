
const Message = class {
    constructor(from, content) {
        this.from = from;
        this.content = content;
    }
};

export class Chat {

    sessionId = null;
    container = document.querySelector('.chat__display');
    displayMessageContainer = document.querySelector('#message-template').content;

    constructor(client, username) {
        this.client = client;
        this.username = username;
    }

    initSendMessage() {
        const sendMessage = () => {
            const input = document.querySelector('.chat__submit-input');
            const value = input.value;
            if (value.trim() === '') return;
            this.client.publish({ destination: '/app/receive-message', body: JSON.stringify(new Message(this.username, value))})
            input.value = '';
        };
        document.querySelector('.chat__submit-button').addEventListener('click', sendMessage);
        window.addEventListener('keydown', e => {
            if (e.key.toLocaleLowerCase() === 'enter') {
                sendMessage();
            }
        });
    }

    initReceiveMessage() {
        this.client.subscribe('/topic/connected', ({ body }) => {
            let { sessionId, message } = JSON.parse(body);
            if (this.sessionId !== null) {
                return;
            }
            this.sessionId = sessionId;
            this.#addMessage(new Message(`Olá, ${this.username}`, message));
            this.client.subscribe(`/topic/receive-message/${sessionId}`, ({ body }) => {
                const { from, content } = JSON.parse(body);
                this.#addMessage(new Message(from, content));
            })
        });
    }

    #addMessage(message) {
        const displayMessage =  this.displayMessageContainer.querySelector('.chat__display-message').cloneNode(true);
        displayMessage.querySelector('.chat__display-message-content-name').innerText = message.from;
        displayMessage.querySelector('.chat__display-message-content-text').innerText = message.content;
        if (message.from === this.username) {
            displayMessage.classList.add('chat__display-message--right');
        }
        this.container.appendChild(displayMessage);
        this.container.scrollTo({
            behavior: "smooth",
            top: 999999
        });
    }

    start() {
        if (this.username === undefined) return;
        
        this.initSendMessage();
        this.initReceiveMessage();

        this.client.publish({ destination: '/app/connect', body: JSON.stringify({
            username: this.username,
        })});

        this.client.onDisconnect = () => {
            this.client.publish({ destination: '/app/disconnect' });
        }

        console.log(this.client)
 
    }
}

