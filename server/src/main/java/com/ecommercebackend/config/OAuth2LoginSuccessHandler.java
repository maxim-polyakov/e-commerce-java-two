package com.ecommercebackend.config;

import com.ecommercebackend.model.LocalUser;
import com.ecommercebackend.model.dao.LocalUserDAO;
import com.ecommercebackend.model.enums.Role;
import com.ecommercebackend.service.JWTService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

/**
 * Обработчик успешного входа через Google OAuth2.
 * Создаёт/находит пользователя, генерирует JWT и редиректит на frontend с code для обмена на JWT.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final LocalUserDAO localUserDAO;
    private final JWTService jwtService;
    private final OAuthCodeStore oauthCodeStore;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            Map<String, Object> attrs = oauth2User.getAttributes();

            String googleId = (String) attrs.get("sub");
            String email = (String) attrs.get("email");
            String name = (String) attrs.get("name");

            if (googleId == null || email == null || email.isBlank()) {
                redirectToFrontendWithError(response, "OAUTH_MISSING_DATA");
                return;
            }

            LocalUser user = localUserDAO.findByGoogleId(googleId)
                    .or(() -> localUserDAO.findByEmailIgnoreCase(email))
                    .orElseGet(() -> createGoogleUser(googleId, email, attrs));

            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setEmailVerified(true);
                localUserDAO.save(user);
            }

            String jwt = jwtService.generateJWT(user);
            if (jwt == null) {
                redirectToFrontendWithError(response, "OAUTH_AUTH_ERROR");
                return;
            }

            String code = oauthCodeStore.put(jwt);
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/login")
                    .queryParam("oauth", "google")
                    .queryParam("code", code)
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            redirectToFrontendWithError(response, "OAUTH_AUTH_ERROR");
        }
    }

    private LocalUser createGoogleUser(String googleId, String email, Map<String, Object> attrs) {
        String givenName = (String) attrs.get("given_name");
        String familyName = (String) attrs.get("family_name");
        if (givenName == null) {
            String name = (String) attrs.get("name");
            if (name != null && !name.isBlank()) {
                String[] parts = name.trim().split("\\s+");
                givenName = parts[0];
                familyName = parts.length > 1 ? parts[1] : null;
            }
        }
        if (givenName == null) {
            givenName = email.split("@")[0];
        }
        String firstName = givenName;
        String lastName = (familyName != null && !familyName.isBlank()) ? familyName : null;

        // Username: если имя из 2 слов — "first last", иначе только first
        String username;
        if (lastName != null && !lastName.isBlank()) {
            username = firstName + " " + lastName;
        } else {
            username = firstName;
        }

        String baseUsername = username;
        int suffix = 1;
        while (localUserDAO.findByUsernameIgnoreCase(username).isPresent()) {
            username = baseUsername + "_" + suffix++;
        }

        LocalUser user = new LocalUser();
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword(null);
        user.setGoogleId(googleId);
        user.setEmailVerified(true);
        user.setRole(Role.USER);
        return localUserDAO.save(user);
    }

    private void redirectToFrontendWithError(HttpServletResponse response, String error) throws IOException {
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/login")
                .queryParam("oauth_error", error)
                .build().toUriString();
        response.sendRedirect(redirectUrl);
    }
}
