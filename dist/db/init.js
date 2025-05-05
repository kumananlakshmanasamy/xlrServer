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
const isDev = true;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const models_1 = require("./models");
const admin_1 = __importDefault(require("./models/admin"));
const driver_1 = __importDefault(require("./models/driver"));
const driver_documents_1 = __importDefault(require("./models/driver-documents"));
const driverlocation_1 = __importDefault(require("./models/driverlocation"));
const recieverdetails_1 = __importDefault(require("./models/recieverdetails"));
const riderequest_1 = __importDefault(require("./models/riderequest"));
const servicetype_1 = __importDefault(require("./models/servicetype"));
const users_1 = __importDefault(require("./models/users"));
const driverearnings_1 = __importDefault(require("./models/driverearnings"));
const restaurant_1 = __importDefault(require("./models/restaurant"));
const product_1 = __importDefault(require("./models/product"));
const SubCategory_1 = __importDefault(require("./models/SubCategory"));
const SuperCategory_1 = __importDefault(require("./models/SuperCategory"));
const Category_1 = __importDefault(require("./models/Category"));
const brand_1 = __importDefault(require("./models/brand"));
const image_1 = __importDefault(require("./models/image"));
const inventory_1 = __importDefault(require("./models/inventory"));
const Address_1 = __importDefault(require("./models/Address"));
const userTransaction_1 = __importDefault(require("./models/userTransaction"));
const add_to_cart_1 = __importDefault(require("./models/add_to_cart"));
const drivertransaction_1 = __importDefault(require("./models/drivertransaction"));
const vehicle_1 = __importDefault(require("./models/vehicle"));
const order_1 = __importDefault(require("./models/order"));
const payment_1 = __importDefault(require("./models/payment"));
const order_items_1 = __importDefault(require("./models/order_items"));
const CartItemRestaurants_1 = __importDefault(require("./models/CartItemRestaurants"));
// import dish from './models/dish';
// import Payment from './models/payment';
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const isDev = false;
        // Set up associations
        users_1.default.hasMany(riderequest_1.default, { foreignKey: 'user_id' });
        driver_1.default.hasMany(riderequest_1.default, { foreignKey: 'driver_id' });
        models_1.Booking.hasMany(riderequest_1.default, { foreignKey: 'booking_id' });
        recieverdetails_1.default.hasMany(riderequest_1.default, { foreignKey: 'receiver_id' });
        recieverdetails_1.default.hasMany(riderequest_1.default, { foreignKey: 'receiver_id' });
        riderequest_1.default.belongsTo(users_1.default, { foreignKey: 'user_id' });
        riderequest_1.default.belongsTo(driver_1.default, { foreignKey: 'driver_id' });
        riderequest_1.default.belongsTo(models_1.Booking, { foreignKey: 'booking_id' });
        riderequest_1.default.belongsTo(recieverdetails_1.default, { foreignKey: 'receiver_id' });
        riderequest_1.default.belongsTo(recieverdetails_1.default, { foreignKey: 'receiver_id' });
        yield users_1.default.sync({ alter: isDev });
        yield driver_1.default.sync({ alter: isDev });
        yield driver_documents_1.default.sync({ alter: isDev });
        yield servicetype_1.default.sync({ alter: isDev });
        yield recieverdetails_1.default.sync({ alter: isDev });
        yield riderequest_1.default.sync({ alter: isDev });
        yield admin_1.default.sync({ alter: isDev });
        yield driverlocation_1.default.sync({ alter: isDev });
        yield driverearnings_1.default.sync({ alter: isDev });
        yield SubCategory_1.default.sync({ alter: isDev });
        yield SuperCategory_1.default.sync({ alter: isDev });
        yield Category_1.default.sync({ alter: isDev });
        yield restaurant_1.default.sync({ alter: isDev });
        //await dish.sync({alter: isDev});
        yield brand_1.default.sync({ alter: isDev });
        yield inventory_1.default.sync({ alter: isDev });
        yield product_1.default.sync({ alter: isDev });
        yield image_1.default.sync({ alter: isDev });
        yield restaurant_1.default.sync({ alter: isDev });
        yield brand_1.default.sync({ alter: isDev });
        yield Address_1.default.sync({ alter: isDev });
        yield userTransaction_1.default.sync({ alter: isDev });
        yield add_to_cart_1.default.sync({ alter: isDev });
        yield drivertransaction_1.default.sync({ alter: isDev });
        yield vehicle_1.default.sync({ alter: isDev });
        yield order_items_1.default.sync({ alter: isDev });
        yield payment_1.default.sync({ alter: isDev });
        yield CartItemRestaurants_1.default.sync({ alter: isDev });
        yield order_1.default.sync({ alter: isDev });
    });
}
const dbInit = () => {
    init();
};
exports.default = dbInit;
