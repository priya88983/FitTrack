import nodemailer from "nodemailer";

export const mailsender = async (subject, content, receiver) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.NODEMAILER_GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MY_MAIL,
      to: receiver,
      subject: subject,
      text: content,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info; // Return info if needed
  } catch (error) {
    console.log("Error sending email:", error);
    throw error; // Let caller handle the error if needed
  }
};
