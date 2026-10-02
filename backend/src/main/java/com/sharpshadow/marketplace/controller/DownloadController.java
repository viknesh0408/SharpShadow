package com.sharpshadow.marketplace.controller;

import com.sharpshadow.marketplace.dto.ApiResponse;
import com.sharpshadow.marketplace.dto.DownloadResponse;
import com.sharpshadow.marketplace.dto.PageResponse;
import com.sharpshadow.marketplace.security.UserPrincipal;
import com.sharpshadow.marketplace.service.DownloadService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/downloads")
@RequiredArgsConstructor
public class DownloadController {

    private final DownloadService downloadService;

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<DownloadResponse>> getDownloadUrl(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        String ip = getClientIp(request);
        DownloadResponse response = downloadService.authorizeAndGenerateDownloadUrl(productId, principal.getId(), ip);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/file")
    public ResponseEntity<Resource> downloadFile(
            @RequestParam("file") String file,
            @RequestParam(value = "uid", required = false) Long userId,
            @RequestParam("expires") long expires,
            @RequestParam("filename") String filename,
            @RequestParam("sig") String signature
    ) {
        String decodedFile = URLDecoder.decode(file, StandardCharsets.UTF_8);
        String decodedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8);

        Resource resource = downloadService.serveSecureFile(decodedFile, userId, expires, signature);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + decodedFilename + "\"")
                .body(resource);
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getUserDownloads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        PageResponse<Map<String, Object>> downloads = downloadService.getUserDownloads(principal.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(downloads));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
