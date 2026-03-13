import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const getRequestErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach the backend server at " + BASE_URL + ".";
  }
  return fallbackMessage;
};

export const createAccount = async (name, email, password) => {
  if (!name || !email || !password) {
    return { success: false, message: "Name, email, and password are required." };
  }
  try {
    const response = await axios.post(`${BASE_URL}/createAccountAPI`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error("Error creating account", error);
    return {
      success: false,
      message: getRequestErrorMessage(error, "Failed to create account."),
    };
  }
};

export const signIn = async (email, password) => {
  console.log("SignIn function in backend.js");
  if (!email || !password) {
    console.log("Email and password are required.");
    return { success: false, message: "Email and password are required." };
  }
  try {
    console.log("Signing in with email: ", email, " and password: ", password);
    const response = await axios.post(`${BASE_URL}/signInAPI`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Error signing in", error);
    return {
      success: false,
      message: getRequestErrorMessage(error, "Invalid email or password."),
    };
  }
};
