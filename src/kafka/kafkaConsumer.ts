// // kafkaConsumer.ts
// import { Kafka, logLevel } from 'kafkajs';
// import RideRequest from '../db/models';
// import { Server } from 'socket.io';

// const kafka = new Kafka({
//   clientId: 'ride-booking-app',
//   brokers: ['localhost:9092'],
//   logLevel: logLevel.ERROR,
// });

// const consumer = kafka.consumer({ groupId: 'ride-booking-group' });

// const pendingRides: { [key: string]: any } = {};

// export const connectConsumer = async (io: Server) => {
//   await consumer.connect();
//   console.log('Kafka Consumer connected');

//   await consumer.subscribe({ topic: 'ride-requests', fromBeginning: true });
//   await consumer.subscribe({ topic: 'ride-accepted', fromBeginning: true });
//   await consumer.subscribe({ topic: 'ride-completed', fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, message }) => {
//       const data = JSON.parse((message.value ?? '{}').toString());

//       switch (topic) {
//         case 'ride-requests':
//           if (data.status === 'pending') {
//             pendingRides[data.bookingId] = data;
//             io.emit('PENDING_RIDE_REQUEST', data);
//           }
//           break;
//         case 'ride-accepted':
//           io.emit('RIDE_ACCEPTED', data);
//           if (pendingRides[data.bookingId]) {
//             pendingRides[data.bookingId].status = 'accepted';
//             pendingRides[data.bookingId].driverId = data.driverId;
//             await RideRequest.upsert(pendingRides[data.bookingId]);
//           }
//           break;
//         case 'ride-completed':
//           io.emit('RIDE_COMPLETED', data);
//           if (pendingRides[data.bookingId]) {
//             pendingRides[data.bookingId].status = 'completed';
//             await RideRequest.upsert(pendingRides[data.bookingId]);
//             delete pendingRides[data.bookingId];
//           }
//           break;
//       }
//     },
//   });

//   setInterval(async () => {
//     for (const bookingId in pendingRides) {
//       await RideRequest.upsert(pendingRides[bookingId]);
//     }
//   }, 10000); // Sync pending rides every 10 seconds
// };
