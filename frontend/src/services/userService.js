import api from "./api";

const userService = {
  // 🟢 Lấy thông tin user theo ID
  async getUserById(userId) {
    try {
      console.log(`📡 Calling API: /public/users/${userId}`);
      const response = await api.get(`/public/users/${userId}`);
      console.log("✅ User data received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error getting user by ID:", error);
      throw error;
    }
  },

  // src/services/userService.js
async getUserByEmail(email) {
  try {
    console.log(`📡 Getting user by email: ${email}`);
    const response = await api.get(`/public/users/email/${email}`);
    console.log("✅ User by email - FULL RESPONSE:", response);
    console.log("✅ User by email - DATA:", response.data);
    
    // ✅ DEBUG: Kiểm tra cấu trúc response
    if (response.data) {
      console.log("🔍 Response structure:", Object.keys(response.data));
      console.log("🔍 User ID fields:", {
        user_id: response.data.user_id,
        userId: response.data.userId,
        id: response.data.id
      });
    }
    
    return response.data;
  } catch (error) {
    console.error("❌ Error getting user by email:", error);
    throw error;
  }
},
// src/services/userService.js
async updateUser(userId, userData) {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };

    // ✅ Dùng camelCase theo DTO
    const updateData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      mobileNumber: userData.mobileNumber
    };

    console.log("💾 Sending camelCase data to API:", updateData);

    const response = await api.put(`/public/users/${userId}`, updateData, config);
    
    console.log("✅ Database update successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Database update failed:", error);
    throw error;
  }
},
  // 🟢 Lấy thông tin user profile (compatibility)
  async getUserProfile(userId) {
    return this.getUserById(userId);
  }
};

export default userService;