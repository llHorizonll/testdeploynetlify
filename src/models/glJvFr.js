import gbl from "utils/formatter";
import { format } from "date-fns";

export default {
  Type: "Template",
  Prefix: "",
  Description: "",
  FJvhFrom: format(new Date(), "MM/yyyy"),
  FJvhTo: format(new Date(), "MM/yyyy"),
  FJvhFromYr: "",
  FJvhToYr: "",
  FJvhFromPr: "",
  FJvhToPr: "",
  FJvhFreq: 1,
  Detail: [],
  DimHList: {
    Dim: [],
  },
  UserModified: gbl.UserName,
};
