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
exports.socketHandlers = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const redis_1 = __importDefault(require("../redis/redis"));
const vehicleBooking_1 = __importDefault(require("../db/models/vehicleBooking"));
// Store active drivers
const activeDrivers = {};
// Store active user bookings (optional if you want to map user booking to user socketId)
const activeUserBookings = {}; // Maps bookingId to user socketId
// Haversine formula to calculate distance between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};
// Function to initialize the socket server (for both users and drivers)
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST"],
        },
    });
    return io;
};
exports.initializeSocket = initializeSocket;
// Function to handle socket events for users and drivers
const socketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // Store the mapping of booking ID to socket ID for users
        socket.on('associateSocketWithBooking', (data) => {
            const { bookingId, socketId } = data;
            activeUserBookings[bookingId] = socketId;
            console.log(`Associated booking ${bookingId} with socket ID ${socketId}`);
        });
        // Function to associate the driver with their socket ID
        socket.on('associateSocketWithDriver', (data) => {
            const { driver_id, socketId } = data;
            // Check if the driver exists in activeDrivers
            if (!activeDrivers[driver_id]) {
                console.error(`Driver ${driver_id} is not registered in activeDrivers.`);
                return; // Exit early if the driver does not exist
            }
            // If the driver exists, set the socketId
            activeDrivers[driver_id].socketId = socketId;
            console.log(`Associated driver ${driver_id} with socket ID ${socketId}`);
        });
        /* -------------------- USER SOCKET HANDLERS -------------------- */
        socket.on('REQUEST_BOOKING', (bookingData) => __awaiter(void 0, void 0, void 0, function* () {
            const { bookingId, userId, driver_id, pickupAddress, dropoffAddress, totalPrice, vehicleName, sender_name, sender_phone, receiver_name, receiver_phone, otp, } = bookingData;
            console.log(`Booking request received from user ${userId} for driver ${driver_id}`);
            const driver = activeDrivers[driver_id];
            if (driver) {
                try {
                    yield redis_1.default.set(`booking:${bookingId}`, JSON.stringify(bookingData), 'EX', 200); // Store booking in Redis
                    console.log(`Stored booking data in Redis for bookingId: ${bookingId}`);
                }
                catch (err) {
                    console.error(`Failed to store booking in Redis: ${err.message}`);
                    socket.emit('bookingError', 'Internal server error while processing booking.');
                    return;
                }
                // Emit ride request to the initially assigned driver
                io.to(driver.socketId).emit('BOOKING_REQUEST', {
                    bookingId,
                    userId,
                    driver_id, // Include the driver_id
                    pickupAddress,
                    dropoffAddress,
                    totalPrice,
                    vehicleName,
                    sender_name,
                    sender_phone,
                    receiver_name,
                    receiver_phone,
                    otp,
                });
                console.log(`Ride request emitted to driver ${driver.driver_id}`);
                // Store the user socketId and bookingId mapping
                activeUserBookings[bookingId] = socket.id;
            }
            else {
                console.log(`Driver ${driver_id} not found or not connected.`);
                const availableDrivers = Object.values(activeDrivers).filter((d) => d.vehicle_type === bookingData.vehicleName);
                if (availableDrivers.length > 0) {
                    const newDriver = availableDrivers[0]; // Optionally implement more complex selection logic here
                    console.log(`Assigning booking to another driver ${newDriver.driver_id}`);
                    // Emit ride request to the newly assigned driver, including the new driver's ID
                    io.to(newDriver.socketId).emit('BOOKING_REQUEST', {
                        bookingId,
                        userId,
                        driver_id: newDriver.driver_id, // Use the new driver's ID
                        pickupAddress,
                        dropoffAddress,
                        totalPrice,
                        vehicleName,
                        sender_name,
                        sender_phone,
                        receiver_name,
                        receiver_phone,
                        otp,
                    });
                }
                else {
                    socket.emit('bookingError', 'No drivers available with the matching vehicle type.');
                }
            }
        }));
        /* -------------------- DRIVER SOCKET HANDLERS -------------------- */
        socket.on('DRIVER_RESPONSE', (response) => __awaiter(void 0, void 0, void 0, function* () {
            const { driver_id, bookingId, status } = response;
            const userSocketId = activeUserBookings[bookingId]; // Get the user's socket ID
            if (userSocketId) {
                if (status === 'accepted') {
                    console.log("Status sent to ", userSocketId);
                    try {
                        // Fetch driver details from Redis
                        const driverData = yield redis_1.default.get(`driver:${driver_id}`);
                        if (!driverData) {
                            console.error(`Driver data for driver_id: ${driver_id} not found in Redis`);
                            return;
                        }
                        const { vehicle_type, vehicle_number, driver_name, phone } = JSON.parse(driverData);
                        // Emit ride status with driver details to the user
                        io.to(userSocketId).emit('rideRequestStatus', {
                            bookingId,
                            driver_id,
                            vehicle_type,
                            vehicle_number,
                            status: 'accepted',
                            driver_name, // Driver's name fetched from Redis
                            phone // Driver's phone number fetched from Redis
                        });
                        console.log("Emitted to user", {
                            bookingId,
                            driver_id,
                            vehicle_type,
                            vehicle_number,
                            status: 'accepted',
                            driver_name,
                            phone
                        });
                        // Fetch the booking data and update status in Redis
                        const bookingData = yield redis_1.default.get(`booking:${bookingId}`);
                        if (bookingData) {
                            const updatedBooking = Object.assign(Object.assign({}, JSON.parse(bookingData)), { status: 'accepted', driver_id,
                                driver_name,
                                phone });
                            // Save the updated booking data back to Redis
                            yield redis_1.default.set(`booking:${bookingId}`, JSON.stringify(updatedBooking), 'EX', 200);
                            console.log(`Updated Redis booking for bookingId: ${bookingId}`);
                        }
                        // Update the booking status in the database to "In progress"
                        const bookingRecord = yield vehicleBooking_1.default.findOne({ where: { id: bookingId } });
                        if (bookingRecord) {
                            bookingRecord.status = 'In progress'; // Update status to "In progress"
                            yield bookingRecord.save(); // Save the changes
                            console.log(`Updated booking status to 'In progress' for bookingId: ${bookingId}`);
                        }
                        else {
                            console.error(`No booking found with bookingId: ${bookingId}`);
                        }
                    }
                    catch (err) {
                        console.error(`Failed to fetch driver or update booking in Redis: ${err.message}`);
                    }
                    console.log(`Driver ${driver_id} accepted ride ${bookingId}`);
                }
                else {
                    io.to(userSocketId).emit('rideRequestStatus', {
                        bookingId,
                        status: 'rejected'
                    });
                    console.log(`Driver ${driver_id} rejected ride ${bookingId}`);
                }
            }
            else {
                console.log(`User for booking ${bookingId} not found`);
            }
        }));
        // When driver starts the ride
        socket.on('ride_started', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { driver_id, bookingId } = data;
            try {
                // Fetch user socket ID from active bookings
                const userSocketId = activeUserBookings[bookingId];
                if (userSocketId) {
                    console.log(`Notifying user with socket ID ${userSocketId} that the ride has started.`);
                    // Fetch driver details from Redis or your database
                    const driverData = yield redis_1.default.get(`driver:${driver_id}`);
                    if (!driverData) {
                        console.error(`Driver data for driver_id: ${driver_id} not found in Redis`);
                        return;
                    }
                    const { driver_name, vehicle_type, vehicle_number, phone } = JSON.parse(driverData);
                    // Emit ride start event to the user
                    io.to(userSocketId).emit('rideStatusUpdate', {
                        bookingId,
                        driver_id,
                        status: 'ride_started',
                        driver_name,
                        vehicle_type,
                        vehicle_number,
                        phone,
                    });
                    console.log(`Emitted ride start to user: ${userSocketId}, for booking: ${bookingId}`);
                }
                else {
                    console.log(`User for booking ${bookingId} not found.`);
                }
            }
            catch (err) {
                console.error('Error starting the ride:', err);
            }
        }));
        /* -------------------- USER SOCKET HANDLERS -------------------- */
        // Handle user trip cancellation
        socket.on('cancelTrip', (cancelData) => __awaiter(void 0, void 0, void 0, function* () {
            const { bookingId, userId } = cancelData;
            console.log(`Cancellation request received from user ${userId} for booking ${bookingId}`);
            // Fetch the booking data from Redis to get the associated driver_id
            let driverId = null;
            try {
                const bookingData = yield redis_1.default.get(`booking:${bookingId}`);
                if (bookingData) {
                    const { driver_id } = JSON.parse(bookingData);
                    driverId = driver_id;
                    console.log(`Retrieved driver_id: ${driverId} for booking ${bookingId}`);
                }
                else {
                    console.log(`No booking data found for bookingId: ${bookingId}`);
                }
            }
            catch (err) {
                console.error(`Error retrieving booking data for ${bookingId}: ${err.message}`);
            }
            if (driverId) {
                // Notify the connected driver about the trip cancellation
                const driver = activeDrivers[driverId];
                if (driver && driver.socketId) {
                    console.log("driver socket id for cancel: " + driver.socketId);
                    io.to(driver.socketId).emit('TRIP_CANCELLED_BY_USER', {
                        bookingId,
                        message: `User has cancelled the trip for booking ID: ${bookingId}.`
                    });
                    console.log(`Notified driver ${driver.driver_id} of trip cancellation for booking ID: ${bookingId}`);
                }
                else {
                    console.log(`Driver ${driverId} not connected or not found in active drivers.`);
                }
            }
            else {
                console.log(`No driver found or assigned to booking ${bookingId}.`);
            }
            // Update the status in the vehicleBooking table to "cancelled"
            try {
                const bookingCancel = yield vehicleBooking_1.default.findOne({ where: { id: bookingId } });
                if (bookingCancel) {
                    bookingCancel.status = 'cancelled'; // Update status to "cancelled"
                    yield bookingCancel.save(); // Save the changes
                    console.log(`Updated booking status to 'cancelled' for booking ID: ${bookingId}`);
                }
                else {
                    console.error(`No booking found with bookingId: ${bookingId}`);
                }
            }
            catch (err) {
                console.error(`Error updating booking status for ${bookingId}: ${err.message}`);
            }
            // Optional: Remove the booking from activeUserBookings if needed
            delete activeUserBookings[bookingId];
            // Optional: Remove the booking from Redis
            try {
                yield redis_1.default.del(`booking:${bookingId}`);
                console.log(`Removed booking ${bookingId} from Redis.`);
            }
            catch (err) {
                console.error(`Error removing booking ${bookingId} from Redis: ${err.message}`);
            }
            // Notify the user that the cancellation request was processed
            socket.emit('CANCEL_CONFIRMATION', { bookingId, status: 'cancelled' });
        }));
        /* -------------------- DRIVER SOCKET HANDLERS -------------------- */
        // Driver registers on connection
        socket.on('REGISTER_DRIVER', (driverData) => __awaiter(void 0, void 0, void 0, function* () {
            const { vehicle_type, latitude, longitude, driver_name, phone, vehicle_number, driver_id } = driverData;
            // console.log("Registered driver", vehicle_type, latitude, longitude, driver_name, phone, vehicle_number, driver_id);
            // Check if driver already exists, if yes update the socketId
            if (activeDrivers[driver_id]) {
                activeDrivers[driver_id].socketId = socket.id; // Update existing socket ID
            }
            else {
                // Create new driver entry if it does not exist
                activeDrivers[driver_id] = {
                    vehicle_type,
                    vehicle_number,
                    latitude,
                    longitude,
                    driver_name,
                    phone,
                    driver_id,
                    socketId: socket.id, // Store driver's socket ID
                };
            }
            // Store driver in Redis
            const driverKey = `driver:${driver_id}`;
            try {
                yield redis_1.default.set(driverKey, JSON.stringify(activeDrivers[driver_id]), 'EX', 200);
                // console.log(`Driver data stored in Redis successfully: ${driver_id}`);
            }
            catch (error) {
                console.error(`Error storing driver data in Redis: ${error}`);
            }
            // console.log(`Driver registered successfully: ${driver_id}`);
        }));
        /* -------------------- DRIVER LOCATION UPDATES -------------------- */
        socket.on("driverLocation", (data) => {
            const existingDriver = activeDrivers[data.driver_id];
            // Update driver's location if they already exist
            if (existingDriver) {
                existingDriver.latitude = data.latitude;
                existingDriver.longitude = data.longitude;
            }
            else {
                // Add new driver if they don't exist
                activeDrivers[data.driver_id] = {
                    driver_id: data.driver_id,
                    vehicle_type: data.vehicleType,
                    vehicle_number: data.vehicleNumber,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    driver_name: data.drivername,
                    phone: data.phone,
                    socketId: socket.id,
                };
            }
            // Broadcast updated driver locations to all clients (optional)
            io.emit("driverLocationsUpdated", activeDrivers);
        });
        /* -------------------- USER REQUESTS NEARBY DRIVERS -------------------- */
        socket.on("requestNearbyDrivers", (data) => {
            const userLatitude = data.latitude;
            const userLongitude = data.longitude;
            // Filter drivers based on the user's location and the specified radius
            const nearbyDrivers = Object.values(activeDrivers).filter((driver) => {
                const distance = haversineDistance(userLatitude, userLongitude, driver.latitude, driver.longitude);
                return distance <= (data.radius || 5); // Default radius to 5 km if not specified
            });
            // Send the nearby drivers back to the user who requested it
            socket.emit("nearbyDrivers", nearbyDrivers);
            console.log("Nearby drivers", nearbyDrivers);
        });
        /* -------------------- DISCONNECTION HANDLER -------------------- */
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Remove driver from active list on disconnect
            for (const driver_id in activeDrivers) {
                if (activeDrivers[driver_id].socketId === socket.id) {
                    console.log(`Driver ${driver_id} disconnected`);
                    delete activeDrivers[driver_id];
                    break;
                }
            }
            // Optionally remove the user booking when they disconnect (if needed)
            for (const bookingId in activeUserBookings) {
                if (activeUserBookings[bookingId] === socket.id) {
                    delete activeUserBookings[bookingId];
                    break;
                }
            }
        });
    });
};
exports.socketHandlers = socketHandlers;
function emitBookingRequest(newDriver, bookingData, arg2) {
    throw new Error('Function not implemented.');
}
