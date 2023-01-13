require("dotenv").config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

var nodemailer = require('nodemailer');

module.exports = async function SendEmail(email, name, token) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAINEMAIL,
      pass: process.env.MAINEMAILPASS
    }
  });
  
  var mailOptions = {
    from: process.env.MAINEMAIL,
    to: email,
    subject: 'Forgot password',
    text: `<div>
    //   <strong>Hello ${name} Change your password</strong>
    //   <strong>CLick on change passwod to redirect to the change password page!</strong>
    //   <a href="${process.env.API_URL}/user/verifytoken/${token}">Change password</a>
    //   </div>
    //   `
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}