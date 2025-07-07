# Use official Python image
FROM python:3.13-slim

WORKDIR /app

# Copy only requirements first for caching
COPY bacnet_stimulator.py ./

# Install BACpypes
RUN pip install bacpypes

# Expose BACnet UDP port (default 47808)
EXPOSE 47808/udp

CMD ["python", "bacnet_stimulator.py"]
