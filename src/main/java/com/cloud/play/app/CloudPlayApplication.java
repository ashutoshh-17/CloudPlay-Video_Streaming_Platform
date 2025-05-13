
package com.cloud.play.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CloudPlayApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudPlayApplication.class, args);
    }
}
