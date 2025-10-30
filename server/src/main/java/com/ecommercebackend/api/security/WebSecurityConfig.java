package com.ecommercebackend.api.security;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@AllArgsConstructor
public class WebSecurityConfig implements WebMvcConfigurer {

  private JWTRequestFilter jwtRequestFilter;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf().disable()
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .addFilterBefore(jwtRequestFilter, AuthorizationFilter.class)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/product", "/auth/register", "/auth/login",
                "/auth/verify", "/auth/forgot", "/auth/reset", "/error",
                "/websocket", "/websocket/**",
                "/images/**").permitAll() // Разрешаем доступ к изображениям
            .anyRequest().authenticated()
        );

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(List.of("*"));
    configuration.setAllowedMethods(List.of("*"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setExposedHeaders(List.of("*"));
    configuration.setAllowCredentials(false);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  // Добавляем конфигурацию для раздачи статических файлов
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String tmpDir = System.getProperty("java.io.tmpdir");
    String uploadPath;

    // Обрабатываем разные форматы пути
    if (tmpDir.endsWith("/")) {
        uploadPath = tmpDir + "uploads/images/";
    } else {
        uploadPath = tmpDir + "/uploads/images/";
    }

    System.out.println("🔧 Configuring static resources from: " + uploadPath);

    registry.addResourceHandler("/images/**")
            .addResourceLocations("file:" + uploadPath)
            .setCachePeriod(3600)
            .resourceChain(true);
  }
}