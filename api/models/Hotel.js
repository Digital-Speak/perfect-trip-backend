module.exports = class Hotel {

  name = null;
  stars = null;
  city_id = null;
  created_at = null;
  updated_at = null;
  
  constructor({name,stars,city_id, created_at, updated_at}) {
    this.name = name;
    this.stars = stars;
    this.city_id = city_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
