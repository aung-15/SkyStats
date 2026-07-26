// SkyStats recovery map — Leaflet proportional-symbol map
// Bubble size = 2019 passenger volume, color = % change 2025 vs. 2019
(function () {
  fetch("assets/data/skystats.json")
    .then(function (r) { return r.json(); })
    .then(renderMap)
    .catch(function (err) { console.error("Failed to load map data", err); });

  function recoveryColor(pct) {
    if (pct <= -8) return "#a4432f";
    if (pct <= -3) return "#c97a5f";
    if (pct < 3) return "#c9a24b";
    if (pct < 9) return "#6d8f78";
    return "#3f6b4a";
  }

  function renderMap(data) {
    var el = document.getElementById("recovery-map");
    if (!el || typeof L === "undefined") return;

    var map = L.map("recovery-map", {
      scrollWheelZoom: false,
      minZoom: 3,
      maxZoom: 6,
    }).setView([38.5, -96], 4);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    var coords = data.metroCoordinates;
    var vol2019 = [];
    Object.keys(coords).forEach(function (msa) {
      vol2019.push(data.msaYearly[msa]["2019"]);
    });
    var maxVol = Math.max.apply(null, vol2019);

    Object.keys(coords).forEach(function (msa) {
      var latlng = coords[msa];
      var v2019 = data.msaYearly[msa]["2019"];
      var pct = data.recoveryPct2025vs2019[msa];
      var radius = 8 + 32 * Math.sqrt(v2019 / maxVol);

      var marker = L.circleMarker(latlng, {
        radius: radius,
        fillColor: recoveryColor(pct),
        color: "#ffffff",
        weight: 1.5,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindTooltip(
        "<strong>" + msa + "</strong><br>" +
        "2019 volume: " + (v2019 / 1e6).toFixed(1) + "M passengers<br>" +
        "2025 vs. 2019: " + (pct > 0 ? "+" : "") + pct + "%",
        { direction: "top", offset: [0, -radius] }
      );
    });
  }
})();
