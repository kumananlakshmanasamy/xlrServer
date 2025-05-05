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
exports.completeRide = exports.rejectRide = exports.acceptRide = exports.updateDriverStatus = exports.updateRideRequest = void 0;
const riderequest_1 = __importDefault(require("../db/models/riderequest"));
const driver_1 = __importDefault(require("../db/models/driver"));
// Update ride request
function updateRideRequest(rideRequestId, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rideRequest = yield riderequest_1.default.findByPk(rideRequestId);
            if (!rideRequest)
                throw new Error('Ride request not found');
            yield rideRequest.update(updates);
            return rideRequest;
        }
        catch (error) {
            console.error('Error updating ride request:', error);
            throw error;
        }
    });
}
exports.updateRideRequest = updateRideRequest;
// Update driver status
function updateDriverStatus(driver_id, status) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const driver = yield driver_1.default.findByPk(driver_id);
            if (!driver)
                throw new Error('Driver not found');
            yield driver.update({ status });
            return driver;
        }
        catch (error) {
            console.error('Error updating driver status:', error);
            throw error;
        }
    });
}
exports.updateDriverStatus = updateDriverStatus;
// Handle ride acceptance
function acceptRide(request_id, driver_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rideRequest = yield updateRideRequest(request_id, { status: 'accepted', driver_id: driver_id });
            const driver = yield updateDriverStatus(driver_id, 'on ride');
            return { rideRequest, driver };
        }
        catch (error) {
            console.error('Error accepting ride:', error);
            throw error;
        }
    });
}
exports.acceptRide = acceptRide;
// Handle ride rejection
function rejectRide(rideRequestId, driverId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rideRequest = yield updateRideRequest(rideRequestId, { status: 'rejected', driver_id: driverId });
            const driver = yield updateDriverStatus(driverId, 'available');
            return { rideRequest, driver };
        }
        catch (error) {
            console.error('Error rejecting ride:', error);
            throw error;
        }
    });
}
exports.rejectRide = rejectRide;
// Handle ride completion
function completeRide(rideRequestId, driverId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rideRequest = yield updateRideRequest(rideRequestId, { status: 'completed' });
            const driver = yield updateDriverStatus(driverId, 'available');
            return { rideRequest, driver };
        }
        catch (error) {
            console.error('Error completing ride:', error);
            throw error;
        }
    });
}
exports.completeRide = completeRide;
