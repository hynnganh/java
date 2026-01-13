// // // services/userService.js
// // import api from "./api";

// // const userService = {
// //   // ==================== PUBLIC ENDPOINTS ====================
  
// //   // 🟢 Public: Lấy thông tin user theo ID
// //  // 🟢 Public: Lấy thông tin user theo ID - THÊM DEBUG
// // async getUserById(userId) {
// //   try {
// //     console.log(`📡 Calling API: /public/users/${userId}`);
// //     const response = await api.get(`/public/users/${userId}`);
// //     console.log("📨 API Response:", response);
// //     console.log("📊 Response data:", response.data);
    
// //     // ✅ Kiểm tra cấu trúc dữ liệu trả về
// //     if (response.data) {
// //       console.log("🔍 Data structure check:", {
// //         'hasFirst_name': !!response.data.first_name,
// //         'hasFirstName': !!response.data.firstName,
// //         'first_name value': response.data.first_name,
// //         'firstName value': response.data.firstName,
// //         'allKeys': Object.keys(response.data)
// //       });
// //     }
    
// //     return response.data;
// //   } catch (error) {
// //     console.error("❌ Lỗi khi lấy thông tin user:", error);
    
// //     // ✅ Log chi tiết lỗi
// //     if (error.response) {
// //       console.error("🚨 Error response:", {
// //         status: error.response.status,
// //         data: error.response.data
// //       });
// //     }
    
// //     throw error;
// //   }
// // },

// //   // 🟢 Public: Lấy thông tin user theo email
// //   async getUserByEmail(email) {
// //     try {
// //       const { data } = await api.get(`/public/users/email/${email}`);
// //       return data;
// //     } catch (error) {
// //       console.error("❌ Lỗi khi lấy thông tin user bằng email:", error);
// //       throw error;
// //     }
// //   },

// //  // 🟢 Public: Cập nhật thông tin user - DEBUG CHI TIẾT
// // async updateUser(userId, userData) {
// //   try {
// //     // Lấy token từ localStorage
// //     const token = localStorage.getItem("token");
// //     console.log("🔐 Token for update:", token ? `EXISTS (${token.length} chars)` : "MISSING");
    
// //     if (!token) {
// //       throw new Error("No authentication token found in localStorage");
// //     }

// //     const config = {
// //       headers: {
// //         "Content-Type": "application/json",
// //         "Authorization": `Bearer ${token}`
// //       }
// //     };

// //     // Chỉ gửi các trường có trong form
// //     const updateData = {
// //       first_name: userData.first_name,
// //       last_name: userData.last_name,
// //       email: userData.email,
// //       mobile_number: userData.mobile_number
// //     };

// //     console.log("📤 Sending UPDATE request to API:", {
// //       url: `/public/users/${userId}`,
// //       data: updateData,
// //       headers: config.headers
// //     });

// //     const response = await api.put(`/public/users/${userId}`, updateData, config);
// //     console.log("✅ API Update successful - Response:", response.data);
// //     return response.data;
// //   } catch (error) {
// //     console.error("❌ API Update failed:", error);
    
// //     if (error.response) {
// //       console.error("🚨 Error response details:", {
// //         status: error.response.status,
// //         data: error.response.data,
// //         headers: error.response.headers
// //       });
// //     } else if (error.request) {
// //       console.error("🚨 No response received:", error.request);
// //     } else {
// //       console.error("🚨 Request setup error:", error.message);
// //     }
    
// //     throw error;
// //   }
// // },

// //   // ==================== ADMIN ENDPOINTS ====================

// //   // 🔐 Admin: Lấy tất cả users
// //   async getAllUsers() {
// //     try {
// //       const { data } = await api.get("/admin/users");
// //       return data;
// //     } catch (error) {
// //       console.error("❌ Lỗi khi lấy danh sách users:", error);
// //       throw error;
// //     }
// //   },

// //   // 🔐 Admin: Xóa user
// //   async deleteUser(userId) {
// //     try {
// //       const { data } = await api.delete(`/admin/users/${userId}`);
// //       return data;
// //     } catch (error) {
// //       console.error("❌ Lỗi khi xóa user:", error);
// //       throw error;
// //     }
// //   },

// //   // ==================== UTILITY METHODS ====================

// //   // 🟢 Kiểm tra xem user có tồn tại không
// //   async checkUserExists(userId) {
// //     try {
// //       await this.getUserById(userId);
// //       return true;
// //     } catch (error) {
// //       return false;
// //     }
// //   },

// // // 🟢 Lấy thông tin user profile đầy đủ - SỬA LẠI ĐỂ NHẤT QUÁN
// // async getUserProfile(userId) {
// //   try {
// //     console.log(`🔍 Getting user profile for ID: ${userId}`);
// //     const userData = await this.getUserById(userId);
    
// //     console.log("📊 Raw API response:", userData);
    
// //     // ✅ Xử lý dữ liệu - ƯU TIÊN snake_case (first_name, last_name)
// //     const processedData = {
// //       // Giữ nguyên toàn bộ dữ liệu gốc
// //       ...userData,
      
// //       // ✅ NHẤT QUÁN: Ưu tiên snake_case
// //       userId: userData.user_id || userData.userId || userId,
// //       user_id: userData.user_id || userData.userId || userId,
      
// //       // ✅ QUAN TRỌNG: Ưu tiên first_name, last_name
// //       first_name: userData.first_name || userData.firstName || "",
// //       last_name: userData.last_name || userData.lastName || "",
      
// //       // ✅ Các field khác
// //       email: userData.email,
// //       mobile_number: userData.mobile_number || userData.mobileNumber,
      
// //       // ✅ Full name để tiện sử dụng
// //       fullName: `${userData.first_name || userData.firstName || ''} ${userData.last_name || userData.lastName || ''}`.trim()
// //     };
    
// //     console.log("✅ Processed user profile:", processedData);
// //     return processedData;
// //   } catch (error) {
// //     console.error("❌ Lỗi khi lấy user profile:", error);
// //     throw error;
// //   }
// // },

// //   // 🟢 Cập nhật profile user
// //   async updateUserProfile(userId, profileData) {
// //     try {
// //       // Format data để gửi lên server
// //       const formattedData = {
// //         first_name: profileData.firstName || profileData.first_name,
// //         last_name: profileData.lastName || profileData.last_name,
// //         mobile_number: profileData.mobileNumber || profileData.mobile_number,
// //         email: profileData.email
// //       };

// //       const result = await this.updateUser(userId, formattedData);
// //       return result;
// //     } catch (error) {
// //       console.error("❌ Lỗi khi cập nhật profile:", error);
// //       throw error;
// //     }
// //   }
// // };

// // export default userService;


// // services/userService.js
// import api from "./api";

// const userService = {
// async getUserById(userId) {
//   try {
//     console.log(`📡 Calling API: /public/users/${userId}`);
//     const response = await api.get(`/public/users/${userId}`);
//     console.log("📨 API Response:", response);
//     console.log("📊 Response data:", response.data);
    
//     // ✅ Kiểm tra cấu trúc dữ liệu trả về
//     if (response.data) {
//       console.log("🔍 Data structure check:", {
//         'hasFirst_name': !!response.data.first_name,
//         'hasFirstName': !!response.data.firstName,
//         'first_name value': response.data.first_name,
//         'firstName value': response.data.firstName,
//         'allKeys': Object.keys(response.data)
//       });
//     }
    
//     return response.data;
//   } catch (error) {
//     console.error("❌ Lỗi khi lấy thông tin user:", error);
    
//     // ✅ Log chi tiết lỗi
//     if (error.response) {
//       console.error("🚨 Error response:", {
//         status: error.response.status,
//         data: error.response.data
//       });
//     }
    
//     throw error;
//   }
// },

//   async getUserProfile(userId) {
//     try {
//       console.log(`📡 Getting user profile for ID: ${userId}`);
//       const response = await api.get(`/public/users/${userId}`);
//       console.log("✅ User profile loaded:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to get user profile:", error);
//       throw error;
//     }
//   },

//   async updateUser(userId, userData) {
//     try {
//       const token = localStorage.getItem("token");
      
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       };

//       const updateData = {
//         first_name: userData.first_name,
//         last_name: userData.last_name,
//         email: userData.email,
//         mobile_number: userData.mobile_number
//       };

//       console.log("💾 Saving to database:", {
//         userId: userId,
//         data: updateData
//       });

//       const response = await api.put(`/public/users/${userId}`, updateData, config);
      
//       console.log("✅ Database save successful:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Database save failed:", error);
//       throw error;
//     }
//   }
// };

// export default userService;

// src/services/userService.js


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