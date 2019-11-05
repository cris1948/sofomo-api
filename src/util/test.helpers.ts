import userService from "../user/user.service"

export const getValidToken = async (ttl?: string) => {
    const user = {
        id: 1,
        email: "test@test.pl",
        password: "123456",
    }
    return ttl ? userService.toJwt(user, ttl) : userService.toJwt(user)
}

export const getInvalidToken = async () => {
    return userService.toJwt({
        id: 3,
        email: "wrong@wrong.pl",
        password: "999999999",
    })
}

export const sleep = (milliseconds) => {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}
