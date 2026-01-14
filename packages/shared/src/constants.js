"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREQUENCY_CRON = exports.NOTIFICATION_FREQUENCIES = exports.AVAILABLE_CATEGORIES = void 0;
exports.AVAILABLE_CATEGORIES = [
    'technology',
    'business',
    'sports',
    'science'
];
exports.NOTIFICATION_FREQUENCIES = ['30m', '1h', '3h', '1d'];
exports.FREQUENCY_CRON = {
    '30m': '*/30 * * * *',
    '1h': '0 * * * *',
    '3h': '0 */3 * * *',
    '1d': '0 8 * * *'
};
