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

  var UUID = '64990000-1795-4dc3-ac63-068ce153eae6';

  return class {

    constructor() {
      this.device = null;
      this.onDisconnected = this.onDisconnected.bind(this);
    }
  
    request() {
      let options = {
        "filters": [{
          "services": [UUID]
        }],
        "optionalServices": [UUID]
      };
    
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
        return device;
      });
    }
  
    get(key) {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      } else {
        return this.device.gatt.connect()
                .then(server => {
                  return server.getPrimaryService(UUID);
                })
                .then(service => {
                  return service.getCharacteristic(key);
                })
                .then(characteristic => {
                  return characteristic.readValue();
                })
                .then(value => {
                  let d = new TextDecoder('utf-8');
                  return Promise.resolve(d.decode(value));
                });
      }
    }
    
    readHTOPCODE() {
      return this.get('64997bff-1795-4dc3-ac63-068ce153eae6');
    }

    readOKTAUSERNAME() {
      return this.get('64998561-1795-4dc3-ac63-068ce153eae6');
    }

    readOKTAVERIFYVERSION() {
      return this.get('649954aa-1795-4dc3-ac63-068ce153eae6');
    }

    readFACTORID() {
      return this.get('64998caf-1795-4dc3-ac63-068ce153eae6');
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