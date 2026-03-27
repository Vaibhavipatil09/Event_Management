package com.edutech.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entities.Staff;

@Repository
public interface StaffRepository extends JpaRepository <Staff,Long> {

    // write the code here
}
