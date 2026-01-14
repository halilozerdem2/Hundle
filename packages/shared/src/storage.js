"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSubscription = exports.writeSubscriptions = exports.readSubscriptions = exports.getStorePath = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const DEFAULT_FILE = path_1.default.resolve(__dirname, '../../..', 'data', 'subscriptions.json');
const ensureStoreFile = async (filePath) => {
    const dir = path_1.default.dirname(filePath);
    await promises_1.default.mkdir(dir, { recursive: true });
    try {
        await promises_1.default.access(filePath);
    }
    catch {
        await promises_1.default.writeFile(filePath, '[]', 'utf-8');
    }
};
const getStorePath = () => process.env.SUBSCRIPTIONS_FILE ?? DEFAULT_FILE;
exports.getStorePath = getStorePath;
const readSubscriptions = async () => {
    const filePath = (0, exports.getStorePath)();
    await ensureStoreFile(filePath);
    const payload = await promises_1.default.readFile(filePath, 'utf-8');
    return JSON.parse(payload);
};
exports.readSubscriptions = readSubscriptions;
const writeSubscriptions = async (subs) => {
    const filePath = (0, exports.getStorePath)();
    await ensureStoreFile(filePath);
    await promises_1.default.writeFile(filePath, JSON.stringify(subs, null, 2), 'utf-8');
};
exports.writeSubscriptions = writeSubscriptions;
const saveSubscription = async (payload) => {
    const subscriptions = await (0, exports.readSubscriptions)();
    const deduped = subscriptions.filter((sub) => sub.endpoint !== payload.endpoint);
    deduped.push(payload);
    await (0, exports.writeSubscriptions)(deduped);
    return payload;
};
exports.saveSubscription = saveSubscription;
