import { add, format, eachMonthOfInterval, endOfMonth } from "date-fns";

export const DimensionType = ["Text", "Number", "Date", "List", "Boolean"];

export const AccTypeOptions = ["Balance Sheet", "Header", "Income Statement", "Total", "Static"];

export const AccModuleOptions = [
  { name: "Account Payable", value: "UseInAp" },
  { name: "Account Receivable", value: "UseInAr" },
  { name: "General Ledger", value: "UseInGl" },
  { name: "Asset Management", value: "UseInAsset" },
];

export const AssetNumberFormat = [
  { name: "Manual", value: "Manual" },
  { name: "Auto Category + Department", value: "CategoryAndDepartment" },
  { name: "Auto Category", value: "Category" },
];

export const AssetLifeOptions = ["Year", "Month", "Day"];

export const DisposalTypeOptions = ["Quantity", "Amount"];

export const VatTypeOptions = ["None", "Add", "Include"];

export const InvoiceTaxStatusOptions = ["None", "Confirm", "Pending", "UnClaim"];

export const VatTypeAR = ["None", "InputVat", "OutputVat"];

export const AgingPeriodOptions = [
  { name: "by Input Date", value: "InvoiceCreateDate" },
  { name: "by Due Date", value: "InvoiceDueDate" },
  { name: "by Invoice Date", value: "InvoiceDate" },
];

export const PaymentPostingDateOptions = [
  { name: "Payment Date", value: "PaymentDate" },
  { name: "Cheque Date", value: "ChequeDate" },
  { name: "ChequeClearing Date", value: "ChequeClearingDate" },
];

export const PeriodList = (date = new Date()) => {
  let startDate = add(date, { years: -3 });
  let endDate = add(date, { years: 3 });
  var arrDate = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  });
  return arrDate.map((item) => format(item, "MM/yyyy"));
};

export const PeriodListWithYear = (date = new Date(), countStartDate, countEndDate) => {
  let startDate = add(date, { years: countStartDate });
  let endDate = add(date, { years: countEndDate });

  var arrDate = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  });

  return arrDate.map((item) => format(endOfMonth(item), "dd/MM/yyyy"));
};
