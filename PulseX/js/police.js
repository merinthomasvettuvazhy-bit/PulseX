// =========================
// FIND NEARBY POLICE STATIONS
// =========================
function findPolice(dynamicRadius = 3000) {

  if (userLat === null || userLng === null) {
    alert("Location not available");
    return;
  }

  const radius = dynamicRadius;

  const query = `
    [out:json];
    (
      node["amenity"="police"](around:${radius},${userLat},${userLng});
      way["amenity"="police"](around:${radius},${userLat},${userLng});
      relation["amenity"="police"](around:${radius},${userLat},${userLng});

      node["building"="police"](around:${radius},${userLat},${userLng});
      way["building"="police"](around:${radius},${userLat},${userLng});

      node["amenity"="police_station"](around:${radius},${userLat},${userLng});
      way["amenity"="police_station"](around:${radius},${userLat},${userLng});
    );
    out center tags;
  `;

  const url =
    "https://overpass-api.de/api/interpreter?data=" +
    encodeURIComponent(query);

  document.getElementById("policeList").innerHTML =
    `⏳ Searching within ${radius / 1000} km...`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      let elements = data.elements || [];

      // AUTO EXPAND SEARCH
      if (elements.length === 0) {

        if (radius < 50000) {
          return findPolice(radius * 2);
        }

        document.getElementById("policeList").innerHTML = `
          <div style="
            background:#222;
            padding:15px;
            border-radius:12px;
            margin-top:10px;
          ">
            ❌ No police stations found.

            <button
              onclick="closePoliceList()"
              style="
                margin-top:15px;
                background:#ff3366;
                color:white;
                border:none;
                padding:12px;
                border-radius:12px;
                width:100%;
                font-weight:bold;
                cursor:pointer;
              "
            >
              ✖ Close
            </button>
          </div>
        `;

        return;
      }

      // DISTANCE FUNCTION
      function getDistance(lat1, lon1, lat2, lon2) {

        const R = 6371;

        const dLat =
          (lat2 - lat1) * Math.PI / 180;

        const dLon =
          (lon2 - lon1) * Math.PI / 180;

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1 * Math.PI / 180) *
          Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;

        return 2 * R *
          Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      // FORMAT RESULTS
      let stations = elements.map(st => {

        const lat =
          st.lat ||
          (st.center && st.center.lat);

        const lon =
          st.lon ||
          (st.center && st.center.lon);

        return {
          ...st,
          lat,
          lon,
          distance:
            lat && lon
              ? getDistance(userLat, userLng, lat, lon)
              : 9999
        };

      })
      .filter(s => s.lat && s.lon)
      .sort((a, b) => a.distance - b.distance);

      const results = stations.slice(0, 7);

      let html = "";

      results.forEach(station => {

        const name =
          station.tags.name ||
          "Police Station";

        const phone =
          station.tags.phone ||
          station.tags["contact:phone"] ||
          "Not Available";

        const dist =
          station.distance.toFixed(2);

        html += `
          <div style="
            background:#1a1a1a;
            padding:14px;
            margin:12px 0;
            border-radius:14px;
            border-left:4px solid #00b4ff;
          ">

            <b>🚔 ${name}</b><br><br>

            📏 ${dist} km away<br><br>

            📞 ${phone}<br><br>

            <a
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}"
              target="_blank"
              style="color:#00e676;"
            >
              🧭 Open in Maps
            </a>

          </div>
        `;
      });

      // CLOSE BUTTON
      html += `
        <button
          onclick="closePoliceList()"
          style="
            margin-top:15px;
            background:#ff3366;
            color:white;
            border:none;
            padding:14px;
            border-radius:14px;
            width:100%;
            font-weight:bold;
            cursor:pointer;
          "
        >
          Close
        </button>
      `;

      document.getElementById("policeList").innerHTML = html;

    })

    .catch(err => {

      console.error(err);

      document.getElementById("policeList").innerHTML = `
        <div style="
          background:#222;
          padding:15px;
          border-radius:12px;
          margin-top:10px;
        ">

          ⚠ Error loading police stations.

          <button
            onclick="closePoliceList()"
            style="
              margin-top:15px;
              background:#ff3366;
              color:white;
              border:none;
              padding:12px;
              border-radius:12px;
              width:100%;
              font-weight:bold;
              cursor:pointer;
            "
          >
            ✖ Close
          </button>

        </div>
      `;

    });

}

// =========================
// CLOSE POLICE LIST
// =========================
function closePoliceList() {

  document.getElementById("policeList").innerHTML = "";

}