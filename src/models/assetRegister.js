import gbl from "utils/formatter";

export default {
  ReqId: -1,
  Id: "",
  No: "Auto",
  InputDate: new Date(),
  AcquireDate: new Date(),
  TransferDate: new Date(),
  VnCode: "",
  CategoryCode: "",
  DepartmentCode: "",
  Barcode: "",
  Amount: 0,
  BaseAmount: 0,
  InitAccu: 0,
  InvoiceNo: "",
  Life: 1,
  LifeType: "Year",
  LocationCode: "",
  Name: "",
  Qty: 1,
  Remark: "",
  RemainDay: 0,
  CurCode: "",
  CurRate: 0,
  RemainNet: 0,
  RemainQty: 0,
  RemainTotalCost: 0,
  Salvage: 1,
  TotalSalvage: 1,
  SerialNo: "",
  Spec: "",
  TotalCost: 0,
  UnitCode: "",
  DepreDeptCode: "",
  DepreAccCode: "",
  AccuDeptCode: "",
  AccuAccCode: "",
  CostDeptCode: "",
  CostAccCode: "",
  AstPhoto:
    "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",
  DimList: {},
  UserModified: gbl.UserName,
};