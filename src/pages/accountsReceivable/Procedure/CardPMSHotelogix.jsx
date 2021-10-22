/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useForm } from "react-hook-form";
import { getAccountCodeList, getDepartmentList } from "services/setting";
import { getLookup } from "services/lookup";
import { getSettingInfHotelogix, uploadFileHotelogix } from "services/interface";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import { Button, Typography } from "@material-ui/core";
import { MuiAutosuggest, SelectInForm, NumberFormatInForm, DescInForm } from "components/Form";
import DialogMappingHotelogix from "./DialogMappingHotelogix";
import DialogPostingResult from "./DialogPostingResult";
import { VatTypeOptions } from "utils/options";
import fileReader from "utils/fileReader";
import gbl from "utils/formatter";

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
  const [openMapping, setOpenMapping] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [lookupList, setLookupList] = useState({
    accountCodeList: [],
    departmentList: [],
    arProfileList: [],
  });
  const [config, setConfig] = useStateWithCallbackLazy();
  //const [selectedFile, setSelectedFile] = useState();
  const [postData, setPostData] = useState([]);
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
  const fetchArNoLookup = async () => {
    const r = await getLookup("ArNo");
    setLookupList((state) => ({
      ...state,
      arProfileList: r,
    }));
  };

  const fetchSetting = useCallback(async () => {
    const Config = await getSettingInfHotelogix();
    Config.DataFilePath = null;
    setConfig(Config);
    reset(Config);
  }, []);

  useEffect(() => {
    fetchAccLookup();
    fetchDeptLookup();
    fetchArNoLookup();
  }, []);

  useEffect(() => {
    fetchSetting();
  }, [fetchSetting]);

  const onSubmit = (values) => {
    //Adjust parameter before save
    setConfig(
      (state) => ({
        ...state,
        ...values,
      }),
      async (nextState) => {
        if (nextState.DataFilePath === null) {
          alert("File Not Found");
          return;
        }
        let paramUploadFile = {
          FileData: nextState.DataFilePath,
          UserModified: gbl.UserName,
          LastModified: new Date(),
        };
        var data = await uploadFileHotelogix(paramUploadFile);
        Save(data);
      }
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
    let item = values.find((item) => item.IsPost === true);
    if (item) {
      let msg = "The data already exists. Would you like to repost?";
      let dialog = window.confirm(msg);
      if (dialog) {
        setPostData(values);
        setOpenResult(true);
      } else {
        return;
      }
    } else {
      setPostData(values);
      setOpenResult(true);
    }
  };

  return (
    <div>
      <Card variant="outlined">
        <Box p={1} display="flex">
          <Box p={1} flexGrow={1}>
            <Typography variant="h6" className={classes.title2}>
              Hotelogix
            </Typography>
            <Typography variant="caption">Posting from PMS - Hotelogix</Typography>
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
          <Box p={1} align="left">
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
                label="Dr Acc. Code"
                name="DrAccCode"
                optKey="AccCode"
                optDesc="Description"
                options={lookupList["accountCodeList"]}
                updateOtherField={[{ key: "DrAccDesc", optKey: "Description" }]}
                methods={methods}
                style={{ width: 200 }}
              />
              <DescInForm
                style={{ paddingLeft: 20 }}
                name="DrAccDesc"
                methods={methods}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box p={1} display="flex">
              <MuiAutosuggest
                label="Cr Acc. Code"
                name="CrAccCode"
                optKey="AccCode"
                optDesc="Description"
                options={lookupList["accountCodeList"]}
                updateOtherField={[{ key: "CrAccDesc", optKey: "Description" }]}
                methods={methods}
                style={{ width: 200 }}
              />
              <DescInForm
                style={{ paddingLeft: 20 }}
                name="CrAccDesc"
                methods={methods}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box p={1} display="flex">
              <MuiAutosuggest
                label="Tax AccountCode"
                name="TaxAccCode"
                optKey="AccCode"
                optDesc="Description"
                options={lookupList["accountCodeList"]}
                updateOtherField={[{ key: "TaxAccDesc", optKey: "Description" }]}
                methods={methods}
                style={{ width: 200 }}
              />
              <DescInForm
                style={{ paddingLeft: 20 }}
                name="TaxAccDesc"
                methods={methods}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box p={1} display="flex" style={{ width: 200 }}>
              <SelectInForm label="TaxType" name="TaxType" methods={methods} options={VatTypeOptions} />
            </Box>
            <Box p={1} display="flex" style={{ width: 200 }}>
              <NumberFormatInForm label="Tax Rate" methods={methods} name="TaxRate" />
            </Box>
          </Box>
          <Box py={1} align="center">
            <Box p={1}>
              <i>{"COA for assign as the invoice detail."}</i>
            </Box>
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
        <DialogMappingHotelogix
          open={openMapping}
          onClose={() => setOpenMapping(false)}
          lookupList={{
            departmentList: lookupList["departmentList"],
            accountCodeList: lookupList["accountCodeList"],
          }}
        />
      )}
      {openResult && (
        <DialogPostingResult
          open={openResult}
          onClose={() => setOpenResult(false)}
          lookupList={{
            departmentList: lookupList["departmentList"],
            accountCodeList: lookupList["accountCodeList"],
            arProfileList: lookupList["arProfileList"],
          }}
          data={postData}
          updateData={(idx, arno) => {
            postData[idx].ArNo = arno;
            setPostData(postData);
          }}
        />
      )}
    </div>
  );
}
