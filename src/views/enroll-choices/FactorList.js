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
  'util/RouterUtil'
], function (Okta, RouterUtil) {

  var _ = Okta._;

  var FactorRow = Okta.View.extend({
    className: 'enroll-factor-row clearfix',

    template: '\
      <div class="enroll-factor-icon-container">\
        <div class="factor-icon enroll-factor-icon {{iconClassName}}">\
        </div>\
      </div>\
      <div class="enroll-factor-description">\
        <h3 class="enroll-factor-label">Bluetooth</h3>\
        {{#if factorDescription}}\
          <p>Use a paired bluetooth device to read verify code.</p>\
        {{/if}}\
        <div class="enroll-factor-button"></div>\
      </div>\
    ',

    attributes: function () {
      return { 'data-se': this.model.get('factorName') };
    },

    children: function () {
      if (this.model.get('enrolled')) {
        return [['<span class="icon success-16-green"></span>', '.enroll-factor-label']];
      }
      else if (this.model.get('enrollment') === 'REQUIRED') {
        return [['<span class="icon success-16-gray"></span>', '.enroll-factor-label']];
      }

      return [[Okta.createButton({
        className: 'button',
        title: Okta.loc('enroll.choices.setup', 'login'),
        click: function () {
          this.options.appState.trigger('navigate', RouterUtil.createEnrollFactorUrl(
            this.model.get('provider'),
            this.model.get('factorType')
          ));
        }
      }), '.enroll-factor-button']];
    },

    minimize: function () {
      this.$el.addClass('enroll-factor-row-min');
    },

    maximize: function () {
      this.$el.removeClass('enroll-factor-row-min');
    }
  });

  return Okta.ListView.extend({

    className: 'enroll-factor-list',

    item: FactorRow,

    itemSelector: '.list-content',

    template: '\
      {{#if listSubtitle}}\
        <div class="list-subtitle">{{listSubtitle}}</div>\
      {{/if}}\
      {{#if listTitle}}\
        <div class="list-title">{{listTitle}}</div>\
      {{/if}}\
      <div class="list-content"></div>\
    ',

    getTemplateData: function () {
      var json = Okta.ListView.prototype.getTemplateData.call(this);
      _.extend(json, this);
      return json;
    },

    postRender: function () {
      if (this.options.minimize) {
        this.invoke('minimize');
      }
    }

  });

});
