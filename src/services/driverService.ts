import Driver from "../db/models/driver";

// Fetch all available drivers (drivers who are not deleted and are active)
export const getAvailableDrivers = async () => {
  try {
    const availableDrivers = await Driver.findAll({
      where: {
        is_deleted: false,
        active: true
      }
    });

    return availableDrivers;
  } catch (error: any) {
    console.error("Error in fetching available drivers:", error);
    throw new Error(`Error in fetching available drivers: ${error.message}`);
  }
};
