(function (global) {
    'use strict';

    function SVGExporter(selector) {
        var body         = global.document.querySelector('body'),
            svg          = global.document.querySelector(selector),
            dataUri      = 'data:image/svg+xml;base64,' + global.btoa(new XMLSerializer().serializeToString(svg)),
            targetCanvas = global.document.createElement('canvas'),
            targetImg    = new Image(),
            downloadLink = global.document.createElement('a');

        targetCanvas.width = svg.clientWidth;
        targetCanvas.height = svg.clientHeight;
        targetImg.width = svg.clientWidth;
        targetImg.height = svg.clientHeight;
        body.appendChild(targetImg);

        return {
            to: function (fileName) {
                targetImg.onload = function () {
                    targetCanvas.getContext('2d').drawImage(targetImg, 0, 0, targetImg.width, targetImg.height, 0, 0, targetImg.width+10, targetImg.height+10);
                    downloadLink.download = fileName;
                    downloadLink.href = targetCanvas.toDataURL('image/' + fileName.slice(fileName.indexOf('.') + 1));
                    body.appendChild(downloadLink);
                    downloadLink.click();
                    body.removeChild(downloadLink);
                    body.removeChild(targetImg);
                };
                targetImg.src = dataUri;
            }
        };
    }

    global.SVGExporter = SVGExporter;
})(window);