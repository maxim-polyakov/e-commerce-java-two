package com.ecommercebackend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Сервис для верификации Google ID токенов.
 */
@Service
public class GoogleAuthService {

    @Value("${google.client-id}")
    private String clientId;

    /**
     * Верифицирует Google ID token и возвращает payload.
     * @param idToken Google ID token (credential.credential)
     * @return GoogleIdToken.Payload или null если токен невалиден
     */
    public GoogleIdToken.Payload verifyToken(String idToken) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();

        GoogleIdToken token = verifier.verify(idToken);
        return token != null ? token.getPayload() : null;
    }
}
