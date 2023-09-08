import { Request, ResponseToolkit } from '@hapi/hapi';
import { db } from '../database';
import * as bcrypt from 'bcrypt';
import { User } from '../model/user';
import { Wallet } from '../model/wallet';
import { MovementList } from '../model/movementList';
import * as jwtUtils from '../jwtUtils';
import { currentDateAsUTCString } from '../utils';

/**
 * <p>Route | POST:subscribe</p>
 * <p>Registers new user account</p>
 * <p>Payload: email, password (raw), name (Optional)</p>
 *
 * @returns 'feedback' property

*/

export async function profile(request: Request, h: ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token
    const user = db.data?.users.find((user) => user.id === userId);
    if (!user){    return h.response({ feedback: 'Usuário não encontrado' }).code(404);
} else{
    return h.response(user).code(200);
}
}

/**
 * <p>Route | POST:login</p>
 * <p>User login</p>
 * <p>Payload: email, password (raw)</p>
 *
 * @returns 'feedback' property and response has header "Authorization" with JWT token used to access protected routes
 */

export async function singup(request: Request, h: ResponseToolkit) {
    const newUser = <any>request.payload;

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }
    if (db.data.users.some((user) => user.email === newUser.email)) {
        return h
            .response({ feedback: 'This email is already in use.' })
            .code(409);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);
    const isSubscribed = false
    const user = new User(newUser.email, hashedPassword, newUser.name, isSubscribed);
    const wallet = new Wallet(user.id);
    const movementList = new MovementList(wallet.id);
    db.data.users.push(user);
    db.data.wallets.push(wallet);
    db.data.movementLists.push(movementList);

    await db.write(); //Required to write to database

    return h.response({ feedback: 'Account created successfully' }).code(200);
}

/**
 * <p>Route | POST:login</p>
 * <p>User login</p>
 * <p>Payload: email, password (raw)</p>
 *
 * @returns 'feedback' property and response has header "Authorization" with JWT token used to access protected routes
 */
export async function login(request: Request, h: ResponseToolkit) {
    const { email, password } = <any>request.payload;

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const user = db.data.users.find((user) => user.email === email);
    if (!user) {
        return h
            .response({ feedback: 'This account does not exist' })
            .code(404);
    }
    if (!(await bcrypt.compare(password, user.password))) {
        return h.response({ feedback: 'Incorrect credentials' }).code(401);
    }
    const token = jwtUtils.sign({ userId: user.id });
    user.lastLogin = currentDateAsUTCString();

    //Return new user object without password property
    const responseUser: any = { ...user };
    delete responseUser.password;

    await db.write(); //Required to write to database

    return h
        .response({ feedback: 'Login successful', user: responseUser })
        .code(200)
        .header('Authorization', token);
}
