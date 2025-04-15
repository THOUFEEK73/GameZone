import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thoufeeknazeerpunalur@gmail.com",
    pass: "umum ecjl rysk oghb",
  },
});

 const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "thoufeeknazeerpunalur@gmail.com",
    to,
    subject,
    text,
  };
  try {
    await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Email sending Failed:", err);
    return;
  }
};


export default sendEmail