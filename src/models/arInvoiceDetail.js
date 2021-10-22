import gbl from "utils/formatter";

export default {
  InvdSeq: 0,
  InvhSeq: 0,
  GroupNo: 0,
  InvdNo: 0,
  InvdDesc: "",
  InvdRemark: "",
  DeptCode: "",
  CrAcc: "",
  DrAcc: "",
  Qty: 1,
  Unit: "",
  Price: 0,
  NetAmt: 0,
  NetBaseAmt: 0,
  TotalAmt: 0,
  TotalBaseAmt: 0,
  TaxAcc1: "",
  TaxType1: "None",
  TaxRate1: 0,
  TaxAmt1: 0,
  TaxBaseAmt1: 0,
  TaxOverwrite1: "",
  TaxAcc2: "",
  TaxType2: "None",
  TaxRate2: 0,
  TaxAmt2: 0,
  TaxBaseAmt2: 0,
  TaxOverwrite2: "",
  Unpaid: 0,
  Paid: 0,
  PfmSeq: 0,
  InvdDate: new Date(),
  UserModified: gbl.UserName,
  DimList: {
    Dim: [],
  },
};