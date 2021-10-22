import axiosAuth from "utils/request";

//---------------------------- List ----------------------------//

export async function getAssetDisposalListByAssetNo(limit = 10, page = 1, Id, No) {
  const uriQueryString = {
    Limit: limit,
    Page: page,
    WhereGroupList: [
      {
        ConditionList: [
          {
            AndOr: "And",
            Field: "AstId",
            Operator: "=",
            Value: Id,
          },
          {
            AndOr: "And",
            Field: "AstNo",
            Operator: "=",
            Value: No,
          },
        ],
      },
    ],
    Exclude: ["AstPhoto"],
  };
  const { data } = await axiosAuth.post(`/api/assetDisposal/search`, uriQueryString);
  return data;
}

export async function getAstCategory() {
  const { data } = await axiosAuth.get(`/api/astCategory`);
  return data;
}

export async function getAstDepartment() {
  const { data } = await axiosAuth.get(`/api/assetDepartment`);
  return data;
}

export async function getAstLocation() {
  const { data } = await axiosAuth.get(`/api/assetLocation`);
  return data;
}

//---------------------------- Search ----------------------------//

export async function getAssetRegisterSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/assetRegister/search`, uriQueryString);
  return data;
}

export async function getAssetDisposalSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/assetDisposal/search`, uriQueryString);
  return data;
}

export async function getAstCategorySearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/astCategory/search`, uriQueryString);
  return data;
}

export async function getAstDepartmentSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/assetDepartment/search`, uriQueryString);
  return data;
}

export async function getAstLocationSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/assetLocation/search`, uriQueryString);
  return data;
}

//---------------------------- Detail ----------------------------//

export async function getAstCategoryDetail(Id) {
  const { data } = await axiosAuth.get(`/api/astCategory/${Id}`);
  return data;
}

export async function createAstCategoryDetail(param) {
  const { data } = await axiosAuth.post(`/api/astCategory`, param);
  return data;
}

export async function updateAstCategoryDetail(param) {
  const { data } = await axiosAuth.put(`/api/astCategory/${param.Id}`, param);
  return data;
}

export async function delAstCategoryDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/astCategory/${Id}`);
  return data;
}

export async function getAstDepartmentDetail(Id) {
  const { data } = await axiosAuth.get(`/api/assetDepartment/${Id}`);
  return data;
}

export async function createAstDepartmentDetail(param) {
  const { data } = await axiosAuth.post(`/api/assetDepartment`, param);
  return data;
}

export async function updateAstDepartmentDetail(param) {
  const { data } = await axiosAuth.put(`/api/assetDepartment/${param.Id}`, param);
  return data;
}

export async function delAstDepartmentDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/assetDepartment/${Id}`);
  return data;
}

export async function getAstLocationDetail(Id) {
  const { data } = await axiosAuth.get(`/api/assetLocation/${Id}`);
  return data;
}

export async function createAstLocationDetail(param) {
  const { data } = await axiosAuth.post(`/api/assetLocation`, param);
  console.log(data);
  return data;
}

export async function updateAstLocationDetail(param) {
  const { data } = await axiosAuth.put(`/api/assetLocation/${param.Id}`, param);
  console.log(data);
  return data;
}

export async function delAstLocationDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/assetLocation/${Id}`);
  return data;
}

export async function getAssetRegDetail(RegId) {
  const { data } = await axiosAuth.get(`/api/assetRegister/${RegId}`);
  return data;
}

export async function createAssetRegDetail(param) {
  const { data } = await axiosAuth.post(`/api/assetRegister`, param);
  return data;
}

export async function updateAssetRegDetail(param) {
  const { data } = await axiosAuth.put(`/api/assetRegister/${param.RegId}`, param);
  return data;
}

export async function delAssetRegDetail(RegId) {
  const { data } = await axiosAuth.delete(`/api/assetRegister/${RegId}`);
  return data;
}

export async function getAssetDisDetail(DisposalId) {
  const { data } = await axiosAuth.get(`/api/assetDisposal/${DisposalId}`);
  return data;
}

export async function createAssetDisDetail(param) {
  const { data } = await axiosAuth.post(`/api/assetDisposal`, param);
  return data;
}

export async function updateAssetDisDetail(param) {
  const { data } = await axiosAuth.put(`/api/assetDisposal/${param.DisposalId}`, param);
  return data;
}

export async function delAssetDisDetail(DisposalId) {
  const { data } = await axiosAuth.delete(`/api/assetDisposal/${DisposalId}`);
  return data;
}

//---------------------------- History ----------------------------//

export async function getAssetHisByAssetNo(astId, astNo) {
  const { data } = await axiosAuth.get(`/api/assetHistory/${astId}/${astNo}`);
  return data;
}

export async function getAssetHisLocationByAssetNo(astId, astNo) {
  const { data } = await axiosAuth.get(`/api/assetHistory/LocLog/${astId}/${astNo}`);
  return data;
}

//---------------------------- GetNetAmount & GetAvailable (Disposal) ----------------------------//

export async function getAssetDisposalAccuDepre(param) {
  const { data } = await axiosAuth.post(`/api/assetDisposalAccuDepre`, param);
  return data;
}

export async function checkRegisterDisposal(id) {
  const { data } = await axiosAuth.get(`/api/assetRegister/isDisposal/${id}`);
  return data;
}

export async function copyAssetRegister(param) {
  const { data } = await axiosAuth.post(`/api/assetRegister/copy`, param);
  return data;
}

export async function changeLocation(param) {
  const { data } = await axiosAuth.put(`/api/assetRegister/changeLocation`, param);
  return data;
}
