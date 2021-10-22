import axiosAuth from "utils/request";

export async function closePeriodAr(closeDate) {
  const { data } = await axiosAuth.post(`/api/arProcedure/closePeriod?closeDate=${closeDate}`);
  return data;
}
