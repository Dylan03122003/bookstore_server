import nodemailer from 'nodemailer';

export async function sendEmail({ sendTo, sendFrom, subject, message, resetPasswordPageURL }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'caodangquocduong2003kg@gmail.com',
      pass: 'qcqxqqbjwhlkzlxp',
    },
  });

  const mailOptions = {
    from: sendFrom,
    to: sendTo,
    subject,
    text: message,
    html: `
        <html>
          <head>
          <style>
          * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
        }
        
        .container {
          max-width: 70%;
          margin: auto;
          margin-top: 20px;
        }
        
        .container .icon {
          display: flex;
          margin: 0 auto;
          width: 3rem;
          margin-top: 1rem;
          margin-bottom: 1.4rem;
        }
        
        .container .title {
          font-size: 2rem;
          margin-bottom: 2rem;
        }
        
        .small-title,
        .title {
          text-align: center;
          font-weight: 100;
          color: #333;
        }
        
        .small-title {
          margin-bottom: 1rem;
        }
        
        .small-container {
          padding: 2rem;
          border: 1px solid #ccc;
          border-radius: 5px;
          color: #333;
        }
        
        .small-title {
          font-size: 24px;
          font-weight: 550;
        }
        
        .small-container p {
          /* line-height: 35px; */
          margin: 10px 0;
          line-height: 25px;
        }
        
        .small-container p:last-child {
          line-height: 25px;
        }
        
        .small-container .reset {
          width: fit-content;
          font-size: 14px;
          font-weight: 600;
          padding: 15px 20px;
          color: #fff;
          background-color: rgba(29, 145, 29, 0.9);
          border: none;
          border-radius: 10px;
          display: block;
          margin: 0 auto;
          text-decoration: none;
        }
        
        .small-container .reset:hover {
          cursor: pointer;
        }
        
        .small-container a {
          color: blue;
        }
        
        .notice {
          color: rgba(51, 51, 51, 0.7);
          font-size: 16px;
          text-align: center;
          padding: 0 15px;
          line-height: 25px;
          margin: 30px 0;
        }
        
        .footer {
          text-align: center;
          color: rgba(51, 51, 51, 0.7);
          font-size: 14px;
          margin-bottom: 30px;
        }
        
        </style>
          </head>
          <body class="container">
          <div class="container">
          <h2 class="title">Reset your Storybound password</h2>
    
          <div class="small-container">
            <h3 class="small-title">Storybound password reset</h3>
            <p>
              We heard that you lost your Storybound password. Sorry about that!
            </p>
            <p>
              But don't worry! You can use the following button to reset your
              password:
            </p>
            <a href="${resetPasswordPageURL}" class="reset">Reset your password</a>
    
            <p>
              Thanks, <br />
              The Storybound Team
            </p>
          </div>
    
          <p class="notice">
            You're receiving this email because a password reset was requested for
            your account.
          </p>
    
          <div class="footer">
            <p>
              Storybound, Inc. - 88 Colin P Kelly Jr Street - San Francisco, CA
              94107
            </p>
          </div>
        </div>
          </body>
        </html>
      `,
  };

  await transporter.sendMail(mailOptions);
}
