module.exports = class Dossier {
  dossier_num = null;
  starts_at = null;
  ends_at = null;
  circuit_id = null;
  agency_id = null;
  client_id = null;
  created_at = null;
  updated_at = null;

  constructor({ dossier_num, starts_at, ends_at, circuit_id, agency_id, client_id, created_at, updated_at }) {
    this.dossier_num = dossier_num;
    this.starts_at = starts_at;
    this.ends_at = ends_at;
    this.circuit_id = circuit_id;
    this.agency_id = agency_id;
    this.client_id = client_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
