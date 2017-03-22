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

define(['okta', 'views/shared/TextBox', 'util/BluetoothVerify'], function (Okta, TextBox, BluetoothVerify) {

  var $ = Okta.$;

  return Okta.Form.extend({
    autoSave: true,
    noButtonBar: true,
    scrollOnError: false,
    layout: 'o-form-theme',

    className: 'mfa-verify-totp-inline',

    attributes: { 'data-se': 'factor-inline-totp' },

    initialize: function () {
      var myBluetooth = new BluetoothVerify();
      this.addDivider();
      var input = this.addInput({
        label: false,
        'label-top': true,
        placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
        className: 'o-form-fieldset o-form-label-top inline-input auth-passcode bluetooth-input',
        name: 'answer',
        input: TextBox,
        type: 'text'
      }).last();
      this.add(Okta.createButton({
        attributes: { 'data-se': 'inline-totp-verify' },
        className: 'button inline-totp-verify',
        title: 'Read Code',
        click: function () {
          $('.bluetooth-input input').val('123');
          alert('read code!');
          myBluetooth.request()
          .then(_ => myBluetooth.connect())
          .then(_ => { this.setSubmitState(2) })
          .catch(error => {  
            error;
            this.setSubmitState(0);
          });
        }
      }));
      input.focus();
    }
  });

});
