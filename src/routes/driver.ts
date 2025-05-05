import express, { Request, Response } from "express";
import Driver from "../db/models/driver";
import { clusterPoints, rawDataPoints } from "../services/greedy_cluster";
import redisClient from '../../src/redis/redis';

const DriverRouter = express.Router();

// Create a new driver
DriverRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, vehicle_number, gender, dob, vehicle_type, phone } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !vehicle_number || !vehicle_type) {
      return res.status(400).send({ message: "Please fill in all required fields." });
    }

    // Validate email format                                                        
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).send({ message: "Please enter a valid email address." });
    }

    // Check if driver with same email already exists and is active
    const existingDriver = await Driver.findOne({ where: { email, is_deleted: false } });

    if (existingDriver) {
      return res.status(400).send({ message: "Driver with this email already exists." });
    }

    // Create driver_name from first_name and last_name
    const driver_name = `${first_name} ${last_name}`;

    // Create driver object to be inserted
    const createDriverObject: any = {
      driver_name,
      email,
      password,
      gender,
      dob,
      vehicle_type,
      vehicle_number,
      phone
    };

    console.log("Creating Driver with object:", createDriverObject);

    // Create driver using Sequelize model
    const createDriver = await Driver.create(createDriverObject);

    return res.status(200).send({ message: "Driver created successfully", data: createDriver });
  } catch (error: any) {
    console.error("Error in creating driver:", error);
    return res.status(500).send({ message: `Error in creating driver: ${error.message}` });
  }
});

// Get driver by ID
DriverRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if the real-time driver data is in Redis
    redisClient.get(`driver:${id}`, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      let realTimeData;
      if (cachedData) {
        // If data is found in Redis, parse it as real-time data
        console.log('Cache hit, returning data from Redis');
        realTimeData = JSON.parse(cachedData);
      }

      // Fetch driver details from the database (persistent data)
      const driver = await Driver.findOne({
        where: { driver_id: id, is_deleted: false }
      });

      if (!driver) {
        return res.status(404).send({ message: 'Driver not found.' });
      }

      // Convert the Sequelize model to JSON
      const persistentData = driver.toJSON();

      // Merge persistent data from DB with real-time data from Redis (real-time data takes precedence)
      const mergedData = {
        ...persistentData,       // Persistent data (name, phone, etc.)
        ...realTimeData          // Real-time data (location, socketId, etc.)
      };

      // Store the driver details in Redis with an expiration time of 100 seconds
      await redisClient.set(`driver:${id}`, JSON.stringify(mergedData), 'EX', 200);

      // Respond with the merged driver details
      return res.status(200).send(mergedData);
    });
  } catch (error: any) {
    console.error('Error in fetching driver by ID:', error);
    return res.status(500).send({ message: `Error in fetching driver: ${error.message}` });
  }
});

// Get all drivers
DriverRouter.get("/", async (req: Request, res: Response) => {
  try {
    // Check if the driver list is already in Redis
    redisClient.get('drivers:list', async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If data is found in Redis, parse and return it
        console.log('Cache hit, returning data from Redis');
        return res.status(200).send(JSON.parse(cachedData));
      }

      // Fetch driver list from the database
      const drivers = await Driver.findAll({ where: { is_deleted: false } });

      // Store the driver list in Redis with an expiration time of 2 seconds
      await redisClient.set('drivers:list', JSON.stringify(drivers));
      await redisClient.expire('drivers:list', 2);

      // Respond with the driver list
      return res.status(200).send(drivers);
    });
  } catch (error: any) {
    console.error('Error in fetching drivers:', error);
    return res.status(500).send({ message: `Error in fetching drivers: ${error.message}` });
  }
});

// Update driver
// DriverRouter.patch("/:id", async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const { active } = req.body;
//     if (typeof active !== 'boolean') {
//       return res.status(400).send({ message: "Please provide a valid active status." });
//     }

//     const { first_name, last_name, email, password, vehicle_number, gender, dob, vehicle_type, active, phone } = req.body;


//     const driver = await Driver.findOne({ where: { driver_id: id, is_deleted: false } });

//     if (!driver) {
//       return res.status(404).send({ message: "Driver not found." });
//     }

//     // Create driver_name from first_name and last_name
//     const driver_name = `${first_name} ${last_name}`;

//     // Update driver object
//     const updateDriverObject: any = {
//       driver_name,
//       email,
//       password,
//       gender,
//       dob,
//       vehicle_type,
//       vehicle_number,
//       active,
//       phone
//     };

//     // Update driver using Sequelize model
//     await Driver.update(updateDriverObject, { where: { driver_id: id } });

//     return res.status(200).send({ message: "Driver updated successfully" });
//   } catch (error: any) {
//     console.error("Error in updating driver:", error);
//     return res.status(500).send({ message: `Error in updating driver: ${error.message}` });
//   }
// });


//update all driver.
DriverRouter.patch("/:id/upadate", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driver_name, email, phone, gender,vehicle_type, vehicle_number,status } = req.body;

    // Fetch driver by id and check if not deleted
    const driver = await Driver.findOne({ where: { driver_id: id, is_deleted: false } });

    if (!driver) {
      return res.status(404).send({ message: "Driver not found." });
    }

    // Update driver object
    const updateDriverObject: any = {
      driver_name,
      email,
      phone,
      gender,
      vehicle_type,
      vehicle_number,
      status
    };

    // Update driver using Sequelize model
    const response=await Driver.update(updateDriverObject, { where: { driver_id: id } });
    console.log(response)

    return res.status(200).send({ message: "Driver updated successfully" });
  } catch (error: any) {
    console.error("Error in updating driver:", error);
    return res.status(500).send({ message: `Error in updating driver: ${error.message}` });
  }
});



// Soft delete driver (set is_deleted to true)
DriverRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({ where: { driver_id: id, is_deleted: false } });

    if (!driver) {
      return res.status(404).send({ message: "Driver not found." });
    }

    // Soft delete driver
    await Driver.update({ is_deleted: true }, { where: { driver_id: id } });

    return res.status(200).send({ message: "Driver deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleting driver:", error);
    return res.status(500).send({ message: `Error in deleting driver: ${error.message}` });
  }
});

// Update driver's active status
DriverRouter.patch("/:id/active", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).send({ message: "Please provide a valid active status." });
    }

    const driver = await Driver.findOne({ where: { driver_id: id, is_deleted: false } });

    if (!driver) {
      return res.status(404).send({ message: "Driver not found." });
    }

    await Driver.update({ active }, { where: { driver_id: id } });

    return res.status(200).send({ message: "Driver active status updated successfully" });
  } catch (error: any) {
    console.error("Error in updating driver's active status:", error);
    return res.status(500).send({ message: `Error in updating driver's active status: ${error.message}` });
  }
});





DriverRouter.get('/:id/count', async (req: Request, res: Response) => {
  try {
    // Define the cache key based on the route
    const cacheKey = 'activeDrivers:count';

    // Check if the count is already in Redis
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If data is found in Redis, parse and return it
        console.log('Cache hit, returning data from Redis');
        return res.status(200).json({ count: JSON.parse(cachedData) });
      }

      // Fetch the active drivers count from the database
      const activeDriversCount = await Driver.count({
        where: {
          active: true,
          is_deleted: false
        }
      });

      // Store the count in Redis with an expiration time of 2 seconds
      await redisClient.set(cacheKey, JSON.stringify(activeDriversCount));
      await redisClient.expire(cacheKey, 2);

      // Respond with the count
      res.status(200).json({ count: activeDriversCount });
    });
  } catch (error: any) {
    console.error('Error fetching active drivers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Get total count of all drivers (including active, inactive, and soft-deleted)
DriverRouter.get('/total/count/all', async (req: Request, res: Response) => {
  try {
    // Define the cache key for total drivers count
    const cacheKey = 'totalDrivers:count';

    // Check if the count is already in Redis
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If data is found in Redis, parse and return it
        console.log('Cache hit, returning data from Redis');
        return res.status(200).json({ count: JSON.parse(cachedData) });
      }

      // Fetch the total drivers count from the database
      const totalDriversCount = await Driver.count();

      // Store the count in Redis with an expiration time of 2 seconds
      await redisClient.set(cacheKey, JSON.stringify(totalDriversCount));
      await redisClient.expire(cacheKey, 2);

      // Respond with the total count
      res.status(200).json({ count: totalDriversCount });
    });
  } catch (error: any) {
    console.error('Error fetching total drivers count:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Endpoint to get clustered data
DriverRouter.get('/drive/heatmap-data', async(req:Request, res:Response) => {
  try{
  const clusteredData = await clusterPoints(rawDataPoints, 100); // 100 meters threshold
  res.json(clusteredData);
  }catch(error){
    res.status(500).json({error: 'An error occured' })
  }
});

export default DriverRouter;