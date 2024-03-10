
const map = L.map("map", {
    minZoom: 0,
    maxZoom: 5,
  });

  // Set maximum bounds to ensure the entire world is visible
  const maxBounds = [
    [-60, -180], // Southwest coordinates
    [90, 180], // Northeast coordinates
  ];
  map.setMaxBounds(maxBounds);

  // Check the screen size and set the default view accordingly
  if (window.innerWidth > 768) {
    // Larger screens - set a higher zoom level
    map.setView([0, 0], 2); // Adjust the zoom level as needed
  } else {
    // Smaller screens
    map.fitBounds(maxBounds);
  }

  // Define the custom control
  const resetViewControl = L.Control.extend({
    options: {
      position: "topleft", // You can change the position as needed
    },

    onAdd: function (map) {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );

      // Add a button with the reset view icon
      const button = L.DomUtil.create(
        "a",
        "leaflet-control-zoom-in leaflet-bar-part",
        container
      );
      button.href = "#";
      button.title = "Reset View";
      button.innerHTML = "&#8634;"; // Unicode character for refresh icon

      // Add a click event listener to the button
      L.DomEvent.on(button, "click", function (e) {
        //map.setView([42, 0], 1);
        map.fitBounds(maxBounds);
        L.DomEvent.stopPropagation(e);
      });

      return container;
    },
  });

  // Add the custom control to the map
  map.addControl(new resetViewControl());

  // Create an array to store selected countries
  let selectedCountries = [];

  // Define the 'info' control
  const info = L.control();

  // Define the 'geojson' layer
  const geojson = L.geoJson(countriesData, {
    style: style,
    onEachFeature: onEachFeature,
  }).addTo(map);

  // 'info' control methods
  info.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info");
    this.update();
    return this._div;
  };

  info.update = function (props) {
    const contents = props
      ? `<b>${props.NAME_LONG}</b><br />`
      : "Hover over a country";
    this._div.innerHTML = `${contents}`;

    // Update the counter
    const counterElement = document.getElementById("selected-count");
    counterElement.textContent = selectedCountries.length;

    /// Update the percentage
    const percentageElement = document.getElementById(
      "selected-percentage"
    );
    percentageElement.textContent =
      ((selectedCountries.length / 252) * 100).toFixed(0) + "%";

    // Redraw the map
    geojson.setStyle(style);
  };

  info.addTo(map);

  // Style function
  function style(feature) {
    const selected = selectedCountries.includes(
      feature.properties.NAME_LONG
    );
    return {
      weight: 1,
      opacity: 0.5,
      color: "white",
      dashArray: "",
      fillOpacity: 1,
      fillColor: selected ? "#028bc4" : "#e6e6e6",
    };
  }

  // Highlight feature function
  function highlightFeature(e) {
    const layer = e.target;
    info.update(layer.feature.properties);
    layer.setStyle({
      weight: 1,
      dashArray: "",
      fillOpacity: 0.9,
      fillColor: "#028bc4",
    });
    layer.bringToFront();
  }

  // Reset highlight function
  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }

  // On each feature function
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: function (e) {
        const countryName = e.target.feature.properties.NAME_LONG;

        if (selectedCountries.includes(countryName)) {
          // Country is already selected, remove it
          const index = selectedCountries.indexOf(countryName);
          if (index !== -1) {
            selectedCountries.splice(index, 1);
          }
          uncheckCheckboxByCountry(countryName);
        } else {
          // Country is not selected, add it
          selectedCountries.push(countryName);
          checkCheckboxByCountry(countryName);
        }

        // Update the info control
        info.update(e.target.feature.properties);
      },
    });
  }

  // Function to uncheck a checkbox by country name
  function uncheckCheckboxByCountry(country) {
    const checkboxId = `checkbox${country.replace(/\s+/g, "")}`;
    const checkbox = document.getElementById(checkboxId);

    if (checkbox) {
      checkbox.checked = false;
    }
  }

  // Function to check a checkbox by country name
  function checkCheckboxByCountry(country) {
    const checkboxId = `checkbox${country.replace(/\s+/g, "")}`;
    const checkbox = document.getElementById(checkboxId);

    if (checkbox) {
      checkbox.checked = true;
    }
  }

  // Function to remove a country from the list
  function removeCountry(country) {
    const index = selectedCountries.indexOf(country);
    if (index !== -1) {
      selectedCountries.splice(index, 1);
    }

    // Update the info control and redraw the map
    info.update();
  }

  // Function to update the selected countries based on checkbox state
  function updateSelectedCountries(country, isChecked) {
    if (isChecked && !selectedCountries.includes(country)) {
      selectedCountries.push(country);
    } else if (!isChecked && selectedCountries.includes(country)) {
      const index = selectedCountries.indexOf(country);
      selectedCountries.splice(index, 1);
    }

    // Update the info control
    info.update();
  }

  // Function to initialize event listeners for checkboxes
  function initializeCheckboxListeners() {
    const checkboxes = document.querySelectorAll(".form-check-input");

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const country = this.value;
        const isChecked = this.checked;
        updateSelectedCountries(country, isChecked);
      });
    });
  }

  // Initialize the checkbox listeners
  initializeCheckboxListeners();
