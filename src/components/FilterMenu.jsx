// import React from "react";
// import SearchBar from "material-ui-search-bar";

// const FilterMenu = ({ searchOption }) => {
//   console.log(searchOption);
//   return (
//     <div>
//       <SearchBar
//         value={""}
//         placeholder={searchOption.placeholder}
//         //onChange={(newValue) => console.log(newValue)}
//         onRequestSearch={(e) => searchOption.update(e)}
//       />
//     </div>
//   );
// };

// export default FilterMenu;

import React from "react";
import TextField from "@material-ui/core/TextField";
import Avatar from "@material-ui/core/Avatar";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import { getJvList } from "services/generalLedger";

const useStyles = makeStyles((theme) => ({
  inputRoot: {
    padding: "4px !important",
  },
  option: {
    width: 500,
    fontSize: 14,
    "& > span": {
      marginRight: 10,
      fontSize: 18,
    },
  },
  icon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
}));

const FilterMenu = ({ searchOption }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const fetch = React.useMemo(
    () =>
      throttle(async (request, callback) => {
        let whereGroupList = [
          {
            AndOr: "And",
            ConditionList: [
              {
                AndOr: "And",
                Field: "Prefix",
                Operator: "Like",
                Value: `%${request.input}%`,
              },
            ],
          },
          {
            AndOr: "Or",
            ConditionList: [
              {
                AndOr: "And",
                Field: "JvhNo",
                Operator: "Like",
                Value: `%${request.input}%`,
              },
            ],
          },
        ];

        let param = {
          Limit: 100,
          Page: 1,
          OrderBy: { JvhSeq: "asc" },
          WhereGroupList: whereGroupList,
          Exclude: ["Detail", "DimHList"],
          //WhereRaw: "",
          //WhereLike: `%${request.input}%`,
          //WhereLikeFields: ["Prefix", "JvhNo"],
        };

        getJvList(param).then(callback);
      }, 200),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        const { Data } = results;
        if (Data?.length > 0) {
          let newOptions = [];
          newOptions = [...Data];
          setOptions(newOptions);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      size="small"
      style={{ width: 260, marginTop: 7 }}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.Prefix.concat(option.JvhNo))}
      getOptionSelected={(option) => (typeof option === "string" ? option : option.Prefix.concat(option.JvhNo))}
      options={options}
      classes={{
        inputRoot: classes.inputRoot,
        option: classes.option,
      }}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event, newValue) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
        searchOption.update(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => <TextField {...params} label={searchOption.placeholder} variant="outlined" fullWidth />}
      renderOption={(option) => {
        const matches = match(option.JvhNo, inputValue);
        const parts = parse(option.JvhNo, matches);

        return (
          <Grid container alignItems="center">
            <Grid item>
              <Avatar className={classes.icon}>{option.Prefix}</Avatar>
            </Grid>
            <Grid item xs>
              {parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                  {part.text}
                </span>
              ))}

              <Typography variant="body2" color="textSecondary">
                {option.Description}
              </Typography>
            </Grid>
          </Grid>
        );
      }}
    />
  );
};

export default FilterMenu;
