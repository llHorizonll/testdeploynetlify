export const UserName = localStorage.getItem("UserName") ?? "";

export const Base64DecodeUnicode = (str) => {
  // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
  let percentEncodedStr = atob(str)
    .split("")
    .map(function (c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    })
    .join("");

  return decodeURIComponent(percentEncodedStr);
};

export const ParseINIString = (data) => {
  var regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/,
  };
  var value = {};
  var lines = data.split(/[\r\n]+/);
  var section = null;
  lines.forEach(function (line) {
    if (regex.comment.test(line)) {
      return;
    } else if (regex.param.test(line)) {
      let match = line.match(regex.param);
      if (section) {
        value[section][match[1]] = match[2];
      } else {
        value[match[1]] = match[2];
      }
    } else if (regex.section.test(line)) {
      let match = line.match(regex.section);
      value[match[1]] = {};
      section = match[1];
    } else if (line.length === 0 && section) {
      section = null;
    }
  });
  return value;
};

export const PadNumberString = (string) => {
  const regex = /[0-9]+/i;
  return string.replace(regex, (m) => m.padStart(2, "0"));
};

export default {
  UserName,
  Base64DecodeUnicode,
  ParseINIString,
  PadNumberString,
};
