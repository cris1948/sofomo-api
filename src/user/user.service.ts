import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../util/secrets";
import {User} from "../interfaces"

const users: User[] = [
    {
        id: 1,
        email: "test@test.pl",
        password: "123456"
    },
    {
        id: 2,
        email: "admin@test.pl",
        password: "456789"
    }
]

export default {
    getUser(email: string): User {
        return users.find(user => email === user.email);
    },

    comparePasswords(password: string, userPassword: string): boolean {
        return password === userPassword;
    },

    fromJwt(token: string): User {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;
        return users.find(user => userId === user.id);
    },

    toJwt(user: User, ttl: string = "1d" ): string {
        return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: ttl });
    }
};
