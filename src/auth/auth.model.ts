export interface IUserLogin {
  email: string;
  password: string;
}

export interface IAuthTokenPayload {
  id: number;
  firstName: string;
  lastName: string;
}

export interface TokenResult {
  jwtToken: string;
}