
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { User } from '../../types/User';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'loggedInUser';

export function saveAuth(token: string, userData: Omit<User, 'token'>) {
  const user: User = {
    ...userData
  };
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveUser(userData: Omit<User, 'token'>) {
  const user: User = {
    ...userData
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getLoggedInUser(): User | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded: JwtPayload = jwtDecode(token);

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      clearAuth();
      return null;
    }
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logOut(){
    clearAuth();
}