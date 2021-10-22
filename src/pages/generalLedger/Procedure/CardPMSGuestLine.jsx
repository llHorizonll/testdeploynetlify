/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useForm } from "react-hook-form";
import { getAccountCodeList, getDepartmentList } from "services/setting";
import { getSettingInfGuestLine, postGuestLine } from "services/interface";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import { Button, Typography } from "@material-ui/core";
import { MuiAutosuggest, DescInForm } from "components/Form";
import DialogMappingGuestLine from "./DialogMappingGuestLine";
import gbl from "utils/formatter";
import fileReader from "utils/fileReader";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  appBar: {
    position: "relative",
    backgroundColor: theme.palette.primary.main,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  content: {
    padding: 0,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

export default function CardItem() {
  const classes = useStyles();
  const [dimValueCfg, setDimValueCfg] = useState("");
  const [openMapping, setOpenMapping] = useState(false);
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
  });
  const [config, setConfig] = useStateWithCallbackLazy();
  //const [selectedFile, setSelectedFile] = useState();

  const methods = useForm({ defaultValues: config });

  const { handleSubmit, reset } = methods;

  const disableFormEnter = (e) => {
    if (e.key === "Enter" && e.target.localName !== "textarea") e.preventDefault();
  };

  const fetchAccLookup = async () => {
    const { Data } = await getAccountCodeList("Gl");
    setLookupList((state) => ({
      ...state,
      accountCodeList: Data,
    }));
  };
  const fetchDeptLookup = async () => {
    const { Data } = await getDepartmentList();
    setLookupList((state) => ({
      ...state,
      departmentList: Data,
    }));
  };

  const fetchSetting = useCallback(async () => {
    const { Config } = await getSettingInfGuestLine();
    let iniDataString = gbl.Base64DecodeUnicode(Config.ConfigFile);
    let javascript_ini = gbl.ParseINIString(iniDataString);
    let dim = javascript_ini["System"]["DimensionKey"].trim();
    let pattern = /([^[]+(?=]))/g;
    let q = dim.trim();
    let listString = q.match(pattern);
    let textSplit = listString[0].split(":");
    Config.DataFilePath = null;
    setDimValueCfg(textSplit[1]);
    setConfig(Config);
    reset(Config);
  }, []);

  useEffect(() => {
    fetchAccLookup();
    fetchDeptLookup();
  }, []);

  useEffect(() => {
    fetchSetting();
  }, [fetchSetting]);

  const onSubmit = (values) => {
    console.log(values);
    //Adjust parameter before save
    setConfig(
      (state) => ({
        ...state,
        ...values,
      }),
      (nextState) => Save(nextState)
    );
  };

  const uploadFile = async (e) => {
    if (e.target.files.length >= 1) {
      let files = e.target.files;
      const filePathsPromises = [];
      files.forEach((file) => {
        console.log(file);
        filePathsPromises.push(fileReader.ToBase64(file));
      });
      const txt = await Promise.all(filePathsPromises);
      let base64 = btoa(txt.join(""));
      setConfig((state) => ({
        ...state,
        DataFilePath: base64,
      }));
    }
  };

  const Save = async (values) => {
    let paramPostGuestLine = {
      File: values.DataFilePath,
      BalanceDeptCode: values.DeptCode,
      BalanceAccCode: values.AccCode,
    };
    if (values.DataFilePath === null) {
      alert("File Not Found");
      return;
    }

    const { Code, InternalMessage } = await postGuestLine(paramPostGuestLine);
    if (Code === null) {
      alert("File Not Found");
    }

    if (Code === 0) {
      alert("Success");
    }
    if (Code === -1) {
      alert(InternalMessage);
    }

    if (Code === -500) {
      setOpenMapping(true);
    }
  };

  return (
    <div>
      <Card variant="outlined">
        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="h6" className={classes.title2}>
              GuestLine
            </Typography>
            <Typography variant="caption">Posting from PMS - GuestLine</Typography>
          </Box>
        </Box>
        <form onKeyDown={disableFormEnter}>
          <Box p={1} display="flex">
            <Box p={1} flexGrow={1}>
              File Name : <input type="file" id="fileCsv" onChange={uploadFile} accept=".csv,(*.*)" multiple></input>
              {/* {!selectedFile && <input type="file" id="fileCsv" onChange={uploadFile} accept=".csv,(*.*)"></input>}
              {selectedFile && (
                <>
                  <span style={{ margin: "0 10px" }}>{selectedFile}</span>{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile();
                    }}
                  >
                    cancel
                  </button>
                </>
              )} */}
            </Box>
            <Box p={1}></Box>
          </Box>
          <Box p={1} align="center">
            <Box p={1} display="flex">
              <MuiAutosuggest
                label="Department"
                name="DeptCode"
                optKey="DeptCode"
                optDesc="Description"
                options={lookupList["departmentList"]}
                updateOtherField={[{ key: "DeptDesc", optKey: "Description" }]}
                methods={methods}
                style={{ width: 200 }}
              />
              <DescInForm
                style={{ paddingLeft: 20 }}
                name="DeptDesc"
                methods={methods}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box p={1} display="flex">
              <MuiAutosuggest
                label="Account"
                name="AccCode"
                optKey="AccCode"
                optDesc="Description"
                options={lookupList["accountCodeList"]}
                updateOtherField={[{ key: "AccDesc", optKey: "Description" }]}
                methods={methods}
                style={{ width: 200 }}
              />
              <DescInForm
                style={{ paddingLeft: 20 }}
                name="AccDesc"
                methods={methods}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box p={1}>
              <i>{"COA for adjustment if the data not balance"}</i>
            </Box>
          </Box>
          <Box py={1} align="center">
            <Button variant="outlined" onClick={() => setOpenMapping(true)}>
              Mapping code
            </Button>
          </Box>
          <Box py={1} align="center">
            <Button variant="contained" color="primary" type="submit" onClick={handleSubmit(onSubmit)}>
              POST
            </Button>
          </Box>
        </form>
      </Card>
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(methods.watch(), 0, 2) : ""}</pre>
      {openMapping && (
        <DialogMappingGuestLine
          open={openMapping}
          onClose={() => setOpenMapping(false)}
          lookupList={{
            departmentList: lookupList["departmentList"],
            accountCodeList: lookupList["accountCodeList"],
          }}
          dimValueCfg={dimValueCfg}
        />
      )}
    </div>
  );
}
