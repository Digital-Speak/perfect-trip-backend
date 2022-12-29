module.exports = class User {

  name = null;
  email = null;
  password = null;
  is_admin = null;
  created_at = null;
  updated_at = null;
  
  constructor({name, email, password,is_admin, created_at, updated_at}) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.is_admin = is_admin;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
