import axiosAuth from "../utils/request";

export async function getCompany() {
  const { data } = await axiosAuth.get(`/api/company`);
  return data;
}

export async function updateCompany(param) {
  const { data } = await axiosAuth.put(`/api/company`, param);
  return data;
}

export async function getSettingAll() {
  const { data } = await axiosAuth.get(`/api/setting/all`);
  return data;
}

export async function getSettingClosePeriod() {
  const { data } = await axiosAuth.get(`/api/setting/closePeriod`);
  return data;
}

export async function getSettingSystem() {
  const { data } = await axiosAuth.get(`/api/settingSystem`);
  return data;
}

export async function getSettingAp() {
  const { data } = await axiosAuth.get(`/api/settingAp`);
  return data;
}

export async function updateSettingAp(param) {
  const { data } = await axiosAuth.post(`/api/settingAp`, param);
  return data;
}

export async function getSettingAr() {
  const { data } = await axiosAuth.get(`/api/settingAr`);
  return data;
}

export async function updateSettingAr(param) {
  const { data } = await axiosAuth.post(`/api/settingAr`, param);
  return data;
}

export async function getSettingAsset() {
  const { data } = await axiosAuth.get(`/api/settingAsset`);
  return data;
}

export async function updateSettingAsset(param) {
  const { data } = await axiosAuth.post(`/api/settingAsset`, param);
  return data;
}

export async function getSettingGl() {
  const { data } = await axiosAuth.get(`/api/settingGl`);
  return data;
}

export async function updateSettingGl(param) {
  const { data } = await axiosAuth.post(`/api/settingGl`, param);
  return data;
}

export async function updateSettingSystem(param) {
  const { data } = await axiosAuth.post(`/api/settingSystem`, param);
  return data;
}

//---------------------------- List ----------------------------//

export async function getAccountCodeList(module) {
  var q;
  if (module) {
    switch (module) {
      case "Ap":
        q = {
          Limit: 0,
          Page: 1,
          OrderBy: {},
          WhereGroupList: [
            {
              AndOr: "And",
              ConditionList: [
                {
                  AndOr: "And",
                  Field: "UseInAp",
                  Operator: "=",
                  Value: true,
                },
              ],
            },
          ],
        };
        break;
      case "Ar":
        q = {
          Limit: 0,
          Page: 1,
          OrderBy: {},
          WhereGroupList: [
            {
              AndOr: "And",
              ConditionList: [
                {
                  AndOr: "And",
                  Field: "UseInAr",
                  Operator: "=",
                  Value: true,
                },
              ],
            },
          ],
        };
        break;
      case "Gl":
        q = {
          Limit: 0,
          Page: 1,
          OrderBy: {},
          WhereGroupList: [
            {
              AndOr: "And",
              ConditionList: [
                {
                  AndOr: "And",
                  Field: "UseInGl",
                  Operator: "=",
                  Value: true,
                },
              ],
            },
          ],
        };
        break;
      case "Asset":
        q = {
          Limit: 0,
          Page: 1,
          OrderBy: {},
          WhereGroupList: [
            {
              AndOr: "And",
              ConditionList: [
                {
                  AndOr: "And",
                  Field: "UseInAsset",
                  Operator: "=",
                  Value: true,
                },
              ],
            },
          ],
        };
        break;
      default:
        break;
    }
    const { data } = await axiosAuth.get(`/api/accountCode?q=${JSON.stringify(q)}`);
    return data;
  } else {
    const { data } = await axiosAuth.get(`/api/accountCode`);
    return data;
  }
}

export async function getDepartmentList() {
  const { data } = await axiosAuth.get(`/api/department`);
  return data;
}

export async function getCurrencyList() {
  const { data } = await axiosAuth.get(`/api/currency`);
  return data;
}

export async function getApPaymentTypeList() {
  const { data } = await axiosAuth.get(`/api/apPaymentType`);
  return data;
}

export async function getArPaymentTypeList() {
  const { data } = await axiosAuth.get(`/api/arPaymentType`);
  return data;
}

export async function getUnitList() {
  const { data } = await axiosAuth.get(`/api/unit`);
  return data;
}

export async function getTenantList() {
  const { data } = await axiosAuth.get(`/api/tenant`);
  return data;
}

export async function getGblFileFromBank() {
  const { data } = await axiosAuth.get(`/api/gblfilefrombank?q=${encodeURI("{limit:0}")}`);
  return data;
}

//---------------------------- Search ----------------------------//
export async function getVdCategoryList() {
  const { data } = await axiosAuth.post(`/api/vendorCategory/search`, { limit: 0 });
  return data;
}

export async function getAccountCodeSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/accountCode/search`, uriQueryString);
  return data;
}

export async function getCurrencySearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/currency/search`, uriQueryString);
  return data;
}

export async function getDepartmentSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/department/search`, uriQueryString);
  return data;
}

export async function getPaymentTypeSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/paymentType/search`, uriQueryString);
  return data;
}

export async function getDimensionSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/dimension/search`, uriQueryString);
  return data;
}

export async function getUnitSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/unit/search`, uriQueryString);
  return data;
}

export async function getVdCategorySearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/vendorCategory/search`, uriQueryString);
  return data;
}

export async function getUserSearchList(uriQueryString) {
  const { data } = await axiosAuth.post(`/api/user/search`, uriQueryString);
  return data;
}

//---------------------------- Detail ----------------------------//

export async function getAccountCodeDetail(Id) {
  const { data } = await axiosAuth.get(`/api/accountCode/${Id}`);
  return data;
}

export async function createAccountCodeDetail(param) {
  const { data } = await axiosAuth.post(`/api/accountCode`, param);
  return data;
}

export async function updateAccountCodeDetail(param) {
  const { data } = await axiosAuth.put(`/api/accountCode/${param.Id}`, param);
  return data;
}

export async function delAccountCodeDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/accountCode/${Id}`);
  return data;
}

export async function getDepartmentDetail(Id) {
  const { data } = await axiosAuth.get(`/api/department/${Id}`);
  return data;
}

export async function createDepartmentDetail(param) {
  const { data } = await axiosAuth.post(`/api/department`, param);
  return data;
}

export async function updateDepartmentDetail(param) {
  const { data } = await axiosAuth.put(`/api/department/${param.Id}`, param);
  return data;
}

export async function delDepartmentDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/department/${Id}`);
  return data;
}

export async function getPaymentTypeDetail(Id) {
  const { data } = await axiosAuth.get(`/api/paymentType/${Id}`);
  return data;
}

export async function createPaymentTypeDetail(param) {
  const { data } = await axiosAuth.post(`/api/paymentType`, param);
  return data;
}

export async function updatePaymentTypeDetail(param) {
  const { data } = await axiosAuth.put(`/api/paymentType/${param.Id}`, param);
  return data;
}

export async function delPaymentTypeDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/paymentType/${Id}`);
  return data;
}

export async function getUnitDetail(Id) {
  const { data } = await axiosAuth.get(`/api/unit/${Id}`);
  return data;
}

export async function createUnitDetail(param) {
  const { data } = await axiosAuth.post(`/api/unit`, param);
  return data;
}

export async function updateUnitDetail(param) {
  const { data } = await axiosAuth.put(`/api/unit/${param.Id}`, param);
  return data;
}

export async function delUnitDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/unit/${Id}`);
  return data;
}

export async function getVdCategoryDetail(Id) {
  const { data } = await axiosAuth.get(`/api/vendorCategory/${Id}`);
  return data;
}

export async function createVdCategoryDetail(param) {
  const { data } = await axiosAuth.post(`/api/vendorCategory`, param);
  return data;
}

export async function updateVdCategoryDetail(param) {
  const { data } = await axiosAuth.put(`/api/vendorCategory/${param.Id}`, param);
  return data;
}

export async function delVdCategoryDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/vendorCategory/${Id}`);
  return data;
}

export async function getUserByUserName(userName) {
  const { data } = await axiosAuth.get(`/api/userTenant/UserName/${userName}`);
  return data;
}

export async function getUserDetail(UserId) {
  const { data } = await axiosAuth.get(`/api/user/${UserId}`);
  return data;
}

export async function createUserDetail(param) {
  const { data } = await axiosAuth.post(`/api/user`, param);
  return data;
}

export async function updateUserDetail(param) {
  const { data } = await axiosAuth.put(`/api/user/${param.UserId}`, param);
  return data;
}

export async function delUserDetail(UserId) {
  const { data } = await axiosAuth.delete(`/api/user/${UserId}`);
  return data;
}

export async function getGblFileFromBankDetail(id) {
  const { data } = await axiosAuth.get(`/api/gblfilefrombank/${id}`);
  return data;
}

export async function createGblFileFromBankDetail(param) {
  const { data } = await axiosAuth.post(`/api/gblfilefrombank`, param);
  return data;
}

export async function updateGblFileFromBankDetail(param) {
  const { data } = await axiosAuth.put(`/api/gblfilefrombank/${param.FileId}`, param);
  return data;
}

export async function delGblFileFromBankDetail(id) {
  const { data } = await axiosAuth.delete(`/api/gblfilefrombank/${id}`);
  return data;
}

//---------------------------- License ----------------------------//

export async function getLicenseList() {
  const { data } = await axiosAuth.get(`/api/licenseInterface/license`);
  return data;
}

//---------------------------- Template Permission ----------------------------//

export async function getTemplatePermission() {
  const { data } = await axiosAuth.get(`/api/permission/Template`);
  return data;
}

export async function getUpdatePermission(param) {
  const { data } = await axiosAuth.put(`/api/permission`, param);
  return data;
}

//---------------------------- AddOrDelete ----------------------------//

export async function addOrDeleteTenant(username, bu, action) {
  const { data } = await axiosAuth.put(
    `/api/userTenant/addOrDelete?userName=${username}&tenant=${bu}&action=${action}`
  );
  return data;
}
