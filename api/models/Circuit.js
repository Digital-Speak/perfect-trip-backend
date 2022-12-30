module.exports = class Circuit {

  name = null;
  created_at = null;
  updated_at = null;
  
  constructor({name, created_at, updated_at}) {
    this.name = name;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
