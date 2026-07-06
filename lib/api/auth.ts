// API Layer
// Call api from backent

import axios from "./axios"; // IMPORTANT: "./axios" not "axios"
import { API } from "./endpoints";

type ApiErrorShape = {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiErrorShape;
  const backendMessage =
    apiError.response?.data?.message || apiError.response?.data?.error;

  if (apiError.response?.status === 429) {
    return backendMessage || "Too many requests. Please try again later.";
  }

  return backendMessage || apiError.message || fallback;
};

export const register = async (registerData: Record<string, unknown>) => {
    try{
        const response = await axios.post(
            API.AUTH.REGISTER, // API path '/api/auth/register'
            registerData // body data
        );
        return response.data; // what the backend-controller returns
    }catch(err: unknown){
        // 4xx or 5xx counts as exception
        throw new Error(getApiErrorMessage(err, "Registration failed"));
    }
}
export const login = async (loginData: Record<string, unknown>) => {
    try{
        const response = await axios.post(
            API.AUTH.LOGIN, // API path '/api/auth/register'
            loginData // body data
        );
        return response.data; // what the backend-controller returns
    }catch(err: unknown){
        // 4xx or 5xx counts as exception
        throw new Error(getApiErrorMessage(err, "Login failed"));
    }
}

export const verifyTwoFactorLogin = async (payload: {
  userId?: string;
  email?: string;
  otp: string;
}) => {
    try{
        const response = await axios.post(API.AUTH.VERIFY_2FA, payload);
        return response.data;
    }catch(err: unknown){
        throw new Error(getApiErrorMessage(err, "Two-factor verification failed"));
    }
}

export const enableTwoFactor = async (token: string) => {
  try {
    const response = await axios.post(
      API.AUTH.ENABLE_2FA,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, "Failed to start 2FA setup"));
  }
};

export const verifyTwoFactorSetup = async (token: string, otp: string) => {
  try {
    const response = await axios.post(
      API.AUTH.VERIFY_2FA_SETUP,
      { otp },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, "Failed to verify 2FA setup"));
  }
};

export const disableTwoFactor = async (token: string, password: string) => {
  try {
    const response = await axios.post(
      API.AUTH.DISABLE_2FA,
      { password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, "Failed to disable 2FA"));
  }
};

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axios.post(API.AUTH.REQUEST_PASSWORD_RESET, { email });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, 'Request password reset failed'));
    }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { newPassword: newPassword });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, 'Reset password failed'));
    }
};


export type UserProfile = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  address?: string;
  role?: string;
};

export const getUserById = async (id: string) => {
  try {
    const res = await axios.get(API.USERS.BY_ID(id));
    return res.data; // expects { success, data, message }
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, "Failed to fetch user"));
  }
};

export const updateUserById = async (id: string, payload: Partial<UserProfile>) => {
  try {
    const res = await axios.put(API.USERS.UPDATE(id), payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, "Failed to update user"));
  }
};

