// SkyStats narrative charts — reads assets/data/skystats.json and renders with Chart.js
(function () {
  var GOLD = "#c9a24b";
  var GOLD_LIGHT = "rgba(201, 162, 75, 0.25)";
  var NAVY = "#12294a";
  var NAVY_LIGHT = "rgba(18, 41, 74, 0.15)";
  var RED = "#a4432f";
  var GREEN = "#3f6b4a";
  var GRID = "#e4ddca";
  var TEXT = "#464b57";

  Chart.defaults.font.family = "'Source Sans 3', sans-serif";
  Chart.defaults.color = TEXT;

  fetch("assets/data/skystats.json")
    .then(function (r) { return r.json(); })
    .then(renderAll)
    .catch(function (err) {
      console.error("Failed to load SkyStats data", err);
    });

  function renderAll(data) {
    renderNationalYearly(data);
    renderMonthly(data);
    renderRecovery(data);
    renderDistance(data);
  }

  function renderNationalYearly(data) {
    var ctx = document.getElementById("chart-national");
    if (!ctx) return;
    var years = data.years.map(String);
    var values = years.map(function (y) { return data.nationalYearly[y]; });

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: years,
        datasets: [{
          label: "Total Passengers",
          data: values,
          backgroundColor: years.map(function (y) {
            return y === "2020" ? GOLD : NAVY_LIGHT;
          }),
          borderColor: years.map(function (y) {
            return y === "2020" ? GOLD : NAVY;
          }),
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (c) { return " " + c.parsed.y.toLocaleString() + " passengers"; }
            }
          }
        },
        scales: {
          y: {
            grid: { color: GRID },
            ticks: {
              callback: function (v) { return (v / 1e6) + "M"; }
            }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function renderMonthly(data) {
    var ctx = document.getElementById("chart-monthly");
    if (!ctx) return;
    var labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "2019 (pre-pandemic)",
            data: data.nationalMonthly2019,
            borderColor: NAVY,
            backgroundColor: NAVY,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "2020 (pandemic onset)",
            data: data.nationalMonthly2020,
            borderColor: RED,
            backgroundColor: RED,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "2025 (five years later)",
            data: data.nationalMonthly2025,
            borderColor: GOLD,
            backgroundColor: GOLD,
            tension: 0.3,
            pointRadius: 3,
            borderDash: [5, 3],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: function (c) { return " " + c.dataset.label + ": " + c.parsed.y.toLocaleString(); }
            }
          }
        },
        scales: {
          y: {
            grid: { color: GRID },
            ticks: { callback: function (v) { return (v / 1e6) + "M"; } }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function renderRecovery(data) {
    var ctx = document.getElementById("chart-recovery");
    if (!ctx) return;
    var entries = Object.keys(data.recoveryPct2025vs2019).map(function (msa) {
      return { msa: msa, pct: data.recoveryPct2025vs2019[msa] };
    }).sort(function (a, b) { return b.pct - a.pct; });

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: entries.map(function (e) { return e.msa; }),
        datasets: [{
          label: "% change, 2025 vs. 2019",
          data: entries.map(function (e) { return e.pct; }),
          backgroundColor: entries.map(function (e) { return e.pct >= 0 ? "rgba(63,107,74,0.75)" : "rgba(164,67,47,0.75)"; }),
          borderColor: entries.map(function (e) { return e.pct >= 0 ? GREEN : RED; }),
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (c) { return " " + (c.parsed.x > 0 ? "+" : "") + c.parsed.x + "% vs. 2019"; }
            }
          }
        },
        scales: {
          x: {
            grid: { color: GRID },
            ticks: { callback: function (v) { return v + "%"; } }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  function renderDistance(data) {
    var ctx = document.getElementById("chart-distance");
    if (!ctx) return;
    var years = data.distYears.map(String);

    new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Avg. Nonstop Segment Distance (mi)",
            data: years.map(function (y) { return data.nationalAvgDistance[y]; }),
            borderColor: GOLD,
            backgroundColor: GOLD,
            yAxisID: "y",
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Total Departures",
            data: years.map(function (y) { return data.nationalDepartures[y]; }),
            borderColor: NAVY,
            backgroundColor: NAVY,
            yAxisID: "y1",
            tension: 0.3,
            pointRadius: 4,
            borderDash: [5, 3],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, usePointStyle: true } },
        },
        scales: {
          y: {
            type: "linear",
            position: "left",
            grid: { color: GRID },
            title: { display: true, text: "Miles" },
          },
          y1: {
            type: "linear",
            position: "right",
            grid: { display: false },
            title: { display: true, text: "Departures" },
            ticks: { callback: function (v) { return (v / 1e6).toFixed(1) + "M"; } }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
})();
