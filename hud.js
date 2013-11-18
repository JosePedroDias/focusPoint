(function(window, undefined) {
    
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

        var m = ~~(s / 60);
        s -= m * 60;

        var h = ~~(m / 60);
        m -= h * 60;

        var parts = [pad02(s, m || h)];
        if (m) { parts.unshift( pad02(m, h) ); }
        if (h) { parts.unshift( h  ); }

        return parts.join(':');
    };

    var elapsedTimeEl = QS('.hud .elapsed-time');
    var nrMovesEl     = QS('.hud .nr-moves');

    window.updateElapsedTime = function(t) {
        elapsedTimeEl.innerHTML = formatTime(t);
    };

    window.updateNrMoves = function(n) {
        nrMovesEl.innerHTML = '' + n;
    };

    window.tilesCreated = function(o) { // o(offset), d(dims), tiles(arr of tiles with o and d)
        var hintsEl = document.createElement('div');
        hintsEl.className = 'hints';
        var s = hintsEl.style;
        s.left   = o.o[0] + 'px';
        s.top    = o.o[1] + 'px';
        s.width  = o.d[0] + 'px';
        s.height = o.d[1] + 'px';

        var p, el;
        for (var i = 0, f = o.tiles.length; i < f; ++i) {
            p = o.tiles[i];
            el = document.createElement('div');
            s = el.style;
            s.left   = p.o[0] + 'px';
            s.top    = p.o[1] + 'px';
            s.width  = p.d[0] + 'px';
            s.height = p.d[1] + 'px';
            hintsEl.appendChild(el);
        }

        var canvasEl = QS('canvas');
        document.body.insertBefore(hintsEl, canvasEl);
        return hintsEl;
    };

    window.gameCompleted = function(o) {
        alert( ['Completed by doing ', o.nrMoves, ' moves in ', formatTime(o.elapsedTime), '!'].join('') );
    };
    
})(window);