export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  fullName?: string;
  userType?: "admin" | "farmer" | "buyer" | "other";
}

