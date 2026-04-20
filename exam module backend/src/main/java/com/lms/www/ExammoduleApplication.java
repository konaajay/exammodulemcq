package com.lms.www;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import java.util.Arrays;

@SpringBootApplication
public class ExammoduleApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExammoduleApplication.class, args);
    }

    @Bean
    public CommandLineRunner logProfiles(Environment env) {
        return args -> {
            System.out.println("ACTIVE PROFILES: " + Arrays.toString(env.getActiveProfiles()));
        };
    }
}
