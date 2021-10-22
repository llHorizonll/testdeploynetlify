import axiosAuth from "utils/request";

export async function getLookup(lookupType) {
  const { data } = await axiosAuth.get(`/api/lookup/${lookupType}`);
  return data;
}
