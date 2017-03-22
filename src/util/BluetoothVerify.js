/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */



define(function() {

  return class {

    constructor() {
      this.device = null;
      this.onDisconnected = this.onDisconnected.bind(this);
    }
  
    request() {
      let options = {
        "filters": [{
          "services": ["6499e02d-1795-4dc3-ac63-068ce153eae6"]
        }],
        "optionalServices": ["6499e02d-1795-4dc3-ac63-068ce153eae6"]
      };
    
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
        return device;
      });
    }
  
    connect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      } else {
        return this.device.gatt.connect();
      }
    }
    
    readHTOPCODE() {
      return this.device.gatt.getPrimaryService("6499e02d-1795-4dc3-ac63-068ce153eae6")
      .then(service => service.getCharacteristic("64997bff-1795-4dc3-ac63-068ce153eae6"))
      .then(characteristic => characteristic.readValue());
    }

    readOKTAUSERNAME() {
      return this.device.gatt.getPrimaryService("6499e02d-1795-4dc3-ac63-068ce153eae6")
      .then(service => service.getCharacteristic("64998561-1795-4dc3-ac63-068ce153eae6"))
      .then(characteristic => characteristic.readValue());
    }

    readOKTAVERIFYVERSION() {
      return this.device.gatt.getPrimaryService("6499e02d-1795-4dc3-ac63-068ce153eae6")
      .then(service => service.getCharacteristic("649954aa-1795-4dc3-ac63-068ce153eae6"))
      .then(characteristic => characteristic.readValue());
    }

    readFACTORID() {
      return this.device.gatt.getPrimaryService("6499e02d-1795-4dc3-ac63-068ce153eae6")
      .then(service => service.getCharacteristic("64998caf-1795-4dc3-ac63-068ce153eae6"))
      .then(characteristic => characteristic.readValue());
    }

    disconnect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      } else {
        return this.device.gatt.disconnect();
      }
    }

    onDisconnected() {
      console.log('Device is disconnected.');
    }
  
  }

});