import axiosAuth from "utils/request";

//---------------------------- List ----------------------------//

export async function getApVendorList() {
  const { data } = await axiosAuth.get(`/api/vendor?q=${encodeURI("{}")}`);
  return data;
}

//---------------------------- Search ----------------------------//

export async function getApVendorSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/vendor/search`, uriQueryString);
  return data;
}

export async function getApInvoiceSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/apInvoice/search`, uriQueryString);
  return data;
}

export async function getApPaymentSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/apPayment/search`, uriQueryString);
  return data;
}

export async function getApWhtServiceSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/apWht/search`, uriQueryString);
  return data;
}

export async function getApWhtTypeSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/apWhtType/search`, uriQueryString);
  return data;
}

//---------------------------- Detail ----------------------------//

export async function getWhtTypeDetail(Id) {
  const { data } = await axiosAuth.get(`/api/apWhtType/${Id}`);
  return data;
}

export async function createWhtTypeDetail(param) {
  const { data } = await axiosAuth.post(`/api/apWhtType`, param);
  return data;
}

export async function updateWhtTypeDetail(param) {
  const { data } = await axiosAuth.put(`/api/apWhtType/${param.Id}`, param);
  return data;
}

export async function delWhtTypeDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/apWhtType/${Id}`);
  return data;
}

export async function getWhtServiceDetail(Id) {
  const { data } = await axiosAuth.get(`/api/apWht/${Id}`);
  return data;
}

export async function createWhtServiceDetail(param) {
  const { data } = await axiosAuth.post(`/api/apWht`, param);
  return data;
}

export async function updateWhtServiceDetail(param) {
  const { data } = await axiosAuth.put(`/api/apWht/${param.Id}`, param);
  return data;
}

export async function delWhtServiceDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/apWht/${Id}`);
  return data;
}

export async function getVendorDetail(Id) {
  const { data } = await axiosAuth.get(`/api/vendor/${Id}`);
  return data;
}

export async function createVendorDetail(param) {
  const { data } = await axiosAuth.post(`/api/vendor`, param);
  return data;
}

export async function updateVendorDetail(param) {
  const { data } = await axiosAuth.put(`/api/vendor/${param.Id}`, param);
  return data;
}

export async function delVendorDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/vendor/${Id}`);
  return data;
}

export async function getInvoiceDetail(Id) {
  const { data } = await axiosAuth.get(`/api/apInvoice/${Id}`);
  if (data?.Detail?.length > 0) {
    data.Detail.forEach((i, idx) => {
      i.index = idx;
      if (i.InvdTaxT1 === "Include") {
        i.NetAmt = i.InvdPrice * i.InvdQty - i.InvdTaxC1;
      } else {
        i.NetAmt = i.InvdPrice * i.InvdQty;
      }
    });
  }
  return data;
}

export async function getInvoiceUnpaid(vnCode) {
  const { data } = await axiosAuth.get(`/api/apInvoice/unpaid?vnCode=${vnCode}`);
  return data;
}

export async function createInvoiceDetail(param) {
  const { data } = await axiosAuth.post(`/api/apInvoice`, param);
  return data;
}

export async function updateInvoiceDetail(param) {
  const { data } = await axiosAuth.put(`/api/apInvoice/${param.InvhSeq}`, param);
  return data;
}

export async function delInvoiceDetail(InvhSeq) {
  const { data } = await axiosAuth.delete(`/api/apInvoice/${InvhSeq}`);
  return data;
}

export async function getPaymentDetail(Id) {
  const { data } = await axiosAuth.get(`/api/apPayment/${Id}`);
  data.PayWht.Items.forEach((i, idx) => (i.index = idx));
  return data;
}

export async function createPaymentDetail(param) {
  const { data } = await axiosAuth.post(`/api/apPayment`, param);
  return data;
}

export async function updatePaymentDetail(param) {
  const { data } = await axiosAuth.put(`/api/apPayment/${param.PyhSeq}`, param);
  return data;
}

export async function delPaymentDetail(PvhSeq) {
  const { data } = await axiosAuth.delete(`/api/apPayment/${PvhSeq}`);
  return data;
}
