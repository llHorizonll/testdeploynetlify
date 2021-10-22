/* eslint-disable no-unused-vars */

const arrCompany = [
  {
    name: "Carmen.dev",
    apiUrl: `http://app.blueledgers.com:88/carmen.dev.api`,
    adminToken: "602380b9f449404d7d6f6aaffcee4bd5",
  },
  {
    name: "Carmen.demo",
    apiUrl: `https://carmen4.com/Carmen.Demo`,
    adminToken: "70ff70b09e1ee5b9e7155fda6b9a59e2",
  },
  {
    name: "Carmen Office (HO)",
    apiUrl: `https://carmen4.com/carmen.api`,
    adminToken: "1c2801844de9d96d42f7274e1ae265eb",
  },
];

//TODO: switch index arrCompany for default company
const { apiUrl, adminToken } = arrCompany[1];
//TODO: switch show test version dev or anything
const env = "demo";
