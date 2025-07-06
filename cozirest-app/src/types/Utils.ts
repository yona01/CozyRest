import { User } from "./User";

export type CallResultDto<T> = {
	isSuccess: boolean;
	message: string;
	data: T;
	data2: number;
	totalCount: number | null;
};

export type LogInResult<T> = {
	message: string;
	data: T;
	token:string;
};

export interface LoggedInUser {
  user:User;
  token: string;
}