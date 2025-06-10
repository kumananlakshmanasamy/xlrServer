import { Router, Request, Response } from "express";
import DriverRouter from "./driver";
import OTPRouter from "./OtpRouter";
import UserRouter from "./user";
import DriverDocsRouter from "./driver-documents";
import DriverOTPRouter from "./driverOtpRouter";
import ReceiverDetailsRouter from "./recieverRoute";
import authMiddleware from "../middlewares/authenticateToken";
import ImageRouter from "./image";
import AddressRouter from "./AddressRoutes";
import calculatePricesForAllVehicles from "./VehicleRouter";
import driverAuthRouter from "./driverAuthRouter";
import UsersRouter from "./userimage";
import SenderDetailsRouter from "./sender_details_route";
import DriversRouter from "./driverimage";
import vehicleBookingRouter from "./vehicleBookingRoute";
import XlrUserRouter from "./xlrUserRoute";
import XlrOtpRouter from "./xlrOtpRoute";
import routerAgent from "./Agent";
const routes = Router();

routes.use('/driver', DriverRouter)
routes.use('/otp', OTPRouter)
routes.use('/user', UserRouter)
routes.use('/driverdoc', DriverDocsRouter)
routes.use('/driverotp', DriverOTPRouter)
routes.use('/auth', driverAuthRouter)
routes.use('/reciever',authMiddleware,ReceiverDetailsRouter)
routes.use('/image',ImageRouter)
routes.use('/addresses', AddressRouter)
routes.use('/userimage',UsersRouter)
routes.use('/sender-details',SenderDetailsRouter)
routes.use('/vehicle-type',calculatePricesForAllVehicles)
routes.use('/driverimage',DriversRouter)
routes.use('/vehicle-booking',vehicleBookingRouter)
routes.use('/xlruser',XlrUserRouter )
routes.use('/xlrUserOtp',XlrOtpRouter)
routes.use('/agent',routerAgent)

export default routes;
