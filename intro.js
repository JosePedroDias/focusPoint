(function(w) {
      
    'use strict';


    var QS = function(s) {
        return document.querySelector(s);
    };



    var imgUri, nrTiles, cutRatio;



    var introEl = document.createElement('div');
    introEl.className = 'intro';
    introEl.innerHTML = [
        '<button>config</button>',
        '<div class="content hidden">',
            '<label>image:</label><input type="text" class="img-uri" value=""><br/>',
            '<label>difficulty:</label><select class="difficulty">',
                '<option value="1">easy</option>',
                '<option value="2">medium</option>',
                '<option value="3">hard</option>',
            '</select>',
        '</div>'
    ].join('');
    document.body.appendChild(introEl);

    var buttonEl     = QS('.intro button');
    var contentEl    = QS('.intro .content');
    var imgUriEl     = QS('.intro .img-uri');
    var difficultyEl = QS('.intro .difficulty');

    buttonEl.addEventListener('click', function() {
        contentEl.classList.toggle('hidden');
    });

    imgUriEl.addEventListener('change', function() {
        var v = imgUriEl.value;
        var h = location.hash.substring(1).split(' ');
        h[0] = v;
        toHash( h.join(' ') ); onHashChange();
    });

    difficultyEl.addEventListener('change', function() {
        var v = parseInt(difficultyEl.value, 10);
        var a, b;
        switch (v) {
            case 1: a = 20; b = 0.25; break;
            case 2: a = 40; b = 0.33; break;
            case 3: a = 80; b = 0.4;  break;
            default: return;
        }
        var h = location.hash.substring(1).split(' ');
        h[1] = a;
        h[2] = b;
        toHash( h.join(' ') ); onHashChange();
    });

    

    var toHash = function(h) {
        localStorage.setItem('focusPoint', h);
        location.hash = h;
    };

    var onHashChange = function(ev) {
        if (ev) {
            ev.preventDefault();
        }

        var h = location.hash;
        if (!h) {
            h = localStorage.getItem('focusPoint');
            if (!h) {
                // the original image used above can be found here: http://fotos.sapo.pt/rgomes/fotos/?uid=S9PHTzBpba2g5631t5od
                h = 'http://c9.quickcachr.fotos.sapo.pt/i/u8f02c6c6/1833_0008psh2.jpg 20 0.25';
            }
        }
        else {
            h = h.substring(1);
        }
        h = h.split(' ');
        
        imgUri   = h[0];
        nrTiles  = parseInt(h[1], 10);
        cutRatio = parseFloat(h[2]);
        if (isNaN(nrTiles)) {  nrTiles  = 20;   }
        if (isNaN(cutRatio)) { cutRatio = 0.25; }

        imgUriEl.value = imgUri;
        difficultyEl.value = (nrTiles === 20) ? 1 : (nrTiles === 40) ? 2 : 3;

        //toHash( h.join(' ') );

        if (ev) {
            location.reload(true);
        }
        
        window.focusPoint({
            imgUri:               imgUri,
            nrTiles:              nrTiles,
            cutRatio:             cutRatio,

            onElapsedTimeChanged: window.updateElapsedTime,
            onNrMovesChanged:     window.updateNrMoves,
            onError:              function(err) { window.alert(err); },
            onTilesCreated:       window.tilesCreated,
            onGameCompleted:      window.gameCompleted
        });
    };
    
    

    w.addEventListener('hashchange', onHashChange);
    
    onHashChange();
    
})(this);
