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

  function addInlineTotp(form) {
    var myBluetooth = new BluetoothVerify();
    form.addDivider();
    var input = form.addInput({
        label: false,
        'label-top': true,
        placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
        className: 'o-form-fieldset o-form-label-top inline-input auth-passcode bluetooth-input',
        name: 'answer',
        input: TextBox,
        type: 'text'
      }).last();
    var button = form.add(Okta.createButton({
        attributes: { 'data-se': 'inline-totp-verify' },
        className: 'button inline-totp-verify bluetooth-button',
        title: 'Read Code',
        click: function () {
          button.disable();
          button.$el.text('Pairing');
          myBluetooth.request()
            .then(_ => myBluetooth.readHTOPCODE())
            .then(value => {
              $('.bluetooth-input input').val(value);
              form.model.set('answer', value);
              button.$el.text('Verifying');
              form.model.manageTransaction(function (transaction, setTransaction) {
              // This is the case where we enter the TOTP code and verify while there is an
              // active Push request (or polling) running. We need to invoke previous() on authClient
              // and then call model.save(). If not, we would still be in MFA_CHALLENGE state and
              // verify would result in a wrong request (push verify instead of a TOTP verify).
              if (transaction.status === 'MFA_CHALLENGE' && transaction.prev) {
                return transaction.prev().then(function (trans) {
                 setTransaction(trans);
                 form.model.save();
                });
              } else {
                // Push is not active and we enter the code to verify.
                form.model.save();
              }
              });
            })
            .catch(error => {
              console.error(error);
              button.enable();
            });
        }
      })).last();
      input.focus();
  }

  return Okta.Form.extend({
    autoSave: true,
    noButtonBar: true,
    scrollOnError: false,
    layout: 'o-form-theme',

    className: 'mfa-verify-totp-inline',

    attributes: { 'data-se': 'factor-inline-totp' },

    initialize: function () {
      var form = this;
      this.listenTo(this.model, 'error', function () {
        this.clearErrors();
      });
      addInlineTotp(form);
    }
  });

});
