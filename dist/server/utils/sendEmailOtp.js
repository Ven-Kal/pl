import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();
// SendGrid config
sgMail.setApiKey(process.env.SendGridAPIKey);
console.log("SendGrid API Key:", process.env.SendGridAPIKey);
export async function sendEmailOtp(email, otp) {
    const msg = {
        to: email,
        from: "plingbicycles@gmail.com", // must be a verified sender in SendGrid
        subject: "Your OTP for Registration",
        text: `Your OTP is: ${otp}`,
        html: `<strong>Your OTP is: ${otp}</strong>`,
    };
    await sgMail.send(msg);
}
