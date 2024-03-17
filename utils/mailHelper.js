const nodemailer = require("nodemailer");

const mailHelper = ({
  from = "",
  to = "",
  subject = "",
  text = "",
  html = "",
}) => {
  var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "47a21e98850816",
      pass: "a653fe7a03d9f8",
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }

  return main();
};
module.exports = mailHelper;
