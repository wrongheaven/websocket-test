import { WebSocket } from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

type ClientData = {
    id: string;
    x: number;
    y: number;
};

const clients: { [key: string]: ClientData } = {};

wss.on('connection', (ws) => {
    let id = '';
    let isMsgSent = false;

    ws.on('message', (message) => {
        const data = JSON.parse(message.toString()) as ClientData;
        id = data.id;
        clients[id] = data;

        if (!isMsgSent) {
            console.log('Client connected:', id);
            isMsgSent = true;
        }

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
