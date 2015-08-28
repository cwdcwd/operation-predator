/**
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * HotMap class contains the sorted data, functions to communicate with view and events
 * @version 1.0
 * @author lovefreya
 */

(function (global, Tabletop, async, _, ViewManager) {
    'use strict';

    var MARK_CLASS = 'marked-ready';

    /**
     * Hot map construction
     * @param options
     * @constructor
     */
    function HotMap(options) {
        this._techKeyName = options.techKeyName;
        this._dataPoints = [];
        this._functionStack = [];
        this._viewManager = new ViewManager(options);
        this._viewManager.setLoading();
        this._allData = [];
    }

    /**
     * function to fetch data from google sheet
     * @param url
     * @returns {HotMap}
     */
    HotMap.prototype.fetchData = function (url) {
        var self = this;
        self._functionStack.push(function (cb) {
            Tabletop.init({
                key: url,
                callback: function (data, e) {
                    if (data) {
                        self._dataPoints = data;
                        self._allData = _.cloneDeep(data);
                        self._viewManager.finishLoading();
                        return cb();
                    }
                    cb(e);
                },
                simpleSheet: true
            });
        });
        return self;
    };

    /**
     * sort data based on hot key
     * @param sortBy
     * @returns {HotMap}
     */
    HotMap.prototype.sortData = function (sortBy) {
        var self = this;
        self._functionStack.push(function (cb) {
            _.forEach(self._dataPoints, function (d) {
                d[sortBy.hotKey] = parseInt(d[sortBy.hotKey]);
            });
            self._dataPoints = _.sortByAll(self._dataPoints, [sortBy.hotKey, sortBy.techNameKey]);
            cb();
        });
        return self;
    };

    /**
     * draw the hot map
     * @returns {HotMap}
     */
    HotMap.prototype.drawMap = function () {
        var self = this;
        self._functionStack.push(function (cb) {
            self._viewManager
                .sizeMap()
                .positionCells();

            _.forEach(self._dataPoints, function (point) {
                self._viewManager.appendDataPoint(point);
            });
            cb();
        });
        return self;
    };

    /**
     * count the number of total cells in the map
     * @param strategy
     * @returns {HotMap}
     */
    HotMap.prototype.countCells = function (strategy) {
        var self = this;
        self._functionStack.push(function (cb) {
            var numberOfAllCells = 0;
            _.forEach(self._dataPoints, function (dataPoint) {
                dataPoint.numberOfCells = strategy(dataPoint);
                numberOfAllCells += dataPoint.numberOfCells;
            });
            self._viewManager.setNumberOfCells(numberOfAllCells);
            cb();
        });
        return self;
    };

    /**
     * reset the light in some lightened cells
     */
    HotMap.prototype.resetLight = function () {
        _.forEach(this._dataPoints, function (point) {
            if (point.cellInTheMap) {
                point.cellInTheMap.attr('filter', null);
            }
        });
    };

    /**
     * lighten some cells based on their values
     * @param keyInTheDataPoint
     * @param possibleValues
     */
    HotMap.prototype.lighten = function (keyInTheDataPoint, possibleValues) {
        this.resetLight();
        _.forEach(this._dataPoints, function (point) {
            if (point.cellInTheMap && ~possibleValues.indexOf(point[keyInTheDataPoint])) {
                point.cellInTheMap.attr('filter', 'url(#lighten)');
            }
        });
    };

    /**
     * append the indicator to some cells
     * @param keyInTheDataPoint
     * @param matchedValue
     * @param iconName
     */
    HotMap.prototype.markIcon = function (keyInTheDataPoint, matchedValue, iconName) {
        var self = this;
        _.forEach(this._dataPoints, function (point) {
            if (point.cellInTheMap && point[keyInTheDataPoint] === matchedValue) {
                self._viewManager.appendIconIfNotExist(point.cellInTheMap, point, iconName, MARK_CLASS);
            }
        });
    };

    /**
     * remove certain indicators from some cells
     */
    HotMap.prototype.removeIcons = function () {
        var self = this;
        _.forEach(this._dataPoints, function (point) {
            if (point.cellInTheMap) {
                self._viewManager.removeIcon(point.cellInTheMap, MARK_CLASS);
            }
        });
    };

    /**
     * rollback to redraw the hot map, cause the type has changed
     * @param type
     * @returns {HotMap}
     */
    HotMap.prototype.updateDataPointsByType = function (type) {
        var self = this;
        self._functionStack = [];

        if (type === '*') {
            self._dataPoints = _.cloneDeep(self._allData);
        } else {
            self._dataPoints = _.filter(self._allData, function (n) {
                return n[self._techKeyName] === type;
            });
        }
        return self;
    };

    /**
     * call all the functions when this then called
     * @param fn
     * @returns {HotMap}
     */
    HotMap.prototype.then = function (fn) {
        var self = this;
        async.waterfall(self._functionStack, function (err) {
            if (self.errorHandler && err) {
                self.errorHandler(err);
            } else {
                fn(self._dataPoints, _.uniq(_.map(self._dataPoints, function (n) {
                    return n[self._techKeyName]
                })));
            }
        });
        return self;
    };

    /**
     * error callback
     * @param errFn
     */
    HotMap.prototype.error = function (errFn) {
        this.errorHandler = errFn;
    };

    global.HotMap = HotMap;

})(this, this.Tabletop, this.async, this._, this.ViewManager);