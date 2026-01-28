// // Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
// package com.ngocanh.anh05.controller;
// import com.ngocanh.anh05.service.OtpService;

// import com.ngocanh.anh05.exceptions.UserNotFoundException;
// import com.ngocanh.anh05.payloads.LoginCredentials;
// import com.ngocanh.anh05.payloads.UserDTO;
// import com.ngocanh.anh05.security.JWTUtil;
// import com.ngocanh.anh05.service.UserService;
// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// import jakarta.validation.Valid;
// import java.util.Collections;
// import java.util.Map;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequestMapping({"/api"})
// @SecurityRequirement(
//    name = "E-Commerce Application"
// )
// @CrossOrigin(
//    origins = {"*"},
//    allowedHeaders = {"*"}
// )
// public class AuthController {
//    @Autowired
//    private UserService userService;
//    @Autowired
//    private JWTUtil jwtUtil;
//    @Autowired
//    private AuthenticationManager authenticationManager;
//    @Autowired
//    private PasswordEncoder passwordEncoder;

//    public AuthController() {
//    }

//    @PostMapping({"/register"})
//    public ResponseEntity<Map<String, Object>> registerHandler(@RequestBody @Valid UserDTO user) throws UserNotFoundException {
//       String encodedPass = this.passwordEncoder.encode(user.getPassword());
//       user.setPassword(encodedPass);
//       UserDTO userDTO = this.userService.registerUser(user);
//       String token = this.jwtUtil.generateToken(userDTO.getEmail());
//       return new ResponseEntity(Collections.singletonMap("jwt-token", token), HttpStatus.CREATED);
//    }

//    @PostMapping({"/login"})
//    public Map<String, Object> loginHandler(@RequestBody @Valid LoginCredentials credentials) {
//       UsernamePasswordAuthenticationToken authCredentials = new UsernamePasswordAuthenticationToken(credentials.getEmail(), credentials.getPassword());
//       this.authenticationManager.authenticate(authCredentials);
//       String token = this.jwtUtil.generateToken(credentials.getEmail());
//       return Collections.singletonMap("jwt-token", token);
//    }

//    @PostMapping("/forgot-password")
//     public ResponseEntity<Map<String, String>> forgotPasswordHandler(@RequestBody Map<String, String> request) {
//         String email = request.get("email");
//         String newPassword = request.get("newPassword");
//         try {
//             UserDTO userDTO = userService.getUserByEmail(email); // Nàng cần thêm hàm này trong UserService
//             String encodedPass = passwordEncoder.encode(newPassword);
//             userService.updatePassword(email, encodedPass); // Nàng cần thêm hàm này trong UserService
//             return new ResponseEntity<>(Collections.singletonMap("message", "Đổi mật khẩu thành công!"), HttpStatus.OK);
//         } catch (Exception e) {
//             return new ResponseEntity<>(Collections.singletonMap("error", "Email không tồn tại!"), HttpStatus.NOT_FOUND);
//         }
//     }

//     @PostMapping("/forgot-password/send-otp")
// public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
//     String email = request.get("email");
//     try {
//         // Kiểm tra xem email có tồn tại trong hệ thống không
//         userService.getUserByEmail(email); 
        
//         String otp = otpService.generateOTP(email);
//         otpService.sendOtpEmail(email, otp);
//         return ResponseEntity.ok(Collections.singletonMap("message", "Mã OTP đã được gửi!"));
//     } catch (Exception e) {
//         return ResponseEntity.status(404).body("Email này chưa đăng ký nàng ơi!");
//     }
// }

// @PostMapping("/forgot-password/verify")
// public ResponseEntity<?> verifyAndReset(@RequestBody Map<String, String> request) {
//     String email = request.get("email");
//     String otp = request.get("otp");
//     String newPassword = request.get("newPassword");

//     if (otpService.validateOTP(email, otp)) {
//         String encodedPass = passwordEncoder.encode(newPassword);
//         userService.updatePassword(email, encodedPass);
//         otpService.clearOTP(email);
//         return ResponseEntity.ok(Collections.singletonMap("message", "Đổi mật khẩu thành công!"));
//     } else {
//         return ResponseEntity.status(400).body("Mã OTP không chính xác!");
//     }
// }
// }
// Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
package com.ngocanh.anh05.controller;

import com.ngocanh.anh05.exceptions.UserNotFoundException;
import com.ngocanh.anh05.payloads.LoginCredentials;
import com.ngocanh.anh05.payloads.UserDTO;
import com.ngocanh.anh05.security.JWTUtil;
import com.ngocanh.anh05.service.UserService;
import com.ngocanh.anh05.service.OtpService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@RestController
@RequestMapping({"/api"})
@SecurityRequirement(
   name = "E-Commerce Application"
)
@CrossOrigin(
   origins = {"*"},
   allowedHeaders = {"*"}
)
public class AuthController {
   @Autowired
   private UserService userService;
   @Autowired
   private JWTUtil jwtUtil;
   @Autowired
   private AuthenticationManager authenticationManager;
   @Autowired
   private PasswordEncoder passwordEncoder;
   @Autowired
   private OtpService otpService;
   public AuthController() {
   }

   // @PostMapping({"/register"})
   // public ResponseEntity<Map<String, Object>> registerHandler(@RequestBody @Valid UserDTO user) throws UserNotFoundException {
   //    String encodedPass = this.passwordEncoder.encode(user.getPassword());
   //    user.setPassword(encodedPass);
   //    UserDTO userDTO = this.userService.registerUser(user);
   //    String token = this.jwtUtil.generateToken(userDTO.getEmail());
   //    return new ResponseEntity(Collections.singletonMap("jwt-token", token), HttpStatus.CREATED);
   // }

   // @PostMapping({"/login"})
   // public Map<String, Object> loginHandler(@RequestBody @Valid LoginCredentials credentials) {
   //    UsernamePasswordAuthenticationToken authCredentials = new UsernamePasswordAuthenticationToken(credentials.getEmail(), credentials.getPassword());
   //    this.authenticationManager.authenticate(authCredentials);
   //    String token = this.jwtUtil.generateToken(credentials.getEmail());
   //    return Collections.singletonMap("jwt-token", token);
   // }

   @PostMapping({"/register"})
public ResponseEntity<Map<String, Object>> registerHandler(@RequestBody @Valid UserDTO user) throws UserNotFoundException {
    String encodedPass = this.passwordEncoder.encode(user.getPassword());
    user.setPassword(encodedPass);
    UserDTO userDTO = this.userService.registerUser(user);

    // ✅ Lấy Role từ userDTO sau khi đăng ký (Giả sử mặc định là USER)
    String role = "USER"; 
    String token = this.jwtUtil.generateToken(userDTO.getEmail(), role);

    Map<String, Object> response = new HashMap<>();
    response.put("jwt-token", token);
    response.put("role", role);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
}

@PostMapping({"/login"})
public Map<String, Object> loginHandler(@RequestBody @Valid LoginCredentials credentials) {
    UsernamePasswordAuthenticationToken authCredentials = 
        new UsernamePasswordAuthenticationToken(credentials.getEmail(), credentials.getPassword());
    
    // 1. Xác thực thành công thì thông tin User (kèm Role) sẽ nằm trong cái Authentication này
    Authentication authentication = this.authenticationManager.authenticate(authCredentials);

    // 2. Lấy Role thực tế từ Database (thông qua Spring Security)
    String role = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst()
            .orElse("USER");

    // 3. Truyền cả Email và Role vào Token
    String token = this.jwtUtil.generateToken(credentials.getEmail(), role);

    // 4. Trả về Map chứa cả Token và Role cho Frontend dễ xử lý
    Map<String, Object> response = new HashMap<>();
    response.put("jwt-token", token);
    response.put("role", role);
    return response;
}
   @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPasswordHandler(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        try {
            UserDTO userDTO = userService.getUserByEmail(email); // Nàng cần thêm hàm này trong UserService
            String encodedPass = passwordEncoder.encode(newPassword);
            userService.updatePassword(email, encodedPass); // Nàng cần thêm hàm này trong UserService
            return new ResponseEntity<>(Collections.singletonMap("message", "Đổi mật khẩu thành công!"), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Collections.singletonMap("error", "Email không tồn tại!"), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/forgot-password/send-otp")
public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
    String email = request.get("email");
    try {
        // Kiểm tra xem email có tồn tại trong hệ thống không
        userService.getUserByEmail(email); 
        
        String otp = otpService.generateOTP(email);
        otpService.sendOtpEmail(email, otp);
        return ResponseEntity.ok(Collections.singletonMap("message", "Mã OTP đã được gửi!"));
    } catch (Exception e) {
        return ResponseEntity.status(404).body("Email này chưa đăng ký nàng ơi!");
    }
}

@PostMapping("/forgot-password/verify")
public ResponseEntity<?> verifyAndReset(@RequestBody Map<String, String> request) {
    String email = request.get("email");
    String otp = request.get("otp");
    String newPassword = request.get("newPassword");

    if (otpService.validateOTP(email, otp)) {
        String encodedPass = passwordEncoder.encode(newPassword);
        userService.updatePassword(email, encodedPass);
        otpService.clearOTP(email);
        return ResponseEntity.ok(Collections.singletonMap("message", "Đổi mật khẩu thành công!"));
    } else {
        return ResponseEntity.status(400).body("Mã OTP không chính xác!");
    }
}
}
