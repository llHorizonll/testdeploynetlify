import React from "react";
import LuckyExcel from "luckyexcel";

class Luckysheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "", file: null };
    this.uploadFile = this.uploadFile.bind(this);
  }

  componentDidMount() {
    const luckysheet = window.luckysheet;
    luckysheet.create({
      container: "luckysheet",
      showinfobar: false,
      plugins: ["chart"],
    });
  }

  uploadFile(e) {
    this.setState({ file: e.target.files[0] });
    LuckyExcel.transformExcelToLucky(
      e.target.files[0],
      function (exportJson, luckysheetfile) {
        if (exportJson.sheets === null || exportJson.sheets.length === 0) {
          alert(
            "Failed to read the content of the excel file, currently does not support xls files!"
          );
          return;
        }
        window.luckysheet.destroy();

        window.luckysheet.create({
          container: "luckysheet", //luckysheet is the container id
          showinfobar: false,
          data: exportJson.sheets,
          title: exportJson.info.name,
          userInfo: exportJson.info.name.creator,
        });
      }
    );
  }

  render() {
    const luckyCss = {
      marginTop: "120px",
      padding: "0px",
      position: "absolute",
      width: "100%",
      height: "85%",
      left: "0px",
      top: "0px",
    };

    return (
      <div>
        <div id="luckysheet" style={luckyCss}></div>
        &nbsp;
        <form style={{ marginLeft: 20 }}>
          <input
            type="text"
            value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
          <input id="file" type="file" onChange={this.uploadFile} />
        </form>
      </div>
    );
  }
}

export default Luckysheet;
