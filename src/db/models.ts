import dotenv from 'dotenv'
dotenv.config();
import Driver from './models/driver';
import DriverDocs from './models/driver-documents';
import DriverLocation from './models/driverlocation';
import ReceiverDetails from './models/recieverdetails';
import User from './models/users';
import Image from './models/image';
import Address from './models/Address';
import UserTransaction from './models/userTransaction';
import Vehicle from './models/Vehicles';
import SenderDetails from './models/sender_details';
import vehicleBooking from './models/vehicleBooking';
import XlrUser from './models/xlrUser';
import Agent from './models/agent';
async function init() {

    const isDev = false
    await User.sync({ alter: isDev });
    await Driver.sync({ alter: isDev });
    await DriverDocs.sync({ alter: isDev });
    await ReceiverDetails.sync({ alter: isDev });
    await DriverLocation.sync({ alter: isDev });
    await Image.sync({alter: isDev});
    await Address.sync({alter: isDev});
    await UserTransaction.sync({alter: isDev});
    await Vehicle.sync({alter: isDev});
    await SenderDetails.sync({alter: isDev});
    await XlrUser.sync({alter:isDev})
    await vehicleBooking.sync({alter: true});
    await Agent.sync({alter: true});
}

const dbInit = () => {
    init();
};

export default dbInit;