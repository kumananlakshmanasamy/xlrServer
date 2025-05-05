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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableDrivers = void 0;
const models_1 = require("../db/models");
// Fetch all available drivers (drivers who are not deleted and are active)
const getAvailableDrivers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const availableDrivers = yield models_1.Driver.findAll({
            where: {
                is_deleted: false,
                active: true
            }
        });
        return availableDrivers;
    }
    catch (error) {
        console.error("Error in fetching available drivers:", error);
        throw new Error(`Error in fetching available drivers: ${error.message}`);
    }
});
exports.getAvailableDrivers = getAvailableDrivers;
