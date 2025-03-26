import axios from "axios";

const baseUrl = "https://chatdd.bukharney.site";

const createUser = async (user) => {
  try {
    const response = await axios.post(`${baseUrl}/v1/users/`, user, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const loginUser = async (user) => {
  try {
    const response = await axios.post(`${baseUrl}/v1/auth/login/`, user, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export { createUser, loginUser };
