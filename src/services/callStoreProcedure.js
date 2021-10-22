import axiosAuth from "utils/request";

const formatDate = (date) => {
  date = date ?? new Date();

  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
};

export async function getFrontSummary(date = new Date()) {
  date = formatDate(new Date(date));
  const spName = `chart_fo_summary('${date}')`;
  const { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);

  if (!data) {
    return undefined;
  }

  data[0].icon = "attach_money";
  data[1].icon = "bar_chart";
  data[2].icon = "insights";
  data[3].icon = "leaderboard";

  data[0].color = "#7BDFF2";
  data[1].color = "#C1FBA4";
  data[2].color = "#FBC3BC";
  data[3].color = "#E7C6FF";

  const res = {
    name: "Statistical Highlight",
    date: data[0].date,
    data: data,
  };
  return res;
}

export async function getFrontYtdrr(date = new Date()) {
  date = formatDate(new Date(date));
  const spName = `chart_fo_ytdrr('${date}')`;
  var { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);

  if (!data) {
    return undefined;
  }

  if (data !== null && data?.length > 0) {
    var rawData = data?.filter((i) => i.DimValue !== "" && i.DimValue !== null && i.Amount !== 0);

    var newArr = [["DimName", "Amount"]];

    rawData.forEach((element) => {
      newArr.push([element.DimValue, element.Amount]);
    });
  }
  const res = {
    name: "YTD - Room Revenue by Market Segment",
    date: date,
    rawData: rawData ?? null,
    data: data?.length > 0 ? newArr : null,
  };
  return res;
}

export async function getProfitSummary(date = new Date()) {
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  const spName = `chart_fo_plsummary('${year}','${month}')`;
  const { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);
  if (!data) {
    return undefined;
  }
  const res = {
    name: "Monthly P&L Summary",
    date: date,
    data: data,
  };
  return res;
}

export async function getYearcomparision(param) {
  var group, date;
  if (!param) {
    group = "0";
    date = new Date();
  } else {
    group = param.group;
    date = param.date;
  }

  let year = date.getFullYear();
  const spName = `chart_fo_yearcomparision('${group}','${year}')`;
  const { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);
  if (!data) {
    return undefined;
  }
  let arrLabel = Object.keys(data[0]).filter((e) => e !== "Year");
  let arrDataset0 = Object.values(data[0]).filter((e) => e !== (year - 1).toString());
  let arrDataset1 = Object.values(data[1]).filter((e) => e !== year.toString());

  var newArr = [["Month", "Last Year", "This Year"]];

  arrLabel.forEach((element, idx) => {
    newArr.push([element, arrDataset0[idx], arrDataset1[idx]]);
  });

  const res = {
    name: "This Year VS Last Year",
    date: date,
    data: newArr,
  };
  return res;
}

export async function getYearcomparisionOption() {
  const { data } = await axiosAuth.get(`/api/callStoreProc/chart_fo_yearcomparision_options`);
  if (!data) {
    return undefined;
  }
  return data;
}

export async function getDaily(date = new Date()) {
  date = formatDate(new Date(date));
  const spName = `chart_gl_dailyaccount('${date}')`;
  const { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);
  if (!data) {
    return undefined;
  }
  const res = {
    name: "Daily Monitor Account",
    date: date,
    data: data === "" ? [] : data,
  };
  return res;
}

export async function getActualbudget(param) {
  var date, typeOfDate;

  if (!param) {
    date = new Date();
    typeOfDate = "Y";
  } else {
    date = param.date;
    typeOfDate = param.typeOfDate;
  }
  date = formatDate(new Date(date));
  const spName = `chart_actualbudget('${date}','${typeOfDate}')`;
  const { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);
  if (!data) {
    return undefined;
  }
  const res = {
    name: "Actual vs Budget",
    date: date,
    typeOfDate: typeOfDate,
    data: data === "" ? [] : data,
  };
  return res;
}

export async function getPayable(date = new Date()) {
  date = formatDate(new Date(date));
  const spName = `chart_payable('')`;
  var { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);
  var d;
  if (!data) {
    return undefined;
  }
  if (data == null) {
    data = [];
    d = [
      {
        Undue: 0,
        Overdue: 0,
        Current: 0,
        Age30: 0,
        Age60: 0,
        Age90: 0,
        Age91: 0,
      },
    ];
  } else {
    d = data[0];
  }

  var newArr = [["Key", "Undue", "Unpaid"]];
  newArr.push(["Payable", d.Undue, d.Overdue]);

  var newArr2 = [["Key", "Current", "30", "60", "90", "91"]];
  newArr2.push(["Payable", d.Current, d.Age30, d.Age60, d.Age90, d.Age91]);

  const res = {
    name: "Payable",
    date: date,
    totalUnPaid: d?.Unpaid,
    data1: newArr,
    colors1: ["#B8B5FF", "#7868E6"],
    data2: newArr2,
    colors2: ["#b0efeb", "#118ab2", "#ef476f", "#ffd166", "#06d6a0"],
    rawData: d,
  };

  return res;
}

export async function getReceivable(date = new Date()) {
  date = formatDate(new Date(date));
  const spName = `chart_receivable('')`;
  var { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);
  var d;
  if (!data) {
    return undefined;
  }
  if (data == null) {
    data = [];
    d = [
      {
        Undue: 0,
        Overdue: 0,
        Current: 0,
        Age30: 0,
        Age60: 0,
        Age90: 0,
        Age91: 0,
      },
    ];
  } else {
    d = data[0];
  }
  var newArr = [["Key", "Undue", "Unpaid"]];
  newArr.push(["Receivable", d.Undue, d.Overdue]);

  var newArr2 = [["Key", "Current", "30", "60", "90", "91"]];
  newArr2.push(["Receivable", d.Current, d.Age30, d.Age60, d.Age90, d.Age91]);

  const res = {
    name: "Receivable",
    date: date,
    totalUnPaid: d?.Unpaid,
    data1: newArr,
    colors1: ["#FF99B9", "#FF4782"],
    data2: newArr2,
    colors2: ["#b0efeb", "#118ab2", "#ef476f", "#ffd166", "#06d6a0"],
    rawData: d,
  };

  return res;
}

export async function getIncomeStatement(param) {
  var month, year, date, deptCode;
  if (!param) {
    date = new Date();
    month = date.getMonth() + 1;
    year = date.getFullYear();
    deptCode = "";
  } else {
    date = param.date;
    month = param.date.getMonth() + 1;
    year = param.date.getFullYear();
    deptCode = param.deptValue.DeptCode === "All" ? "*" : param.deptValue.DeptCode;
  }
  const spName = `chart_incomestatement('${year}','${month}','${deptCode}')`;
  const { data } = await axiosAuth.get(`/api/callStoreProc/${spName}`);
  if (!data) {
    return undefined;
  }
  const res = {
    name: "Income Statement",
    date: date,
    data: data,
  };
  return res;
}

export async function getListApPeriod() {
  const { data } = await axiosAuth.get(`/api/callStoreProc/rptGetListApPeriod`);
  return data;
}

export default {
  getFrontSummary,
  getFrontYtdrr,
  getYearcomparision,
  getYearcomparisionOption,
  getProfitSummary,
  getDaily,
  getActualbudget,
  getPayable,
  getReceivable,
  getIncomeStatement,
};
