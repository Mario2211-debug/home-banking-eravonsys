"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.start = exports.init = exports.server = void 0;
const hapi_1 = __importDefault(require("@hapi/hapi"));
const devAPI = __importStar(require("./api/dev"));
const accountAPI = __importStar(require("./api/account"));
const bankAPI = __importStar(require("./api/bank"));
const dotenv = __importStar(require("dotenv"));
const database_1 = require("./database");
const init = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, database_1.initDB)();
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
        dotenv.config({ override: false });
        exports.server = hapi_1.default.server({
            port: process.env.PORT || 4000,
            host: '0.0.0.0',
            routes: {
                cors: {
                    origin: ['*'],
                    exposedHeaders: ['Authorization'], //Allows Authorization header to be read by requests
                },
            },
        });
        yield exports.server.register(require('hapi-auth-jwt2'));
        exports.server.auth.strategy('jwt', 'jwt', {
            key: process.env.JWT_SECRET_KEY,
            validate: (decoded) => __awaiter(this, void 0, void 0, function* () {
                yield database_1.db.read();
                if (!database_1.db.data) {
                    return { isValid: false };
                }
                return {
                    isValid: database_1.db.data.users.some((user) => user.id === decoded.userId),
                    credentials: { userId: decoded.userId } //Allows endpoints to access request.auth.credentials.userId
                };
            }),
        });
        exports.server.auth.default('jwt');
        if (process.env.NODE_ENV !== 'prod') {
            exports.server.route({
                method: 'DELETE',
                path: '/delete',
                options: {
                    auth: false,
                },
                handler: devAPI.databaseReset,
            });
        }
        exports.server.route({
            method: 'POST',
            path: '/singup',
            options: {
                auth: false,
            },
            handler: accountAPI.singup,
        });
        exports.server.route({
            method: 'POST',
            path: '/login',
            options: {
                auth: false,
            },
            handler: accountAPI.login,
        });
        exports.server.route({
            method: 'POST',
            path: '/profile/:id',
            handler: accountAPI.profile,
        });
        exports.server.route({
            method: 'GET',
            path: '/funds',
            handler: bankAPI.getFunds,
        });
        exports.server.route({
            method: 'PUT',
            path: '/funds',
            handler: bankAPI.addFunds,
        });
        exports.server.route({
            method: 'DELETE',
            path: '/funds',
            handler: bankAPI.removeFunds,
        });
        exports.server.route({
            method: 'GET',
            path: '/movements',
            handler: bankAPI.getMovements,
        });
        exports.server.route({
            method: 'GET',
            path: '/internalMovements',
            handler: bankAPI.getInternalMovements,
        });
        exports.server.route({
            method: 'GET',
            path: '/transfers',
            handler: bankAPI.getTransfers,
        });
        exports.server.route({
            method: 'GET',
            path: '/user',
            handler: bankAPI.getTransfers,
        });
        exports.server.route({
            method: 'POST',
            path: '/transfers',
            handler: bankAPI.makeTransfer,
        });
        exports.server.route({
            method: 'GET',
            path: '/payments',
            handler: bankAPI.getPayments,
        });
        exports.server.route({
            method: 'POST',
            path: '/payments',
            handler: bankAPI.makePayment,
        });
        exports.server.route({
            method: 'POST',
            path: '/subscribe',
            handler: bankAPI.subscribe,
        });
        return exports.server;
    });
};
exports.init = init;
const start = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Listening on ${exports.server.settings.host}:${exports.server.settings.port}`);
        return exports.server.start();
    });
};
exports.start = start;
process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection');
    console.error(err);
    process.exit(1);
});
