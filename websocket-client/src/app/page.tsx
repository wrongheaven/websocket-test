'use client';

import { useEffect, useRef, useState } from 'react';
import { v7 as uuidv7 } from 'uuid';

type ClientData = {
    id: string;
    x: number;
    y: number;
};

const id = uuidv7();

export default function Home() {
    const [clients, setClients] = useState<ClientData[]>([]);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080');

        ws.current.onopen = () => {
            console.log('Connected to WebSocket server');

            setInterval(() => {
                const centerX = window.screenX + window.innerWidth / 2;
                const centerY = window.screenY + window.innerHeight / 2;
                ws.current?.send(
                    JSON.stringify({ id, x: centerX, y: centerY }),
                );
            }, 10);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data) as ClientData[];
            setClients(data);
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    return (
        <div className="antialiased">
            <svg width="100%" height="100vh">
                {clients.map((client) => {
                    if (client.id === id) return;
                    return <Circle client={client} fill="red" />;
                })}
                <Circle
                    client={clients.find((client) => client.id === id)}
                    fill="lime"
                />
            </svg>
        </div>
    );
}

const Circle = ({ client, fill }: { client?: ClientData; fill: string }) => {
    if (!client) return;

    return (
        <circle
            cx={client.x - window.screenX}
            cy={client.y - window.screenY}
            r="50"
            fill={fill}
            stroke="black"
            strokeWidth="1"
        />
    );
};
