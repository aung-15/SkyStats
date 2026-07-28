// SkyStats narrative charts — reads assets/data/skystats.json and renders with Chart.js
(function () {
  var GOLD = "#c9a24b";
  var NAVY = "#12294a";
  var RED = "#a4432f";
  var GREEN = "#3f6b4a";
  var GRID = "#e4ddca";
  var TEXT = "#464b57";
  var PALETTE = ["#12294a", "#c9a24b", "#a4432f", "#3f6b4a", "#6d8f78",
    "#8a6fb0", "#c97a5f", "#2a4d80", "#7a7a4a", "#d9b869"];

  Chart.defaults.font.family = "'Source Sans 3', sans-serif";
  Chart.defaults.color = TEXT;

  fetch("assets/data/skystats.json")
    .then(function (r) { return r.json(); })
    .then(renderAll)
    .catch(function (err) {
      console.error("Failed to load SkyStats data", err);
    });

  function renderAll(data) {
    renderPaxPerDeparture(data);
    renderMsaMonthly(data);
    renderDistanceByMsa(data);
    renderRouteRestoration(data);
    renderLoadFactorGauge(data);
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

    var datasets = data.msas.map(function (msa, i) {
      return {
        label: msa,
        data: data.msaMonthlySeries[msa],
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: PALETTE[i % PALETTE.length],
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

  function renderDistanceByMsa(data) {
    var ctx = document.getElementById("chart-distance-msa");
    if (!ctx || !data.distanceByMsa) return;
    var years = data.distYears.map(String);

    var datasets = data.msas.map(function (msa, i) {
      return {
        label: msa,
        data: years.map(function (y) { return data.distanceByMsa[msa][y]; }),
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: PALETTE[i % PALETTE.length],
        borderWidth: msa === "Los Angeles" || msa === "New York" ? 2.75 : 1.25,
        pointRadius: 3,
        tension: 0.2,
      };
    });

    new Chart(ctx, {
      type: "line",
      data: { labels: years, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true, font: { size: 10 } } },
          tooltip: {
            callbacks: {
              label: function (c) { return " " + c.dataset.label + ": " + c.parsed.y + " mi"; }
            }
          },
        },
        scales: {
          y: {
            grid: { color: GRID },
            title: { display: true, text: "Avg. nonstop segment distance (mi)" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function renderRouteRestoration(data) {
    var ctx = document.getElementById("chart-route-restoration");
    if (!ctx || !data.routeRestoration) return;
    var d = data.routeRestoration;

    new Chart(ctx, {
      type: "line",
      data: {
        labels: d.years.map(String),
        datasets: [
          {
            label: "Traffic on Retained Routes (Domestic)",
            data: d.domesticTraffic,
            borderColor: NAVY,
            backgroundColor: NAVY,
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Traffic on Retained Routes (International)",
            data: d.internationalTraffic,
            borderColor: NAVY,
            backgroundColor: NAVY,
            borderDash: [5, 3],
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Route Restoration (Domestic)",
            data: d.domesticRouteRestoration,
            borderColor: GOLD,
            backgroundColor: GOLD,
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Route Restoration (International)",
            data: d.internationalRouteRestoration,
            borderColor: GOLD,
            backgroundColor: GOLD,
            borderDash: [5, 3],
            tension: 0.3,
            pointRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, usePointStyle: true, font: { size: 10.5 } } },
          tooltip: {
            callbacks: {
              label: function (c) { return " " + c.dataset.label + ": " + c.parsed.y + "% of 2019"; }
            }
          }
        },
        scales: {
          y: {
            grid: { color: GRID },
            title: { display: true, text: "% of 2019 (=100)" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function renderLoadFactorGauge(data) {
    var ctx = document.getElementById("chart-load-factor");
    if (!ctx || !data.loadFactorGauge) return;
    var d = data.loadFactorGauge;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: d.years.map(String),
        datasets: [
          {
            label: "Avg. Seats per Departure",
            data: d.nationalSeatsPerDeparture,
            backgroundColor: "rgba(18,41,74,0.75)",
            borderColor: NAVY,
            borderWidth: 1.5,
            borderRadius: 4,
            yAxisID: "y",
          },
          {
            label: "Load Factor (%)",
            data: d.nationalLoadFactorPct,
            type: "line",
            borderColor: RED,
            backgroundColor: RED,
            borderWidth: 2.5,
            pointRadius: 5,
            yAxisID: "y1",
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
            title: { display: true, text: "Seats per departure" },
          },
          y1: {
            type: "linear",
            position: "right",
            grid: { display: false },
            title: { display: true, text: "Load factor (%)" },
            min: 70,
            max: 90,
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
})();
