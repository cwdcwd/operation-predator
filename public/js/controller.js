/**
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * event controller. provide some interactions.
 * @version 1.0
 * @author lovefreya
 */

(function (global, $) {
    'use strict';

    /**
     * construction function to get the main elements
     * @param options
     * @constructor
     */
    function Controller(options) {
        this._eventNames = options.eventNames;

        this._techTypeList = $('#tech-type-list');
        this._techTypeDropdown = $('#tech-type-selector');
        this._resetBtn = $('#reset-menu');
        this._communityReadyBtn = $('#mark-ready');
        this._trigger = $('#main-menu');
        this._panel = $('#main-menu-panel');
        this._saleAbilitySlider = $('#sale-ability-slider');
        this._saleAbilityLabel = $('#sale-ability-slider-val-label');
    }

    /**
     * initialize each elements
     * @param uniqTechTypes
     * @returns {Controller}
     */
    Controller.prototype.init = function (uniqTechTypes) {
        var self = this;
        self._trigger.on('click', function () {
            if (self._panel.hasClass('hide')) {
                self._panel.removeClass('hide');
            } else {
                self._panel.addClass('hide');
            }
        });


        self._saleAbilitySlider.slider({
            tooltip: 'hide'
        });
        self._saleAbilityLabel.text('All selected.');
        //this function used for updating label
        self._saleAbilitySlider.on('slideStop', function (slideEvt) {
            var text;
            switch (slideEvt.value) {
                case 1:
                    text = 'No';
                    break;
                case 2:
                    text = 'With Care';
                    break;
                case 3:
                    text = 'Yes';
                    break;
                case 4:
                    text = 'All';
                    break;
            }
            self._saleAbilityLabel.text(text);
        });

        $.each(uniqTechTypes, function (i, type) {
            self._techTypeList
                .append('<li><a data-techtype="' + type + '">' + type + '</a></li>');
        });
        self._techTypeDropdown
            .text('Select a Technology Type')
            .append('<span class="caret"></span>');
        return self;
    };

    /**
     * handler for each listener and do the inner processes
     * @param eventName
     * @param fn
     * @returns {Controller}
     */
    Controller.prototype.on = function (eventName, fn) {
        var self = this;

        switch (eventName) {
            case self._eventNames.SALEABILITY:
                self._saleAbilitySlider.on('slideStop', function (slideEvt) {
                    switch (slideEvt.value) {
                        case 1:
                            fn(['N']);
                            break;
                        case 2:
                            fn(['WC']);
                            break;
                        case 3:
                            fn(['Y', 'WC']);
                            break;
                        case 4:
                            fn(['N', 'WC', 'Y']);
                            break;
                    }
                });
                break;
            case self._eventNames.RESET:
                self._resetBtn.on('click', function () {
                    self._saleAbilityLabel.text('All selected.');
                    self._techTypeDropdown
                        .text('Select a Technology Type')
                        .append('<span class="caret"></span>');
                    fn();
                });
                break;
            case self._eventNames.COMMUNITY_READY:
                self._communityReadyBtn.on('click', function () {
                    fn();
                });
                break;
            case self._eventNames.TECHNOLOGY_TYPE_SELECTED:
                $('#tech-type-list li a').on('click', function (evt) {
                    var target   = $(evt.target),
                        techName = target.data('techtype');
                    self._techTypeDropdown.text(techName + ' ').append('<span class="caret"></span>');
                    fn(techName);
                });
                break;
            case self._eventNames.EXPORT:
                $('#export-as-png').on('click', function () {
                    if (document.getElementById('export-png').checked) {
                        return fn('png');
                    }
                    fn('jpg');
                });

                break;
        }

        return self;
    };

    global.HotMapController = Controller;
})(this, this.$);