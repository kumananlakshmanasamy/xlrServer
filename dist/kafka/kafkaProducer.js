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
exports.sendMessage = exports.disconnectProducer = exports.connectProducer = void 0;
// kafkaProducer.ts
const kafka_1 = __importDefault(require("./kafka"));
const producer = kafka_1.default.producer();
const connectProducer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.connect();
});
exports.connectProducer = connectProducer;
const disconnectProducer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.disconnect();
});
exports.disconnectProducer = disconnectProducer;
const sendMessage = (topic, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        console.log(`Message sent to Kafka topic '${topic}':`, message);
    }
    catch (error) {
        console.error('Error sending message to Kafka:', error);
    }
});
exports.sendMessage = sendMessage;
