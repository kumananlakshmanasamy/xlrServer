"use strict";
// import express, { Request, Response } from 'express';
// import Booking from '../db/models/booking';
// import User from '../db/models/users';
// const BookingRouter = express.Router();
// // Create a new booking
// BookingRouter.post('/', async (req: Request, res: Response) => {
//   try {
//     const { user_id, pickup_address, dropoff_address } = req.body;
//     // Check if user exists and is not deleted
//     const user = await User.findOne({ where: { id: user_id, is_deleted: false } });
//     if (!user) {
//       return res.status(404).send({ message: 'User not found or is deleted.' });
//     }
//     // Create booking
//     const createBookingObject = { user_id, pickup_address, dropoff_address };
//     const createBooking = await Booking.create(createBookingObject);
//     return res.status(200).send({ message: 'Booking created successfully', data: createBooking });
//   } catch (error: any) {
//     console.error('Error in creating booking:', error);
//     return res.status(500).send({ message: `Error in creating booking: ${error.message}` });
//   }
// });
// // Get all bookings
// BookingRouter.get('/', async (req: Request, res: Response) => {
//   try {
//     const bookings = await Booking.findAll();
//     // Check if associated users are not deleted
//     const validBookings = [];
//     for (const booking of bookings) {
//       const user = await User.findOne({ where: { id: booking.user_id, is_deleted: false } });
//       if (user) {
//         validBookings.push(booking);
//       }
//     }
//     return res.status(200).send(validBookings);
//   } catch (error: any) {
//     console.error('Error in fetching all bookings:', error);
//     return res.status(500).send({ message: `Error in fetching all bookings: ${error.message}` });
//   }
// });
// // Get all bookings for a specific user
// BookingRouter.get('/user/:user_id', async (req: Request, res: Response) => {
//   try {
//     const { user_id } = req.params;
//     // Check if user exists and is not deleted
//     const user = await User.findOne({ where: { id: user_id, is_deleted: false } });
//     if (!user) {
//       return res.status(404).send({ message: 'User not found or is deleted.' });
//     }
//     const bookings = await Booking.findAll({ where: { user_id } });
//     return res.status(200).send(bookings);
//   } catch (error: any) {
//     console.error('Error in fetching bookings:', error);
//     return res.status(500).send({ message: `Error in fetching bookings: ${error.message}` });
//   }
// });
// // // Update booking
// // BookingRouter.patch('/:id', async (req: Request, res: Response) => {
// //   try {
// //     const { id } = req.params;
// //     const { user_id, pickup_address, dropoff_address } = req.body;
// //     const booking = await Booking.findOne({ where: { booking_id: id } });
// //     if (!booking) {
// //       return res.status(404).send({ message: 'Booking not found.' });
// //     }
// //     // Check if associated user is not deleted
// //     const user = await User.findOne({ where: { id: booking.user_id, is_deleted: false } });
// //     if (!user) {
// //       return res.status(404).send({ message: 'Associated user not found or is deleted.' });
// //     }
// //     // Update booking
// //     const updateBookingObject = { user_id, pickup_address, dropoff_address };
// //     await Booking.update(updateBookingObject, { where: { booking_id: id } });
// //     return res.status(200).send({ message: 'Booking updated successfully' });
// //   } catch (error: any) {
// //     console.error('Error in updating booking:', error);
// //     return res.status 500).send({ message: `Error in updating booking: ${error.message}` });
// //   }
// // });
// // // Delete (soft delete) booking
// // BookingRouter.delete('/:id', async (req: Request, res: Response) => {
// //   try {
// //     const { id } = req.params;
// //     const booking = await Booking.findOne({ where: { booking_id: id } });
// //     if (!booking) {
// //       return res.status(404).send({ message: 'Booking not found.' });
// //     }
// //     // Check if associated user is not deleted
// //     const user = await User.findOne({ where: { id: booking.user_id, is_deleted: false } });
// //     if (!user) {
// //       return res.status(404).send({ message: 'Associated user not found or is deleted.' });
// //     }
// //     // Soft delete booking
// //     await Booking.destroy({ where: { booking_id: id } });
// //     return res.status(200).send({ message: 'Booking deleted successfully' });
// //   } catch (error: any) {
// //     console.error('Error in deleting booking:', error);
// //     return res.status(500).send({ message: `Error in deleting booking: ${error.message}` });
// //   }
// // });
// export default BookingRouter;
