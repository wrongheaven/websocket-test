'use client';

import { useEffect, useRef, useState } from 'react';

type ClientData = {
    id: string;
    x: number;
    y: number;
};

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
                ws.current?.send(JSON.stringify({ x: centerX, y: centerY }));
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
        <div>
            <svg width="100%" height="100vh">
                {clients.map((client) => {
                    console.log(client);
                    return (
                        <circle
                            key={client.id}
                            cx={client.x - window.screenX}
                            cy={client.y - window.screenY}
                            r="50"
                            fill="red"
                        />
                    );
                })}
            </svg>
        </div>
    );
}
