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

  let HTOP_UUID = '64990000-1795-4dc3-ac63-068ce153eae6';
  let REGISTRATION_UUID = '64994f8b-1795-4dc3-ac63-068ce153eae6';
  let AUTHN_UUID = '64990fa5-1795-4dc3-ac63-068ce153eae6';
  let NOTIFICATION_UUID = '6499821f-1795-4dc3-ac63-068ce153eae6';
  let VERSION = '> Version: 0.3.2';
  let encoder = new TextEncoder('utf-8');
  let decoder = new TextDecoder('utf-8');

  let log = console.log;

  let kvp = {
    '64990000-1795-4dc3-ac63-068ce153eae6': 'HTOP_SERVICE',
    '64994f8b-1795-4dc3-ac63-068ce153eae6': 'REGISTRATION_SERVICE',
    '64990fa5-1795-4dc3-ac63-068ce153eae6': 'AUTHN_SERVICE',
    '6499821f-1795-4dc3-ac63-068ce153eae6': 'NOTIFICATION',
    '6499ab52-1795-4dc3-ac63-068ce153eae6': 'REGISTRATION_TRIGGER',
    '6499dc6c-1795-4dc3-ac63-068ce153eae6': 'REGISTRATION_KEY_1',
    '649955db-1795-4dc3-ac63-068ce153eae6': 'REGISTRATION_KEY_2',
    '64997bff-1795-4dc3-ac63-068ce153eae6': 'HTOP_CODE',
    '6499c92c-1795-4dc3-ac63-068ce153eae6': 'AUTHN_TRANSACTION_ID',
    '64998623-1795-4dc3-ac63-068ce153eae6': 'AUTHN_FACTOR_ID',
    '649992cd-1795-4dc3-ac63-068ce153eae6': 'AUTHN_USER_ID',
    '6499d958-1795-4dc3-ac63-068ce153eae6': 'AUTHN_TRIGGER'
  }

  function splitStr(str) { 
    var len = str.length, mid = Math.floor(len / 2); 
    return [str.substring(0, mid), str.substring(mid)]
  }

  return class {

    constructor() {
      this.device = null;
      this.onDisconnected = this.onDisconnected.bind(this);
    }
  
    requestReadCode() {
      return this.doRequest(HTOP_UUID);
    }

    doRequest(id) {
      let options = {
        "filters": [{
          "services": [id]
        }],
        "optionalServices": [id]
      };
      log(VERSION);
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        log(['> Device is requested for service UUID:', id, kvp[id]].join(' '));
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
        return device;
      })
      .then(_ => {
        return this.device.gatt.connect();
      })
      .then(server => {
        return server.getPrimaryService(id);
      })
      .then(service => {
        this.service = service;
        return Promise.resolve({});
      });
    }

    requestRegister() {
      return this.doRequest(REGISTRATION_UUID);
    }

    requestAuthenticate() {
      return this.doRequest(AUTHN_UUID);
    }
  
    get(key) {
      if (!this.service) {
        return Promise.reject('Service is not connected.');
      } else {
        return this.service.getCharacteristic(key)
                .then(characteristic => {
                  return characteristic.readValue();
                })
                .then(value => {
                  log('> read the value: ' + value + ' for the key: ' + key);
                  return Promise.resolve(decoder.decode(value));
                });
      }
    }

    setValue(key, value) {
      if (!this.service) {
        return Promise.reject('Service is not connected.');
      } else {
        log(['> Getting the characteristic : ', key, ' for ', kvp[key]].join(''));
        return this.service.getCharacteristic(key)
                .then(characteristic => {
                  log(['> Writing the characteristic: ', key, ' for ', kvp[key]].join(''));
                  return characteristic.writeValue(encoder.encode(value));
                })
                .then(_ => {
                  log(['> write the value: ', value, ' for the key: ', key, ' ', kvp[key]].join(''));
                  return Promise.resolve({});
                });
      }
    }

    startNotification() {
      if (!this.service) {
        return Promise.reject('Service is not connected.');
      } else {
        log('> Starting the Notification ' + NOTIFICATION_UUID);
        return this.service.getCharacteristic(NOTIFICATION_UUID)
                .then(characteristic => {
                  this.myNotification = characteristic;
                  log('> Got the characteristic for the Notification: ' + NOTIFICATION_UUID);
                  return this.myNotification.startNotifications();
                })
                .then(_ => {
                  log('> Notifications started: ' + NOTIFICATION_UUID);
                  this.myNotification.addEventListener('characteristicvaluechanged',
                    this.handleNotifications);
                  return Promise.resolve();
                });
      }
    }

    setTrigger(id) {
      if (!this.service) {
        return Promise.reject('Service is not connected.');
      } else {
        log('> Getting the characteristic for ' + kvp[id] + ' trigger: ' + id);
        return this.service.getCharacteristic(id)
                .then(characteristic => {
                  log('> Writing the ' + kvp[id] + ' characteristic: ' + id);
                  return characteristic.writeValue(Uint8Array.of(1));
                })
                .then(_ => {
                  log('> written the value 1 for ' + kvp[id] + ': ' + id);
                  return Promise.resolve({});
                });
      } 
    }
    
    readHTOPCODE() {
      return this.get('64997bff-1795-4dc3-ac63-068ce153eae6');
      //real: 64997bff-1795-4dc3-ac63-068ce153eae6
      //mistake: 64997bff-0179-54dc-3ac7-068ce153eae6
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

    writeREGISTRATIONURI(value, promise) {
      this.promise = promise;
      var values = splitStr(value);
      return this.startNotification()
              .then(_ =>  {
                return this.setValue('6499dc6c-1795-4dc3-ac63-068ce153eae6', values[0]);
              })
              .then(_ => {
                return this.setValue('649955db-1795-4dc3-ac63-068ce153eae6', values[1]);
              })
              .then(_ => {
                return this.setTrigger('6499ab52-1795-4dc3-ac63-068ce153eae6');
              });
    }

    authenticate(userId, factorId, transactionId) {
      return this.setValue('649992cd-1795-4dc3-ac63-068ce153eae6', userId)
              .then(_ => {
                return this.setValue('64998623-1795-4dc3-ac63-068ce153eae6', factorId);
              })
              .then(_ => {
                return this.setValue('6499c92c-1795-4dc3-ac63-068ce153eae6', transactionId);
              })
              .then(_ => {
                return this.setTrigger('6499d958-1795-4dc3-ac63-068ce153eae6');
              })
    }

    disconnect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      } else {
        return this.device.gatt.disconnect();
      }
    }

    onDisconnected() {
      log('Device is disconnected.');
    }

    handleNotifications(event) {
      let value = event.target.value;
      let a = [];
      // Convert raw data bytes to hex values just for the sake of showing something.
      // In the "real" world, you'd use data.getUint8, data.getUint16 or even
      // TextDecoder to process raw data bytes.
      for (let i = 0; i < value.byteLength; i++) {
        a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
      }
      if (a.join('') === '01') {
        this.promise && this.promise.resolve({});
      } else {
        this.promise && this.promise.reject({});
      }
      log('> ' + a.join(' '));
      if (this.myNotification) {
        this.myNotification.removeEventListener('characteristicvaluechanged',
                        this.handleNotifications);
        this.myNotification = undefined;
      }
    }
  
  }

});