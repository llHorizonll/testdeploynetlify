import axiosAuth from "utils/request";

//---------------------------- List ----------------------------//

export async function getJvList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/glJv/search`, uriQueryString);
  return data;
}

export async function getJvFrList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/glJvFr/search`, uriQueryString);
  return data;
}

export async function getBudgetList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/budget/search`, uriQueryString);
  return data;
}

export async function getGlPrefix() {
  const { data } = await axiosAuth.get(`/api/glPrefix`);
  return data;
}

export async function getGlPrefixSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/glPrefix/search`, uriQueryString);
  return data;
}

//---------------------------- Detail ----------------------------//

export async function getGlPrefixDetail(Id) {
  const { data } = await axiosAuth.get(`/api/glPrefix/${Id}`);
  return data;
}

export async function createGlPrefixDetail(param) {
  const { data } = await axiosAuth.post(`/api/glPrefix`, param);
  return data;
}

export async function updateGlPrefixDetail(param) {
  const { data } = await axiosAuth.put(`/api/glPrefix/${param.Id}`, param);
  return data;
}

export async function delGlPrefixDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/glPrefix/${Id}`);
  return data;
}

export async function getJvDetail(JvhSeq) {
  const { data } = await axiosAuth.get(`/api/glJv/${JvhSeq}`);
  if (data?.Detail?.length > 0) {
    data.Detail.forEach((i, idx) => (i.index = idx));
  }
  return data;
}

export async function createJvDetail(param) {
  const { data } = await axiosAuth.post(`/api/glJv`, param);
  return data;
}

export async function updateJvDetail(param) {
  const { data } = await axiosAuth.put(`/api/glJv/${param.JvhSeq}`, param);
  return data;
}

export async function delJvDetail(JvhSeq) {
  const { data } = await axiosAuth.delete(`/api/glJv/${JvhSeq}`);
  return data;
}

export async function getJvFrDetail(FJvhSeq) {
  const { data } = await axiosAuth.get(`/api/glJvFr/${FJvhSeq}`);
  if (data?.Detail?.length > 0) {
    data.Detail.forEach((i, idx) => (i.index = idx));
  }
  return data;
}

export async function createJvFrDetail(param) {
  const { data } = await axiosAuth.post(`/api/glJvFr`, param);
  return data;
}

export async function updateJvFrDetail(param) {
  const { data } = await axiosAuth.put(`/api/glJvFr/${param.FJvhSeq}`, param);
  return data;
}

export async function delJvFrDetail(FJvhSeq) {
  const { data } = await axiosAuth.delete(`/api/glJvFr/${FJvhSeq}`);
  return data;
}

export async function getBudgetDetail(BudgetId) {
  const { data } = await axiosAuth.get(`/api/budget/${BudgetId}`);
  return data;
}

export async function createBudgetDetail(param) {
  const { data } = await axiosAuth.post(`/api/budget`, param);
  return data;
}

export async function updateBudgetDetail(param) {
  const { data } = await axiosAuth.put(`/api/budget/${param.BudgetId}`, param);
  return data;
}

export async function delBudgetDetail(BudgetId) {
  const { data } = await axiosAuth.delete(`/api/budget/${BudgetId}`);
  return data;
}
