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
exports.initDB = exports.db = exports.DATABASE_DEFAULT = void 0;
const lowdb_1 = require("@commonify/lowdb");
//Default database state
exports.DATABASE_DEFAULT = {
    users: [],
    wallets: [],
    movementLists: [],
    subscribes: []
};
function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        let dbFileName;
        switch (process.env.NODE_ENV) {
            case 'testing':
                dbFileName = 'testingDB';
                break;
            case 'dev':
                dbFileName = 'devDB';
                break;
            case 'prod':
                dbFileName = 'prodDB';
                break;
            default:
                dbFileName = 'lostDB';
                break;
        }
        let path = __dirname.split('\\');
        path.pop();
        path.push('database');
        const pathString = `${path.join('\\')}\\${dbFileName}.json`;
        const adapter = new lowdb_1.JSONFile(pathString);
        exports.db = new lowdb_1.Low(adapter);
        //Set default database state if it doesn't exist
        yield exports.db.read();
        if (!exports.db.data) {
            exports.db.data = exports.DATABASE_DEFAULT;
        }
        yield exports.db.write();
    });
}
exports.initDB = initDB;
