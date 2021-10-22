import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Drawer, Typography, Tooltip, Avatar, Divider, Icon, Input, IconButton } from "@material-ui/core";
import DimensionContent from "components/DimensionContent";
import TaxVatContent from "components/TaxVatContent";
import SummaryRightSide from "components/SummaryRightSide";
import { addComment, getCommentById, downloadCommentById, getCommentListByModule } from "services/comment";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7),
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 0.5),
    marginTop: 50,
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  divIcon: {
    padding: theme.spacing(0, 0.5),
  },
  avtCenter: {
    margin: "0 auto",
    padding: theme.spacing(0.6),
    cursor: "pointer",
  },
  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: 14,
  },
  content: {
    padding: 5,
  },
  contentRight: {
    textAlign: "right",
    marginRight: 10,
  },
}));

const TaxOpen = ({ dataTax }) => {
  const classes = useStyles();
  return (
    <Box>
      <Typography variant="h6" className={classes.content}>
        Tax
      </Typography>
      <TaxVatContent data={dataTax} module={module} />
      <Divider />
      <Typography variant="h6" className={classes.content}>
        Base Summary
      </Typography>
      <SummaryRightSide data={dataTax} />
    </Box>
  );
};

const CommentOpen = ({ module, moduleId }) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = React.useState(true);
  const userName = localStorage.getItem("UserName");
  const [dataComment, setDataComment] = React.useState();
  const [message, setMessage] = React.useState();
  async function getCommentList(module, moduleId) {
    const response = await getCommentListByModule(module, moduleId);
    if (response) {
      response.Data.forEach((element) => {
        let date = new Date(element.LastModified);
        element.stringDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      });
      setDataComment(response.Data);
      setIsLoading(false);
    }
  }
  React.useEffect(() => {
    if (!dataComment) {
      getCommentList(module, moduleId);
    }
  }, [dataComment, module, moduleId]);

  const attachFile = (e) => {
    console.log(e.target.files[0]);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
      let param = {
        Module: module,
        ModuleId: moduleId,
        Message: "",
        File: base64String,
        FileInfo: {
          FileName: e.target.files[0].name,
          FileExtension: e.target.files[0].type,
        },
        UserModified: userName,
      };
      await addComment(param);
      await getCommentList(module, moduleId);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const sendComment = async (e) => {
    if (message) {
      let param = {
        Module: module,
        ModuleId: moduleId,
        Message: message,
        UserModified: userName,
      };
      const r = await addComment(param);
      console.log(r);
      await getCommentList(module, moduleId);
      setMessage("");
    }
  };

  const doResizeOrSendComment = async (e) => {
    let key = e.key;
    if (key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        setIsLoading(true);
        let param = {
          Module: module,
          ModuleId: moduleId,
          Message: message,
          UserModified: userName,
        };
        const r = await addComment(param);
        console.log(r);
        await getCommentList(module, moduleId);
        setMessage("");
      }
    } else {
      var maxrows = 5;
      var txt = e.target.value;
      var cols = e.target.cols;

      var arraytxt = txt.split("\n");
      var rows = arraytxt.length;

      for (var i = 0; i < arraytxt.length; i++) rows += parseInt(arraytxt[i].length / cols);

      if (rows > maxrows) e.target.rows = maxrows;
      else e.target.rows = rows;
    }
  };

  const Downloadlink = ({ item }) => {
    const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
      const byteCharacters = window.atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    };

    const clickFile = async (id, file) => {
      if (file.FileExtension.search("image") !== -1) {
        //view image
        const r = await getCommentById(id);
        if (r.File) {
          const blob = b64toBlob(r.File, item.FileInfo.FileExtension);
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank").focus();
        }
      } else {
        //view downloadfile
        const blob = await downloadCommentById(id);
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, file.FileName);
        } else {
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = file.FileName;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0);
        }
      }
    };

    return (
      <Tooltip title={`download`}>
        <div
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => clickFile(item.Id, item.FileInfo)}
        >
          {item.FileInfo.FileName}
        </div>
      </Tooltip>
    );
  };

  return (
    <Box>
      <Typography variant="h6" className={classes.content}>
        Comment
      </Typography>
      <div className={classes.content}>
        {dataComment &&
          dataComment.map((item, idx) => {
            return (
              <div
                key={idx}
                className={
                  item.UserModified === userName ? "chatbox__messageBox text-right" : "chatbox__messageBox text-left"
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: item.UserModified === userName ? "flex-end" : "flex-start",
                  }}
                >
                  <Icon>person</Icon>
                  {item.UserModified}
                </div>
                <div className={item.UserModified === userName ? "message-box currentUser" : "message-box"}>
                  {item.Message && item.Message !== "" ? item.Message : <Downloadlink item={item} />}
                  <div
                    className={
                      item.UserModified === userName
                        ? "chatbox__tooltip chatbox__tooltip--left"
                        : "chatbox__tooltip chatbox__tooltip--right"
                    }
                  >
                    {item.stringDate}
                  </div>
                </div>
              </div>
            );
          })}
        <div className="chatbox-popup__footer">
          <label htmlFor="FileInfo">
            <Input
              accept="image/*"
              id="FileInfo"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => {
                attachFile(e);
              }}
            />
            <IconButton aria-label="upload picture" component="span" style={{ padding: 2 }}>
              <Icon>attach_file</Icon>
            </IconButton>
          </label>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <textarea
              className="textAreaComment"
              type="text"
              placeholder="Type your message here..."
              value={message}
              onKeyUp={(e) => doResizeOrSendComment(e)}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              rows="1"
            />
          )}

          <IconButton onClick={(e) => sendComment(e)} style={{ padding: 2 }}>
            <Icon>send</Icon>
          </IconButton>
        </div>
      </div>
      <pre>{process.env.NODE_ENV === "development" ? JSON.stringify(dataComment, 0, 2) : ""}</pre>
    </Box>
  );
};

export default function PersistentDrawerRight({
  open,
  close,
  ShowDim,
  dataDim,
  dataTax,
  module,
  moduleId,
  modify,
  update,
}) {
  const classes = useStyles();
  const [state, setState] = useState({
    dimension: false,
    tax: false,
    comment: false,
  });

  return (
    <Drawer
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
      anchor="right"
    >
      <div className={classes.toolbar}>
        <IconButton
          onClick={() => {
            setState({ ...state, dimension: !open, tax: !open, comment: !open });
            if (open) {
              close();
            } else {
              ShowDim();
            }
          }}
        >
          {open ? <Icon>chevron_right</Icon> : <Icon>chevron_left</Icon>}
        </IconButton>
      </div>
      <Divider />

      {open ? (
        <>
          {!state.comment && dataTax ? <TaxOpen dataTax={dataTax} /> : ""}
          <Divider />
          {!state.comment && dataDim && dataDim.length > 0 ? (
            <Box>
              <Typography variant="h6" className={classes.content}>
                Dimension
              </Typography>
              <DimensionContent data={dataDim} update={update} modify={modify} />
            </Box>
          ) : (
            ""
          )}
          {state.comment ? <CommentOpen module={module} moduleId={moduleId} /> : ""}
        </>
      ) : (
        <>
          {dataDim && dataDim.length > 0 ? (
            <>
              <div className={classes.divIcon}>
                <IconButton
                  onClick={() => {
                    setState({ ...state, dimension: !state.dimension });
                    ShowDim();
                  }}
                >
                  <Icon>dashboard</Icon>
                </IconButton>
              </div>
              <Divider />
            </>
          ) : (
            ""
          )}
          {dataTax ? (
            <>
              <div
                className={classes.avtCenter}
                onClick={() => {
                  setState({ ...state, tax: !state.tax });
                  ShowDim();
                }}
              >
                <Avatar className={classes.small}>
                  <span>Tax</span>
                </Avatar>
              </div>
              <Divider />
            </>
          ) : (
            ""
          )}
          {module ? (
            <>
              <div className={classes.divIcon}>
                <IconButton
                  onClick={() => {
                    setState({ ...state, comment: !state.comment });
                    ShowDim();
                  }}
                >
                  <Icon>comment</Icon>
                </IconButton>
              </div>
            </>
          ) : (
            ""
          )}
        </>
      )}
    </Drawer>
  );
}
