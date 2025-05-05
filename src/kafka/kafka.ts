// kafkaConfig.ts
import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app-client-id', // Replace with your client ID
  brokers: ['localhost:9092'], // Replace with your Kafka broker addresses
  logLevel: logLevel.INFO, // Adjust log level as needed (DEBUG, INFO, WARN, ERROR)
});

export default kafka;