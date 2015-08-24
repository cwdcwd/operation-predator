/**
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * ViewManager. Drawing the hot map
 * @version 1.0
 * @author lovefreya
 */

(function (global, $, d3, _) {
    'use strict';

    var HIDE_CLASS          = 'hide',
        EDGE_LENGTH_OF_CELL = 117,
        MARGIN_OF_CELL      = 12,
        HOT_CLASSES_MAPPING = {
            1: 'very-hot',
            2: 'some-hot',
            3: 'so-so',
            4: 'no-hot',
            5: 'never-hot'
        };

    function ViewManager(options) {
        this._hotKey = options.hotKey;
        this._title = options.displayTitle;
        this._desc = options.displayDesc;

        this._container = $('.hot-map');
        this._loadingIndicator = $('.loading');
        this._svg = d3.select('.hot-map svg')
            .attr('width', '100%');

        this._init();
    }

    /**
     * Init some variables to describe the map
     * @private
     */
    ViewManager.prototype._init = function () {
        this._svg.selectAll('g').remove();
        this._scale = {
            width: null
        };

        this._numberOfColumns = 0;
        this._numberOfRows = 0;

        this._cellPositions = [];
        this._positionIndex = 0;
    };

    /**
     * hide the map
     */
    ViewManager.prototype.setLoading = function () {
        this._container.addClass(HIDE_CLASS);
        this._loadingIndicator.removeClass(HIDE_CLASS);
    };

    /**
     * show the map
     */
    ViewManager.prototype.finishLoading = function () {
        this._loadingIndicator.addClass(HIDE_CLASS);
        this._container.removeClass(HIDE_CLASS);
    };

    ViewManager.prototype.setNumberOfCells = function (n) {
        this._numberOfAllCells = n;
    };

    /**
     * define the size of the map
     * @returns {ViewManager}
     */
    ViewManager.prototype.sizeMap = function () {
        //need to clean the whole svg
        this._init();

        this._scale.width = $('.hot-map svg').width();
        this._numberOfColumns = parseInt(this._scale.width / EDGE_LENGTH_OF_CELL);
        this._numberOfRows = Math.ceil(this._numberOfAllCells / this._numberOfColumns);

        this._svg
            .attr('height', (MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL) * this._numberOfRows);
        return this;
    };

    /**
     * define each cell in the map
     */
    ViewManager.prototype.positionCells = function () {
        var i, j;
        for (i = 0; i < this._numberOfColumns; i++) {
            for (j = 0; j < this._numberOfRows; j++) {
                this._cellPositions.push({
                    x: i * (MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL),
                    y: j * (MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL),
                    occupied: false
                });
            }
        }
    };

    /**
     * generate class for the hot level of each cell
     * @param point
     * @returns {*}
     * @private
     */
    ViewManager.prototype._generateClass = function (point) {
        return HOT_CLASSES_MAPPING[parseInt(point[this._hotKey])];
    };

    /**
     * detailed functions to define the number of the lines, the font's properties of the text and the position of the text
     * @param group
     * @param position
     * @param point
     * @private
     */
    ViewManager.prototype._renderText = function (group, position, point) {
        function sliceString(title, ch) {
            var str = _.trim(title);
            if (str.length > 10 && point.numberOfCells === 1) {
                var lines = [];
                _.forEach(str.split(ch), function (line) {
                    if (!line.length) return;
                    lines.push(_.trim(line));
                });
                return lines;
            } else {
                return [str];
            }
        }

        /**
         * slice the text into more lines separated by '/'
         * and combine short lines into one;
         * @param lines
         * @returns {Array}
         */
        function reArrangeLines(lines) {
            var step1 = [];
            _.forEach(lines, function (line) {
                if (~line.indexOf('/')) {
                    var out = sliceString(line, '/');
                    _.forEach(out, function (sub, i) {
                        if (i !== (out.length - 1)) {
                            step1.push(sub + '/');
                        }
                    });
                } else {
                    step1.push(line);
                }
            });

            var step2 = [],
                i     = 1,
                tmp   = step1[0];

            for (; i < step1.length; i++) {
                if ((tmp + step1[i]).length > 10) {
                    step2.push(tmp);
                    tmp = step1[i];
                } else {
                    tmp += ' ' + step1[i];
                }
            }

            step2.push(tmp);

            return step2;
        }

        var titleLines = reArrangeLines(sliceString(point[this._title], ' '));

        /**
         * process title text
         */
        _.forEach(titleLines, function (line, index) {
            group.append('text')
                .text(line)
                .attr('x', position.x + (point.numberOfCells > 1 ? (EDGE_LENGTH_OF_CELL * 2 + MARGIN_OF_CELL) : EDGE_LENGTH_OF_CELL) / 2)
                .attr('y', position.y + (45 - (8 * (titleLines.length - 1))) + 20 * index)
                .attr('text-anchor', 'middle')
                .attr('style', 'font-size: ' + (26 - (titleLines.length * 3) - (line.length > 10 ? 5 : 0)) + 'px;');
        });

        /**
         * process tech type text
         */
        var specLines = sliceString(point[this._desc], '/');
        _.forEach(specLines, function (line, index) {
            group.append('text')
                .text(line)
                .attr('x', position.x + (point.numberOfCells > 1 ? (EDGE_LENGTH_OF_CELL * 2 + MARGIN_OF_CELL) : EDGE_LENGTH_OF_CELL) / 2)
                .attr('y', position.y + 90 + 15 * index)
                .attr('text-anchor', 'middle')
                .attr('style', 'font-size: 15px;');
        });
    };

    /**
     * render each cell into inner cell position
     * @param group
     * @param position
     * @param point
     * @private
     */
    ViewManager.prototype._renderCell = function (group, position, point) {
        var cell = group
            .append('rect')
            .attr('x', position.x)
            .attr('y', position.y)
            .attr('height', EDGE_LENGTH_OF_CELL)
            .attr('class', this._generateClass(point))
            .attr('filter', 'url(#inset-shadow)');
        if (point.numberOfCells > 1) {
            cell.attr('width', (EDGE_LENGTH_OF_CELL * 2 + MARGIN_OF_CELL));
            this._cellPositions[this._positionIndex + this._numberOfRows].occupied = true;
        } else
            cell.attr('width', EDGE_LENGTH_OF_CELL);
    };

    /**
     * load real data into each cell
     * @param point
     */
    ViewManager.prototype.appendDataPoint = function (point) {
        var position = this._cellPositions[this._positionIndex];
        while (position.occupied) {
            this._positionIndex++;
            position = this._cellPositions[this._positionIndex];
        }
        position.occupied = true;

        var group = this._svg.append('g');

        this._renderCell(group, position, point);

        this._renderText(group, position, point);
        this._positionIndex++;

        point.cellInTheMap = group;
    };

    /**
     * function to add the icon
     * @param group
     * @param point
     * @param iconName
     * @param className
     */
    ViewManager.prototype.appendIconIfNotExist = function (group, point, iconName, className) {
        if ((group.selectAll('image.' + className))[0].length > 0) {
            return;
        }

        var relatedRect = group.select('rect'),
            x           = relatedRect.attr('x'),
            y           = relatedRect.attr('y');
        group.append("svg:image")
            .attr('x', parseInt(x) + (point.numberOfCells > 1 ? (EDGE_LENGTH_OF_CELL * 2 + MARGIN_OF_CELL) / 2 : EDGE_LENGTH_OF_CELL / 2) - 30)
            .attr('y', (parseInt(y) - 15))
            .attr('width', 60)
            .attr('height', 40)
            .attr('xlink:href', 'img/' + iconName)
            .attr('class', className);
    };

    /**
     * function to remove icon
     * @param group
     * @param className
     */
    ViewManager.prototype.removeIcon = function (group, className) {
        group.selectAll('image.' + className).remove();
    };

    global.ViewManager = ViewManager;

})(this, this.$, this.d3, this._);