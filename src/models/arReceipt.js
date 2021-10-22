import gbl from "utils/formatter";

export default {
  RcpthSeq: 0,
  ArNo: "",
  RcpthDate: new Date(),
  SetAsSettleDate: false,
  DeptCr: "",
  CrAcc: "",
  DeptDr: "",
  DrAcc: "",
  CurrCode: "",
  CurrRate: 0,
  Amount: 0,
  BaseAmt: 0,
  NetAmt: 0,
  NetBaseAmt: 0,
  GainLossAmt: 0,
  DeptGL: "",
  GainLossAcc: "",
  AvlCrAmt: 0,
  AvlCrBaseAmt: 0,
  RcptDesc: "",
  RcptType: "",
  RunNoType: true,
  RcptRefNo: "Auto",
  RcpthStatus: "Effective",
  PayType: "",
  PayRefNo: "",
  PayDate: new Date(),
  TaxInvNo: "Auto",
  TaxRate: 0,
  TaxType: "None",
  TaxAmt: 0,
  TaxBaseAmt: 0,
  DeptTax: "",
  TaxAcc: "",
  TaxOverwrite: false,
  WhtDept: "",
  WhtAcc: "",
  WhtAmt: 0,
  AmtBfWht: 0,
  WhtType: "Add",
  WhtRate: 0,
  WhtOverWrite: false,
  BankChargeDept: "",
  BankChargeAcc: "",
  BankChargeAmt: 0,
  RunTaxType: true,
  Billto: "Address1",
  BillToName: "",
  BillToCompany: "",
  BillToAddress: "",
  UserModified: gbl.UserName,
  Detail: [],
};