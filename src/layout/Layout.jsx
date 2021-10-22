import React, { useContext, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSetLocale, Loading, Layout, Sidebar } from "react-admin";
import ErrorDashboard from "layout/ErrorDashboard";
import authProviders from "providers/auth";
import AppBar from "./AppBar";
import Menu from "./Menu";
import { darkTheme, lightTheme } from "utils/themes";

import { GblContext } from "providers/formatter";

const CustomSidebar = (props) => {
  var url = new URL(window.location.href);
  if (url) {
    var callFromDesktopApp = url.searchParams.get("ShowOnlyDashboard") === "true";
  }

  return !callFromDesktopApp ? <Sidebar {...props} size={200} /> : <div style={{ margin: "12px" }}></div>;
};

const CustomAppBar = (props) => {
  var url = new URL(window.location.href);
  if (url) {
    var callFromDesktopApp = url.searchParams.get("ShowOnlyDashboard") === "true";
  }
  let tkFromDesktopApp = url.searchParams.get("tk");
  if (tkFromDesktopApp) {
    localStorage.setItem("AccessToken", tkFromDesktopApp);
  }

  return !callFromDesktopApp ? <AppBar {...props} /> : <div style={{ marginTop: "-40px" }}></div>;
};

const CustomLayout = (props) => {
  const { UpdateSettingAll } = useContext(GblContext);
  const theme = useSelector((state) => (state.theme === "dark" ? darkTheme : lightTheme));
  const setLocale = useSetLocale();
  const [loading, setLoading] = useState(true);
  const [error] = useState(false);

  const GetSetting = useCallback(
    async (mounted) => {
      let localSetting = JSON.parse(localStorage.getItem("SettingAll"));
      let language = localStorage.getItem("Language");
      console.log(localSetting, "localSetting");
      if (language) {
        setLocale(language);
      } else {
        setLocale("en");
      }
      if (localSetting) {
        UpdateSettingAll(localSetting);
        if (mounted) {
          setLoading(false);
        }
      } else {
        console.log("call api settingAll");
        const response = await authProviders.getSettingAll();
        if (response) {
          localStorage.setItem("SettingAll", JSON.stringify(response));
          UpdateSettingAll(response);
        }
        if (mounted) {
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    let mounted = true;
    GetSetting(mounted);
    return function cleanup() {
      mounted = false;
    };
  }, [GetSetting]);

  if (loading) return <Loading />;
  if (error) return <ErrorDashboard />;
  return (
    <>
      <Layout {...props} appBar={CustomAppBar} sidebar={CustomSidebar} menu={Menu} theme={theme} />
    </>
  );
};

export default CustomLayout;
