import { Resource } from "react-admin";
import Icon from "@material-ui/core/Icon";
import CommentIcon from "@material-ui/icons/Comment";
import AssignmentIcon from "@material-ui/icons/Assignment";
import Avatar from "@material-ui/core/Avatar";

import JournalVoucher from "pages/generalLedger/JournalVoucher";
import StdVoucher from "pages/generalLedger/StdVoucher";
import ChartOfAccount from "pages/generalLedger/ChartOfAccount";
import Budget from "pages/generalLedger/Budget";
import GlProcedure from "pages/generalLedger/Procedure";

import ApVendor from "pages/accountsPayable/ApVendor";
import ApInvoice from "pages/accountsPayable/ApInvoice";
import ApPayment from "pages/accountsPayable/ApPayment";
import ApProcedure from "pages/accountsPayable/Procedure";

import ArProfile from "pages/accountsReceivable/ArProfile";
import ArFolio from "pages/accountsReceivable/ArFolio";
import ArInvoice from "pages/accountsReceivable/ArInvoice";
import ArReceipt from "pages/accountsReceivable/ArReceipt";
import ArProcedure from "pages/accountsReceivable/Procedure";

import AssetRegister from "pages/asset/AssetRegister";
import AssetDisposal from "pages/asset/AssetDisposal";
import AssetProcedure from "pages/asset/Procedure";

import Report from "../pages/Report";

const avartarWidth = {
  width: 30,
  height: 30,
  backgroundColor: "#2196f3",
};

const avatarText = {
  fontSize: 14,
};

const ReportIcon = () => {
  return <Icon>assessment</Icon>;
};

const resources = [
  <Resource
    key="GL"
    name="menuGl"
    options={{ id: "GL", label: "General Ledger", IsSubmenu: true }}
    icon={
      <Avatar style={avartarWidth}>
        <span style={avatarText}>GL</span>
      </Avatar>
    }
  />,
  <Resource
    key="glJv"
    name="glJv"
    options={{ label: "Journal Voucher", parentName: "menuGl", permitName: "GL.Jv" }}
    icon={CommentIcon}
    {...JournalVoucher}
  />,
  <Resource
    key="glJvFr"
    name="glJvFr"
    options={{ label: "Standard Jv", parentName: "menuGl", permitName: "GL.StdJv" }}
    icon={CommentIcon}
    {...StdVoucher}
  />,
  <Resource
    key="chartOfAcc"
    name="accountCode"
    options={{ label: "Chart Of Account", parentName: "menuGl", permitName: "GL.ChartOfAccount" }}
    icon={CommentIcon}
    {...ChartOfAccount}
  />,
  <Resource
    key="budget"
    name="budget"
    options={{ label: "Budget", parentName: "menuGl", permitName: "GL.Budget" }}
    icon={CommentIcon}
    {...Budget}
  />,
  <Resource
    key="menuProcedureGl"
    name="procedureGl"
    options={{ label: "Procedure", parentName: "menuGl" }}
    icon={AssignmentIcon}
    {...GlProcedure}
  />,
  <Resource
    key="reportGl"
    name="reportGl"
    options={{ label: "Report", parentName: "menuGl", groupName: "GL" }}
    icon={ReportIcon}
    {...Report}
  />,
  <Resource
    key="AP"
    name="menuAp"
    options={{ id: "AP", label: "Accounts Payable", IsSubmenu: true }}
    icon={
      <Avatar style={avartarWidth}>
        <span style={avatarText}>AP</span>
      </Avatar>
    }
  />,
  <Resource
    key="apVendor"
    name="apVendor"
    options={{ label: "Vendor", parentName: "menuAp", permitName: "AP.Vendor" }}
    icon={CommentIcon}
    {...ApVendor}
  />,
  <Resource
    key="apInvoice"
    name="apInvoice"
    options={{ label: "Invoice", parentName: "menuAp", permitName: "AP.Invoice" }}
    icon={CommentIcon}
    {...ApInvoice}
  />,
  <Resource
    key="apPayment"
    name="apPayment"
    options={{ label: "Payment", parentName: "menuAp", permitName: "AP.Payment" }}
    icon={CommentIcon}
    {...ApPayment}
  />,
  <Resource
    key="menuProcedureAp"
    name="procedureAp"
    options={{ label: "Procedure", parentName: "menuAp" }}
    icon={AssignmentIcon}
    {...ApProcedure}
  />,
  <Resource
    key="reportAp"
    name="reportAp"
    options={{ label: "Report", parentName: "menuAp", groupName: "AP" }}
    icon={ReportIcon}
    {...Report}
  />,
  <Resource
    key="AR"
    name="menuAr"
    options={{ id: "AR", label: "Accounts Receivable", IsSubmenu: true }}
    icon={
      <Avatar style={avartarWidth}>
        <span style={avatarText}>AR</span>
      </Avatar>
    }
  />,
  <Resource
    key="arProfile"
    name="arProfile"
    options={{ label: "Profile", parentName: "menuAr", permitName: "AR.Profile" }}
    icon={CommentIcon}
    {...ArProfile}
  />,
  <Resource
    key="arFolio"
    name="arFolio"
    options={{ label: "Folio", parentName: "menuAr" }}
    icon={CommentIcon}
    {...ArFolio}
  />,
  <Resource
    key="arInvoice"
    name="arInvoice"
    options={{ label: "Invoice", parentName: "menuAr", permitName: "AR.Invoice" }}
    icon={CommentIcon}
    {...ArInvoice}
  />,
  <Resource
    key="arReceipt"
    name="arReceipt"
    options={{ label: "Receipt", parentName: "menuAr", permitName: "AR.Receipt" }}
    icon={CommentIcon}
    {...ArReceipt}
  />,

  <Resource
    key="menuProcedureAr"
    name="procedureAr"
    options={{ label: "Procedure", parentName: "menuAr" }}
    icon={AssignmentIcon}
    {...ArProcedure}
  />,
  <Resource
    key="reportAr"
    name="reportAr"
    options={{ label: "Report", parentName: "menuAr", groupName: "AR" }}
    icon={ReportIcon}
    {...Report}
  />,
  <Resource
    key="AST"
    name="menuAsset"
    options={{ id: "AST", label: "Asset", IsSubmenu: true }}
    icon={
      <Avatar style={avartarWidth}>
        <span style={avatarText}>AS</span>
      </Avatar>
    }
  />,
  <Resource
    key="asVendor"
    name="asVendor"
    options={{ label: "Vendor", parentName: "menuAsset", permitName: "AP.Vendor" }}
    icon={CommentIcon}
    {...ApVendor}
  />,
  <Resource
    key="assetRegister"
    name="assetRegister"
    options={{ label: "Asset Register", parentName: "menuAsset", permitName: "Ast.Register" }}
    icon={CommentIcon}
    {...AssetRegister}
  />,
  <Resource
    key="assetDisposal"
    name="assetDisposal"
    options={{ label: "Asset Disposal", parentName: "menuAsset", permitName: "Ast.Disposal" }}
    icon={CommentIcon}
    {...AssetDisposal}
  />,
  <Resource
    key="menuProcedureAsset"
    name="procedureAsset"
    options={{ label: "Procedure", parentName: "menuAsset" }}
    icon={AssignmentIcon}
    {...AssetProcedure}
  />,
  <Resource
    key="reportAsset"
    name="reportAsset"
    options={{ label: "Report", parentName: "menuAsset", groupName: "ASSET" }}
    icon={ReportIcon}
    {...Report}
  />,
  // <Resource
  //   key="INC"
  //   name="menuIncome"
  //   options={{ id: "INC", label: "Income", IsSubmenu: true }}
  //   icon={
  //     <Avatar style={avartarWidth}>
  //       <span style={avatarText}>IC</span>
  //     </Avatar>
  //   }
  // />,
];

export default resources;
