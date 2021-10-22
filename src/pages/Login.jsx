import React, { useState, useEffect } from "react";
import { useLogin, useLocale, useSetLocale, useTranslate, Notification } from "react-admin";
import { Avatar, Button, CssBaseline, TextField, Link, Box, MenuItem, Container, Typography } from "@material-ui/core";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, ThemeProvider, createTheme } from "@material-ui/core/styles";
import authProviders from "providers/auth";
import SnackbarUtils from "utils/SnackbarUtils";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  submit: {
    margin: theme.spacing(2, 0, 2),
  },
  circularProgress: {
    marginLeft: 0,
    marginRight: theme.spacing(1),
  },
}));

const LoginPage = ({ theme }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("UserName") ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminToken, setAdminToken] = useState(window.config.arrCompany[0].adminToken);
  const [tenant, setTenant] = useState();
  const [tenantList, setTenantList] = useState([]);
  const [userRight, setUserRight] = useState(false);
  const login = useLogin();
  const language = useLocale();
  const setLocale = useSetLocale();
  const translate = useTranslate();
  const languageList = [
    {
      value: "en",
      label: "English (United States)",
    },
    {
      value: "th",
      label: "ไทย",
    },
  ];

  const checkUserRight = (e) => {
    e.preventDefault();
    setLoading(true);
    authProviders
      .getTenantByUserName({
        Username: username,
      })
      .then((r) => {
        setTenantList(r);
        if (r) {
          let selectDefaultTenant = r.find((item) => item.IsDefault).Tenant;
          setTenant(selectDefaultTenant);
        }
        setTimeout(() => {
          setLoading(false);
          setUserRight(true);
        }, 1000);
      })
      .catch((e) => {
        SnackbarUtils.error("Not found User");
        setLoading(false);
        setTenantList([]);
      });
  };

  const signIn = (e) => {
    e.preventDefault();
    setLoading(true);
    setLocale(language);
    login({
      Username: username,
      Password: password,
      Tenant: tenant,
      Language: language,
    }).catch((e) => {
      console.error(e.name + ": " + e.message);
      SnackbarUtils.error(e.message);
      setLoading(false);
    });
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    async function fetchDefaultTenant() {
      var username = localStorage.getItem("UserName");
      if (username != null) {
        setLoading(true);
        authProviders
          .getTenantByUserName({
            Username: username,
          })
          .then((r) => {
            setTenantList(r);
            if (r) {
              let selectDefaultTenant = r.find((item) => item.IsDefault).Tenant;
              setTenant(selectDefaultTenant);
            }
            setUserRight(true);
          })
          .catch((e) => {
            SnackbarUtils.error("Not found User");
          });
        setLoading(false);
      }
    }
    fetchDefaultTenant();
  }, []);

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} autoComplete="off" noValidate onSubmit={userRight ? signIn : checkUserRight}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label={translate("ra.field.Username")}
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              onBlur={userRight ? checkUserRight : () => ""}
              autoFocus
              autoComplete="off"
            />
            {userRight ? (
              <>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <OutlinedInput
                    variant="outlined"
                    required
                    type={showPassword ? "text" : "password"}
                    id="password"
                    label="Password"
                    name="password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="tenant"
                  label="Business Unit"
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                >
                  {tenantList.map((option) => (
                    <MenuItem key={option.TenantId} value={option.Tenant}>
                      {option.Tenant}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="language"
                  label="Language"
                  value={language}
                  onChange={(e) => setLocale(e.target.value)}
                >
                  {languageList.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={() => setUserRight(false)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    //fullWidth
                    className={classes.submit}
                    disabled={loading || tenantList.length === 0}
                  >
                    {loading && <CircularProgress className={classes.circularProgress} size={20} />}
                    Sign In
                  </Button>
                </Box>
              </>
            ) : (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={loading}
                >
                  {loading && <CircularProgress className={classes.circularProgress} size={20} />}
                  Next
                </Button>
              </Box>
            )}
            {/* <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid> */}
          </form>
          <Notification />
        </div>
        {window.config.env === "dev" && (
          <Box mt={8} justifyContent="center">
            {!userRight ? (
              <>
                <Typography variant="h5" align="center">
                  Test Version
                </Typography>
                <FormControl fullWidth style={{ marginBottom: 20 }}>
                  <InputLabel id="demo-simple-select-bu">Select Company</InputLabel>
                  <Select
                    labelId="demo-simple-select-bu"
                    id="demo-simple-select"
                    value={adminToken}
                    defaultValue={adminToken}
                    onChange={(e) => {
                      localStorage.setItem("adminToken", e.target.value);
                      setAdminToken(e.target.value);
                    }}
                  >
                    {window.config.arrCompany
                      ? window.config.arrCompany.map((item, idx) => (
                          <MenuItem key={idx} value={item.adminToken}>
                            {item.name}
                          </MenuItem>
                        ))
                      : ""}
                  </Select>
                </FormControl>
              </>
            ) : (
              ""
            )}
          </Box>
        )}
        <br />
        <Copyright />
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;
