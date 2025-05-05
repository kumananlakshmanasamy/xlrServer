"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketInstance = exports.socketHandlers = exports.initializeSocket = void 0;
const kafkajs_1 = require("kafkajs");
const models_1 = require("../db/models");
const socket_io_1 = require("socket.io");
const redis_1 = __importDefault(require("../redis/redis"));
const redis_adapter_1 = require("@socket.io/redis-adapter");
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
        },
    });
    const pubClient = redis_1.default.duplicate();
    const subClient = redis_1.default.duplicate();
    io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    // Run Kafka only after the io instance is initialized
    runKafka(io).catch(console.error);
    return io;
};
exports.initializeSocket = initializeSocket;
const drivers = {};
const users = {}; // Store user sockets
const pendingRides = {}; // Cache for pending rides
// Initialize Kafka
const kafka = new kafkajs_1.Kafka({
    clientId: 'ride-booking-app',
    brokers: ['localhost:9092'],
    logLevel: kafkajs_1.logLevel.ERROR, // Set log level to ERROR
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'ride-booking-group' });
function runKafka(io) {
    return __awaiter(this, void 0, void 0, function* () {
        yield producer.connect();
        yield consumer.connect();
        console.log("Kafka connected");
        yield consumer.subscribe({ topic: 'ride-requests', fromBeginning: true });
        yield consumer.subscribe({ topic: 'ride-accepted', fromBeginning: true });
        yield consumer.subscribe({ topic: 'ride-completed', fromBeginning: true });
        yield consumer.subscribe({ topic: 'driver-location', fromBeginning: true });
        yield consumer.run({
            eachMessage: ({ topic, message }) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const data = JSON.parse(((_a = message.value) !== null && _a !== void 0 ? _a : '{}').toString());
                switch (topic) {
                    case 'ride-requests':
                        if (data.status === 'pending') {
                            // Store pending ride in cache
                            pendingRides[data.bookingId] = data;
                            Object.values(drivers).forEach((socket) => {
                                // Emit the filled ride request data to the driver
                                socket.emit('PENDING_RIDE_REQUEST', data);
                            });
                        }
                        break;
                    case 'ride-accepted':
                        io.emit('RIDE_ACCEPTED', data);
                        if (users[data.userId]) {
                            users[data.userId].emit('RIDE_ACCEPTED', {
                                request_id: data.bookingId,
                                user_id: data.driverId,
                                driver_id: data.userId,
                                service_type_id: data.serviceType,
                                receiver_id: data.receiverId,
                                booking_id: data.bookingId,
                                status: data.status,
                                rideDetails: pendingRides[data.bookingId],
                            });
                        }
                        // Update the ride in the cache and database
                        if (pendingRides[data.bookingId]) {
                            pendingRides[data.bookingId].status = 'accepted';
                            pendingRides[data.bookingId].driverId = data.driverId;
                            yield models_1.RideRequest.upsert(pendingRides[data.bookingId]);
                        }
                        break;
                    case 'ride-completed':
                        io.emit('RIDE_COMPLETED', data);
                        // Emit to the user who made the request
                        if (users[data.userId]) {
                            users[data.userId].emit('RIDE_COMPLETED', data);
                        }
                        // Update the ride in the cache and database
                        if (pendingRides[data.bookingId]) {
                            pendingRides[data.bookingId].status = 'completed';
                            pendingRides[data.bookingId].driverId = data.driverId;
                            yield models_1.RideRequest.upsert(pendingRides[data.bookingId]);
                            delete pendingRides[data.bookingId];
                        }
                        break;
                }
            }),
        });
        // Periodically sync data to the database every 10 seconds
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            for (const bookingId in pendingRides) {
                const ride = pendingRides[bookingId];
                yield models_1.RideRequest.upsert(ride);
            }
        }), 10000); // Sync every 10 seconds
    });
}
// Socket event handlers
const socketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('A client connected:', socket.id);
        socket.on('REGISTER_DRIVER', (data) => {
            drivers[data.driverId] = socket;
            // Emit all pending rides to the connected driver
            Object.values(pendingRides).forEach((ride) => {
                if (ride.status === 'pending') {
                    socket.emit('PENDING_RIDE_REQUEST', ride);
                }
            });
        });
        socket.on('REQUEST_RIDE', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const rideRequest = {
                rideBookingId: 'ride_' + Math.random().toString(36).substr(2, 9),
                userId: data.userId,
                driverId: null,
                startLocation: data.startLocation,
                endLocation: data.endLocation,
                fare: data.fare,
                status: 'pending',
                distance: data.distance,
                duration: data.duration,
                time: new Date().toISOString(),
                bookingFee: data.bookingFee,
                rideCharge: data.rideCharge,
            };
            yield producer.send({
                topic: 'ride-requests',
                messages: [
                    {
                        value: JSON.stringify(rideRequest),
                    },
                ],
            });
            // Store in pending rides cache
            pendingRides[rideRequest.rideBookingId] = rideRequest;
            // Store user socket
            users[data.userId] = socket;
            socket.emit('RIDE_REQUEST_SENT', { rideBookingId: rideRequest.rideBookingId });
        }));
        socket.on('ACCEPT_RIDE', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const rideAcceptance = {
                bookingId: data.bookingId,
                driverId: data.driverId,
                userId: data.userId,
                status: 'accepted',
            };
            yield producer.send({
                topic: 'ride-accepted',
                messages: [
                    {
                        value: JSON.stringify(rideAcceptance),
                    },
                ],
            });
            // Update the ride in the cache and database
            if (pendingRides[data.bookingId]) {
                pendingRides[data.bookingId].status = 'accepted';
                pendingRides[data.bookingId].driverId = data.driverId;
                yield models_1.RideRequest.upsert(pendingRides[data.bookingId]);
            }
        }));
        socket.on('COMPLETE_RIDE', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const rideCompletion = {
                bookingId: data.bookingId,
                driverId: data.driverId,
                userId: data.userId,
                status: 'completed',
            };
            yield producer.send({
                topic: 'ride-completed',
                messages: [
                    {
                        value: JSON.stringify(rideCompletion),
                    },
                ],
            });
            // Update the ride in the cache and database
            if (pendingRides[data.bookingId]) {
                pendingRides[data.bookingId].status = 'completed';
                yield models_1.RideRequest.upsert(pendingRides[data.bookingId]);
                delete pendingRides[data.bookingId];
            }
        }));
        socket.on('REGISTER_USER', (data) => {
            users[data.userId] = socket;
        });
        socket.on('disconnect', () => {
            for (const driverId in drivers) {
                if (drivers[driverId] === socket) {
                    delete drivers[driverId];
                    break;
                }
            }
            for (const userId in users) {
                if (users[userId] === socket) {
                    delete users[userId];
                    break;
                }
            }
            console.log('A client disconnected:', socket.id);
        });
    });
};
exports.socketHandlers = socketHandlers;
const getSocketInstance = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
};
exports.getSocketInstance = getSocketInstance;
