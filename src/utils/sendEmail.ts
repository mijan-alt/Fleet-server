import nodemailer from "nodemailer";
import { config } from "dotenv";
import { Transporter } from "nodemailer";
import { google } from "googleapis";

config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

oAuth2Client.setCredentials({ refresh_token: refreshToken });

type MailPayload = {
  email: string;
  subject: string;
  html: string;
};
export const sendMail = async (options: MailPayload) => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    service: process.env.SMTP_SERVICE,
    // secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  let mailOptions = {
    from: process.env.SMTP_MAIL as string,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// export const sendMails = async ({email,subject,html}:MailOptions) => {
//   try {
//     const accessToken:any=(await oAuth2Client.getAccessToken())

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: "OAuth2",
//         user: "mijanigoni@gmail.com",
//         clientId: clientId,
//         clientSecret: clientSecret,
//         refreshToken: refreshToken,
//         accessToken: accessToken.token,
//        },
//     })

//     const mailOptions = {
//       from: 'mijanigoni@gmail.com',
//       to: email,
//       subject: subject,
//       html:html
//     }

//     await transporter.sendMail(mailOptions)

//   } catch (error) {
//      return error
//   }
// }
