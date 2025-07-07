"""
A BACnet stimulator using BACpypes.
Simulates multiple BACnet devices, each with a variety of BACnet objects.
"""

from bacpypes.core import run, stop
from bacpypes.app import BIPSimpleApplication
from bacpypes.local.device import LocalDeviceObject
from bacpypes.local.object import (AnalogInputObject, AnalogOutputObject, AnalogValueObject,
                                   BinaryInputObject, BinaryOutputObject, BinaryValueObject,
                                   MultiStateInputObject, MultiStateOutputObject, MultiStateValueObject)
from bacpypes.service.device import WhoIsIAmServices
import threading

# Device and object simulation parameters
NUM_DEVICES = 3  # Number of simulated devices
OBJECTS_PER_TYPE = 2  # Number of each object type per device

# BACnet/IP base address (increment last octet for each device)
BASE_ADDRESS = "192.168.1.10"

applications = []

def create_device(device_id, address):
    device = LocalDeviceObject(
        objectName=f"BACnetStimDevice{device_id}",
        objectIdentifier=device_id,
        maxApduLengthAccepted=1024,
        segmentationSupported="segmentedBoth",
        vendorIdentifier=15,
    )
    app = BIPSimpleApplication(device, address)
    WhoIsIAmServices().add_to_application(app)

    # Add a variety of BACnet objects
    for i in range(OBJECTS_PER_TYPE):
        ai = AnalogInputObject(objectIdentifier=("analogInput", i), objectName=f"AI{i}", presentValue=20.0+i)
        ao = AnalogOutputObject(objectIdentifier=("analogOutput", i), objectName=f"AO{i}", presentValue=10.0+i)
        av = AnalogValueObject(objectIdentifier=("analogValue", i), objectName=f"AV{i}", presentValue=5.0+i)
        bi = BinaryInputObject(objectIdentifier=("binaryInput", i), objectName=f"BI{i}", presentValue=1)
        bo = BinaryOutputObject(objectIdentifier=("binaryOutput", i), objectName=f"BO{i}", presentValue=0)
        bv = BinaryValueObject(objectIdentifier=("binaryValue", i), objectName=f"BV{i}", presentValue=1)
        msi = MultiStateInputObject(objectIdentifier=("multiStateInput", i), objectName=f"MSI{i}", presentValue=1)
        mso = MultiStateOutputObject(objectIdentifier=("multiStateOutput", i), objectName=f"MSO{i}", presentValue=2)
        msv = MultiStateValueObject(objectIdentifier=("multiStateValue", i), objectName=f"MSV{i}", presentValue=3)
        device.objectList.extend([ai, ao, av, bi, bo, bv, msi, mso, msv])
    return app

def send_whois_all():
    print("Sending Who-Is broadcast from all devices...")
    for app in applications:
        app.who_is()

def main():
    # Create multiple simulated devices
    for n in range(NUM_DEVICES):
        device_id = 1234 + n
        # Increment last octet for each device
        address = f"{BASE_ADDRESS[:-2]}{10+n}/24"
        app = create_device(device_id, address)
        applications.append(app)
    # Send Who-Is from all devices after startup
    threading.Timer(2.0, send_whois_all).start()
    try:
        run()
    except KeyboardInterrupt:
        stop()

if __name__ == "__main__":
    main()
