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
    renderPaxPerDeparture(data);
    renderMsaMonthly(data);
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

  function renderPaxPerDeparture(data) {
    var ctx = document.getElementById("chart-pax-departure");
    if (!ctx || !data.avgPaxPerDeparture) return;
    var d = data.avgPaxPerDeparture;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: d.years.map(String),
        datasets: [
          {
            label: "Domestic",
            data: d.domestic,
            backgroundColor: "rgba(18,41,74,0.75)",
            borderColor: NAVY,
            borderWidth: 1.5,
            borderRadius: 4,
          },
          {
            label: "International",
            data: d.international,
            backgroundColor: "rgba(201,162,75,0.75)",
            borderColor: GOLD,
            borderWidth: 1.5,
            borderRadius: 4,
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
              label: function (c) {
                if (c.parsed.y === null) return " " + c.dataset.label + ": not reported for this year";
                return " " + c.dataset.label + ": " + c.parsed.y + " passengers/departure";
              }
            }
          }
        },
        scales: {
          y: {
            grid: { color: GRID },
            title: { display: true, text: "Avg. passengers per departure" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function renderMsaMonthly(data) {
    var ctx = document.getElementById("chart-msa-monthly");
    if (!ctx || !data.msaMonthlySeries) return;

    var palette = ["#12294a", "#c9a24b", "#a4432f", "#3f6b4a", "#6d8f78",
      "#8a6fb0", "#c97a5f", "#2a4d80", "#7a7a4a", "#d9b869"];

    var datasets = data.msas.map(function (msa, i) {
      return {
        label: msa,
        data: data.msaMonthlySeries[msa],
        borderColor: palette[i % palette.length],
        backgroundColor: palette[i % palette.length],
        borderWidth: msa === "New York" || msa === "Los Angeles" ? 2.5 : 1.25,
        pointRadius: 0,
        tension: 0.25,
      };
    });

    var march2020Index = data.msaMonthlyLabels.indexOf("2020-03");
    var referenceLinePlugin = {
      id: "march2020ReferenceLine",
      afterDraw: function (chart) {
        if (march2020Index < 0) return;
        var xScale = chart.scales.x;
        var yScale = chart.scales.y;
        var x = xScale.getPixelForValue(march2020Index);
        var ctx2d = chart.ctx;
        ctx2d.save();
        ctx2d.strokeStyle = "#a4432f";
        ctx2d.setLineDash([4, 4]);
        ctx2d.lineWidth = 1.5;
        ctx2d.beginPath();
        ctx2d.moveTo(x, yScale.top);
        ctx2d.lineTo(x, yScale.bottom);
        ctx2d.stroke();
        ctx2d.setLineDash([]);
        ctx2d.fillStyle = "#a4432f";
        ctx2d.font = "11px 'Source Sans 3', sans-serif";
        ctx2d.fillText("National emergency declared", x + 6, yScale.top + 12);
        ctx2d.restore();
      }
    };

    new Chart(ctx, {
      type: "line",
      data: { labels: data.msaMonthlyLabels, datasets: datasets },
      plugins: [referenceLinePlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", axis: "x", intersect: false },
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true, font: { size: 10 } } },
          tooltip: {
            callbacks: {
              label: function (c) { return " " + c.dataset.label + ": " + c.parsed.y.toLocaleString(); }
            }
          },
        },
        scales: {
          y: {
            grid: { color: GRID },
            ticks: { callback: function (v) { return (v / 1e6) + "M"; } }
          },
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 14,
              callback: function (val, idx) {
                var label = this.getLabelForValue(val);
                return label.endsWith("-01") ? label.slice(0, 4) : "";
              }
            }
          }
        }
      }
    });
  }
})();
