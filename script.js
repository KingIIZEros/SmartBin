// Replace these variables with your ThinkSpeak Channel settings
const apiKey = "SSMUEA0BW9YPPOFT"; // API Key ถ้าใช้ Read API Key
const channelId = "2812389"; // Channel ID ของคุณ
const fieldId = 1; // Field ID ที่ต้องการดึงข้อมูล
const fieldLatId = 2; // Field ID for latitude
const fieldLngId = 3; // Field ID for longitude

var curentValue = 0;

async function fetchData() {
  try {
    const response = await fetch(
      `https://api.thingspeak.com/channels/${channelId}/fields/${fieldId}.json?results=10&api_key=${apiKey}`
    );
    const data = await response.json();

    // Extract Channel Name
    const channelName = data.channel.name;
    document.getElementById("channelName").innerText = channelName;

    // Extract Field Data
    const fieldData = data.feeds.map((feed) => ({
      time: feed.created_at,
      value: feed[`field${fieldId}`],
      lat: feed[`field${fieldLatId}`],
      lng: feed[`field${fieldLngId}`],
    }));

    // Prepare Data for Chart
    const labels = fieldData.map((item) =>
      new Date(item.time).toLocaleString()
    );
    const values = fieldData.map((item) => parseFloat(item.value));

    renderChart(labels, values);
    curentValue = values[values.length - 1];
    renderbar([curentValue]);

    // Get the latest latitude and longitude
    const latestLat = 8.6425943;
    const latestLng = 99.8954679;
    renderMap(latestLat, latestLng);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function renderChart(labels, data) {
  const ctx = document.getElementById("dataChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Trash level in bin`,
          data: data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `Value: ${tooltipItem.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Timestamp",
          },
        },
        y: {
          title: {
            display: true,
            text: "Value",
          },
        },
      },
    },
  });
}

function renderbar(values) {
  document.getElementById(
    "dataChartBar"
  ).innerHTML = `<div class="bg-cover rounded-b-lg" style="height:${curentValue}%; background-image: url('https://ichef.bbci.co.uk/ace/ws/800/cpsprodpb/A9FF/production/_114791534_4f6eb12c-d2a0-4cb5-ba03-b5f14bad18ab.jpg.webp');"></div>
  `;

  let statusTrash = document.getElementById("statusTrash");
  statusTrash.innerText = "Trash level : " + curentValue + "%";
  statusTrash.className = "text-gray-600 text-xl text-center my-4";
}

function renderMap(lat, lng) {
  const map = L.map('map').setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  L.marker([lat, lng]).addTo(map)
    .bindPopup('Trash Bin Location')
    .openPopup();
}

// Update the bar chart when new data is fetched
fetchData();
