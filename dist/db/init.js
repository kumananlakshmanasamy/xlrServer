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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const driver_1 = __importDefault(require("./models/driver"));
const driver_documents_1 = __importDefault(require("./models/driver-documents"));
const driverlocation_1 = __importDefault(require("./models/driverlocation"));
const recieverdetails_1 = __importDefault(require("./models/recieverdetails"));
const users_1 = __importDefault(require("./models/users"));
const image_1 = __importDefault(require("./models/image"));
const Address_1 = __importDefault(require("./models/Address"));
const userTransaction_1 = __importDefault(require("./models/userTransaction"));
const Vehicles_1 = __importDefault(require("./models/Vehicles"));
const sender_details_1 = __importDefault(require("./models/sender_details"));
const vehicleBooking_1 = __importDefault(require("./models/vehicleBooking"));
const xlrUser_1 = __importDefault(require("./models/xlrUser"));
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const isDev = false;
        yield users_1.default.sync({ alter: isDev });
        yield driver_1.default.sync({ alter: isDev });
        yield driver_documents_1.default.sync({ alter: isDev });
        yield recieverdetails_1.default.sync({ alter: isDev });
        yield driverlocation_1.default.sync({ alter: isDev });
        yield image_1.default.sync({ alter: isDev });
        yield Address_1.default.sync({ alter: isDev });
        yield userTransaction_1.default.sync({ alter: isDev });
        yield Vehicles_1.default.sync({ alter: isDev });
        yield sender_details_1.default.sync({ alter: isDev });
        yield xlrUser_1.default.sync({ alter: isDev });
        yield vehicleBooking_1.default.sync({ alter: true });
    });
}
const dbInit = () => {
    init();
};
exports.default = dbInit;
