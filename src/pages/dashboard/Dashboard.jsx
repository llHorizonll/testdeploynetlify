import React, { useState, useEffect, useCallback } from "react";
import { useAuthState, Loading } from "react-admin";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import ErrorDashboard from "layout/ErrorDashboard";
// import CardChart from "./CardChart";
import UsageChart from "./UsageChart";
import BudgetBarChart from "./BudgetBarChart";
import SectionCardChart from "./SectionCardChart";
import StackCardChart from "./StackCardChart";
import StackedBarChart from "./StackedBarChart";
import ListingChart from "./ListingChart";
import IncomeChart from "./IncomeChart";
import chartapi from "services/callStoreProcedure";

const Dashboard = () => {
  const { loaded, authenticated } = useAuthState();

  const [state, setState] = useState({
    dataSectionCardChart1: "",
    dataUsageChart: "",
    dataBudgetBarChart: "",
    dataSectionCardChart2: "",
    dataDailyChart: "",
    dataListingChart: "",
    dataIncomeStatment: "",
    dataStackedInvBarChart: "",
    dataStackedRecBarChart: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const fetchOrUpdateSection = useCallback(async (date, stateKey) => {
    var res = "";
    switch (stateKey) {
      case "dataSectionCardChart1":
        res = await chartapi.getFrontSummary(date);
        if (!res) {
          setError(true);
        }
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      case "dataSectionCardChart2":
        res = await chartapi.getProfitSummary(date);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      // no default
    }
  }, []);

  const fetchOrUpdateChart = useCallback(async (param, stateKey) => {
    var res = "";
    switch (stateKey) {
      case "dataUsageChart":
        res = await chartapi.getFrontYtdrr(param);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      case "dataBudgetBarChart":
        res = await chartapi.getYearcomparision(param);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      case "dataDailyChart":
        res = await chartapi.getDaily(param);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      case "dataListingChart":
        res = await chartapi.getActualbudget(param);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      case "dataStackedInvBarChart":
        res = await chartapi.getPayable(param);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      case "dataStackedRecBarChart":
        res = await chartapi.getReceivable(param);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      case "dataIncomeStatment":
        res = await chartapi.getIncomeStatement(param);
        setState((state) => ({ ...state, [`${stateKey}`]: res }));
        break;
      // no default
    }
  }, []);

  useEffect(() => {
    if (authenticated && loaded) {
      fetchOrUpdateSection(undefined, "dataSectionCardChart1");
      fetchOrUpdateChart(undefined, "dataUsageChart");
      fetchOrUpdateChart(undefined, "dataBudgetBarChart");
      fetchOrUpdateSection(undefined, "dataSectionCardChart2");
      fetchOrUpdateChart(undefined, "dataDailyChart");
      fetchOrUpdateChart(undefined, "dataListingChart");
      fetchOrUpdateChart(undefined, "dataStackedInvBarChart");
      fetchOrUpdateChart(undefined, "dataStackedRecBarChart");
      fetchOrUpdateChart(undefined, "dataIncomeStatment");
    }
    const timeoutID = setTimeout(() => setLoading(false), 2000);
    return () => {
      window.clearTimeout(timeoutID);
    };
  }, [authenticated, loaded, fetchOrUpdateSection, fetchOrUpdateChart]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading />;
  if (error) return <ErrorDashboard />;

  const {
    // dataCardChart,
    dataSectionCardChart1,
    dataUsageChart,
    dataBudgetBarChart,
    dataSectionCardChart2,
    dataDailyChart,
    dataListingChart,
    dataStackedInvBarChart,
    dataStackedRecBarChart,
    dataIncomeStatment,
  } = state;

  return (
    <Container style={{ marginBottom: 100 }}>
      <Grid container spacing={3}>
        {/* <Grid item xs={12} sm={3}>
          <CardChart
            data={dataCardChart ? dataCardChart[0] : ""}
            updateCard={updateCard}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <CardChart
            data={dataCardChart ? dataCardChart[1] : ""}
            updateCard={updateCard}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <CardChart
            data={dataCardChart ? dataCardChart[2] : ""}
            updateCard={updateCard}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <CardChart
            data={dataCardChart ? dataCardChart[3] : ""}
            updateCard={updateCard}
          />
        </Grid> */}
        <Grid item xs={12} sm={12}>
          <SectionCardChart
            stateKey="dataSectionCardChart1"
            {...dataSectionCardChart1}
            updateSection={fetchOrUpdateSection}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <UsageChart stateKey="dataUsageChart" {...dataUsageChart} updateChart={fetchOrUpdateChart} />
        </Grid>
        <Grid item xs={12} sm={12}>
          <BudgetBarChart stateKey="dataBudgetBarChart" {...dataBudgetBarChart} updateChart={fetchOrUpdateChart} />
        </Grid>
        <Grid item xs={12} sm={12}>
          <SectionCardChart
            stateKey="dataSectionCardChart2"
            {...dataSectionCardChart2}
            updateSection={fetchOrUpdateSection}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <StackCardChart stateKey="dataDailyChart" {...dataDailyChart} updateChart={fetchOrUpdateChart} />
        </Grid>
        <Grid item xs={12} sm={12}>
          <ListingChart stateKey="dataListingChart" {...dataListingChart} updateChart={fetchOrUpdateChart} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StackedBarChart
            stateKey="dataStackedInvBarChart"
            {...dataStackedInvBarChart}
            updateChart={fetchOrUpdateChart}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StackedBarChart
            stateKey="dataStackedRecBarChart"
            {...dataStackedRecBarChart}
            updateChart={fetchOrUpdateChart}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <IncomeChart stateKey="dataIncomeStatment" {...dataIncomeStatment} updateChart={fetchOrUpdateChart} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
