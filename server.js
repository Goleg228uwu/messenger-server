const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const users = new Map();

console.log("Сервер работает! Ждём игроков...");

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        
        if (data.type === 'join') {
            users.set(ws, { id: data.id, name: data.name });
            console.log(data.name + " зашёл");
            broadcast({ type: 'list', users: Array.from(users.values()) });
        }
        
        if (data.type === 'chat') {
            const sender = users.get(ws);
            broadcast({ type: 'chat', name: sender.name, text: data.text });
        }
    });
    
    ws.on('close', () => {
        users.delete(ws);
        broadcast({ type: 'list', users: Array.from(users.values()) });
    });
});

function broadcast(data) {
    const msg = JSON.stringify(data);
    users.forEach((_, ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    });
}