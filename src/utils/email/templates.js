export const generateEmailHTML = (type, actionUrl) => {
  const subject =
    type === "VERIFY" ? "Verify your email" : "Reset your password";
  const buttonText = type === "VERIFY" ? "Verify Email" : "Reset Password";

  return {
    subject,
    html: `
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
    <div style="padding: 20px 30px; border-bottom: 1px solid #eaeaea; background: linear-gradient(to right, #1a73e8, #4e9ef7); border-top-left-radius: 10px; border-top-right-radius: 10px;">
      <h1 style="margin: 0; color: #fff; font-size: 24px;">${subject}</h1>
    </div>
    <div style="padding: 30px;">
      <p>Hello 👋,</p>
      <p>To <strong>${
        type === "VERIFY" ? "verify your email address" : "reset your password"
      }</strong>, click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #1a73e8; color: #ffffff; padding: 14px 28px; font-size: 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          ${buttonText}
        </a>
      </div>
      <p>If the button doesn't work, use this link:</p>
      <p><a href="${actionUrl}">${actionUrl}</a></p>
      <p style="color: #999;">⚠️ This link will expire in 1 hour.</p>
    </div>
    <div style="padding: 20px 30px; background-color: #f7f9fc; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; text-align: center;">
      <p>If you didn't request this, please ignore this email.</p>
      <p>— The Team</p>
    </div>
  </div>
    `,
  };
};
