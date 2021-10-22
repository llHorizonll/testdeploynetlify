import axiosAuth from "../utils/request";

export async function getDimensionModuleList() {
  const { data } = await axiosAuth.get(`/api/dimension/module`);
  return data;
}

export async function getDimList(limit = 10, page = 1) {
  const uriQueryString = {
    Limit: limit,
    Page: page,
  };
  const { data } = await axiosAuth.post(`/api/dimension/search`, uriQueryString);
  return data;
}

export async function getActiveDimList(limit = 10, page = 1) {
  const uriQueryString = {
    Limit: limit,
    Page: page,
    WhereGroupList: [
      {
        AndOr: "And",
        ConditionList: [
          {
            AndOr: "And",
            Field: "Active",
            Operator: "=",
            Value: true,
          },
        ],
      },
    ],
  };
  const { data } = await axiosAuth.post(`/api/dimension/search`, uriQueryString);
  return data;
}

export async function getActiveDimListByModuleName(limit = 10, page = 1, moduleName) {
  const uriQueryString = {
    Limit: limit,
    Page: page,
    WhereGroupList: [
      {
        AndOr: "And",
        ConditionList: [
          {
            AndOr: "And",
            Field: "Active",
            Operator: "=",
            Value: true,
          },
        ],
      },
    ],
    WhereLikeFields: ["json_extract(Module, '$')"],
    WhereLike: `%${moduleName}%`,
  };
  const { data } = await axiosAuth.post(`/api/dimension/search`, uriQueryString);
  return data;
}

export async function getDimensionByCaption(caption) {
  const uriQueryString = {
    Limit: 0,
    Page: 1,
    WhereGroupList: [
      {
        AndOr: "And",
        ConditionList: [
          {
            AndOr: "And",
            Field: "Caption",
            Operator: "=",
            Value: caption,
          },
          {
            AndOr: "And",
            Field: "Active",
            Operator: "=",
            Value: true,
          },
        ],
      },
    ],
  };
  const { data } = await axiosAuth.post(`/api/dimension/search`, uriQueryString);
  return data;
}

export async function getDimensionDetail(Id) {
  const { data } = await axiosAuth.get(`/api/dimension/${Id}`);
  return data;
}

export async function createDimensionDetail(param) {
  const { data } = await axiosAuth.post(`/api/dimension`, param);
  return data;
}

export async function updateDimensionDetail(param) {
  const { data } = await axiosAuth.put(`/api/dimension/${param.Id}`, param);
  return data;
}

export async function delDimensionDetail(Id) {
  const { data } = await axiosAuth.delete(`/api/dimension/${Id}`);
  return data;
}
