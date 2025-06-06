"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const init_1 = __importDefault(require("./db/init"));
const routes_1 = __importDefault(require("./routes"));
const socket_1 = require("./socket/socket");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = (0, socket_1.initializeSocket)(server);
const port = 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    "origin": "*"
})); // Enable cors for all origins
// Database initialization
(0, init_1.default)();
// Initializing routes
app.use('/api/v1', routes_1.default);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.head('/', (req, res) => {
    res.sendStatus(200);
});
(0, socket_1.socketHandlers)(io);
server.listen(port, () => {
    console.log(`Express is listening at ${port}`);
});
