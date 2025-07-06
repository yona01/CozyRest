export type User = {
  id: number;
  name: string;
  contact_number?: string;
  email: string;
  password:string;
  password_confirmation:string;
  role:string;
};

export type UserLogIn = {
  email:string;
  password:string;
};

export type UserDetails = {
  id:number;
  contact_number:string;
  name:string;
  email:string;
};