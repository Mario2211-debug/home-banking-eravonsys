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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.singup = exports.profile = void 0;
const database_1 = require("../database");
const bcrypt = __importStar(require("bcrypt"));
const user_1 = require("../model/user");
const wallet_1 = require("../model/wallet");
const movementList_1 = require("../model/movementList");
const jwtUtils = __importStar(require("../jwtUtils"));
const utils_1 = require("../utils");
/**
 * <p>Route | POST:subscribe</p>
 * <p>Registers new user account</p>
 * <p>Payload: email, password (raw), name (Optional)</p>
 *
 * @returns 'feedback' property

*/
function profile(request, h) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        const user = (_a = database_1.db.data) === null || _a === void 0 ? void 0 : _a.users.find((user) => user.id === userId);
        if (!user) {
            return h.response({ feedback: 'Usuário não encontrado' }).code(404);
        }
        else {
            return h.response(user).code(200);
        }
    });
}
exports.profile = profile;
/**
 * <p>Route | POST:login</p>
 * <p>User login</p>
 * <p>Payload: email, password (raw)</p>
 *
 * @returns 'feedback' property and response has header "Authorization" with JWT token used to access protected routes
 */
function singup(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const newUser = request.payload;
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        if (database_1.db.data.users.some((user) => user.email === newUser.email)) {
            return h
                .response({ feedback: 'This email is already in use.' })
                .code(409);
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newUser.password, salt);
        const isSubscribed = false;
        const user = new user_1.User(newUser.email, hashedPassword, newUser.name, isSubscribed);
        const wallet = new wallet_1.Wallet(user.id);
        const movementList = new movementList_1.MovementList(wallet.id);
        database_1.db.data.users.push(user);
        database_1.db.data.wallets.push(wallet);
        database_1.db.data.movementLists.push(movementList);
        yield database_1.db.write(); //Required to write to database
        return h.response({ feedback: 'Account created successfully' }).code(200);
    });
}
exports.singup = singup;
/**
 * <p>Route | POST:login</p>
 * <p>User login</p>
 * <p>Payload: email, password (raw)</p>
 *
 * @returns 'feedback' property and response has header "Authorization" with JWT token used to access protected routes
 */
function login(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = request.payload;
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const user = database_1.db.data.users.find((user) => user.email === email);
        if (!user) {
            return h
                .response({ feedback: 'This account does not exist' })
                .code(404);
        }
        if (!(yield bcrypt.compare(password, user.password))) {
            return h.response({ feedback: 'Incorrect credentials' }).code(401);
        }
        const token = jwtUtils.sign({ userId: user.id });
        user.lastLogin = (0, utils_1.currentDateAsUTCString)();
        //Return new user object without password property
        const responseUser = Object.assign({}, user);
        delete responseUser.password;
        yield database_1.db.write(); //Required to write to database
        return h
            .response({ feedback: 'Login successful', user: responseUser })
            .code(200)
            .header('Authorization', token);
    });
}
exports.login = login;
