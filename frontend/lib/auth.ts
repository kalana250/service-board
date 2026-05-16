import api from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

// Save token to localStorage
export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem("token");
};

// Register
export const register = async (name: string, email: string, password: string) => {
  const res = await api.post("/auth/register", { name, email, password });
  saveToken(res.data.token);
  return res.data;
};

// Login
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  saveToken(res.data.token);
  return res.data;
};

// Logout
export const logout = () => {
  removeToken();
};

// Get current user from token
export const getMe = async (): Promise<AuthUser | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.user;
  } catch {
    removeToken();
    return null;
  }
};