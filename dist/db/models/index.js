"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideRequest = exports.Booking = exports.ServiceType = exports.Driver = exports.User = void 0;
const users_1 = __importDefault(require("./users"));
exports.User = users_1.default;
const driver_1 = __importDefault(require("./driver"));
exports.Driver = driver_1.default;
const servicetype_1 = __importDefault(require("./servicetype"));
exports.ServiceType = servicetype_1.default;
const booking_1 = __importDefault(require("./booking"));
exports.Booking = booking_1.default;
const riderequest_1 = __importDefault(require("./riderequest"));
exports.RideRequest = riderequest_1.default;
const recieverdetails_1 = __importDefault(require("./recieverdetails"));
// Set up associations
users_1.default.hasMany(riderequest_1.default, { foreignKey: 'user_id' });
driver_1.default.hasMany(riderequest_1.default, { foreignKey: 'driver_id' });
booking_1.default.hasMany(riderequest_1.default, { foreignKey: 'booking_id' });
recieverdetails_1.default.hasMany(riderequest_1.default, { foreignKey: 'receiver_id' });
riderequest_1.default.belongsTo(users_1.default, { foreignKey: 'user_id' });
riderequest_1.default.belongsTo(driver_1.default, { foreignKey: 'driver_id' });
riderequest_1.default.belongsTo(booking_1.default, { foreignKey: 'booking_id' });
riderequest_1.default.belongsTo(recieverdetails_1.default, { foreignKey: 'receiver_id' });
