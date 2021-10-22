import React, { useContext, useState, useEffect } from "react";
import { GblContext } from "providers/formatter";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Divider } from "@material-ui/core";
import { SwitchInForm, SelectInForm } from "components/Form";
import { getSettingAsset, updateSettingAsset } from "services/setting";
import DialogAstCategory from "./Dialog/AstCategory";
import DialogAstDepartment from "./Dialog/AstDepartment";
import DialogAstLocation from "./Dialog/AstLocation";
import ActionMenu from "components/ActionMenu";
import ButtonFooter from "components/ButtonFooter";
import { AssetNumberFormat } from "utils/options";
import SnackbarUtils from "utils/SnackbarUtils";

const useStyles = makeStyles((theme) => ({
  tabPanel: { width: "100%", margin: "0 20px" },
  button: { textTransform: "none" },
}));

const Asset = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  const { UpdateSettingAll } = useContext(GblContext);
  const [setting, setSetting] = useState();
  const [mode, setMode] = useState("view");
  const [openAstCate, setOpenAstCate] = useState(false);
  const [openAstDept, setOpenAstDept] = useState(false);
  const [openAstLoc, setOpenAstLoc] = useState(false);

  const methods = useForm({ defaultValues: setting });

  const { handleSubmit, reset } = methods;

  const fetchItem = async () => {
    const setting = await getSettingAsset();
    if (setting) {
      setSetting(setting);
      reset(setting);
      console.log(setting);
    }
  };

  useEffect(() => {
    if (value === index) {
      fetchItem();
    }
  }, [value, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const onSubmit = async (values) => {
    console.log(values);
    let settingAll = JSON.parse(localStorage.getItem("SettingAll"));
    settingAll.SettingAsset = values;
    const { Code, UserMessage } = await updateSettingAsset(values);
    if (Code === 0) {
      SnackbarUtils.success(UserMessage);
      localStorage.setItem("SettingAll", JSON.stringify(settingAll));
      UpdateSettingAll(settingAll);
      setMode("view");
      fetchItem();
    } else {
      alert(UserMessage);
    }
  };

  const menuControlProp = [
    {
      name: "Edit",
      fnc: () => {
        setMode("edit");
      },
    },
  ];

  const CancelFnc = () => {
    reset();
    setMode("view");
  };

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      className={classes.tabPanel}
    >
      {value === index && (
        <>
          <ActionMenu menuControl={menuControlProp} justifyContent="flex-start" />
          <Divider />
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={disableFormEnter}>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Asset Register Number Format</Typography>
                <Typography variant="caption">
                  Set asset number by auto - generated from category + department + auto running number 4 digits
                </Typography>
              </Box>
              <Box style={{ width: 240 }}>
                {methods.watch("IdFormat") && (
                  <SelectInForm
                    label="Format"
                    name="IdFormat"
                    options={AssetNumberFormat.map((i) => i.value)}
                    methods={methods}
                    disabled={mode === "view"}
                  />
                )}
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Enable Asset BarCode</Typography>
                <Typography variant="caption">Enable or disable barcode menu in asset</Typography>
              </Box>
              <Box>
                <SwitchInForm name="EnableAssetBarCode" methods={methods} disabled={mode === "view"} defaultChecked />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Reverse Assets and Acc. Depre. Account</Typography>
                <Typography variant="caption">Reverse Assets and Acc. Depre. Account</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="UsePostReverseAssetsAndAccDepre"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Disallow create duplicate TaxID on vendor profile</Typography>
                <Typography variant="caption">Disallow create duplicate TaxID on vendor profile</Typography>
              </Box>
              <Box>
                <SwitchInForm
                  name="DisallowVendorDuplicateTaxId"
                  methods={methods}
                  disabled={mode === "view"}
                  defaultChecked
                />
              </Box>
            </Box>
            <Box p={1} display="flex" justifyContent="space-between">
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Setup Lookup</Typography>
                <Typography variant="caption">add edit delete lookup</Typography>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenAstCate(true)}>
                  Category
                </Button>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenAstDept(true)}>
                  Department
                </Button>
              </Box>
              <Box px={1}>
                <Button variant="outlined" onClick={() => setOpenAstLoc(true)}>
                  Location
                </Button>
              </Box>
            </Box>
            {mode !== "view" && <ButtonFooter CancelFnc={CancelFnc} />}
          </form>
          <DialogAstCategory title={"Asset Category"} open={openAstCate} onClose={() => setOpenAstCate(false)} />
          <DialogAstDepartment title={"Asset Department"} open={openAstDept} onClose={() => setOpenAstDept(false)} />
          <DialogAstLocation title={"Asset Location"} open={openAstLoc} onClose={() => setOpenAstLoc(false)} />
        </>
      )}
    </div>
  );
};

export default Asset;
