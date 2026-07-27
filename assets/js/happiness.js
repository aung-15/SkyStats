// SkyStats — global happiness vs. air travel scatter plots
// Reads assets/data/happiness.json and renders two Chart.js scatter panels:
//   #chart-happiness-collapse  (2020 happiness vs. % change in passengers 2019->2020)
//   #chart-happiness-recovery  (2020 happiness vs. % change in passengers 2019->2023)
(function () {
  var GRID = "#e4ddca";
  var TEXT = "#464b57";
  var TREND = "#1a1d24";

  // Region colors drawn from the site palette (same family as charts.js msaMonthly)
  var REGION_COLORS = {
    "Americas": "#2a4d80",
    "East Asia & Pacific": "#c9a24b",
    "Europe & Central Asia": "#a4432f",
    "Middle East & N. Africa": "#6d8f78",
    "South Asia": "#3f6b4a",
    "Sub-Saharan Africa": "#8a6fb0"
  };

  fetch("assets/data/happiness.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderPanel("chart-happiness-collapse", data.countries, "collapse",
        "Change in passengers, 2019\u21922020 (%)");
      renderPanel("chart-happiness-recovery", data.countries, "recovery",
        "Change in passengers, 2019\u21922023 (%)");
    })
    .catch(function (err) { console.error("Failed to load happiness data", err); });

  // Ordinary least-squares fit for the trend line
  function trendLine(points) {
    var n = points.length;
    if (n < 2) return null;
    var sx = 0, sy = 0, sxy = 0, sxx = 0;
    points.forEach(function (p) {
      sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x;
    });
    var slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    var intercept = (sy - slope * sx) / n;
    var xs = points.map(function (p) { return p.x; });
    var minX = Math.min.apply(null, xs);
    var maxX = Math.max.apply(null, xs);
    return [
      { x: minX, y: intercept + slope * minX },
      { x: maxX, y: intercept + slope * maxX }
    ];
  }

  function renderPanel(canvasId, countries, key, yLabel) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;

    var byRegion = {};
    var allPoints = [];
    countries.forEach(function (c) {
      if (c[key] === null || c[key] === undefined) return;
      var pt = { x: c.score, y: c[key], country: c.name };
      (byRegion[c.region] = byRegion[c.region] || []).push(pt);
      allPoints.push(pt);
    });

    var datasets = Object.keys(REGION_COLORS)
      .filter(function (region) { return byRegion[region]; })
      .map(function (region) {
        return {
          label: region,
          data: byRegion[region],
          backgroundColor: "rgba(255,255,255,0)",
          borderColor: REGION_COLORS[region],
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          showLine: false
        };
      });

    var fit = trendLine(allPoints);
    if (fit) {
      datasets.push({
        label: "Trend",
        data: fit,
        type: "line",
        borderColor: TREND,
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0
      });
    }

    new Chart(ctx, {
      type: "scatter",
      data: { datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              font: { size: 10 },
              filter: function (item) { return item.text !== "Trend"; }
            }
          },
          tooltip: {
            callbacks: {
              label: function (c) {
                var p = c.raw;
                if (!p.country) return null;
                return " " + p.country + " \u2014 happiness " + p.x.toFixed(2) +
                  ", " + (p.y > 0 ? "+" : "") + p.y + "%";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: GRID },
            title: { display: true, text: "Life evaluation score, 2020 Gallup World Poll (0\u201310)", color: TEXT }
          },
          y: {
            grid: { color: GRID },
            title: { display: true, text: yLabel, color: TEXT },
            ticks: { callback: function (v) { return v + "%"; } }
          }
        }
      }
    });
  }
})();
