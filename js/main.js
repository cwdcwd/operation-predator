/**
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * main process
 * @version 1.0
 * @author lovefreya
 */

(function (global, config, HotMap, Controller) {
    'use strict';


    //declare main hotmap
    var hotMap = new HotMap({
        hotKey: config.hotBy,
        displayTitle: config.cellDisplayTitle,
        displayDesc: config.cellDisplayDesc,
        techKeyName: config.cellDisplayDesc
    });

    //declare event controller
    var ctrl = new Controller({
        eventNames: config.interactionEventNames
    });

    function whenTheCellShouldTake2Place(dataPoint) {
        return ~dataPoint[config.sortByColumns.techNameKey].indexOf('and') ? 2 : 1;
    }

    //redraw function. used when selecting a specify technology type
    function redraw(techType) {
        hotMap.updateDataPointsByType(techType)
            .sortData(config.sortByColumns)
            .countCells(whenTheCellShouldTake2Place)
            .drawMap()
            .then(function () {
            });
    }

    /**
     * 1. fetch data from google spreadsheet
     * 2. sort them based on the hot key
     * 3. draw the map with the support of viewManager
     * 4. setup the event listeners to provider some interactions
     */
    hotMap
        .fetchData(config.spreadsheetDataSource)
        .sortData(config.sortByColumns)
        .countCells(whenTheCellShouldTake2Place)
        .drawMap()
        .then(function (data, techTypes) {
            ctrl
                .init(techTypes)
                .on(config.interactionEventNames.SALEABILITY, function (saleAbilityValues) {
                    hotMap.lighten(config.saleAbilityKeyName, saleAbilityValues);
                })
                .on(config.interactionEventNames.RESET, function () {
                    hotMap.resetLight();
                    hotMap.removeIcons();
                    redraw('*');
                })
                .on(config.interactionEventNames.COMMUNITY_READY, function () {
                    hotMap.markIcon(config.communityReadinessKeyName, 'Y', 'indicator.svg');
                })
                .on(config.interactionEventNames.TECHNOLOGY_TYPE_SELECTED, function (type) {
                    redraw(type);
                })
                .on(config.interactionEventNames.EXPORT, function(){
                });
        })
        .error(function (err) {
            console.error(err);
        });

}(this, this.TC_APP_CONFIG, this.HotMap, this.HotMapController));