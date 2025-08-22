// bacnet-stimulator.js
// A BACnet stimulator using node-bacstack (pure Node.js)


const Bacnet = require('bacstack');
const express = require('express');
const path = require('path');

const NUM_DEVICES = 3; // Number of simulated devices
const OBJECTS_PER_TYPE = 2; // Number of each object type per device
const BASE_ADDRESS = '192.168.1.10'; // Base IP address
const BASE_PORT = 47808; // Standard BACnet port

const applications = [];

function createDevice(deviceId, address, port) {
  const client = new Bacnet({adpuTimeout: 6000, port, interface: address});
  client.deviceId = deviceId;
  client.address = address;
  client.port = port;
  // node-bacstack does not support local object simulation or custom I-Am responses
  return client;
}

function sendWhoIsAll() {
  console.log('Sending Who-Is broadcast from all devices...');
  applications.forEach((app) => {
    app.whoIs();
  });
}

function main() {
  for (let n = 0; n < NUM_DEVICES; n++) {
    const deviceId = 1234 + n;
    // Increment last octet for each device
    const lastOctet = 10 + n;
    const address = BASE_ADDRESS.substring(0, BASE_ADDRESS.lastIndexOf('.') + 1) + lastOctet;
    const port = BASE_PORT + n; // Use different port for each simulated device
    const app = createDevice(deviceId, address, port);
    applications.push(app);
    console.log(`Simulated BACnet device ${deviceId} at ${address}:${port}`);
  }
  // Send Who-Is from all devices after startup
  setTimeout(sendWhoIsAll, 2000);
}

// --- Express Web UI ---
const app = express();
const PORT = 3000;

// Serve static HTML for UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui.html'));
});

// API endpoint to get device list
app.get('/api/devices', (req, res) => {
  const devices = applications.map(app => ({
    deviceId: app.deviceId,
    address: app.address,
    port: app.port
  }));
  res.json(devices);
});

main();

app.listen(PORT, () => {
  console.log(`Web UI available at http://localhost:${PORT}`);
});
