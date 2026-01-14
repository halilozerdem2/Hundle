"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPush = exports.getPublicVapidKey = void 0;
const web_push_1 = __importDefault(require("web-push"));
const getVapidDetails = () => ({
    subject: process.env.PUSH_SUBJECT ?? 'mailto:admin@example.com',
    publicKey: process.env.PUSH_PUBLIC_KEY ?? 'PUBLIC_VAPID_KEY_PLACEHOLDER',
    privateKey: process.env.PUSH_PRIVATE_KEY ?? 'PRIVATE_VAPID_KEY_PLACEHOLDER'
});
let configured = false;
const ensureConfigured = () => {
    if (configured) {
        return;
    }
    const { subject, publicKey, privateKey } = getVapidDetails();
    web_push_1.default.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
};
const getPublicVapidKey = () => getVapidDetails().publicKey;
exports.getPublicVapidKey = getPublicVapidKey;
const toWebPushSubscription = (subscription) => ({
    endpoint: subscription.endpoint,
    keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
    }
});
const sendPush = async (subscription, payload) => {
    ensureConfigured();
    try {
        await web_push_1.default.sendNotification(toWebPushSubscription(subscription), JSON.stringify(payload));
    }
    catch (error) {
        const err = error;
        console.error('Failed to send push', err?.statusCode, err?.body ?? err);
        throw err;
    }
};
exports.sendPush = sendPush;
