
import { Client } from '@stomp/stompjs';
import { Chat } from "./chat.js";

let username = window.prompt("Username: ");

while (username === null || username.trim() === '') {
    username = window.prompt("Username: ");
}

const client = new Client({
    brokerURL: 'ws://localhost:8080/chat',
    onConnect: () => new Chat(client, username).start(),
});

client.activate();

