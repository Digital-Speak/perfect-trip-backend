require("dotenv").config();
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
    html: `<div>
       <h1 style="background-color: orange">Perfect trip</h1>
       <strong>Hello ${name}, if you are the one who sent this request click on the link below, else just ignore this email</strong>
       <strong>CLick on change password to be redirected to the change password page!</strong>
       <a href="${process.env.API_URL}/user/verifytoken/${token}">Change password</a>
      </div>
       `
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}