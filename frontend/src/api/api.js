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
    await axios.get(`${baseUrl}/v1/auth/logout`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error logging out:", error);
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

const changePassword = async (newPassword = "", oldPassword = "") => {
  try {
    await axios.patch(
      `${baseUrl}/v1/users/change-password`,
      {
        new_password: newPassword,
        old_password: oldPassword,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  } catch (error) {
    if (error.response.status === 403) {
      await refreshToken();
    }
    console.error("Error fetching contacts:", error);
  }
};

const findUserByEmail = async (email = "") => {
  try {
    const response = await axios.get(
      `${baseUrl}/v1/users/find?email=${email}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    if (error.response.status === 403) {
      await refreshToken();
    }
    console.error("Error fetching contacts:", error);
  }
};

const addFriend = async (friendId = "") => {
  try {
    const response = await axios.post(
      `${baseUrl}/v1/users/add-friend`,
      {
        user_b_id: friendId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response.status === 403) {
      await refreshToken();
    }
    console.error("Error adding friend:", error);
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
    console.error("Error refreshing token:", error);
    window.location.href = "/login";
  }
};

export {
  createUser,
  loginUser,
  logoutUser,
  addFriend,
  getFriends,
  changePassword,
  getUser,
  findUserByEmail,
  refreshToken,
};
