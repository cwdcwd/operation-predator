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
        HOT_FILL_MAPPING    = {
            1: '#EB6045',
            2: '#FDC171',
            3: '#D2EC9B',
            4: '#69C3A4',
            5: '#4AA3B1'
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

    ViewManager.prototype._drawLegend = function () {
        var lengend = this._svg
                .append('g'),
            startY  = this._scale.height / 2 - 200,
            startX  = (MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL) * this._numberOfColumns + 45;

        lengend.append('text')
            .text('Hot')
            .attr('x', startX)
            .attr('y', startY)
            .attr('text-anchor', 'middle')
            .attr('style', 'font-size:22px;color:#333E48;');

        for (var i = 1; i < 6; i++) {
            lengend.append('rect')
                .attr('width', 50)
                .attr('height', 70)
                .attr('fill', HOT_FILL_MAPPING[i])
                .attr('x', startX - 25)
                .attr('y', startY + 75 * (i - 1) + 20)
                .attr('filter', 'url(#inset-shadow)');
            lengend.append('text')
                .text(i)
                .attr('x', startX + 40)
                .attr('y', startY + 75 * i - 10)
                .attr('style', 'font-size:30px;color:#333E48;');
        }
        lengend.append('text')
            .text('Cold')
            .attr('x', startX)
            .attr('y', startY + 425)
            .attr('text-anchor', 'middle')
            .attr('style', 'font-size:22px;color:#333E48;');
        this._svg.attr('width', startX+70);
    };

    /**
     * define the size of the map
     * @returns {ViewManager}
     */
    ViewManager.prototype.sizeMap = function () {
        //need to clean the whole svg
        this._init();

        this._svg.attr('width', '100%');
        this._scale.width = $('.hot-map svg').width() * 0.94;
        // - 70 to make space for the legend.
        this._numberOfColumns = Math.min(parseInt((this._scale.width - 70) / (MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL)), this._numberOfAllCells);
        this._numberOfRows = Math.ceil(this._numberOfAllCells / this._numberOfColumns);
        this._scale.height = Math.max((MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL) * this._numberOfRows+20, 500);

        this._svg
            .attr('height', this._scale.height);
        console.log(this._numberOfColumns);
        this._drawLegend();
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
                    x: i * (MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL)+10,
                    y: j * (MARGIN_OF_CELL + EDGE_LENGTH_OF_CELL)+10,
                    occupied: false
                });
            }
        }
    };

    /**
     * generate fill for the hot level of each cell
     * @param point
     * @returns {*}
     * @private
     */
    ViewManager.prototype._generateFill = function (point) {
        return HOT_FILL_MAPPING[parseInt(point[this._hotKey])];
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
            line = line || '';
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
            .attr('fill', this._generateFill(point))
            .attr('filter', 'url(#lighten)');
        if (point.numberOfCells > 1) {
            cell.attr('width', (EDGE_LENGTH_OF_CELL * 2 + MARGIN_OF_CELL));
            this._cellPositions[this._positionIndex + this._numberOfRows].occupied = true;
        } else
            cell.attr('width', EDGE_LENGTH_OF_CELL);

        return cell;
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

        group.backArea = this._renderCell(group, position, point);

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
    ViewManager.prototype.appendIconIfNotExist = function (group, point, iconDataUri, className) {
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
            .attr('xlink:href', iconDataUri)
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
