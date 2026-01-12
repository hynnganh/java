// Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
package com.ngocanh.anh05.controller;

import com.ngocanh.anh05.exceptions.UserNotFoundException;
import com.ngocanh.anh05.payloads.LoginCredentials;
import com.ngocanh.anh05.payloads.UserDTO;
import com.ngocanh.anh05.security.JWTUtil;
import com.ngocanh.anh05.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

   public AuthController() {
   }

   @PostMapping({"/register"})
   public ResponseEntity<Map<String, Object>> registerHandler(@RequestBody @Valid UserDTO user) throws UserNotFoundException {
      String encodedPass = this.passwordEncoder.encode(user.getPassword());
      user.setPassword(encodedPass);
      UserDTO userDTO = this.userService.registerUser(user);
      String token = this.jwtUtil.generateToken(userDTO.getEmail());
      return new ResponseEntity(Collections.singletonMap("jwt-token", token), HttpStatus.CREATED);
   }

   @PostMapping({"/login"})
   public Map<String, Object> loginHandler(@RequestBody @Valid LoginCredentials credentials) {
      UsernamePasswordAuthenticationToken authCredentials = new UsernamePasswordAuthenticationToken(credentials.getEmail(), credentials.getPassword());
      this.authenticationManager.authenticate(authCredentials);
      String token = this.jwtUtil.generateToken(credentials.getEmail());
      return Collections.singletonMap("jwt-token", token);
   }
}
