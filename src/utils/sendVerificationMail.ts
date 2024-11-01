import { sendMail } from "./sendEmail";

type VerifyEmail = {
  verificationToken: string;
  clientUrl: string;
  email: string;
  username: string;
};

const sendVerificationMail = async ({
  verificationToken,
  clientUrl,
  email,
  username,
}: VerifyEmail) => {

  console.log("hit email verify 1");
  
  const verifyEmailLink = `${clientUrl}/verify-email?token=${encodeURIComponent(
    verificationToken
  )}&email=${encodeURIComponent(email)}`;
  
  const message = `
    <p>Please confirm your email by clicking on the following link: 
    <a href="${verifyEmailLink}">Verify Email</a></p>
  `;

   console.log("hit email verify 2", email, verifyEmailLink);

  return await
    sendMail({
    email,
    subject: "Email Confirmation",
    html: `
      <h4>Hello, ${username}</h4>
      ${message}
    `,
  });
};

export default sendVerificationMail;
