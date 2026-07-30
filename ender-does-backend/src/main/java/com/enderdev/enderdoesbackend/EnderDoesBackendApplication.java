package com.enderdev.enderdoesbackend;

import com.enderdev.enderdoesbackend.user.models.Role;
import com.enderdev.enderdoesbackend.user.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.ZoneId;
import java.util.TimeZone;

@SpringBootApplication
public class EnderDoesBackendApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(EnderDoesBackendApplication.class, args);
    }
    @Bean
	public CommandLineRunner runner(RoleRepository roleRepository) {
		return args -> {
			if(roleRepository.findByName ("USER").isEmpty ()){
				roleRepository.save (
						Role.builder ()
								.name ("USER")
								.build ()
				);
			}
		};
	}

}
