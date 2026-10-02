package com.sharpshadow.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
public class EmailService {

    // Optional — app starts fine even if MAIL_USERNAME/PASSWORD are not set.
    // Spring Boot Mail auto-configuration is still active but the sender may
    // fail if credentials are blank; we guard every send attempt below.
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${sharpshadow.mail.from:noreply@sharpshadow.com}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${sharpshadow.app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Sends a password reset email containing a single-use token link.
     * Fires asynchronously so the HTTP response is returned immediately.
     * Silently skips sending if SMTP credentials are not configured.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        if (mailSender == null || mailUsername == null || mailUsername.isBlank()) {
            log.warn("SMTP not configured (MAIL_USERNAME is not set). " +
                     "Password reset email for {} was NOT sent. " +
                     "Set MAIL_USERNAME and MAIL_PASSWORD in Railway to enable emails.", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, "SharpShadow Marketplace");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your SharpShadow Password");

            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            helper.setText(buildResetEmailHtml(userName, resetUrl), true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", toEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            // Log the error but do NOT propagate - the API should still return success
            // to prevent exposing whether an email exists in the system.
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildResetEmailHtml(String userName, String resetUrl) {
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
                """.formatted(userName, resetUrl, resetUrl);
    }
}
