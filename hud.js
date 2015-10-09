(function(w) {
    
    'use strict';
    
    var hudEl = document.createElement('div');
    hudEl.className = 'hud';
    hudEl.innerHTML = [
        '<label>elapsed time:</label> <span class="elapsed-time">0</span>',
        '<label>nr. moves:</label>    <span class="nr-moves">0</span>'
    ].join('<br/>');
    document.body.appendChild(hudEl);

    var QS = function(s) {
        return document.querySelector(s);
    };

    var pad02 = function(n, pad) {
        if (!pad) { return n; }
        return n < 10 ? '0' + n : n;
    };

    var formatTime = function(t) {
        var s = t;
        var m = ~~(s / 60); s -= m * 60;
        var h = ~~(m / 60); m -= h * 60;
        var parts = [pad02(s, m || h)];
        if (m) { parts.unshift( pad02(m, h) ); }
        if (h) { parts.unshift( h  ); }
        return parts.join(':');
    };

    var elapsedTimeEl = QS('.hud .elapsed-time');
    var nrMovesEl     = QS('.hud .nr-moves');

    w.updateElapsedTime = function(t) {
        elapsedTimeEl.innerHTML = formatTime(t);
    };

    w.updateNrMoves = function(n) {
        nrMovesEl.innerHTML = '' + n;
    };

    w.gameCompleted = function(o) {
        w.alert( ['Completed by doing ', o.nrMoves, ' moves in ', formatTime(o.elapsedTime), '!'].join('') );
    };
    
})(this);
