import axiosAuth from "utils/request";

export async function getCommentById(id) {
  const { data } = await axiosAuth.get(`/api/comment/${id}`);
  return data;
}

export async function downloadCommentById(id) {
  const { data } = await axiosAuth.get(`/api/comment/download/${id}`, {
    headers: { "content-type": "application/octet-stream" },
    responseType: "blob",
  });
  return data;
}

export async function getCommentListByModule(Module, ModuleId) {
  const { data } = await axiosAuth.get(`/api/comment/${Module}/${ModuleId}`);
  return data;
}

export async function addComment(param) {
  const { data } = await axiosAuth.post(`/api/comment`, param);
  return data;
}
