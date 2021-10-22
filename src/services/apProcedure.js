import axiosAuth from "utils/request";

export async function closePeriodAp(closeDate) {
  const { data } = await axiosAuth.post(
    `/api/apProcedure/closePeriod?closeDate=${closeDate}`
  );
  return data;
}

export async function postReceiving(param) {
  const { data } = await axiosAuth.post(
    `/api/interfaceBlueLedgers/postReceiving`,
    param
  );
  return data;
}
