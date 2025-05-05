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
const express_1 = __importDefault(require("express"));
const drivertransaction_1 = __importDefault(require("../db/models/drivertransaction")); // Adjust the path as needed
const driverTransactionRouter = express_1.default.Router();
// Utility function to get the latest wallet balance for a driver
const getLatestWalletBalance = (driver_id) => __awaiter(void 0, void 0, void 0, function* () {
    const latestTransaction = yield drivertransaction_1.default.findOne({
        where: { driver_id },
        order: [['transaction_date', 'DESC']]
    });
    return latestTransaction ? latestTransaction.wallet_balance_after : 0;
});
// Create a new transaction
driverTransactionRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id, amount, transaction_type, description, request_id } = req.body;
        // Convert amount to a number
        const amountNum = parseFloat(amount);
        // Get the latest wallet balance
        const wallet_balance_before = yield getLatestWalletBalance(driver_id);
        // Calculate the new balance
        let wallet_balance_after;
        if (transaction_type === 'credit') {
            wallet_balance_after = wallet_balance_before + amountNum;
        }
        else {
            wallet_balance_after = wallet_balance_before - amountNum;
        }
        // Create the transaction record
        const transaction = yield drivertransaction_1.default.create({
            driver_id,
            request_id,
            wallet_balance_before,
            wallet_balance_after,
            amount: amountNum,
            transaction_type,
            description,
            transaction_date: new Date()
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
}));
// Get all transactions for a driver
driverTransactionRouter.get('/:driver_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id } = req.params;
        // Fetch the latest wallet balance for the driver
        const latestWalletBalance = yield getLatestWalletBalance(Number(driver_id));
        // Fetch all transactions for the driver
        const transactions = yield drivertransaction_1.default.findAll({
            where: { driver_id },
            attributes: ['transaction_id', 'amount', 'wallet_balance_before', 'wallet_balance_after', 'transaction_type', 'description', 'request_id', 'transaction_date'],
            order: [['transaction_date', 'DESC']]
        });
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this driver' });
        }
        // Respond with driver details and transactions including the latest wallet balance
        res.status(200).json({
            driver_id,
            latest_wallet_balance: latestWalletBalance,
            transactions
        });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
}));
// Get the latest balance for a driver
driverTransactionRouter.get('/balance/:driver_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id } = req.params;
        const latestTransaction = yield drivertransaction_1.default.findOne({
            where: { driver_id },
            order: [['transaction_date', 'DESC']]
        });
        if (latestTransaction) {
            res.status(200).json({ balance: latestTransaction.wallet_balance_after });
        }
        else {
            res.status(404).json({ message: 'No transactions found for this driver' });
        }
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
}));
exports.default = driverTransactionRouter;
