import React, { createContext, useReducer } from "react";
import accounting from "accounting";
import { format, parse } from "date-fns";

export const GblContext = createContext({});

function getLocalStorage(key) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : {};
  } catch (e) {
    // if error, return initial value
    return {};
  }
}

const initialState = {
  settingAll: getLocalStorage("SettingAll"),
};

const gblReducer = (state, action) => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case "UPDATE_SETTING":
      return {
        ...state, // copy state
        settingAll: action.payload, // set state settingAll
      };
  }
};

export const FormatterProvider = ({ children }) => {
  const [gblState, gblDispatch] = useReducer(gblReducer, initialState);

  const { settingAll } = gblState;

  const UpdateSettingAll = (payload) => gblDispatch({ type: "UPDATE_SETTING", payload }); // ส่ง type UPDATE_SETTING และ payload เพื่อให้ gblReducer ไปใช้งานต่อ

  const DateToString = (date, dateFormat = settingAll.SettingSystem.DateFormat) => {
    if (!date || date === "") {
      return "";
    }
    return format(new Date(date), dateFormat);
  };

  const ToMySqlDate = (date) => {
    if (!date || date === "") {
      return "";
    }

    return format(date, "yyyy-MM-dd");
  };

  const StringToDate = (string, dateFormat = settingAll.SettingSystem.DateFormat) => {
    if (!string || string === "") {
      return "";
    }

    return parse(string, dateFormat, new Date());
  };

  const NumberFormat = (value, type = "base") => {
    let SettingSystem = settingAll.SettingSystem;
    function switchTypeOfDecimal() {
      var typeOfPrecision;
      switch (type) {
        case "percent":
          typeOfPrecision = 0;
          break;
        case "currency":
          typeOfPrecision = SettingSystem.CurrencyRateDecimal;
          break;
        case "unit":
          typeOfPrecision = SettingSystem.CostPerUnitBaseDecimal;
          break;
        case "qty":
          typeOfPrecision = SettingSystem.BaseQtyDecimal;
          break;
        default:
          typeOfPrecision = SettingSystem.CurrencyBaseDecimal;
          break;
      }
      return typeOfPrecision;
    }

    if (SettingSystem) {
      accounting.settings = {
        currency: {
          symbol: "$", // default currency symbol is '$'
          format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
          precision: SettingSystem.CurrencyRateDecimal, // decimal places
        },
        number: {
          precision: switchTypeOfDecimal(), // default precision on numbers is CurrencyBaseDecimal
          decimal: SettingSystem.DecimalSeparator, // decimal point separator
          thousand: SettingSystem.ThousandSeparator, // thousands separator
        },
      };
    }

    return accounting.formatNumber(value);
  };

  const NumberFormatP1 = (value) => {
    let SettingSystem = settingAll.SettingSystem;
    if (SettingSystem) {
      accounting.settings = {
        currency: {
          symbol: "$", // default currency symbol is '$'
          format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
          precision: SettingSystem.CurrencyRateDecimal, // decimal places
        },
        number: {
          precision: 1, // default precision on numbers is 0
          decimal: SettingSystem.DecimalSeparator, // decimal point separator
          thousand: SettingSystem.ThousandSeparator, // thousands separator
        },
      };
    }
    return accounting.formatNumber(value);
  };

  const CurrencyFormat = (value, symbol) => {
    var s;
    let SettingSystem = settingAll.SettingSystem;
    if (SettingSystem) {
      if (symbol !== "ROOM" && symbol) {
        if (symbol === "THB") {
          s = "฿ ";
        }
        if (symbol === "USD") {
          s = "$ ";
        }
        return accounting.formatMoney(
          value,
          s,
          SettingSystem.CurrencyBaseDecimal,
          SettingSystem.ThousandSeparator,
          SettingSystem.DecimalSeparator
        );
      } else if (symbol === "ROOM") {
        return accounting.formatNumber(value, 0, " ");
      } else {
        return accounting.formatNumber(
          value,
          SettingSystem.CurrencyBaseDecimal,
          SettingSystem.ThousandSeparator,
          SettingSystem.DecimalSeparator
        );
      }
    }
  };

  const FixedSumValue = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

  const ToNumber = (value) => accounting.unformat(value);

  const FindTaxAmount = (taxType, taxRate, netAmt) => {
    switch (taxType) {
      case "Add":
        return Math.round((netAmt * (taxRate / 100) + Number.EPSILON) * 100) / 100;
      case "Include":
        //TODO: use CurrencyBase Or CurrencyRateDecimal
        return Number(
          accounting.toFixed(netAmt - (netAmt / (taxRate + 100)) * 100, settingAll.SettingSystem.CurrencyBaseDecimal)
        );
      default:
        return 0;
    }
  };

  const mergeFunctionExport = {
    UpdateSettingAll,
    DateToString,
    ToMySqlDate,
    StringToDate,
    NumberFormat,
    NumberFormatP1,
    CurrencyFormat,
    FixedSumValue,
    ToNumber,
    FindTaxAmount,
  };

  return (
    <GblContext.Provider
      value={{
        settingAll,
        ...mergeFunctionExport,
      }}
    >
      {children}
    </GblContext.Provider>
  );
};
