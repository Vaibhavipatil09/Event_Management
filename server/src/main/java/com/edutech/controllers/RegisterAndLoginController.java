package com.edutech.controllers;

import com.edutech.dto.LoginRequest;
import com.edutech.dto.LoginResponse;
import com.edutech.entities.User;
import com.edutech.jwt.JwtUtil;
import com.edutech.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    /*
     * STEP 1 — Send OTP to the email provided at registration.
     * Request body: { "email": "user@example.com", "username": "john" }
     * Returns 200 with message, or 409 if username already taken.
     */
    @PostMapping("/api/user/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String username = body.get("username");
        try {
            userService.sendOtp(email, username);
            return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    /*
     * STEP 2 — Verify OTP and complete registration.
     * Request body: full User JSON + "otp" field.
     * e.g. { "username":"john", "email":"...", "password":"...", "role":"CLIENT", "otp":"123456" }
     */
    @PostMapping("/api/user/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> body) {
        String otp = body.get("otp");

        User user = new User();
        user.setUsername(body.get("username"));
        user.setEmail(body.get("email"));
        user.setPassword(body.get("password"));
        user.setRole(body.get("role"));

        try {
            User registered = userService.verifyOtpAndRegister(user, otp);
            return ResponseEntity.status(201).body(registered);
        } catch (RuntimeException e) {
            // 400 for wrong/expired OTP, 409 for duplicate username
            int status = e.getMessage().contains("taken") ? 409 : 400;
            return ResponseEntity.status(status).body(e.getMessage());
        }
    }

    /*
     * LOGIN — completely unchanged
     */
    @PostMapping("/api/user/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        User user = userService.findByUsername(loginRequest.getUsername());
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new LoginResponse(token, user.getRole(), user.getId()));
    }
}
