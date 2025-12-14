package com.ecommercebackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import java.net.URI;

@Configuration
@RequiredArgsConstructor
public class S3ClientConfig {

    private final S3Config s3Config;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            s3Config.getAccessKey(),
            s3Config.getSecretKey()
        );

        return S3Client.builder()
                .region(Region.of("ru-central1"))
                .endpointOverride(URI.create(s3Config.getEndpoint()))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}