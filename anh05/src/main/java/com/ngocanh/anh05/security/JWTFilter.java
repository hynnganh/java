// // // Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
// // package com.ngocanh.anh05.security;

// // import com.auth0.jwt.exceptions.JWTVerificationException;
// // import com.ngocanh.anh05.service.impl.UserDetailsServiceImpl;
// // import jakarta.servlet.FilterChain;
// // import jakarta.servlet.ServletException;
// // import jakarta.servlet.http.HttpServletRequest;
// // import jakarta.servlet.http.HttpServletResponse;
// // import java.io.IOException;
// // import org.springframework.beans.factory.annotation.Autowired;
// // import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// // import org.springframework.security.core.context.SecurityContextHolder;
// // import org.springframework.security.core.userdetails.UserDetails;
// // import org.springframework.stereotype.Service;
// // import org.springframework.web.filter.OncePerRequestFilter;

// // @Service
// // public class JWTFilter extends OncePerRequestFilter {
// //    @Autowired
// //    private JWTUtil jwtUtil;
// //    @Autowired
// //    private UserDetailsServiceImpl userDetailsServiceImpl;

// //    @Override
// //     protected void doFilterInternal(@SuppressWarnings("null") HttpServletRequest request, @SuppressWarnings("null")
// //     HttpServletResponse response, @SuppressWarnings("null") FilterChain filterChain)
// //                     throws ServletException,IOException{
// //                         String authHeader = request.getHeader("Authorization");
// //                         if (authHeader != null && !authHeader.isBlank() && authHeader.startsWith("Bearer")){
// //                             String jwt = authHeader.substring(7);
// //                             if(jwt == null || jwt.isBlank()){
// //                                 response.sendError(HttpServletResponse.SC_BAD_REQUEST,"Invlaid JWT token in Bearer Header");
// //                             }else{
// //                                 try{
// //                                     String email = jwtUtil.validateTokenAndRetrieveSubject(jwt);
// //                                     UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(email);
// //                                     UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
// //                                             userDetails, userDetails.getPassword(), userDetails.getAuthorities());
// //                                     if (SecurityContextHolder.getContext().getAuthentication() == null){
// //                                         SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
// //                                     }
// //                                     }catch (JWTVerificationException exc){
// //                                         response.sendError(HttpServletResponse.SC_BAD_REQUEST,"Invalid JWT Token");
// //                                 }
// //                             }
// //                         }
// //                         filterChain.doFilter(request,response);
// //                 }
// //             }


// package com.ngocanh.anh05.security;

// import com.auth0.jwt.exceptions.JWTVerificationException;
// import com.ngocanh.anh05.service.impl.UserDetailsServiceImpl;
// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import java.io.IOException;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.stereotype.Service;
// import org.springframework.web.filter.OncePerRequestFilter;

// @Service
// public class JWTFilter extends OncePerRequestFilter {
//     @Autowired
//     private JWTUtil jwtUtil;
//     @Autowired
//     private UserDetailsServiceImpl userDetailsServiceImpl;

//     @Override
//     protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//             throws ServletException, IOException {
//                 String path = request.getRequestURI();
// if (path.startsWith("/api/forgot-password")) {
        
//         filterChain.doFilter(request, response);
//         return; // Dừng xử lý logic Token ở đây
//     }
//         String authHeader = request.getHeader("Authorization");

//         if (authHeader != null && !authHeader.isBlank() && authHeader.startsWith("Bearer ")) {
//             String jwt = authHeader.substring(7);

//             if (jwt == null || jwt.isBlank()) {
//                 response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid JWT token in Bearer Header");
//                 return;
//             } else {
//                 try {
//                     String email = jwtUtil.validateTokenAndRetrieveSubject(jwt);
                    
//                     // Chỉ load user nếu trong Context chưa có xác thực
//                     if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//                         UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(email);

//                         UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                                 userDetails, null, userDetails.getAuthorities());
                        
//                         SecurityContextHolder.getContext().setAuthentication(authToken);
//                     }
//                 } catch (JWTVerificationException exc) {
//                     // Token hết hạn hoặc sai - CHỈ báo lỗi khi người dùng có gửi token nhưng token sai
//                     response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
//                     return;
//                 } catch (Exception e) {
//                     // Các lỗi khác như không tìm thấy User
//                     response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication Failed");
//                     return;
//                 }
//             }
//         }
        
//         // ✅ CỰC KỲ QUAN TRỌNG: Dòng này phải nằm ngoài IF để các request KHÔNG TOKEN (Register/Login) 
//         // có thể đi tiếp tới SecurityConfig và được permitAll() cho phép.
//         filterChain.doFilter(request, response);
//     }
// }

package com.ngocanh.anh05.security;

import com.ngocanh.anh05.service.impl.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

@Service
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    // ❌ BỎ QUA JWT FILTER VỚI API PUBLIC
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/forgot-password")
            || path.startsWith("/api/login")
            || path.startsWith("/api/register")
            || path.startsWith("/api/public");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);

            try {
                String email = jwtUtil.validateTokenAndRetrieveSubject(jwt);

                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails =
                            userDetailsServiceImpl.loadUserByUsername(email);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
