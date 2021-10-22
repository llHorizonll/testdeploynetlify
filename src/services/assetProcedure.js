import axiosAuth from "utils/request";

export async function closePeriodAsset(closeDate) {
  const { data } = await axiosAuth.post(
    `/api/assetProcedure/closePeriod?closeDate=${closeDate}`
  );
  return data;
}
