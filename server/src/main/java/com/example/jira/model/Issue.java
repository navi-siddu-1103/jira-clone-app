package com.example.jira.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "issues")
public class Issue {

    @Id
    @JsonProperty("_id")
    private String id;

    private String title;
    private String description = "";
    private String type = "TASK";
    private String priority = "MEDIUM";
    private String status = "TODO";

    @Field("projectId")
    private Object projectId;

    @Field("assignee")
    private Object assignee;

    private Date dueDate;
    private Date createdAt = new Date();
    private Date updatedAt = new Date();
}
