const sgMail = require("@sendgrid/mail");
const config = require("../../config");

exports.sendMail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const mailOptions = {
      from: config.from_mail,
      to,
      subject,
      html,
      attachments,
    };

    if (!attachments.length) delete mailOptions.attachments;
    console.log(mailOptions);
    await sgMail.send(mailOptions);
  } catch (err) {
    console.error(err);
    console.error(err.message);
  }
};
