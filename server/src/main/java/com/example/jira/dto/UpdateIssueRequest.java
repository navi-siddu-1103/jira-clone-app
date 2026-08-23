package com.example.jira.dto;

import lombok.Data;

import java.util.Date;

@Data
public class UpdateIssueRequest {
    private String title;
    private String description;
    private String type;
    private String priority;
    private String status;
    private String assignee;
    private Date dueDate;
}
