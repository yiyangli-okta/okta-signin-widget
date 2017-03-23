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

define([
  'okta',
  'util/FactorUtil',
  'util/FormController',
  'views/enroll-factors/Footer'
],
function (Okta, FactorUtil, FormController, Footer) {

  var _ = Okta._;

  // Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
  // in network connection lost errors in Safari and IE.
  var PUSH_INTERVAL = 6000;

  return FormController.extend({
    className: 'barcode-push',
    Model: function () {
      return {
        local: {
          '__factorType__': ['string', false, this.options.factorType],
          '__provider__': ['string', false, this.options.provider]
        }
      };
    },

    Form: {
      title: function () {
        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
        return Okta.loc('enroll.totp.title', 'login', ['Bluetooth']);
      },
      subtitle: '',
      save: 'Registration',
      attributes: { 'data-se': 'step-scan' },
      className: 'barcode-scan',
      initialize: function () {
        this.enabled = true;
        this.listenTo(this.model, 'error errors:clear', function () {
          this.clearErrors();
        });
      },
      events: {
        submit: 'submit'
      },

      setSubmitState: function (ableToRegister) {
        var button = this.$el.find('.button-primary');
        // 0 - fail; 1 -- pairing; 3 -- registering
        this.enabled = !ableToRegister;
        if (ableToRegister === 0) {
          button.removeClass('link-button-disabled');
          button.prop('value', 'Try again');
        } 
        if (ableToRegister === 1) {
          button.addClass('link-button-disabled');
          button.prop('value', 'Pairing');
        }
        if (ableToRegister === 2) {
          button.addClass('link-button-disabled');
          button.prop('value', 'Registering');
        }
      },

      submit: function (e) {
        var form = this,
            qrcode = form.options.appState.get('qrcodeText');
        if (e !== undefined) {
          e.preventDefault();
        }
        alert(qrcode);
        if (form.enabled) {
          form.setSubmitState(1);
        }
      }
    },

    Footer: Footer,

    initialize: function () {
      this.pollForEnrollment();
    },

    pollForEnrollment: function () {
      return this.model.doTransaction(function(transaction) {
        return transaction.poll(PUSH_INTERVAL);
      });
    },

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaEnrollActivate')) {
        return true;
      }
    }
  });

});
