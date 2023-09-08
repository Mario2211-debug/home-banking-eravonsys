import * as jwt from 'jsonwebtoken';

/**
 * Creates a new JSON Web Token (JWT) containing the provided payload data.
 * 
 * @param data - The payload data to include in the JWT. Can be any JSON-serializable value.
 * 
 * @returns The signed JWT string. The JWT is signed using the secret key loaded from the JWT_SECRET_KEY environment variable.
 */
export function sign(data: any) {
    return jwt.sign(data, <string>process.env.JWT_SECRET_KEY);
}



