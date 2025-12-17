import { api } from "./api";


export const login = async (email: string, password: string, device_name: string) => {
    try {
        const res = await api.post("/login", { email, password, device_name });

        // Token is inside res.data.data.token based on Response helper
        const token = res.data.data?.token;
        const user=res.data.data?.user
        if(user){
            localStorage.setItem("user", JSON.stringify(user));
        }

        if (token) {
            localStorage.setItem("token", token);
        }

        return {
            success: true,
            data: res.data,
        };
    } catch (err: any) {
        const errorMessage = err.response?.data?.errors || err.response?.data?.message || "Login failed";
        return {
            success: false,
            error: errorMessage,
        };
    }
};

export const register = async (name: string, email: string, mobile: string, password: string, password_confirmation: string, device_name: string) => {
    try {
        const res = await api.post("/register", { name, email, mobile, password, password_confirmation, device_name });

        const token = res.data.data?.token;
        const user = res.data.data?.user;

        if (token) {
            localStorage.setItem("token", token);
        }
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }

        return {
            success: true,
            data: res.data,
        };
    } catch (err: any) {
        const errorMessage = err.response?.data?.errors || err.response?.data?.message || "Registration failed";
        return {
            success: false,
            error: errorMessage,
        };
    }
};

export const verifyOtp = async (otp: string) => {
    try {
        const res = await api.post("/verify-otp", { otp });

        return {
            success: true,
            data: res.data,
        };
    } catch (err: any) {
        const errorMessage = err.response?.data?.errors || err.response?.data?.message || "OTP verification failed";
        return {
            success: false,
            error: errorMessage,
        };
    }
};

export const resendOtp = async () => {
    try {
        const res = await api.put("/resend-otp");

        return {
            success: true,
            data: res.data,
        };
    } catch (err: any) {
        const errorMessage = err.response?.data?.errors || err.response?.data?.message || "Failed to resend OTP";
        return {
            success: false,
            error: errorMessage,
        };
    }
};
export const logout = async () => {
    try {
        const res = await api.get("/logout");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return {
            success: true,
            data: res.data,
        };
    } catch (err: any) {
        // Even if API fails, we should probably clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        const errorMessage = err.response?.data?.errors || err.response?.data?.message || "Logout failed";
        return {
            success: false,
            error: errorMessage,
        };
    }
};
