module.exports = class Client {

  ref_client = null;
  name = null;
  category = null;
  created_at = null;
  updated_at = null;
  
  constructor({ref_client,name,category, created_at, updated_at}) {
    this.ref_client = ref_client;
    this.name = name;
    this.category = category;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
