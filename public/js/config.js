/**
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * configuration file
 * @version 1.0
 * @author lovefreya
 */

(function (global) {
    'use strict';

    global.TC_APP_CONFIG = {
        //data source url for spread sheet
        spreadsheetDataSource: 'https://docs.google.com/spreadsheets/d/1S58McCjHrZ6iNrQ2yKPI9C_3NdZns3Y3W_8-dOgMnIc/pubhtml',

        //sort the data points based on following columns
        sortByColumns: {
            hotKey: 'TC Community ready? (1 = VERY, 5 = Not possible)',
            techNameKey: 'Technologies'
        },

        //hot is defined by this column
        hotBy: 'TC Community ready? (1 = VERY, 5 = Not possible)',

        //key names in the spread sheet
        cellDisplayTitle: 'Technologies',
        cellDisplayDesc: 'Technology Type',
        saleAbilityKeyName: 'Should we sell? (Yes/No/With Care)',
        communityReadinessKeyName: 'Widely Used on TC',

        //event names to listen
        interactionEventNames: {
            RESET: 'reset',
            SALEABILITY: 'saleAbilityChanged',
            COMMUNITY_READY: 'communityReadiness',
            TECHNOLOGY_TYPE_SELECTED: 'technologyTypeSelected',
            EXPORT: 'export'
        }
    };

})(this);
