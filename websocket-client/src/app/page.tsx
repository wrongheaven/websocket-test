'use client';

import { useEffect, useRef, useState } from 'react';
import { v7 as uuidv7 } from 'uuid';

type ClientData = {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    cx: number;
    cy: number;
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
                const clientData = {
                    id,
                    x: window.screenX,
                    y: window.screenY,
                    w: window.innerWidth,
                    h: window.innerHeight,
                    cx: window.screenX + window.innerWidth / 2,
                    cy: window.screenY + window.innerHeight / 2,
                };
                ws.current?.send(JSON.stringify(clientData));
            }, 100);
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

                    // TODO: Do not render circle if out of bounds
                    // this poop does not work
                    // if (
                    //     client.cx + 50 < 0 ||
                    //     client.cy + 50 < 0 ||
                    //     client.cx - 50 > window.screenX + window.innerWidth ||
                    //     client.cy - 50 > window.screenY + window.innerHeight
                    // ) {
                    //     return;
                    // }

                    return (
                        <Circle key={client.id} client={client} fill="red" />
                    );
                })}
                <Circle
                    client={clients.find((client) => client.id === id)}
                    fill="lime"
                />

                <Lines clients={clients} />
            </svg>
        </div>
    );
}

const Circle = ({ client, fill }: { client?: ClientData; fill: string }) => {
    if (!client) return;

    return (
        <circle
            cx={client.cx - window.screenX}
            cy={client.cy - window.screenY}
            r="50"
            fill={fill}
            stroke="black"
            strokeWidth="1"
        />
    );
};

const Lines = ({ clients }: { clients: ClientData[] }) => {
    if (clients.length < 2) return;

    return (
        <>
            {clients.map((c1) => {
                return clients.map((c2) => {
                    if (c1 === c2) return;

                    return (
                        <line
                            key={c1.id + c2.id}
                            x1={c1.cx - window.screenX}
                            y1={c1.cy - window.screenY}
                            x2={c2.cx - window.screenX}
                            y2={c2.cy - window.screenY}
                            stroke="black"
                            strokeWidth="2"
                        />
                    );
                });
            })}
        </>
    );
};
