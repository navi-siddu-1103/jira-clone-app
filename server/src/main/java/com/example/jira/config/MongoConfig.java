package com.example.jira.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

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

        MongoClientSettings.Builder builder = MongoClientSettings.builder()
                .applyConnectionString(connectionString);

        if (sanitizedUri.startsWith("mongodb+srv://") || sanitizedUri.contains("ssl=true") || sanitizedUri.contains("tls=true")) {
            try {
                TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                        public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                    }
                };

                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

                builder.applyToSslSettings(ssl -> {
                    ssl.enabled(true);
                    ssl.context(sslContext);
                    ssl.invalidHostNameAllowed(true);
                });
            } catch (Exception e) {
                System.err.println("SSL context init warning: " + e.getMessage());
            }
        }

        return MongoClients.create(builder.build());
    }

    private String getSanitizedUri() {
        if (rawUri == null || rawUri.trim().isEmpty()) {
            return "mongodb://127.0.0.1:27017/jira_clone";
        }

        String uri = rawUri.trim();

        // Ensure target database 'jira_clone' is present in URI path
        if (uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://")) {
            try {
                ConnectionString cs = new ConnectionString(uri);
                if (cs.getDatabase() == null || cs.getDatabase().trim().isEmpty()) {
                    int qIdx = uri.indexOf('?');
                    if (qIdx != -1) {
                        String basePath = uri.substring(0, qIdx);
                        String params = uri.substring(qIdx);
                        if (basePath.endsWith("/")) {
                            uri = basePath + "jira_clone" + params;
                        } else {
                            uri = basePath + "/jira_clone" + params;
                        }
                    } else {
                        if (uri.endsWith("/")) {
                            uri = uri + "jira_clone";
                        } else {
                            uri = uri + "/jira_clone";
                        }
                    }
                }
            } catch (Exception ignore) {}
        }

        try {
            new ConnectionString(uri);
            return uri;
        } catch (Exception e) {
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
