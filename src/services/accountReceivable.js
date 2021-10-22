import axiosAuth from "utils/request";

//---------------------------- List ----------------------------//

export async function getArProfileList() {
  const { data } = await axiosAuth.get(`/api/arProfile?q=${encodeURI("{}")}`);
  return data;
}
export async function getArTitleList() {
  const { data } = await axiosAuth.get(`/api/arTitle?q=${encodeURI("{}")}`);
  return data;
}
export async function getArTypeList() {
  const { data } = await axiosAuth.get(`/api/arType?q=${encodeURI("{}")}`);
  return data;
}
export async function getArProjectList() {
  const { data } = await axiosAuth.get(`/api/arProject?q=${encodeURI("{}")}`);
  return data;
}
export async function getArOwnerList() {
  const { data } = await axiosAuth.get(`/api/arOwner?q=${encodeURI("{}")}`);
  return data;
}

export async function getArContractListByDate(frDate) {
  const { data } = await axiosAuth.get(`/api/arContract/byDate/${frDate}`);
  return data;
}

export async function applyContract(param) {
  const { data } = await axiosAuth.post(`/api/arContract/applyContract`, param);
  return data;
}

//---------------------------- Search ----------------------------//

export async function getArProfileSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/arProfile/search`, uriQueryString);
  return data;
}

export async function getArFolioSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/ArFolio/search`, uriQueryString);
  return data;
}

export async function getArInvoiceSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/arInvoice/search`, uriQueryString);
  return data;
}

export async function getArReceiptSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/arReceipt/search`, uriQueryString);
  return data;
}

export async function getArTypeSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/arType/search`, uriQueryString);
  return data;
}

export async function getArTitleSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/arTitle/search`, uriQueryString);
  return data;
}

export async function getArProjectSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/arProject/search`, uriQueryString);
  return data;
}

export async function getArOwnerSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/arOwner/search`, uriQueryString);
  return data;
}

//---------------------------- Detail ----------------------------//

export async function getArTypeDetail(ArTypeId) {
  const { data } = await axiosAuth.get(`/api/arType/${ArTypeId}`);
  return data;
}

export async function createArTypeDetail(param) {
  const { data } = await axiosAuth.post(`/api/arType`, param);
  return data;
}

export async function updateArTypeDetail(param) {
  const { data } = await axiosAuth.put(`/api/arType/${param.ArTypeId}`, param);
  return data;
}

export async function delArTypeDetail(ArTypeId) {
  const { data } = await axiosAuth.delete(`/api/arType/${ArTypeId}`);
  return data;
}

export async function getArTitleDetail(ArTitleId) {
  const { data } = await axiosAuth.get(`/api/arTitle/${ArTitleId}`);
  return data;
}

export async function createArTitleDetail(param) {
  const { data } = await axiosAuth.post(`/api/arTitle`, param);
  return data;
}

export async function updateArTitleDetail(param) {
  const { data } = await axiosAuth.put(`/api/arTitle/${param.ArTitleId}`, param);
  return data;
}

export async function delArTitleDetail(ArTitleId) {
  const { data } = await axiosAuth.delete(`/api/arTitle/${ArTitleId}`);
  return data;
}

export async function getArProjectDetail(ArPrjId) {
  const { data } = await axiosAuth.get(`/api/arProject/${ArPrjId}`);
  return data;
}

export async function createArProjectDetail(param) {
  const { data } = await axiosAuth.post(`/api/arProject`, param);
  return data;
}

export async function updateArProjectDetail(param) {
  const { data } = await axiosAuth.put(`/api/arProject/${param.ArPrjId}`, param);
  return data;
}

export async function delArProjectDetail(ArPrjId) {
  const { data } = await axiosAuth.delete(`/api/arProject/${ArPrjId}`);
  return data;
}

export async function getArOwnerDetail(ArOwnerId) {
  const { data } = await axiosAuth.get(`/api/arOwner/${ArOwnerId}`);
  return data;
}

export async function createArOwnerDetail(param) {
  const { data } = await axiosAuth.post(`/api/arOwner`, param);
  return data;
}

export async function updateArOwnerDetail(param) {
  const { data } = await axiosAuth.put(`/api/arOwner/${param.ArOwnerId}`, param);
  return data;
}

export async function delArOwnerDetail(ArOwnerId) {
  const { data } = await axiosAuth.delete(`/api/arOwner/${ArOwnerId}`);
  return data;
}

export async function getArProfileDetail(Id) {
  const { data } = await axiosAuth.get(`/api/arProfile/${Id}`);
  if (data?.ContractDetail?.length > 0) {
    data?.ContractDetail?.forEach((i, idx) => {
      i.index = idx
      i?.Detail?.forEach((ii, idy) => {
        ii.index = idy
      });
    });
  }
  return data;
}

export async function createArProfileDetail(param) {
  const { data } = await axiosAuth.post(`/api/arProfile`, param);
  return data;
}

export async function updateArProfileDetail(param) {
  const { data } = await axiosAuth.put(`/api/arProfile/${param.ArProfileId}`, param);
  return data;
}

export async function delArProfileDetail(ArProfileId) {
  const { data } = await axiosAuth.delete(`/api/arProfile/${ArProfileId}`);
  return data;
}

export async function getArInvoiceDetail(Id) {
  const { data } = await axiosAuth.get(`/api/arInvoice/${Id}`);
  if (data?.Detail?.length > 0) {
    data.Detail.forEach((i, idx) => (i.index = idx));
  }
  return data;
}

export async function getArInvoiceUnpaid(arCode) {
  const { data } = await axiosAuth.get(`/api/arInvoice/unpaid?arCode=${arCode}`);
  return data;
}

export async function createArInvoiceDetail(param) {
  const { data } = await axiosAuth.post(`/api/arInvoice`, param);
  return data;
}

export async function updateArInvoiceDetail(param) {
  const { data } = await axiosAuth.put(`/api/arInvoice/${param.InvhSeq}`, param);
  return data;
}

export async function delArInvoiceDetail(InvhSeq) {
  const { data } = await axiosAuth.delete(`/api/arInvoice/${InvhSeq}`);
  return data;
}

export async function getArReceiptDetail(Id) {
  const { data } = await axiosAuth.get(`/api/arReceipt/${Id}`);
  if (data?.Detail?.length > 0) {
    data.Detail.forEach((i, idx) => (i.index = idx));
  }
  return data;
}

export async function createArReceiptDetail(param) {
  const { data } = await axiosAuth.post(`/api/arReceipt`, param);
  return data;
}

export async function updateArReceiptDetail(param) {
  const { data } = await axiosAuth.put(`/api/arReceipt/${param.RcpthSeq}`, param);
  return data;
}

export async function delArReceiptDetail(RcpthSeq) {
  const { data } = await axiosAuth.delete(`/api/arReceipt/${RcpthSeq}`);
  return data;
}

//---------------------------- Check Duplicate Contract No ----------------------------//

export async function checkDuplicateContract(contractNo) {
  const { data } = await axiosAuth.get(`/api/arContract/checkDuplicateContractNo/${contractNo}`);
  return data;
}
