package com.ecommercebackend.api.controller.preview;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

class OgPreviewControllerTest {

  private OgPreviewController controller;

  @BeforeEach
  void setUp() throws Exception {
    controller = new OgPreviewController(new ObjectMapper());
    ReflectionTestUtils.setField(controller, "webPublicUrl", "https://ecommerce.baxic.ru");
  }

  @Test
  void usesLanguageFromOriginalPublicUrl() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.addHeader("X-Original-URI", "/login?lang=de");

    ResponseEntity<String> response = controller.preview(request, null, null);
    String html = response.getBody();

    assertTrue(html.contains("<html lang=\"de\""));
    assertTrue(html.contains("Baxic — Online-Shop"));
    assertTrue(html.contains("https://ecommerce.baxic.ru/login?lang=de"));
    assertFalse(html.contains("__"));
  }

  @Test
  void supportsRtlAndFallsBackToBrowserLanguage() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.addHeader("Accept-Language", "ar-SA,ar;q=0.9,en;q=0.8");

    String html = controller.preview(request, null, null).getBody();

    assertTrue(html.contains("<html lang=\"ar\" dir=\"rtl\">"));
    assertTrue(html.contains("lang=ar"));
  }

  @Test
  void rejectsExternalOriginalUrls() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.addHeader("X-Original-URI", "//evil.example/path?lang=ja");

    String html = controller.preview(request, "ja", null).getBody();

    assertTrue(html.contains("https://ecommerce.baxic.ru/login?lang=ja"));
    assertFalse(html.contains("evil.example"));
  }

  @Test
  void directPreviewLinkRedirectsToRequestedReactPath() {
    MockHttpServletRequest request = new MockHttpServletRequest();

    String html = controller.preview(request, "de", "/product/42?tab=details").getBody();

    assertTrue(html.contains(
        "https://ecommerce.baxic.ru/product/42?tab=details&amp;lang=de"));
  }
}
