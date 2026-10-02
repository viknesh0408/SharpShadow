package com.sharpshadow.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private ObjectMapper objectMapper;

    @Value("${sharpshadow.mail.from:noreply@sharpshadow.com}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${sharpshadow.mail.brevo-api-key:}")
    private String brevoApiKey;

    @Value("${sharpshadow.mail.resend-api-key:}")
    private String resendApiKey;

    @Value("${sharpshadow.app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private ObjectMapper getObjectMapper() {
        return objectMapper != null ? objectMapper : new ObjectMapper();
    }

    /**
     * Sends a password reset email containing a single-use token link.
     * Fires asynchronously so the HTTP response is returned immediately.
     * Supports:
     * 1. Brevo HTTP API (recommended on Railway — port 443 is never blocked)
     * 2. Resend HTTP API
     * 3. Standard SMTP (fails on Railway Free/Hobby plans due to port 587 block)
     * Always logs the reset link to stdout as a fallback.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

        // Fail-safe log: Always print the reset link in the server logs so the admin can test immediately!
        log.info("================================================================================");
        log.info("🔑 [PASSWORD RESET LINK GENERATED]");
        log.info("   Recipient: {}", toEmail);
        log.info("   Reset URL: {}", resetUrl);
        log.info("================================================================================");

        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevo(toEmail, userName, resetUrl);
        } else if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendViaResend(toEmail, userName, resetUrl);
        } else if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            sendViaSmtp(toEmail, userName, resetUrl);
        } else {
            log.warn("⚠️ No active email delivery service configured! " +
                     "Railway blocks outbound SMTP ports 25, 465, and 587 on Free/Hobby plans. " +
                     "To send real emails, add BREVO_API_KEY to your Railway backend variables. " +
                     "Meanwhile, copy the reset URL from the log above.");
        }
    }

    private void sendViaBrevo(String toEmail, String userName, String resetUrl) {
        try {
            log.info("Sending password reset email to {} via Brevo HTTPS API...", toEmail);
            String senderEmail = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : fromAddress;

            String html = buildResetEmailHtml(userName, resetUrl);
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", "SharpShadow Marketplace", "email", senderEmail),
                    "to", List.of(Map.of("email", toEmail, "name", userName != null && !userName.isBlank() ? userName : "Valued Customer")),
                    "subject", "Reset Your SharpShadow Password",
                    "htmlContent", html
            );

            String jsonBody = getObjectMapper().writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey.trim())
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✅ Password reset email successfully sent via Brevo to {}. Response: {}", toEmail, response.body());
            } else {
                log.error("❌ Failed to send email via Brevo. HTTP Status: {}, Response: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("❌ Exception while sending email via Brevo: {}", e.getMessage(), e);
        }
    }

    private void sendViaResend(String toEmail, String userName, String resetUrl) {
        try {
            log.info("Sending password reset email to {} via Resend HTTPS API...", toEmail);
            String html = buildResetEmailHtml(userName, resetUrl);
            String from = "SharpShadow <onboarding@resend.dev>";

            Map<String, Object> payload = Map.of(
                    "from", from,
                    "to", List.of(toEmail),
                    "subject", "Reset Your SharpShadow Password",
                    "html", html
            );

            String jsonBody = getObjectMapper().writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✅ Password reset email successfully sent via Resend to {}. Response: {}", toEmail, response.body());
            } else {
                log.error("❌ Failed to send email via Resend. HTTP Status: {}, Response: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("❌ Exception while sending email via Resend: {}", e.getMessage(), e);
        }
    }

    private void sendViaSmtp(String toEmail, String userName, String resetUrl) {
        try {
            log.info("Attempting to send password reset email to {} via SMTP user {}", toEmail, mailUsername);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String displayName = "SharpShadow Marketplace";
            helper.setFrom(mailUsername, displayName);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your SharpShadow Password");
            helper.setText(buildResetEmailHtml(userName, resetUrl), true);

            mailSender.send(message);
            log.info("✅ Password reset email sent successfully via SMTP to {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Failed to send password reset email to {} via SMTP: {}. " +
                      "(Note: Railway blocks outbound SMTP ports 25, 465, and 587 on Free/Hobby plans. " +
                      "Please use BREVO_API_KEY to send emails reliably over HTTPS.)", toEmail, e.getMessage());
        }
    }

    private String buildResetEmailHtml(String userName, String resetUrl) {
        String safeName = (userName != null && !userName.isBlank()) ? userName : "there";
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%%;">

                          <!-- Header -->
                          <tr>
                            <td align="center" style="padding-bottom:32px;">
                              <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                                Sharp<span style="color:#ef4444;">Shadow</span>
                              </span>
                            </td>
                          </tr>

                          <!-- Card -->
                          <tr>
                            <td style="background:#18181b;border:1px solid #27272a;border-radius:20px;padding:40px 36px;">

                              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#ef4444;letter-spacing:2px;text-transform:uppercase;font-family:monospace;">
                                Security Notice
                              </p>
                              <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#fff;">
                                Reset Your Password
                              </h1>
                              <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;line-height:1.6;">
                                Hi %s,<br><br>
                                We received a request to reset the password for your SharpShadow account.
                                Click the button below to choose a new password. This link is valid for
                                <strong style="color:#fff;">30 minutes</strong>.
                              </p>

                              <!-- CTA Button -->
                              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                                <tr>
                                  <td style="background:linear-gradient(135deg,#dc2626,#ef4444);border-radius:12px;">
                                    <a href="%s"
                                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;
                                              color:#fff;text-decoration:none;letter-spacing:0.3px;border-radius:12px;">
                                      Reset My Password →
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <!-- Fallback URL -->
                              <p style="margin:0 0 8px;font-size:12px;color:#71717a;">
                                If the button doesn't work, copy and paste this URL into your browser:
                              </p>
                              <p style="margin:0 0 28px;font-size:11px;color:#52525b;word-break:break-all;font-family:monospace;
                                         background:#09090b;padding:10px 14px;border-radius:8px;border:1px solid #27272a;">
                                %s
                              </p>

                              <!-- Security Note -->
                              <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;">
                                <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
                                  🔒 <strong style="color:#a1a1aa;">Didn't request this?</strong>
                                  You can safely ignore this email — your password will not be changed
                                  unless you click the button above. If you're concerned about account
                                  security, please contact us immediately.
                                </p>
                              </div>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td align="center" style="padding-top:28px;">
                              <p style="margin:0;font-size:11px;color:#52525b;">
                                © 2025 SharpShadow Marketplace. All rights reserved.<br>
                                This is an automated security email — please do not reply.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(safeName, resetUrl, resetUrl);
    }

    /**
     * Sends an email verification OTP to the user's inbox to verify account ownership.
     */
    @Async
    public void sendEmailVerificationOtp(String toEmail, String userName, String otp) {
        String encodedEmail = URLEncoder.encode(toEmail, StandardCharsets.UTF_8);
        String verifyUrl = frontendUrl + "/verify-email?email=" + encodedEmail + "&otp=" + otp;

        log.info("================================================================================");
        log.info("🔐 [EMAIL VERIFICATION OTP GENERATED]");
        log.info("   Recipient:   {}", toEmail);
        log.info("   OTP Code:    {}", otp);
        log.info("   Verify URL:  {}", verifyUrl);
        log.info("   Expires:     15 minutes");
        log.info("================================================================================");

        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendOtpViaBrevo(toEmail, userName, otp, verifyUrl);
        } else if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendOtpViaResend(toEmail, userName, otp, verifyUrl);
        } else if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            sendOtpViaSmtp(toEmail, userName, otp, verifyUrl);
        } else {
            log.warn("⚠️ No active email delivery service configured! Brevo API key is not set. " +
                     "The verification code has been logged to the console above for testing.");
        }
    }

    private void sendOtpViaBrevo(String toEmail, String userName, String otp, String verifyUrl) {
        try {
            log.info("Sending email verification OTP to {} via Brevo HTTPS API...", toEmail);
            String senderEmail = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : fromAddress;

            String html = buildOtpEmailHtml(userName, toEmail, otp, verifyUrl);
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", "SharpShadow Marketplace", "email", senderEmail),
                    "to", List.of(Map.of("email", toEmail, "name", userName != null && !userName.isBlank() ? userName : "Customer")),
                    "subject", otp + " is your SharpShadow verification code",
                    "htmlContent", html
            );

            String jsonBody = getObjectMapper().writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey.trim())
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✅ Verification OTP email successfully sent via Brevo to {}. Response: {}", toEmail, response.body());
            } else {
                log.error("❌ Failed to send OTP email via Brevo. HTTP Status: {}, Response: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("❌ Exception while sending OTP email via Brevo: {}", e.getMessage(), e);
        }
    }

    private void sendOtpViaResend(String toEmail, String userName, String otp, String verifyUrl) {
        try {
            log.info("Sending email verification OTP to {} via Resend HTTPS API...", toEmail);
            String html = buildOtpEmailHtml(userName, toEmail, otp, verifyUrl);
            String from = "SharpShadow <onboarding@resend.dev>";

            Map<String, Object> payload = Map.of(
                    "from", from,
                    "to", List.of(toEmail),
                    "subject", otp + " is your SharpShadow verification code",
                    "html", html
            );

            String jsonBody = getObjectMapper().writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✅ Verification OTP email successfully sent via Resend to {}. Response: {}", toEmail, response.body());
            } else {
                log.error("❌ Failed to send OTP email via Resend. HTTP Status: {}, Response: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("❌ Exception while sending OTP email via Resend: {}", e.getMessage(), e);
        }
    }

    private void sendOtpViaSmtp(String toEmail, String userName, String otp, String verifyUrl) {
        try {
            log.info("Attempting to send verification OTP to {} via SMTP user {}", toEmail, mailUsername);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String displayName = "SharpShadow Marketplace";
            helper.setFrom(mailUsername, displayName);
            helper.setTo(toEmail);
            helper.setSubject(otp + " is your SharpShadow verification code");
            helper.setText(buildOtpEmailHtml(userName, toEmail, otp, verifyUrl), true);

            mailSender.send(message);
            log.info("✅ Verification OTP email sent successfully via SMTP to {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Failed to send verification OTP email to {} via SMTP: {}", toEmail, e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String userName, String toEmail, String otp, String verifyUrl) {
        String safeName = (userName != null && !userName.isBlank()) ? userName : "there";
        String manualUrl = frontendUrl + "/verify-email";
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                </head>
                <body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%%;">

                          <!-- Header -->
                          <tr>
                            <td align="center" style="padding-bottom:32px;">
                              <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                                Sharp<span style="color:#ef4444;">Shadow</span>
                              </span>
                            </td>
                          </tr>

                          <!-- Card -->
                          <tr>
                            <td style="background:#18181b;border:1px solid #27272a;border-radius:20px;padding:40px 36px;">

                              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#ef4444;letter-spacing:2px;text-transform:uppercase;font-family:monospace;">
                                Account Security
                              </p>
                              <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#fff;">
                                Verify Your Email Address
                              </h1>
                              <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;line-height:1.6;">
                                Hi %s,<br><br>
                                Welcome to SharpShadow! To activate your account and complete your signup, click the button below or enter the 6-digit code:
                              </p>

                              <!-- OTP Code Display -->
                              <div style="background:#09090b;border:2px dashed #ef4444;border-radius:16px;padding:24px 20px;text-align:center;margin:0 0 24px;">
                                <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:1px;">
                                  Your 6-Digit Code
                                </p>
                                <div style="font-size:38px;font-weight:900;letter-spacing:12px;color:#ffffff;font-family:Consolas, Monaco, 'Courier New', monospace;padding-left:12px;">
                                  %s
                                </div>
                                <p style="margin:12px 0 0;font-size:12px;color:#ef4444;font-weight:600;">
                                  ⏱️ Code expires in 15 minutes
                                </p>
                              </div>

                              <!-- 1-Click Verification Button -->
                              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%%;">
                                <tr>
                                  <td align="center">
                                    <table cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td style="background:linear-gradient(135deg,#dc2626,#ef4444);border-radius:12px;">
                                          <a href="%s"
                                             style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;
                                                    color:#fff;text-decoration:none;letter-spacing:0.3px;border-radius:12px;">
                                            Verify Email Automatically →
                                          </a>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>

                              <!-- Manual URL instructions -->
                              <p style="margin:0 0 6px;font-size:12px;color:#71717a;text-align:center;">
                                Or enter your code manually at:
                              </p>
                              <p style="margin:0 0 24px;font-size:12px;color:#a1a1aa;text-align:center;">
                                <a href="%s" style="color:#ef4444;text-decoration:underline;">%s</a>
                              </p>

                              <!-- Security Note -->
                              <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;">
                                <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
                                  🔒 <strong style="color:#a1a1aa;">Didn't create this account?</strong>
                                  If you did not register on SharpShadow, please ignore this email. No account will be activated without this verification.
                                </p>
                              </div>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td align="center" style="padding-top:28px;">
                              <p style="margin:0;font-size:11px;color:#52525b;">
                                © 2025 SharpShadow Marketplace. All rights reserved.<br>
                                This is an automated security email — please do not reply.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(safeName, otp, verifyUrl, manualUrl, manualUrl);
    }
}
