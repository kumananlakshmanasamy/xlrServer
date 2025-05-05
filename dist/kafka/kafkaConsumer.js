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
exports.disconnectConsumer = exports.subscribeAndRun = exports.connectConsumer = void 0;
// kafkaConsumer.ts
const kafka_1 = __importDefault(require("./kafka"));
const consumer = kafka_1.default.consumer({ groupId: 'driver-location-group' });
const connectConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield consumer.connect();
});
exports.connectConsumer = connectConsumer;
const subscribeAndRun = (topic, callback) => __awaiter(void 0, void 0, void 0, function* () {
    yield consumer.subscribe({ topic });
    yield consumer.run({
        eachMessage: ({ topic, partition, message }) => __awaiter(void 0, void 0, void 0, function* () {
            if (message.value) {
                const data = JSON.parse(message.value.toString());
                callback(data);
            }
        }),
    });
});
exports.subscribeAndRun = subscribeAndRun;
const disconnectConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield consumer.disconnect();
});
exports.disconnectConsumer = disconnectConsumer;
