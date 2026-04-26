const GOVEE_API_URL = 'https://developer-api.govee.com/v1';

export class GoveeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async fetchDevices() {
    const response = await fetch(`${GOVEE_API_URL}/devices`, {
      method: 'GET',
      headers: {
        'Govee-API-Key': this.apiKey
      }
    });

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Failed to fetch devices');
    }

    return data.data.devices;
  }

  async getDeviceState(device) {
    const response = await fetch(
      `${GOVEE_API_URL}/devices/state?device=${device.device}&model=${device.model}`,
      {
        method: 'GET',
        headers: {
          'Govee-API-Key': this.apiKey
        }
      }
    );

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Failed to get device state');
    }

    return data.data;
  }

  async controlDevice(device, command) {
    const response = await fetch(`${GOVEE_API_URL}/devices/control`, {
      method: 'PUT',
      headers: {
        'Govee-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device: device.device,
        model: device.model,
        cmd: command
      })
    });

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Control command failed');
    }

    return data;
  }

  async toggleDevice(device, turnOn) {
    return this.controlDevice(device, {
      name: 'turn',
      value: turnOn ? 'on' : 'off'
    });
  }

  async setBrightness(device, brightness) {
    return this.controlDevice(device, {
      name: 'brightness',
      value: brightness
    });
  }

  async setColor(device, r, g, b) {
    return this.controlDevice(device, {
      name: 'color',
      value: { r, g, b }
    });
  }

  async setColorTemperature(device, kelvin) {
    return this.controlDevice(device, {
      name: 'colorTem',
      value: kelvin
    });
  }
}

// Helper function to determine device type
export function getDeviceType(device) {
  const model = device.model.toUpperCase();

  if (model.includes('H6') || model.includes('H7') || model.includes('H81')) {
    return { type: 'light', icon: '💡' };
  } else if (model.includes('H5')) {
    return { type: 'plug', icon: '🔌' };
  } else if (model.includes('H71')) {
    return { type: 'humidifier', icon: '💧' };
  } else if (model.includes('H70')) {
    return { type: 'heater', icon: '🔥' };
  }

  return { type: 'unknown', icon: '📱' };
}

// Predefined color palette
export const COLOR_PALETTE = [
  { name: 'Red', r: 255, g: 0, b: 0, class: 'bg-red-500' },
  { name: 'Green', r: 0, g: 255, b: 0, class: 'bg-green-500' },
  { name: 'Blue', r: 0, g: 0, b: 255, class: 'bg-blue-500' },
  { name: 'Yellow', r: 255, g: 255, b: 0, class: 'bg-yellow-500' },
  { name: 'Purple', r: 128, g: 0, b: 128, class: 'bg-purple-500' },
  { name: 'Orange', r: 255, g: 165, b: 0, class: 'bg-orange-500' },
  { name: 'Pink', r: 255, g: 192, b: 203, class: 'bg-pink-500' },
  { name: 'White', r: 255, g: 255, b: 255, class: 'bg-white' },
];
