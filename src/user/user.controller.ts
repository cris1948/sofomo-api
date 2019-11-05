import { User, PromisifiedRequestHandler, PassportExtendedRequest } from "../interfaces"
import userService from "./user.service";

const postLogin: PromisifiedRequestHandler = async (req: PassportExtendedRequest, res) => {
    const user: User = req.user;
    res.status(200).send({
        token: userService.toJwt(user)
    });
};

export default {
    postLogin
};
