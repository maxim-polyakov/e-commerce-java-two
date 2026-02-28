package com.ecommercebackend.api.security;

import com.ecommercebackend.config.OAuth2LoginSuccessHandler;
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
import com.ecommercebackend.config.UploadConfig;

import java.util.List;

@Configuration
@AllArgsConstructor
public class WebSecurityConfig implements WebMvcConfigurer {

  private JWTRequestFilter jwtRequestFilter;

  private final UploadConfig uploadConfig;

  private final OAuth2LoginSuccessHandler oauth2LoginSuccessHandler;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
      http
          .csrf().disable()
          .cors(cors -> cors.configurationSource(corsConfigurationSource()))
          .addFilterBefore(jwtRequestFilter, AuthorizationFilter.class)
          .oauth2Login(oauth2 -> oauth2.successHandler(oauth2LoginSuccessHandler))
          .authorizeHttpRequests(auth -> auth
              .requestMatchers(
                  "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml",
                  "/v3/api-docs/swagger-config", "/api-docs", "/swagger-ui/**",
                  "/swagger-ui.html", "/swagger-ui/index.html", "/swagger-resources/**",
                  "/webjars/**", "/configuration/**"
              ).permitAll()

              .requestMatchers(
                  "/product", "/auth/register", "/auth/login", "/auth/oauth-token",
                  "/auth/verify", "/auth/forgot", "/auth/reset", "/error",
                  "/oauth2/**", "/login/oauth2/**",
                  "/websocket", "/websocket/**",
                  "/images/**"
              ).permitAll()

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
    String uploadPath = uploadConfig.getUploadDir();

    // Добавляем слеш в конец пути, если его нет
    if (!uploadPath.endsWith("/")) {
      uploadPath += "/";
    }

    System.out.println("🔧 Configuring static resources from: " + uploadPath);

    registry.addResourceHandler("/images/**")
            .addResourceLocations("file:" + uploadPath)
            .setCachePeriod(3600)
            .resourceChain(true);
    }
}