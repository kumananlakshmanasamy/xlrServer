"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// kafkaConfig.ts
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app-client-id',
    brokers: ['localhost:9092'],
    logLevel: kafkajs_1.logLevel.INFO, // Adjust log level as needed (DEBUG, INFO, WARN, ERROR)
});
exports.default = kafka;
