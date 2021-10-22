import axiosAuth from "../../utils/request";
import SnackbarUtils from "utils/SnackbarUtils";

export async function getReportList(groupName) {
  let uri =
    groupName === undefined
      ? `/api/report`
      : `/api/report?q={"WhereRaw":"ReportGroup='${groupName}'", "exclude":["File"]}`;
  const { data } = await axiosAuth.get(uri);
  return data;
}

export async function getReport(id) {
  const uri = `/api/report/${id}`;
  const { data } = await axiosAuth.get(uri);
  return data;
}

export async function callStoreProcedurePost(name, parameters) {
  const uri = "/api/CallStoreProc";
  // {
  //      "SpName": "name",
  //      "Params": {"key1":"value1","key2":"value2", ...},
  //      "Timeout": 0,
  // }
  const body = {
    SpName: name,
    Params: parameters ?? {},
    Timeout: 0,
  };

  const { data } = await axiosAuth.post(uri, body);
  return data;
}

export async function showReport(report, param, fileFormat) {
  var isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
    },
  };

  // Method(s) to display report in various format such as pdf, html, csv, xlsx
  const openPDF = (blob, reportName) => {
    var newBlob = new Blob([blob], { type: "application/pdf" });

    // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //   window.navigator.msSaveOrOpenBlob(newBlob);
    //   return;
    // }
    const urlPdf = window.URL.createObjectURL(newBlob);

    if (isMobile.any()) {
      const link = document.createElement("a");
      link.href = urlPdf;
      link.target = "_blank";
      //link.innerHTML = `${reportName}.pdf`;
      link.download = `${reportName}.pdf`;
      link.click();
    } else {
      //window.open(urlPdf);
      const link = document.createElement("a");
      link.href = urlPdf;
      link.target = "_blank";
      //link.innerHTML = `${reportName}.pdf`;
      //link.download = `${reportName}.pdf`;
      link.click();
    }
    URL.revokeObjectURL(urlPdf);
  };

  const openHTML = () => {};

  // ----------------------------------------------------------------

  if (report) {
    var { apiUrl } = window.config;
    var accessToken = localStorage.getItem("AccessToken");

    if (!param) param = [];
    if (!fileFormat) fileFormat = "pdf";

    const reportData = {
      Id: report.Id,
      Type: "Report",
      FileFormat: fileFormat,
      Parameters: param,
    };

    return await fetch(`${apiUrl}/api/report/web`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    })
      //response
      .then((response) => {
        if (response.ok) {
          const contentType = response.headers.get("content-type");

          if (contentType && contentType.includes("json")) return response.json();
          else if (contentType && contentType.includes("pdf")) return response.blob();
          else return response.text();
        } else if (response.status === 400) {
          return response.json();
        } else throw Error(`${response.status} (${response.statusText})`);
      })
      // data
      .then((data) => {
        if (data instanceof Blob) {
          openPDF(data, report.ReportName);
        } else if (typeof data == "string") {
          openHTML(data);
        } else {
          return data.Message;
        }
      })
      .catch((error) => {
        return error.message;
      });
  } else {
    return `Report not found`;
  }
}

export async function showReportByName(reportName, param) {
  const q = `%7B%22WhereGroupList%22%3A%5B%7B%22AndOr%22%3A%22And%22%2C%22ConditionList%22%3A%5B%7B%22AndOr%22%3A%22And%22%2C%22Field%22%3A%22ReportGroup%22%2C%22Operator%22%3A%22%3D%22%2C%22Value%22%3A%22FORM%22%7D%2C%7B%22AndOr%22%3A%22And%22%2C%22Field%22%3A%22ReportName%22%2C%22Operator%22%3A%22%3D%22%2C%22Value%22%3A%22${reportName}%22%7D%5D%7D%5D%7D`;
  const { data } = await axiosAuth.get(`/api/report?q=${q}`);
  const report = data.Data.length > 0 ? data.Data[0] : undefined;
  const r = await showReport(report, param);
  if (typeof r === "string") {
    SnackbarUtils.error(r);
  }
  return r;
}
