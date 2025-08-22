// bacnet-stimulator.js
// A BACnet stimulator using node-bacstack (pure Node.js)


const Bacnet = require('bacstack');
const express = require('express');
const path = require('path');

const NUM_DEVICES = 10; // Number of simulated devices
const OBJECTS_PER_TYPE = 3; // Number of each object type per device
const BASE_ADDRESS = '192.168.1.10'; // Base IP address
const BASE_PORT = 47808; // Standard BACnet port

const applications = [];
const simulatedDevices = [];

function createDevice(deviceId, address, port) {
  const client = new Bacnet({adpuTimeout: 6000, port, interface: address});
  client.deviceId = deviceId;
  client.address = address;
  client.port = port;
  // Simulate BACnet objects for UI (not real BACnet objects)
  const objects = [];
  for (let i = 0; i < OBJECTS_PER_TYPE; i++) {
    objects.push({
      type: 'analogInput',
      name: `AI${i}`,
      presentValue: 20.0 + i
    });
    objects.push({
      type: 'analogOutput',
      name: `AO${i}`,
      presentValue: 10.0 + i
    });
    objects.push({
      type: 'binaryInput',
      name: `BI${i}`,
      presentValue: i % 2
    });
    objects.push({
      type: 'binaryOutput',
      name: `BO${i}`,
      presentValue: (i + 1) % 2
    });
  }
  simulatedDevices.push({
    deviceId,
    address,
    port,
    objects
  });
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

// API endpoint to get device list with objects
app.get('/api/devices', (req, res) => {
  res.json(simulatedDevices);
});

main();

app.listen(PORT, () => {
  console.log(`Web UI available at http://localhost:${PORT}`);
});
