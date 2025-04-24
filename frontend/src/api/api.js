import axios from "axios";

const baseUrl = "http://localhost:8080";

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
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

const getUser = async () => {
  try {
    const response = await axios.get(`${baseUrl}/v1/auth/me`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response.status === 403) {
      await refreshToken();
    }
    console.error("Error fetching user:", error);
  }
};

const logoutUser = async () => {
  try {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      console.log("No token found, clearing local storage only");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return { success: true, message: "Logged out successfully" };
    }

    const response = await axios.post(
      `${baseUrl}/v1/auth/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return { success: true, message: "Logged out locally" };
  }
};

const getFriends = async () => {
  try {
    const response = await axios.get(`${baseUrl}/v1/users/friends`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response.status === 403) {
      await refreshToken();
    }
    console.error("Error fetching contacts:", error);
  }
};

const refreshToken = async () => {
  try {
    const response = await axios.get(`${baseUrl}/v1/auth/refresh-token`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response.status === 403) {
      console.log("User not authenticated or no friends found.");
      return [];
    }
    console.error("Error fetching contacts:", error);
  }
};

export { createUser, loginUser, logoutUser, getFriends, getUser, refreshToken };
