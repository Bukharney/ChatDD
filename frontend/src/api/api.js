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
    const response = await axios.post(`${baseUrl}/v1/auth/login`, user, {
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

const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token') || '';
    if (!token) {
      console.log("No token found, clearing local storage only");
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return { success: true, message: "Logged out successfully" };
    }
    
    const response = await axios.post(`${baseUrl}/v1/auth/logout`, {}, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return { success: true, message: "Logged out locally" };
  }
};

export { createUser, loginUser, logoutUser };
