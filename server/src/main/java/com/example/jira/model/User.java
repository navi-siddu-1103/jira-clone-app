package com.example.jira.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private String role = "USER";
    private String group;
    private Date createdAt;
    private Date updatedAt;

    public User(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = "USER";
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public User(String id, String name, String email, String group) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.group = group;
        this.role = "USER";
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}
