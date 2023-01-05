require("dotenv").config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


module.exports = async function SendEmail(email, name, token) {
  const msg = {
    to: email,
    from: process.env.MAINEMAIL,
    subject: 'Forgot password',
    text: 'Change password',
    html: `<div>
    <strong>Hello ${name} Change your password</strong>
    <strong>Token ${token}</strong>
    <a href="${process.env.API_URL}/user/verifytoken/${token}">Change password</a>
    </div>
    `,
  }
  console.log(msg)
  // sgMail
  //   .send(msg)
  //   .then((response) => {
  //     console.log(response[0].statusCode)
  //     console.log(response[0].headers)
  //   })
  //   .catch((error) => {
  //     console.error(error)
  //   })
}