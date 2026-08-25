package com.example.jira.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri:mongodb://127.0.0.1:27017/jira_clone}")
    private String rawUri;

    @Override
    protected String getDatabaseName() {
        try {
            ConnectionString connString = new ConnectionString(getSanitizedUri());
            String db = connString.getDatabase();
            return (db != null && !db.trim().isEmpty()) ? db : "jira_clone";
        } catch (Exception e) {
            return "jira_clone";
        }
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        String sanitizedUri = getSanitizedUri();
        ConnectionString connectionString = new ConnectionString(sanitizedUri);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();
        return MongoClients.create(mongoClientSettings);
    }

    private String getSanitizedUri() {
        if (rawUri == null || rawUri.trim().isEmpty()) {
            return "mongodb://127.0.0.1:27017/jira_clone";
        }

        String uri = rawUri.trim();

        try {
            // Test if connection string is already valid
            new ConnectionString(uri);
            return uri;
        } catch (Exception e) {
            // Auto-encode unencoded special characters in credentials
            return autoEncodeUriCredentials(uri);
        }
    }

    private String autoEncodeUriCredentials(String uri) {
        try {
            String prefix = "";
            if (uri.startsWith("mongodb+srv://")) {
                prefix = "mongodb+srv://";
            } else if (uri.startsWith("mongodb://")) {
                prefix = "mongodb://";
            } else {
                return uri;
            }

            String remainder = uri.substring(prefix.length());
            int lastAtIndex = remainder.lastIndexOf('@');
            if (lastAtIndex == -1) {
                return uri;
            }

            String userInfo = remainder.substring(0, lastAtIndex);
            String hostAndParams = remainder.substring(lastAtIndex + 1);

            int firstColon = userInfo.indexOf(':');
            if (firstColon != -1) {
                String username = userInfo.substring(0, firstColon);
                String password = userInfo.substring(firstColon + 1);

                // Replace unencoded special characters in username & password
                String encodedUsername = username.replace("@", "%40");
                String encodedPassword = password.replace("@", "%40")
                                                  .replace("#", "%23")
                                                  .replace("$", "%24")
                                                  .replace("&", "%26")
                                                  .replace("+", "%2B");

                return prefix + encodedUsername + ":" + encodedPassword + "@" + hostAndParams;
            }
        } catch (Exception ex) {
            System.err.println("Failed to auto-sanitize MONGODB_URI: " + ex.getMessage());
        }
        return uri;
    }
}
