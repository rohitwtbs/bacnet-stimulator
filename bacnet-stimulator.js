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

  // Assign a type from a list of BACnet device types
  const deviceTypes = [
    'controller',
    'router',
    'gateway',
    'workstation',
    'sensor',
    'actuator',
    'meter',
    'application-specific',
    'lighting-controller',
    'fire-alarm-panel',
    'access-control',
    'smart-sensor',
    'smart-actuator'
  ];
  // Cycle through types for demo
  const type = deviceTypes[deviceId % deviceTypes.length];

  // Simulate BACnet objects for UI (not real BACnet objects)
  const objects = [];
  for (let i = 0; i < OBJECTS_PER_TYPE; i++) {
    if (type === 'controller' || type === 'application-specific') {
      objects.push({ type: 'analogInput', name: `AI${i}`, presentValue: 20.0 + i });
      objects.push({ type: 'analogOutput', name: `AO${i}`, presentValue: 10.0 + i });
      objects.push({ type: 'binaryInput', name: `BI${i}`, presentValue: i % 2 });
      objects.push({ type: 'binaryOutput', name: `BO${i}`, presentValue: (i + 1) % 2 });
    } else if (type === 'sensor' || type === 'smart-sensor') {
      objects.push({ type: 'analogInput', name: `TempSensor${i}`, presentValue: 22.5 + i });
      objects.push({ type: 'analogInput', name: `HumiditySensor${i}`, presentValue: 50 + i });
    } else if (type === 'actuator' || type === 'smart-actuator') {
      objects.push({ type: 'binaryOutput', name: `Valve${i}`, presentValue: i % 2 });
      objects.push({ type: 'analogOutput', name: `Damper${i}`, presentValue: 5.0 + i });
    } else if (type === 'meter') {
      objects.push({ type: 'analogInput', name: `Energy${i}`, presentValue: 1000 + i * 100 });
      objects.push({ type: 'analogInput', name: `Water${i}`, presentValue: 200 + i * 10 });
    } else if (type === 'lighting-controller') {
      objects.push({ type: 'binaryOutput', name: `Light${i}`, presentValue: i % 2 });
    } else if (type === 'fire-alarm-panel') {
      objects.push({ type: 'binaryInput', name: `Smoke${i}`, presentValue: i % 2 });
      objects.push({ type: 'binaryInput', name: `Heat${i}`, presentValue: (i + 1) % 2 });
    } else if (type === 'access-control') {
      objects.push({ type: 'binaryInput', name: `Door${i}`, presentValue: i % 2 });
      objects.push({ type: 'binaryOutput', name: `Lock${i}`, presentValue: (i + 1) % 2 });
    } else if (type === 'router' || type === 'gateway' || type === 'workstation') {
      objects.push({ type: 'device', name: `ConnectedDevice${i}`, presentValue: 1000 + i });
    }
  }
  // Assign random coordinates for demo (replace with real ones as needed)
  const x = Math.floor(Math.random() * 500) + 50; // 50-550 px
  const y = Math.floor(Math.random() * 300) + 50; // 50-350 px
  simulatedDevices.push({
    deviceId,
    address,
    port,
    type,
    x,
    y,
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
