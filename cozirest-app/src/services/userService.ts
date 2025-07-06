import { postToBaseApi } from "../lib/utils/apiService";
import { User, UserDetails, UserLogIn } from "../types/User";
import { CallResultDto, LoggedInUser, LogInResult } from "../types/Utils";


export async function register(user: User) {
    return await postToBaseApi<CallResultDto<object>>('api/register', user);
}

export async function logIn(user: UserLogIn) {
    return await postToBaseApi<LogInResult<User>>('api/login', user);
}

export async function updateUser(user: UserDetails) {
    return await postToBaseApi<CallResultDto<User>>('api/saveUser', user);
}
