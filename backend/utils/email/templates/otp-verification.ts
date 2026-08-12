const otpEmailTemplate = (app_name: string, email: string, expiry_minutes: string,otp: string ) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify Your Account</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#111827; padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:18px; font-weight:700; color:#ffffff; letter-spacing:0.3px;">
                    Sentrik
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:20px; font-weight:600; color:#111827; padding-bottom:12px;">
                    Verify your account
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px; line-height:22px; color:#4b5563; padding-bottom:24px;">
                    Hi there,<br /><br />
                    Use the one-time password (OTP) below to verify the account associated with
                    <strong style="color:#111827;">${email}</strong>. This code is valid for
                    <strong>${expiry_minutes} minutes</strong>.
                  </td>
                </tr>

                <!-- OTP Box -->
                <tr>
                  <td align="center" style="padding:8px 0 24px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color:#f3f4f6; border:1px solid #e5e7eb; border-radius:8px; padding:16px 40px;">
                          <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#111827; font-family:'Courier New', monospace;">
                            ${otp}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="font-size:13px; line-height:20px; color:#6b7280; padding-bottom:8px;">
                    Do not share this code with anyone, including ${app_name} staff. If you did not request this, you can safely ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e5e7eb; padding-top:20px;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px; line-height:18px; color:#9ca3af;">
                    This is an automated message from ${app_name}. Please do not reply to this email.<br />
                    &copy; ${new Date().getFullYear()} ${app_name}. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

export default otpEmailTemplate