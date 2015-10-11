(function() {
    'use strict';

    // defaults
    var imgUri = 'frozen_city';
    var nrTiles = 40;    // 20,   40,   80
    var cutRatio = 0.33; // 0.25, 0.33, 0.4

    var hash = location.hash;
    if (hash) {
        hash = hash.substring(1).split(' ');
        imgUri = hash[0];
        nrTiles = parseInt(hash[1], 10);
        cutRatio = parseFloat(hash[2]);
    }

    window.focusPoint({
        // params
        imgUri               : 'assets/images/' + imgUri + '.jpg',
        nrTiles              : nrTiles,
        cutRatio             : cutRatio,

        // handled by hud
        onElapsedTimeChanged : window.updateElapsedTime,
        onNrMovesChanged     : window.updateNrMoves,
        onGameCompleted      : window.gameCompleted,
        onError              : function(err) { window.alert(err); }
    });

})();