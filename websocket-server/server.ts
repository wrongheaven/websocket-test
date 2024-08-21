import { v7 as uuidv7 } from 'uuid';
import { WebSocket } from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

type ClientData = {
    id: string;
    x: number;
    y: number;
};

const clients: { [key: string]: ClientData } = {};

wss.on('connection', (ws) => {
    const id = uuidv7();
    clients[id] = { id, x: 0, y: 0 };
    console.log('Client connected:', id);

    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        clients[id] = { ...clients[id], ...data };

        const broadcastData = JSON.stringify(Object.values(clients));
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        delete clients[id];
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
