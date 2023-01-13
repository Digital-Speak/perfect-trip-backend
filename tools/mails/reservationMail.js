require("dotenv").config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: '', // Change to your recipient
  from: '', // Change to your verified sender
  subject: '',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

module.exports = async function SendEmail() {
  sgMail
  .send(msg)
  .then((response) => {
  })
  .catch((error) => {
    console.error(error)
  })
}