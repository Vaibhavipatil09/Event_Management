package com.edutech.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entities.Staff;

@Repository
public interface StaffRepository extends JpaRepository <Staff,Long> {

    Optional<Staff> findByUsername(String username);
}
