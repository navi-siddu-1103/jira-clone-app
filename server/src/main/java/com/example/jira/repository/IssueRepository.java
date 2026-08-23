package com.example.jira.repository;

import com.example.jira.model.Issue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends MongoRepository<Issue, String> {
    List<Issue> findByProjectId(Object projectId);
    List<Issue> findAllByOrderByCreatedAtDesc();
}
