import axiosAuth from "utils/request";

export async function getVatReconcile(frDate, toDate) {
  const { data } = await axiosAuth.get(`/api/vatReconcile/${frDate}/${toDate}`);
  return data;
}

export async function addBatchVatReconcile(param) {
  const { data } = await axiosAuth.post(`/api/VatReconcile/batch`, param);
  return data;
}

export async function exportVatReconcile(frDate, toDate) {
  const { data } = await axiosAuth.post(`/api/vatReconcile/export/${frDate}/${toDate}/true`);
  return data;
}

export async function getChequeReconcileList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/chequeReconcile/search`, uriQueryString);
  return data;
}

export async function getEditVatReconcileList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/editVatReconcile/search`, uriQueryString);
  return data;
}

export async function getEditVatReconcileByPrefix(prefix) {
  let q = {
    Limit: 0,
    OrderBy: { Source: "", InvhTInvDt: "", InvhTInvNo: "" },
  };
  const { data } = await axiosAuth.get(`/api/editVatReconcile/prefix/${prefix}?q=${JSON.stringify(q)}`);
  return data;
}

export async function importWhtYearList() {
  const { data } = await axiosAuth.post(`/api/apWhtRecon/import`);
  return data;
}

export async function getWhtReconcileByYearMonth(param) {
  const { data } = await axiosAuth.get(`/api/apWhtRecon/${param.year}/${param.month}`);
  return data;
}

export async function getWhtYearList() {
  const { data } = await axiosAuth.get(`/api/apWhtRecon/year`);
  return data;
}

//---------------------------- Detail ----------------------------//

export async function getEditVatReconcileDetail(Id) {
  const { data } = await axiosAuth.get(`/api/editVatReconcile/${Id}`);
  return data;
}

export async function createEditVatReconcileDetail(param) {
  const { data } = await axiosAuth.post(`/api/editVatReconcile`, param);
  return data;
}

export async function updateEditVatReconcileDetail(param) {
  const { data } = await axiosAuth.put(`/api/editVatReconcile/${param.Id}`, param);
  return data;
}

export async function delEditVatReconcileDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/editVatReconcile/${Id}`);
  return data;
}

export async function createWhtReconcileDetail(param) {
  const { data } = await axiosAuth.post(`/api/apWhtRecon`, param);
  return data;
}

export async function updateWhtReconcileDetail(param) {
  const { data } = await axiosAuth.put(`/api/apWhtRecon/${param.Id}`, param);
  return data;
}

export async function delWhtReconcileDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/apWhtRecon/${Id}`);
  return data;
}

export async function updateChequeReconcile(param) {
  const { data } = await axiosAuth.put(`/api/chequeReconcile`, param);
  return data;
}

//---------------------------- FileFromBank ----------------------------//

export async function getSettingFileFromBank(appyCode) {
  let q = { Limit: 0, WhereRaw: `AppyCode = '${appyCode}'` };
  const { data } = await axiosAuth.get(`/api/gblfilefrombank?q=${JSON.stringify(q)}`);
  return data;
}

export async function uploadFileFromBank(param) {
  const { data } = await axiosAuth.post(`/api/chequeReconcile/fileFromBank`, param);
  return data;
}
