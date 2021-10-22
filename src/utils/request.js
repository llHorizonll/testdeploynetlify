import axios from "axios";
import SnackbarUtils from "utils/SnackbarUtils";
import { createHashHistory as createHistory } from "history";

const history = createHistory();
const listOfCompany = window.config.arrCompany;
var { apiUrl } = window.config;

let url = new URL(window.location.href);
let callFromDesktopApp = url.searchParams.get("ShowOnlyDashboard") === "true";
let desktopUrlApi = url.searchParams.get("urlApi");
let tkFromDesktopApp = url.searchParams.get("tk");

const axiosAuth = axios.create({
  baseURL: !callFromDesktopApp ? window.config.apiUrl : desktopUrlApi,
});

axiosAuth.interceptors.request.use(
  async (config) => {
    config.baseURL = await getBaseUrl();
    return config;
  },
  (error) => Promise.reject(error)
);

export async function getBaseUrl() {
  let url = new URL(window.location.href);
  let tkFromDesktopApp = url.searchParams.get("tk");
  let desktopUrlApi = url.searchParams.get("urlApi");
  if (tkFromDesktopApp) {
    return desktopUrlApi;
  } else {
    let aToken = await localStorage.getItem("adminToken");
    if (aToken) {
      let obj = listOfCompany.find((i) => i.adminToken === aToken);
      apiUrl = obj.apiUrl;
      return apiUrl;
    } else {
      apiUrl = window.config.apiUrl;
      return apiUrl;
    }
  }
}

if (!callFromDesktopApp) {
  axiosAuth.defaults.headers.common["Authorization"] = localStorage.getItem("AccessToken");
} else {
  axiosAuth.defaults.headers.common["Authorization"] = tkFromDesktopApp;
}

const errorResponseHandler = (error) => {
  if (error.message === "Network Error") {
    let url = new URL(window.location.href);
    if (url) {
      let callFromDesktopApp = url.searchParams.get("ShowOnlyDashboard") === "true";
      if (callFromDesktopApp) {
        console.log(error, "DashboardDesktopApp");
        return false;
      } else {
        console.log(error, history, "Not Have Token");
        let url = new URL(window.location.origin);
        window.location.replace(url + "#/login");
        return error;
      }
    }
  }

  switch (error.response.status) {
    case 303:
      SnackbarUtils.warning(error.response.data.UserMessage);
      break;
    case 500:
      if (error.response.data) {
        SnackbarUtils.error(error.response.data.UserMessage);
      } else {
        console.error(`No response from ${error.config.url}`);
      }
      break;
    default:
      let url = new URL(window.location.href);
      if (url) {
        let callFromDesktopApp = url.searchParams.get("ShowOnlyDashboard") === "true";
        if (callFromDesktopApp) {
          console.log(error, "DashboardDesktopApp");
          return false;
        } else {
          return error;
        }
      }
      // Something happened in setting up the request that triggered an Error
      return error;
  }

  return error.response;
};

// Add a response interceptor
axiosAuth.interceptors.response.use((response) => response, errorResponseHandler);

export default axiosAuth;
