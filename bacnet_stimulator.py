"""
A simple BACnet stimulator using BACpypes.
This script simulates a BACnet device that can send and receive Who-Is/I-Am messages.
"""

from bacpypes.core import run, stop
from bacpypes.app import BIPSimpleApplication
from bacpypes.local.device import LocalDeviceObject
from bacpypes.pdu import Address
from bacpypes.service.device import WhoIsIAmServices
import threading

# BACnet device settings
device_id = 1234
vendor_id = 15

# Create a local device object
device = LocalDeviceObject(
    objectName="BACnetStimDevice",
    objectIdentifier=device_id,
    maxApduLengthAccepted=1024,
    segmentationSupported="segmentedBoth",
    vendorIdentifier=vendor_id,
)

# BACnet/IP address and port
address = "192.168.1.10/24"

# Create BACnet application
this_application = BIPSimpleApplication(device, address)

# Add Who-Is/I-Am services
WhoIsIAmServices().add_to_application(this_application)

def send_whois():
    print("Sending Who-Is broadcast...")
    this_application.who_is()

def main():
    # Start a thread to send Who-Is after startup
    threading.Timer(2.0, send_whois).start()
    try:
        run()
    except KeyboardInterrupt:
        stop()

if __name__ == "__main__":
    main()
