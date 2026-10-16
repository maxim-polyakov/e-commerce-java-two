package com.ecommercebackend.api.controller.preview;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

@RestController
public class OgPreviewController {

  private static final Pattern LANG_QUERY =
      Pattern.compile("(?:^|[?&])lang=([^&#?]+)", Pattern.CASE_INSENSITIVE);
  private static final Set<String> RTL_LANGUAGES = Set.of("ar", "he", "fa", "ur", "yi");

  private final Map<String, Preview> previews;

  @Value("${app.web-public-url:https://ecommerce.baxic.ru}")
  private String webPublicUrl;

  public OgPreviewController(ObjectMapper objectMapper) throws IOException {
    previews = loadPreviews(objectMapper);
  }

  @GetMapping(value = "/og/preview", produces = MediaType.TEXT_HTML_VALUE)
  public ResponseEntity<String> preview(
      HttpServletRequest request,
      @RequestParam(required = false) String lang,
      @RequestParam(required = false) String path) {
    String originalUri = request.getHeader("X-Original-URI");
    String language = resolveLanguage(
        lang,
        languageFromUri(originalUri),
        cookieValue(request, "ecommerce_locale"),
        request.getHeader("Accept-Language"));
    Preview preview = previews.getOrDefault(language, previews.get("en"));
    String targetUrl = targetUrl(path == null || path.isBlank() ? originalUri : path, language);
    String imageUrl = normalizedWebUrl() + "/ecommerce-og-preview-v1.jpg";

    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_HTML)
        .cacheControl(CacheControl.maxAge(java.time.Duration.ofMinutes(5)).cachePublic())
        .varyBy("Accept-Language", "Cookie", "X-Original-URI")
        .body(renderHtml(language, preview, targetUrl, imageUrl));
  }

  private Map<String, Preview> loadPreviews(ObjectMapper objectMapper) throws IOException {
    ClassPathResource resource = new ClassPathResource("ecommerce-previews.json");
    try (InputStream stream = resource.getInputStream()) {
      JsonNode root = objectMapper.readTree(stream).path("previews");
      Map<String, Preview> loaded = new HashMap<>();
      root.fields().forEachRemaining(entry -> loaded.put(
          entry.getKey(),
          new Preview(
              entry.getValue().path("title").asText(),
              entry.getValue().path("description").asText())));
      if (!loaded.containsKey("en")) {
        throw new IOException("English e-commerce preview is missing");
      }
      return Map.copyOf(loaded);
    }
  }

  private String resolveLanguage(String... candidates) {
    for (String candidate : candidates) {
      if (candidate == null || candidate.isBlank()) {
        continue;
      }
      for (String item : candidate.split(",")) {
        String normalized = normalizeLanguage(item.split(";", 2)[0]);
        if (normalized != null) {
          return normalized;
        }
      }
    }
    return "en";
  }

  private String normalizeLanguage(String value) {
    String raw = value == null ? "" : value.trim().replace('_', '-');
    if (raw.isEmpty()) {
      return null;
    }
    if (previews.containsKey(raw)) {
      return raw;
    }
    String lower = raw.toLowerCase();
    if (lower.equals("zh-tw") || lower.equals("zh-hk") || lower.contains("hant")) {
      return "zh-TW";
    }
    if (previews.containsKey(lower)) {
      return lower;
    }
    String shortCode = lower.split("-", 2)[0];
    return previews.containsKey(shortCode) ? shortCode : null;
  }

  private String languageFromUri(String uri) {
    if (uri == null) {
      return null;
    }
    Matcher matcher = LANG_QUERY.matcher(uri);
    return matcher.find()
        ? URLDecoder.decode(matcher.group(1), StandardCharsets.UTF_8)
        : null;
  }

  private String cookieValue(HttpServletRequest request, String name) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) {
      return null;
    }
    for (Cookie cookie : cookies) {
      if (name.equals(cookie.getName())) {
        return cookie.getValue();
      }
    }
    return null;
  }

  private String targetUrl(String originalUri, String language) {
    String path = originalUri == null ? "" : originalUri.trim();
    if (path.isEmpty() || !path.startsWith("/") || path.startsWith("//")
        || path.contains("..") || path.contains("://")) {
      path = "/auth/login";
    }
    if (path.length() > 2048) {
      path = "/auth/login";
    }
    if (!LANG_QUERY.matcher(path).find()) {
      path += (path.contains("?") ? "&" : "?") + "lang=" + language;
    }
    return normalizedWebUrl() + path;
  }

  private String normalizedWebUrl() {
    return webPublicUrl.endsWith("/")
        ? webPublicUrl.substring(0, webPublicUrl.length() - 1)
        : webPublicUrl;
  }

  private String renderHtml(String language, Preview preview, String targetUrl, String imageUrl) {
    String title = HtmlUtils.htmlEscape(preview.title());
    String description = HtmlUtils.htmlEscape(preview.description());
    String page = HtmlUtils.htmlEscape(targetUrl);
    String image = HtmlUtils.htmlEscape(imageUrl);
    String direction = RTL_LANGUAGES.contains(language) ? "rtl" : "ltr";
    String htmlLanguage = language.equals("zh") ? "zh-CN" : language;

    return """
        <!doctype html>
        <html lang="%s" dir="%s">
        <head>
          <meta charset="utf-8">
          <meta property="og:image" content="%s">
          <meta property="og:image:secure_url" content="%s">
          <meta property="og:image:type" content="image/jpeg">
          <meta property="og:image:width" content="1536">
          <meta property="og:image:height" content="864">
          <meta property="og:image:alt" content="%s">
          <meta property="og:type" content="website">
          <meta property="og:site_name" content="Baxic">
          <meta property="og:title" content="%s">
          <meta property="og:description" content="%s">
          <meta property="og:url" content="%s">
          <meta name="description" content="%s">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="%s">
          <meta name="twitter:description" content="%s">
          <meta name="twitter:image" content="%s">
          <link rel="canonical" href="%s">
          <link rel="image_src" href="%s">
          <meta http-equiv="refresh" content="0;url=%s">
          <title>%s</title>
        </head>
        <body><a href="%s">%s</a></body>
        </html>
        """.formatted(
        htmlLanguage, direction, image, image, title, title, description, page, description,
        title, description, image, page, image, page, title, page, title);
  }

  private record Preview(String title, String description) {}
}
