package com.edutech.services;

import com.edutech.entities.Client;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.Staff;
import com.edutech.entities.User;
import com.edutech.repositories.ClientRepository;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.StaffRepository;
import com.edutech.repositories.UserRepository;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final EventPlannerRepository eventPlannerRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    // In-memory OTP store: email -> OTP string
    // ConcurrentHashMap is thread-safe for concurrent requests
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public UserService(UserRepository userRepository,
            ClientRepository clientRepository,
            EventPlannerRepository eventPlannerRepository,
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.eventPlannerRepository = eventPlannerRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    /*
     * =================================================
     * STEP 1 — Generate OTP and send to email
     * Called by /api/user/send-otp before registration.
     * Throws RuntimeException if username is already taken.
     * =================================================
     */
    public void sendOtp(String email, String username) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken. Please choose a different username.");
        }

        // Generate a 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Store it keyed by email
        otpStore.put(email, otp);

        // Send the email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Eventora — Your Verification Code");
        message.setText(
            "Hello " + username + ",\n\n" +
            "Your Eventora registration OTP is:\n\n" +
            "  " + otp + "\n\n" +
            "This code is valid for this session only.\n" +
            "Do not share it with anyone.\n\n" +
            "— The Eventora Team"
        );
        mailSender.send(message);
    }

    /*
     * =================================================
     * STEP 2 — Verify OTP then save the user
     * Called by /api/user/register after OTP is entered.
     * =================================================
     */
    public User verifyOtpAndRegister(User user, String otp) {
        String stored = otpStore.get(user.getEmail());

        if (stored == null) {
            throw new RuntimeException("OTP expired or not found. Please request a new one.");
        }
        if (!stored.equals(otp)) {
            throw new RuntimeException("Invalid OTP. Please try again.");
        }

        // OTP correct — remove it so it can't be reused
        otpStore.remove(user.getEmail());

        // Proceed with normal registration
        return registerUser(user);
    }

    /*
     * =================================================
     * REGISTRATION LOGIC (unchanged)
     * =================================================
     */
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already taken. Please choose a different username.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if ("PLANNER".equals(user.getRole())) {
            EventPlanner planner = new EventPlanner();
            planner.setUsername(user.getUsername());
            planner.setEmail(user.getEmail());
            planner.setPassword(user.getPassword());
            planner.setRole(user.getRole());
            return eventPlannerRepository.save(planner);
        }

        if ("CLIENT".equals(user.getRole())) {
            Client client = new Client();
            client.setUsername(user.getUsername());
            client.setEmail(user.getEmail());
            client.setPassword(user.getPassword());
            client.setRole(user.getRole());
            return clientRepository.save(client);
        }

        if ("STAFF".equals(user.getRole())) {
            Staff staff = new Staff();
            staff.setUsername(user.getUsername());
            staff.setEmail(user.getEmail());
            staff.setPassword(user.getPassword());
            staff.setRole(user.getRole());
            return staffRepository.save(staff);
        }

        return userRepository.save(user);
    }

    /*
     * =================================================
     * SPRING SECURITY (MANDATORY — unchanged)
     * =================================================
     */
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = findUserFromAnyRepo(username);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singleton(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole())));
    }

    /*
     * =================================================
     * HELPER METHODS (unchanged)
     * =================================================
     */
    private User findUserFromAnyRepo(String username) {

        Optional<? extends User> planner = eventPlannerRepository.findByUsername(username);
        if (planner.isPresent())
            return planner.get();

        Optional<? extends User> client = clientRepository.findByUsername(username);
        if (client.isPresent())
            return client.get();

        Optional<? extends User> staff = staffRepository.findByUsername(username);
        if (staff.isPresent())
            return staff.get();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + username));
    }

    public User findByUsername(String username) {
        return findUserFromAnyRepo(username);
    }
}
