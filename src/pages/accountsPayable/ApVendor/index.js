import React, { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-admin";
import {
  TextFieldInForm,
  NumberFormatInForm,
  MuiAutosuggest,
  DescInForm,
  SwitchInForm,
  SelectInForm,
} from "components/Form";
import { getAccountCodeList, getDepartmentList, getVdCategoryList, getApPaymentTypeList } from "services/setting";
import List from "./List";
import Show from "./Show";
import Edit from "./Edit";
import Create from "./Create";
import { VatTypeOptions } from "utils/options";

const ViewMode = (props) => {
  return <Show {...props} />;
};

const SwitchActionMode = (props) => {
  const { authenticated } = useAuthState();
  const addMode = props.location.pathname.search("create") !== -1;
  const [lookupList, setLookupList] = useState({
    accountCode: [],
    department: [],
    vdCategory: [],
    apPaymentType: [],
  });
  const fetchAccLookup = useCallback(async () => {
    const { Data } = await getAccountCodeList("Ap");
    setLookupList((state) => ({
      ...state,
      accountCode: Data,
    }));
  }, []);
  const fetchDeptLookup = useCallback(async () => {
    const { Data } = await getDepartmentList();
    setLookupList((state) => ({
      ...state,
      department: Data,
    }));
  }, []);
  const fetchVdCategoryLookup = useCallback(async () => {
    const { Data } = await getVdCategoryList();
    setLookupList((state) => ({
      ...state,
      vdCategory: Data,
    }));
  }, []);
  const fetchPaymentTypeLookup = useCallback(async () => {
    const { Data } = await getApPaymentTypeList();
    setLookupList((state) => ({
      ...state,
      apPaymentType: Data,
    }));
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAccLookup();
      fetchDeptLookup();
      fetchVdCategoryLookup();
      fetchPaymentTypeLookup();
    }
  }, [authenticated, fetchAccLookup, fetchDeptLookup, fetchVdCategoryLookup, fetchPaymentTypeLookup]);

  const formFieldsVendor = [
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="* Vendor No."
          name="VnCode"
          variant="outlined"
          margin="dense"
          disabled={!addMode}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 10,
              message: "maximun length is 10",
            },
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="* Vendor Name"
          name="VnName"
          variant="outlined"
          margin="dense"
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <MuiAutosuggest
          label="* Category"
          name="VnCateCode"
          optKey="VnCateCode"
          optDesc="VnCateDesc"
          options={lookupList["vdCategory"]}
          updateOtherField={[{ key: "VnCateDesc", optKey: "VnCateDesc" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      name: "VnCateDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnCateDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 1,
      name: "Active",
      field: <SwitchInForm name="Active" defaultChecked />,
    },
  ];

  const formFieldsInfo = [
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="WHT. Name"
          name="VnPayee"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="Chq. Name"
          name="Vn2Payee"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
        />
      ),
    },
    {
      size: 4,
      field: (
        <TextFieldInForm
          label="Atten"
          name="VnAttn"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Tax ID."
          name="VnTaxNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Branch No."
          name="BranchNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 20,
              message: "maximum length is 20",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Bus Reg No."
          name="VnRegNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 20,
              message: "maximum length is 20",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="Credit Term"
          name="VnTerm"
          decimal={0}
          rule={{
            maxLength: {
              value: 3,
              message: "maximum length is 3",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="Discount Term"
          name="VnDisTrm"
          decimal={0}
          rule={{
            maxLength: {
              value: 3,
              message: "maximum length is 3",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <NumberFormatInForm
          label="Less (%)"
          name="VnDisPct"
          decimal={0}
          rule={{
            maxLength: {
              value: 3,
              message: "maximum length is 3",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Reference"
          name="VnReference"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximum length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 2,
      field: (
        <TextFieldInForm
          label="Mapping Ref"
          name="VnMapRef"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 30,
              message: "maximum length is 30",
            },
          }}
        />
      ),
    },
  ];

  const formFieldsAddress = [
    {
      size: 6,
      field: (
        <TextFieldInForm
          label="Address1"
          name="mergeVnAdd"
          variant="outlined"
          margin="dense"
          multiline
          rows={4}
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <TextFieldInForm
          label="Address2"
          name="mergeVn2Add"
          variant="outlined"
          margin="dense"
          multiline
          rows={4}
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Tel"
          name="VnTel"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 50,
              message: "maximun length is 50",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Email"
          name="VnEmail"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 50,
              message: "maximun length is 50",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Tel"
          name="Vn2Tel"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 50,
              message: "maximun length is 50",
            },
          }}
        />
      ),
    },
    {
      size: 3,
      field: (
        <TextFieldInForm
          label="Email"
          name="Vn2Email"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 50,
              message: "maximun length is 50",
            },
          }}
        />
      ),
    },
  ];

  const formFieldsBank = [
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="Name"
          name="BankName"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="Acc Name."
          name="BankAccountName"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="Acc No."
          name="BankAccountNo"
          variant="outlined"
          margin="dense"
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
    {
      size: 12,
      field: (
        <TextFieldInForm
          label="Bank Ref."
          name="mergeBankRef"
          variant="outlined"
          margin="dense"
          multiline
          rows={3}
          rule={{
            maxLength: {
              value: 255,
              message: "maximun length is 255",
            },
          }}
        />
      ),
    },
  ];

  const formFieldsInvoice = [
    {
      size: 6,
      field: <SelectInForm label="Vat Type 1" name="VnVat1" options={VatTypeOptions} />,
    },
    {
      size: 6,
      field: <NumberFormatInForm label="Vat Rate 1 (%)" name="VnTaxR1" />,
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="Dr Vat 1"
          name="VnVat1DrAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCode"]}
          updateOtherField={[{ key: "VnVat1DrAccDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 6,
      name: "VnVat1DrAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnVat1DrAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: <SelectInForm label="Vat Type 2" name="VnVat2" options={VatTypeOptions} />,
    },
    {
      size: 6,
      field: <NumberFormatInForm label="Vat Rate 2 (%)" name="VnTaxR2" />,
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="Dr Vat 2"
          name="VnVat2DrAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCode"]}
          updateOtherField={[{ key: "VnVat2DrAccDesc", optKey: "Description" }]}
        />
      ),
    },
    {
      size: 6,
      name: "VnVat2DrAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnVat2DrAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* Cr A/P Acc."
          name="VnVatCrAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCode"]}
          updateOtherField={[{ key: "VnVatCrAccDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      name: "VnVatCrAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnVatCrAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  const formFieldsPayment = [
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* Type"
          name="VnPayType"
          optKey="Code"
          optDesc="Desc"
          options={lookupList["apPaymentType"]}
          updateOtherField={[{ key: "VnPayTypeDesc", optKey: "Desc" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      name: "VnPayTypeDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnPayTypeDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* Payment Dept."
          name="VnPayDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["department"]}
          updateOtherField={[{ key: "VnPayDeptDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      name: "VnPayDeptDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnPayDeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* Cr Acc. Code"
          name="VnCrAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCode"]}
          updateOtherField={[{ key: "VnCrAccDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      name: "VnCrAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnCrAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* WHT. Dept.."
          name="VnWhtDeptCode"
          optKey="DeptCode"
          optDesc="Description"
          options={lookupList["department"]}
          updateOtherField={[{ key: "VnWhtDeptDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      name: "VnWhtDeptDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnWhtDeptDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
    {
      size: 6,
      field: (
        <MuiAutosuggest
          label="* Cr Acc. Code"
          name="VnWhtAccCode"
          optKey="AccCode"
          optDesc="Description"
          options={lookupList["accountCode"]}
          updateOtherField={[{ key: "VnWhtAccDesc", optKey: "Description" }]}
          rule={{
            required: {
              value: true,
              message: "* Required",
            },
          }}
        />
      ),
    },
    {
      size: 6,
      name: "VnWhtAccDesc",
      field: (
        <DescInForm
          style={{ marginTop: 8 }}
          name="VnWhtAccDesc"
          InputProps={{
            readOnly: true,
          }}
        />
      ),
    },
  ];

  if (addMode) {
    return (
      <Create
        {...props}
        formFieldsVendor={formFieldsVendor}
        formFieldsInfo={formFieldsInfo}
        formFieldsAddress={formFieldsAddress}
        formFieldsBank={formFieldsBank}
        formFieldsInvoice={formFieldsInvoice}
        formFieldsPayment={formFieldsPayment}
      />
    );
  } else {
    return (
      <Edit
        {...props}
        formFieldsVendor={formFieldsVendor}
        formFieldsInfo={formFieldsInfo}
        formFieldsAddress={formFieldsAddress}
        formFieldsBank={formFieldsBank}
        formFieldsInvoice={formFieldsInvoice}
        formFieldsPayment={formFieldsPayment}
      />
    );
  }
};

export default {
  list: List,
  show: ViewMode,
  edit: SwitchActionMode,
  create: SwitchActionMode,
};
