package com.edutech.entities;

import javax.persistence.*;
import java.io.Serializable;


public class User implements Serializable {

   // write the code here
   @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
   

}

