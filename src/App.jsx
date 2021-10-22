import React from "react";
import { Admin } from "react-admin";
import dataProvider from "./providers/data";
import authProvider from "./providers/auth";
import { Dashboard } from "./pages/dashboard";
import { CustomLayout } from "./layout";
import customResources from "./utils/resources";
import customRoutes from "./utils/routes";
import LoginPage from "./pages/Login";
import { themeReducer, langReducer, settingAllReducer } from "./utils/customReducer";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import enCustomMessages from "./i18n/en";
import thCustomMessages from "./i18n/th";
import { useSnackbar } from "notistack";
import SnackbarUtils from "utils/SnackbarUtils";
import { createHashHistory as createHistory } from "history";

const history = createHistory();
let mergeLanguageObj = Object.assign(enCustomMessages.ra, englishMessages.ra);
const messages = {
  en: { ra: mergeLanguageObj },
  th: thCustomMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], "en", {
  allowMissing: true,
});

const App = () => {
  //1. UseHooks to get enqueueSnackbar, closeSnackbar
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  React.useEffect(() => {
    //2. Store both  enqueueSnackbar & closeSnackbar to class variables
    SnackbarUtils.setSnackBar(enqueueSnackbar, closeSnackbar);
  }, [enqueueSnackbar, closeSnackbar]);

  return (
    <Admin
      title="Carmen4"
      history={history}
      loginPage={LoginPage}
      layout={CustomLayout}
      customReducers={{
        theme: themeReducer,
        lang: langReducer,
        settingAll: settingAllReducer,
      }}
      customRoutes={customRoutes}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      dataProvider={dataProvider}
      dashboard={Dashboard}
    >
      {customResources}
    </Admin>
  );
};

export default App;
