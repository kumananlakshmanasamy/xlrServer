// kafkaProducer.ts
import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'ride-booking-app',
  brokers: ['localhost:9092'],
  logLevel: logLevel.ERROR,
});

const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log('Kafka Producer connected');
};

export const sendMessage = async (topic: string, message: any) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

export default producer;
