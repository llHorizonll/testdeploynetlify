import axiosAuth from "utils/request";

//---------------------------- Setting ----------------------------//

export async function getSettingInfGuestLine() {
  const { data } = await axiosAuth.get(`/api/interfaceGuestLine/setting`);
  return data;
}

export async function getSettingInfOpera() {
  const { data } = await axiosAuth.get(`/api/interfaceOpera/setting`);
  return data;
}

export async function getSettingInfHotelogix() {
  const { data } = await axiosAuth.get(`/api/interfaceHotelogix/setting`);
  return data;
}

//---------------------------- Mapping ----------------------------//

export async function getMappingGuestLine() {
  const { data } = await axiosAuth.get(`/api/interfaceGuestLine/setting/mapping`);
  return data;
}

export async function updateMappingGuestLine(param) {
  //typeof param === System.Data.DataTable
  const { data } = await axiosAuth.put(`/api/interfaceGuestLine/setting/mapping`, param);
  return data;
}

export async function getMappingHotelogix() {
  const { data } = await axiosAuth.get(`/api/interfaceHotelogix/setting/mapping`);
  return data;
}

export async function updateMappingHotelogix(param) {
  //typeof param === System.Data.DataTable
  const { data } = await axiosAuth.put(`/api/interfaceHotelogix/setting/mapping`, param);
  return data;
}

//---------------------------- Post ----------------------------//

export async function uploadFileHotelogix(param) {
  const { data } = await axiosAuth.post(`api/interfaceHotelogix/uploadfile`, param);
  return data;
}

export async function postGuestLine(param) {
  const { data } = await axiosAuth.post(`api/interfaceGuestLine/postGl`, param);
  return data;
}

export async function postHotelogix(param) {
  const { data } = await axiosAuth.post(`api/arFolio/InterfaceData`, param);
  return data;
}
