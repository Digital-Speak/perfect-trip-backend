const User = require("../models/User");
const Crypto = require('crypto')
const knex = require('../../db');
const bcrypt = require("bcrypt");
const sendEmail = require('../../tools/mails/reservationMail');
const forgotPasswordEmail = require('../../tools/mails/forgotPasswordMail');
var sender = require("../../tools/mails/testMail");
const { createAccessToken } = require("../../tools/helpers/createJWTtoken");
const { createJWTRefreshTokencookie } = require("../../tools/helpers/createCookie");
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

function addHours(date, hours) {
  date.setHours(date.getHours() + hours);
  return date;
}

exports.login = async (req, res, next) => {
  try {
    await knex('user')
      .where('email', req.body.email)
      .select("*").then(async (user) => {
        if (user.length === 0) {
          console.log('email does not exist')
          res.status(401).json({
            success: false,
            message: "Authentication error",
          });
        } else {
          await knex('user_mail_validation_token')
            .where({ user_id: user[0].id })
            .del();
          bcrypt.compare(
            req.body.password,
            user[0].password,
            function (err, result) {
              if (err) {
                return res.status(401).json({
                  success: false,
                  message: "Auth infos incorrect",
                });
              }
              if (result) {
                createJWTRefreshTokencookie(res, user)
                const token = createAccessToken(user);
                return res.status(200).json({
                  success: true,
                  message: "Auth successful",
                  email: req.body.email,
                  token
                });
              }
              return res.status(401).json({
                success: false,
                message: "Auth failed",
              });
            }
          );
        }
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

exports.signUp = async (req, res, next) => {
  try {
    await knex('user')
      .where('email', req.body.email)
      .select("*").then((user) => {
        if (user.length === 0) {
          bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const user = new User({ name: req.body.name, email: req.body.email, password: hash, is_admin: req.body.is_admin, created_at: new Date(), updated_at: new Date() });
              await knex('user').insert(user).then((res_) => {
                return res.status(200).json({
                  success: true,
                  message: "User added successfully",
                  user,
                });
              });
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email address already exist",
            email: req.body.email
          });
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error,
    });
  }
};

exports.logOut = async (req, res, next) => {
  try {
    await knex('user')
      .where('id', req.userData.userId)
      .select("*").then(async (user) => {
        if (user.length === 0) {
          console.log('id does not exist')
          res.status(401).json({
            success: false,
            message: "Logout error",
          });
        } else {
          knex('user')
            .where({ id: req.userData.userId })
            .update({ jwt_version_code: parseInt(user[0].jwt_version_code) + 1 }).then(() => {
              return res.status(200).json({
                success: true,
                message: "Logged out successfully"
              });
            });
        }
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

exports.delete_user = async (req, res, next) => {
  try {
    const userData = req.userData;
    if (userData.isAdmin) {
      await knex('user')
        .where('id', req.body.id)
        .select("*").then(async (user) => {
          if (user.length === 0) {
            return res.status(400).json({
              success: false,
              message: "Email address does not exist"
            });
          } else {
            await knex('user')
              .where({ id: req.body.id })
              .del().then(() => {
                return res.status(200).json({
                  success: true,
                  message: "User deleted successfully"
                });
              });
          }
        })
    } else {
      return res.status(400).json({
        success: false,
        message: "You do not have admin priviliges to perform this action"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const userData = req.userData;
    if (userData.isAdmin) {
      await knex('user')
        .select("*")
        .where('is_admin', '=', false)
        .then(async (users) => {
          if (users.length === 0) {
            return res.status(400).json({
              success: false,
              message: "there is no user"
            });
          } else {
            return res.status(200).json({
              success: true,
              users
            });
          }
        })
    } else {
      return res.status(400).json({
        success: false,
        message: "You do not have admin priviliges to perform this action"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const token = Crypto.randomBytes(128).toString('hex');
    await knex('user')
      .select('name', 'id', 'email')
      .where({ email: req.body.email })
      .returning('name', 'id')
      .then(async function (user) {
        if (user.length === 0) {
          return res.status(400).json({
            success: false,
            message: "There is no user with that email address"
          });
        } else {
          await knex('user_mail_validation_token')
            .insert({
              user_id: user[0].id,
              random_token: token,
              created_at: new Date(),
            }).then(async () => {
              await forgotPasswordEmail(user[0].email, user[0].name, token);
              return res.status(200).json({
                success: true,
                message: "An email has been sent"
              });
            })
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.setNewPassword = async (req, res, next) => {
  try {
    await knex('user_mail_validation_token')
      .select("random_token", "created_at", "user_id")
      .where('random_token', '=', req.body.token)
      .then(async (data) => {
        if (data.length === 0) {
          return res.status(400).json({
            success: false,
            message: "token does not exist"
          });
        } else {
          const date = new Date(data[0].created_at);
          const expirationDate = addHours(date, 3);
          if (expirationDate >= new Date()) {
            bcrypt.hash(req.body.password, 10, async (err, hash) => {
              if (err) {
                return res.status(500).json({
                  error: err,
                });
              } else {
                await knex('user')
                  .where({ id: data[0].user_id })
                  .update({ password: hash, updated_at: new Date() })
                  .then(async () => {
                    await knex('user_mail_validation_token')
                      .where('random_token', '=', req.body.token)
                      .del();
                    return res.status(200).json({
                      success: true,
                      message: "password updated successfully",
                    });
                  });
              }
            });
          } else {
            await knex('user_mail_validation_token')
              .where('random_token', '=', req.params.token)
              .del()
              .then(() => {
                res.status(301).redirect(`${process.env.CLIENT_URL}/auth/login?tokenhasexpired=true`);
              })
          }
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.verifyToken = async (req, res, next) => {
  try {
    if (req.params.token) {
      await knex('user_mail_validation_token')
        .select("random_token", "created_at")
        .where('random_token', '=', req.params.token)
        .then(async (data) => {
          if (data.length === 0) {
            return res.status(400).json({
              success: false,
              message: "token does not exist"
            });
          } else {
            const date = new Date(data[0].created_at);
            const expirationDate = addHours(date, 3);
            if (expirationDate >= new Date()) {
              console.log("first");
              res.status(301).redirect(`${process.env.CLIENT_URL}/auth/password/new/${req.params.token}`);
            } else {
              await knex('user_mail_validation_token')
                .where('random_token', '=', req.params.token)
                .del()
                .then(() => {
                  res.status(301).redirect(`${process.env.CLIENT_URL}/auth/login?tokenhasexpired=true`);
                })
            }
          }
        })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.InviteToChannel = async (req, res, next) => {
  try {  
    const session = new StringSession("1BJWap1wBu6ivV8cBph_GPbJN95DVTukNl3Gs1DPfTMa6UP8OOBXnt15FoXszggoTt6_Ei4sB9aUoxuZWfFRYBVA_pwjyv5UN9Xgzb4BSMaWjAzjmYXe5NVTr2CHQA2Yml6bazJgcF77KiVLDRPO-P2CysyhXPIc6MVZ_ZRDX_kwYuUSbYgwtXgCMJa7oXnOK8MJ7UbMh6xgJjptL9lHxMqy2VulJQwp3kcZOdECHrISDoyhpMTCVfgNEUkmR8QOdZ4iUbTCbBsxpQW36qRKrnzlHTfjwC20NiLXQoHadHpWkivN8v0KpbK83yRiRgCw-miuYv1nAvopq70ZZAATOvqzI5zzUhDg="); // You should put your string session here
    const client = new TelegramClient(session, 22343712, '40d2b62388518c0aabf7ac79a82bfc98', {});
    
    (async function run() {
      await client.connect(); // This assumes you have already authenticated with .start()
      const result = await client.invoke(
        new Api.channels.InviteToChannel({
          channel: "testdigitalspeak",
          users: ["moiOrange"],
        })
      );
      console.log(result); // prints the result
      return res.status(200).json({
        result,
      });
    })();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.InviteToPrivateChannel = async (req, res, next) => {
  try {  
    const session = new StringSession("1BJWap1wBu6ivV8cBph_GPbJN95DVTukNl3Gs1DPfTMa6UP8OOBXnt15FoXszggoTt6_Ei4sB9aUoxuZWfFRYBVA_pwjyv5UN9Xgzb4BSMaWjAzjmYXe5NVTr2CHQA2Yml6bazJgcF77KiVLDRPO-P2CysyhXPIc6MVZ_ZRDX_kwYuUSbYgwtXgCMJa7oXnOK8MJ7UbMh6xgJjptL9lHxMqy2VulJQwp3kcZOdECHrISDoyhpMTCVfgNEUkmR8QOdZ4iUbTCbBsxpQW36qRKrnzlHTfjwC20NiLXQoHadHpWkivN8v0KpbK83yRiRgCw-miuYv1nAvopq70ZZAATOvqzI5zzUhDg="); // You should put your string session here
    const client = new TelegramClient(session, 22343712, '40d2b62388518c0aabf7ac79a82bfc98', {});
    
    (async function run() {
      await client.connect(); // This assumes you have already authenticated with .start()
      const result = await client.invoke(
        new Api.channels.InviteToChannel({
          channel: "-1001860288794",
          users: ["moiOrange"],
        })
      );
      console.log(result); // prints the result
      return res.status(200).json({
        result,
      });
    })();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.InviteToGroup = async (req, res, next) => {
  try {  
    const session = new StringSession("1BJWap1wBu6ivV8cBph_GPbJN95DVTukNl3Gs1DPfTMa6UP8OOBXnt15FoXszggoTt6_Ei4sB9aUoxuZWfFRYBVA_pwjyv5UN9Xgzb4BSMaWjAzjmYXe5NVTr2CHQA2Yml6bazJgcF77KiVLDRPO-P2CysyhXPIc6MVZ_ZRDX_kwYuUSbYgwtXgCMJa7oXnOK8MJ7UbMh6xgJjptL9lHxMqy2VulJQwp3kcZOdECHrISDoyhpMTCVfgNEUkmR8QOdZ4iUbTCbBsxpQW36qRKrnzlHTfjwC20NiLXQoHadHpWkivN8v0KpbK83yRiRgCw-miuYv1nAvopq70ZZAATOvqzI5zzUhDg="); // You should put your string session here
    const client = new TelegramClient(session, 22343712, '40d2b62388518c0aabf7ac79a82bfc98', {});
    
    (async function run() {
      await client.connect(); // This assumes you have already authenticated with .start()
      const result = await client.invoke(
        new Api.channels.InviteToChannel({
          channel: "testfunnels",
          users: ["moiOrange"],
        })
      );
      console.log(result); // prints the result
      return res.status(200).json({
        result,
      });
    })();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.InviteToPrivateGroup = async (req, res, next) => {
  try {  
    const session = new StringSession("1BJWap1wBu6ivV8cBph_GPbJN95DVTukNl3Gs1DPfTMa6UP8OOBXnt15FoXszggoTt6_Ei4sB9aUoxuZWfFRYBVA_pwjyv5UN9Xgzb4BSMaWjAzjmYXe5NVTr2CHQA2Yml6bazJgcF77KiVLDRPO-P2CysyhXPIc6MVZ_ZRDX_kwYuUSbYgwtXgCMJa7oXnOK8MJ7UbMh6xgJjptL9lHxMqy2VulJQwp3kcZOdECHrISDoyhpMTCVfgNEUkmR8QOdZ4iUbTCbBsxpQW36qRKrnzlHTfjwC20NiLXQoHadHpWkivN8v0KpbK83yRiRgCw-miuYv1nAvopq70ZZAATOvqzI5zzUhDg="); // You should put your string session here
    const client = new TelegramClient(session, 22343712, '40d2b62388518c0aabf7ac79a82bfc98', {});
    
    (async function run() {
      await client.connect(); // This assumes you have already authenticated with .start()
      const result = await client.invoke(
        new Api.channels.InviteToChannel({
          channel:-1001811938102,
          users: ["hamidelb"],
        })
      );
      console.log(result); // prints the result
      return res.status(200).json({
        result,
      });
    })();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.InviteToPrivateChannelOrGroup = async (req, res, next) => {
  try {  
    console.log(req.body)

    const session = new StringSession(req.body.session);
    const isPrivate = req.body.isPrivate;
    const api_id = req.body.api_id;
    const api_hash = req.body.api_hash;
    const private_channel_or_group_id = req.body.private_channel_or_group_id;
    const client = new TelegramClient(session, api_id, api_hash, {});
    const users = req.body.users;
   
    (async function run() {
      await client.connect(); // This assumes you have already authenticated with .start()
      const result = await client.invoke(
        new Api.channels.InviteToChannel({
          channel: isPrivate? parseFloat(`-100${private_channel_or_group_id}`): private_channel_or_group_id,
          users,
        })
      );
console.log(parseFloat(`-100${private_channel_or_group_id}`))
      return res.status(200).json({
        result,
        data: req.body
      });
    })();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
}

exports.InviteToPublicChannelOrGroup = async (req, res, next) => {
  try {  
    const session = new StringSession(req.body.session);
    const api_id = req.body.api_id;
    const api_hash = req.body.api_hash;
    const private_channel_or_group_id = req.body.private_channel_or_group_id;
    const client = new TelegramClient(session, api_id, api_hash, {});
    const users = req.body.users;
   
    (async function run() {
      await client.connect(); // This assumes you have already authenticated with .start()
      const result = await client.invoke(
        new Api.channels.InviteToChannel({
          channel: `${private_channel_or_group_id}`,
          users,
        })
      );

      return res.status(200).json({
        result,
        data: req.body
      });
    })();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
}
