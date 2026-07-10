// server side processing of auth actions
"use server";
import { cookies } from "next/headers";
import {
  disableTwoFactor,
  enableTwoFactor,
  login,
  register,
  resetPassword,
  requestPasswordReset,
  verifyTwoFactorLogin,
  verifyTwoFactorSetup,
} from "../api/auth";
// import { Cookie } from "next/font/google";
import { clearAuthCookies, getUserData, setAuthToken, setUserData } from "../cookie";
import { getAuthToken } from "../cookie";
import { jwtDecode} from "jwt-decode";


export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "user";
};

type AuthFormData = Record<string, unknown>;

type AuthApiResult = {
  success?: boolean;
  token?: string;
  data?: Record<string, unknown>;
  message?: string;
  twoFactorRequired?: boolean;
  userId?: string;
  email?: string;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const getStringField = (value: unknown) =>
  typeof value === "string" ? value : undefined;

export const handleRegister = async (formData: AuthFormData) => {
    try{
        // how to get data from component
        const result = (await register(formData)) as AuthApiResult;
        // how to send back to component
        if(result.success){
            return {
                success: true,
                message: "Registration successful",
                data: result.data 
            };
        }
        return {
            success: false, message: result.message || "Registration failed"
        }
    }catch(err: unknown){
        return { success: false, message: getErrorMessage(err, "Registration failed")};
    }
}

const completeLogin = async (result: AuthApiResult) => {
  const token = result.token || getStringField(result.data?.token);
  if (!token) {
    return {
      success: false,
      message: "Login succeeded but no auth token was returned",
    };
  }

  const userData: Record<string, unknown> & { token: string } = result.data
    ? { ...result.data, token }
    : { token };

  // Save token + user data
  await setAuthToken(token);
  await setUserData(userData);

  // Get cookies API
  const cookieStore = await cookies();

  // Store normalized role for middleware
  const normalizedRole =
    typeof userData.role === "string" ? userData.role.toLowerCase() : "";
  if (normalizedRole) {
    cookieStore.set("role", normalizedRole, { path: "/" });
  }

  return {
    success: true,
    message: "Login successful",
    data: userData,
  };
};

// export const handleLogin = async (formData: any) => {
//     try{
//         // how to get data from component
//         const result = await login(formData);
//         // how to send back to component
//         if(result.success){
//             await setAuthToken(result.token);
//             await setUserData(result.data);
//             return {
//                 success: true,
//                 message: "Login successful",
//                 data: result.data 
//             };
//         }
//         return {
//             success: false, message: result.message || "Login failed"
//         }
//     }catch(err: Error | any){
//         return { success: false, message: err.message || "Login failed"};
//     }
// }

export const handleLogin = async (formData: AuthFormData) => {
  try {
    const result = (await login(formData)) as AuthApiResult;

    if (result.success) {
      if (result.twoFactorRequired) {
        return {
          success: true,
          twoFactorRequired: true,
          userId: result.userId,
          email: result.email || (typeof formData.email === "string" ? formData.email : undefined),
          message: result.message || "Two-factor authentication required",
        };
      }

      return completeLogin(result);
    }

    return {
      success: false,
      message: result.message || "Login failed",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getErrorMessage(err, "Login failed"),
    };
  }
};

export const handleVerifyTwoFactorLogin = async (payload: {
  userId?: string;
  email?: string;
  otp: string;
}) => {
  try {
    if (!/^\d{6}$/.test(payload.otp)) {
      return { success: false, message: "Enter a valid 6-digit OTP" };
    }

    const result = (await verifyTwoFactorLogin(payload)) as AuthApiResult;

    if (result.success) {
      return completeLogin(result);
    }

    return {
      success: false,
      message: result.message || "Two-factor verification failed",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getErrorMessage(err, "Two-factor verification failed"),
    };
  }
};

export const handleEnableTwoFactor = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not logged in" };

    const result = (await enableTwoFactor(token)) as AuthApiResult;
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: result.message || "Scan the QR code and verify OTP to enable 2FA",
      };
    }

    return { success: false, message: result.message || "Failed to start 2FA setup" };
  } catch (err: unknown) {
    return { success: false, message: getErrorMessage(err, "Failed to start 2FA setup") };
  }
};

export const handleVerifyTwoFactorSetup = async (otp: string) => {
  try {
    if (!/^\d{6}$/.test(otp)) {
      return { success: false, message: "Enter a valid 6-digit OTP" };
    }

    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not logged in" };

    const result = (await verifyTwoFactorSetup(token, otp)) as AuthApiResult;
    if (result.success) {
      const existingUserData = await getUserData();
      const updatedUser = result.data
        ? { ...(existingUserData || {}), ...result.data, token }
        : { ...(existingUserData || {}), twoFactorEnabled: true, token };
      await setUserData(updatedUser);

      return {
        success: true,
        data: updatedUser,
        message: result.message || "Two-factor authentication enabled successfully",
      };
    }

    return { success: false, message: result.message || "Failed to verify 2FA setup" };
  } catch (err: unknown) {
    return { success: false, message: getErrorMessage(err, "Failed to verify 2FA setup") };
  }
};

export const handleDisableTwoFactor = async (password: string) => {
  try {
    if (!password) {
      return { success: false, message: "Current password is required" };
    }

    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not logged in" };

    const result = (await disableTwoFactor(token, password)) as AuthApiResult;
    if (result.success) {
      const existingUserData = await getUserData();
      const updatedUser = result.data
        ? { ...(existingUserData || {}), ...result.data, token }
        : { ...(existingUserData || {}), twoFactorEnabled: false, token };
      await setUserData(updatedUser);

      return {
        success: true,
        data: updatedUser,
        message: result.message || "Two-factor authentication disabled successfully",
      };
    }

    return { success: false, message: result.message || "Failed to disable 2FA" };
  } catch (err: unknown) {
    return { success: false, message: getErrorMessage(err, "Failed to disable 2FA") };
  }
};

export const handleLogout = async () => {
  await clearAuthCookies();

  return {
    success: true,
    message: "Logged out successfully",
  };
};


type JwtPayload = {
  id: string;
  email: string;
  role: "admin" | "user";
  exp?: number;
};
export const getAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) return null;

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

export const handleRequestPasswordReset = async (email: string) => {
    try {
        const response = await requestPasswordReset(email);
        if (response.success) {
            return {
                success: true,
                message: 'Password reset email sent successfully'
            }
        }
        return { success: false, message: response.message || 'Request password reset failed' }
    } catch (error: unknown) {
        return { success: false, message: getErrorMessage(error, 'Request password reset action failed') }
    }
};

export const handleResetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await resetPassword(token, newPassword);
        if (response.success) {
            return {
                success: true,
                message: 'Password has been reset successfully'
            }
        }
        return { success: false, message: response.message || 'Reset password failed' }
    } catch (error: unknown) {
        return { success: false, message: getErrorMessage(error, 'Reset password action failed') }
    }
};

