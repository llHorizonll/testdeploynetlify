import axiosAuth from "utils/request";

export async function applyStandardJv(date) {
  const { data } = await axiosAuth.post(`/api/glProcedure/applyStandardJv/?atDate=${date}`);
  return data;
}

export async function closePeriodGl() {
  const { data } = await axiosAuth.post(`/api/glProcedure/closePeriod`);
  return data;
}

export async function postAr(fromDate, toDate) {
  const { data } = await axiosAuth.post(`/api/glProcedure/postAr?fromDate=${fromDate}&toDate=${toDate}`);
  return data;
}

export async function postAp(fromDate, toDate) {
  const { data } = await axiosAuth.post(`/api/glProcedure/postAp?fromDate=${fromDate}&toDate=${toDate}`);
  return data;
}

export async function postAssetDepre(fromDate, toDate) {
  const { data } = await axiosAuth.post(`/api/glProcedure/postAssetDepre?fromDate=${fromDate}&toDate=${toDate}`);
  return data;
}

export async function postAssetDisposal(fromDate, toDate) {
  const { data } = await axiosAuth.post(`/api/glProcedure/postAssetDisposal?fromDate=${fromDate}&toDate=${toDate}`);
  return data;
}

//---------------------------- InterfaceBlueledger ----------------------------//

export async function getSettingInterfaceBlueLedgers() {
  const { data } = await axiosAuth.get(`/api/interfaceBlueLedgers/setting`);
  return data;
}

export async function postInventory(param) {
  console.log(param)
  const { data } = await axiosAuth.post(`/api/interfaceBlueLedgers/postInventory`, param);
  return data;
}

export async function postExtraCost(param) {
  console.log(param)
  const { data } = await axiosAuth.post(`/api/interfaceBlueLedgers/postExtraCost`, param);
  return data;
}
