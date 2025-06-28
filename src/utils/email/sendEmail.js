import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../../models/user.model.js";
import transport from "./transporter.js";
import { generateEmailHTML } from "./templates.js";

export const sendMail = async ({ email, emailType, userId }) => {
  try {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(rawToken, 10);
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

    const tokenField =
      emailType === "VERIFY" ? "emailVerificationToken" : "forgotPasswordToken";
    const expiryField =
      emailType === "VERIFY"
        ? "emailVerificationTokenExpiry"
        : "forgotPasswordTokenExpiry";

    await User.findByIdAndUpdate(userId, {
      $set: {
        [tokenField]: hashedToken,
        [expiryField]: expiry,
      },
    });

    const actionPath =
      emailType === "VERIFY" ? "verifyemail" : "reset-password";
    const actionUrl = `${process.env.FRONTEND_URL}/${actionPath}?token=${rawToken}`;

    const { subject, html } = generateEmailHTML(emailType, actionUrl);

    const mailOptions = {
      from: "ashfaqahmad9958@gmail.com",
      to: email,
      subject,
      html,
    };

    const info = await transport.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
