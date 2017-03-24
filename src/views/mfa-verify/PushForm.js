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

define(['okta', 'util/CookieUtil', 'util/BluetoothVerify'], function (Okta, CookieUtil, BluetoothVerify) {

  var _ = Okta._,
      $ = Okta.$;
  // deviceName is escaped on BaseForm (see BaseForm's template)
  var titleTpl = Okta.Handlebars.compile('{{factorName}} ({{{deviceName}}})');

  return Okta.Form.extend({
    className: 'mfa-verify-push',
    autoSave: true,
    noCancelButton: true,
    save: _.partial(Okta.loc, 'oktaverify.send', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-push' },
    events: {
      submit: 'submit'
    },

    initialize: function () {
      this.enabled = true;
      this.myBluetooth = new BluetoothVerify();
      this.listenTo(this.options.appState, 'change:isMfaRejectedByUser',
        function (state, isMfaRejectedByUser) {
          this.setSubmitState(isMfaRejectedByUser ? 0 : 1);
          if (isMfaRejectedByUser) {
            this.showError(Okta.loc('oktaverify.rejected', 'login'));
          }
        }
      );
      this.listenTo(this.options.appState, 'change:isMfaTimeout',
        function (state, isMfaTimeout) {
          this.setSubmitState(isMfaTimeout ? 0 : 1);
          if (isMfaTimeout) {
            this.showError(Okta.loc('oktaverify.timeout', 'login'));
          }
        }
      );
      this.listenTo(this.options.appState, 'change:transactionId',
        function (state, transactionId) {
          alert(transactionId);
        }
      );
      this.listenTo(this.options.appState, 'change:isMfaRequired',
        function (state, isMfaRequired) {
          if (isMfaRequired) {
            this.clearErrors();
          }
        }
      );
      this.title = titleTpl({
        factorName: 'Bluetooth',
        deviceName: this.model.get('deviceName')
      });
    },
    setSubmitState: function (ableToSubmit) {
      var button = this.$el.find('.button');
      this.enabled = ableToSubmit === 0;
      if (ableToSubmit === 0) {
        button.removeClass('link-button-disabled');
        button.prop('value', 'Try again!');
      }
      if (ableToSubmit === 1) {
        button.addClass('link-button-disabled');
        button.prop('value', 'Verifying');
      }
      if (ableToSubmit === 2) {
        button.addClass('link-button-disabled');
        button.prop('value', 'Pairing');
      }
    },
    submit: function (e) {
      if (e !== undefined) {
        e.preventDefault();
      }
      if (this.enabled) {
        this.setSubmitState(2);
        this.doSave();
      }
    },
    postRender: function() {
      if (this.settings.get('features.autoPush') && CookieUtil.isAutoPushEnabled(this.options.appState.get('userId'))) {
        this.model.set('autoPush', true);
        // bind after $el has been rendered, and trigger push once DOM is fully loaded
        _.defer(_.bind(this.submit, this));
      }
    },
    doSave: function () {
      var self = this,
          appState = self.options.appState;
      self.clearErrors();
      if (self.model.isValid()) {
        self.listenToOnce(this.model, 'error', self.setSubmitState, 0);
        self.myBluetooth.requestAuthenticate()
          .then(_ =>  {
            self.trigger('save', self.model);
          });
        self.listenToOnce(appState, 'transactionId', function (transactionId) {
            self.setSubmitState(1);
            self.myBluetooth.authenticate(appState.get('userId'), self.model.get('id'), transactionId)
            .catch(error => {
              console.error(error);
            });
        });
      }
    },
/*
    pollForEnrollment: function () {
      return this.model.doTransaction(function(transaction) {
        return transaction.poll(PUSH_INTERVAL);
      });
    },
    */
    showError: function (msg) {
      this.model.trigger('error', this.model, {responseJSON: {errorSummary: msg}});
    }
  });
});
