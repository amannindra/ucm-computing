type AuthUser = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  user?: AuthUser;
};

export function createAccount(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse>;

export function signIn(
  email: string,
  password: string,
): Promise<AuthResponse>;
