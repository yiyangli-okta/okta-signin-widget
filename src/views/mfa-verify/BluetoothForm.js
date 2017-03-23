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

  var _ = Okta._,
      $ = Okta.$;

  return Okta.Form.extend({
    className: 'mfa-verify-yubikey',
    autoSave: true,
    noCancelButton: true,
    save: 'Authenticate',
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-bluetooth' },
    events: {
      submit: 'submit'
    },

    initialize: function () {
      var factorName = 'Bluetooth';
      this.enabled = true;
      this.title = factorName;
      this.subtitle = '';
      this.myBluetooth = new BluetoothVerify();
      this.listenTo(this.options.appState, 'change:isMfaRejectedByUser',
        function (state, isMfaRejectedByUser) {
          this.setSubmitState(isMfaRejectedByUser ? 0 : 2);
          if (isMfaRejectedByUser) {
            this.showError(Okta.loc('oktaverify.rejected', 'login'));
          }
        }
      );
    },

    setSubmitState: function (ableToAuth) {
      var button = this.$el.find('.button');
      // 0 - fail; 1 -- Authenticating; 2 -- Authenticated.
      this.enabled = !ableToAuth;
      if (ableToAuth === 0) {
        button.removeClass('link-button-disabled');
        button.prop('value', 'Try again');
      } 
      if (ableToAuth === 1) {
        button.addClass('link-button-disabled');
        button.prop('value', 'Authenticating');
      }
      if (ableToAuth === 2) {
        button.addClass('link-button-disabled');
        button.prop('value', 'Authenticated');
      }
    },

    submit: function (e) {
      var form = this;
      if (e !== undefined) {
        e.preventDefault();
      }
      if (form.enabled) {
        form.setSubmitState(1);
        alert('Authenticating!');
      }
    },

    showError: function (msg) {
      this.model.trigger('error', this.model, {responseJSON: {errorSummary: msg}});
    }

  });

});
