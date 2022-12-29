require("dotenv").config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

templates = {
    test: "d-44b652b204c24005ac68ccf22734b8bd",
};
function sendEmail(data) {
   const msg = {
      //extract the email details
      to: data.receiver,
      from: data.sender,
      templateId: templates[data.templateName],
      //extract the custom fields 
      dynamic_template_data: {
         name: data.name,
      }
    };
    //send the email
    sgMail.send(msg, (error, result) => {
      if (error) {
          console.log(error);
      } else {
          console.log("That's wassup!");
      }
    });
}
exports.sendEmail = sendEmail;