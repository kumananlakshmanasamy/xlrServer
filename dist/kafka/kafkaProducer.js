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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.connectProducer = void 0;
// kafkaProducer.ts
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    clientId: 'ride-booking-app',
    brokers: ['localhost:9092'],
    logLevel: kafkajs_1.logLevel.ERROR,
});
const producer = kafka.producer();
const connectProducer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.connect();
    console.log('Kafka Producer connected');
});
exports.connectProducer = connectProducer;
const sendMessage = (topic, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
    });
});
exports.sendMessage = sendMessage;
exports.default = producer;
