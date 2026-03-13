import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const createAccount = async (name, email, password) => {
  if (!name || !email || !password) {
    return { success: false, message: "Name, email, and password are required." };
  }
  try {
    const response = await axios.post(`${BASE_URL}/createAccountAPI`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error("Error creating account", error);
    return { success: false, message: "Failed to create account." };
  }
};

export const signIn = async (email, password) => {
  console.log("SignIn function in backend.js");
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }
  try {
    const response = await axios.post(`${BASE_URL}/signInAPI`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Error signing in", error);
    return { success: false, message: "Invalid email or password." };
  }
};
