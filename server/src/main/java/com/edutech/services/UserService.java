package com.edutech.services;

import com.edutech.entities.Client;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.Staff;
import com.edutech.entities.User;
import com.edutech.repositories.ClientRepository;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.StaffRepository;
import com.edutech.repositories.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final EventPlannerRepository eventPlannerRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       ClientRepository clientRepository,
                       EventPlannerRepository eventPlannerRepository,
                       StaffRepository staffRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.eventPlannerRepository = eventPlannerRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /* =================================================
       REGISTRATION LOGIC
       ================================================= */

    public User registerUser(User user) {

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

    /* =================================================
       SPRING SECURITY (MANDATORY)
       ================================================= */

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = findUserFromAnyRepo(username);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singleton(
                        new SimpleGrantedAuthority(user.getRole())
                )
        );
    }

    /* =================================================
       HELPER METHOD
       ================================================= */

    private User findUserFromAnyRepo(String username) {

        Optional<? extends User> planner =
                eventPlannerRepository.findByUsername(username);
        if (planner.isPresent()) return planner.get();

        Optional<? extends User> client =
                clientRepository.findByUsername(username);
        if (client.isPresent()) return client.get();

        Optional<? extends User> staff =
                staffRepository.findByUsername(username);
        if (staff.isPresent()) return staff.get();

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + username
                        ));
    }

    /* =================================================
       OPTIONAL — USED IN LOGIN CONTROLLER
       ================================================= */

    public User findByUsername(String username) {
        return findUserFromAnyRepo(username);
    }
}