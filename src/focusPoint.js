window.focusPoint = function(o) {

    'use strict';

    
    
    if (!o.imgUri) {
        var err = 'imgUri argument is required!';
        if (o.onError) { o.onError(err); }
        return;
    }

    
    
    var IMG_URI       = o.imgUri;
    var N             = o.nrTiles  || 20;
    var CUT_RATIO     = o.cutRatio || 0.25; // 0 < cr < 0.5
    var SHUFFLE_TIMES = N;
    var FILL_RATIO    = 0.9;

    
    
    var startTime = new Date().valueOf();

    var getElapsedTime = function() {
        return Math.round( (new Date().valueOf() - startTime) / 1000 );
    };

    var timer, timerFn;
    if (o.onElapsedTimeChanged) {
        timerFn = function() {
            o.onElapsedTimeChanged( getElapsedTime() );
        };
        timer = setInterval(timerFn, 500);
    }
    
    
    
    var getDims = function(el) {
        return [
            el.offsetWidth,
            el.offsetHeight
        ];
    };
    
    var seq = function(n){
        var arr = new Array(n);
        for (var i = 0; i < n; ++i) {
            arr[i] = i;
        }
        return arr;
    };
    
    var clone = function(o) {
        return JSON.parse( JSON.stringify(o) );
    };
    
    var rndInt = function(n) {
        return ~~(Math.random() * n);
    };

    var swap = function(arr, a, b) {
        if (a === b) { return; }
        var t = arr[a];
        arr[a] = arr[b];
        arr[b] = t;
    };
    
    var shuffle = function(arr) {
        var i = rndInt(arr.length);
        var f = rndInt(arr.length - 1);
        var val = arr.splice(i, 1)[0];
        arr.splice(f, 0, val);
    };

    var isSorted = function(arr) {
        for (var i = 0, f = arr.length; i < f; ++i) {
            if (arr[i] !== i) { return false; }
        }
        return true;
    };
    
    var calcArea = function(p) {
        return p.d[0] * p.d[1];
    };
    
    var areaSort = function(a, b) {
        return calcArea(a) - calcArea(b);
    };
    
    var split = function(dims) {
        var parts = [ {o:[0, 0], d:dims} ];
        
        var _split = function() {
            var p = parts.pop();
            var axis = (p.d[0] > p.d[1]) ? 0 : 1;
            var cut = Math.round(p.d[axis] / 2);
            cut += ~~( (Math.random() < 0.5 ? -1 : 1) * CUT_RATIO * cut);
            var p0, p1;
            if (axis === 0) {
                p0 = {o:p.o, d:[cut, p.d[1]]};
                p1 = {o:[p.o[0]+cut, p.o[1]], d:[p.d[0]-cut, p.d[1]]};
            }
            else {
                p0 = {o:p.o, d:[p.d[0], cut]};
                p1 = {o:[p.o[0], p.o[1]+cut], d:[p.d[0], p.d[1]-cut]};
            }
            parts.push(p0);
            parts.push(p1);
            parts.sort(areaSort);
        };
        for (var i = 0, f = N-1; i < f; ++i) { _split(); }
        
        return parts;
    };
    
    var createTile = function(origPart, imgEl) {
        var o = origPart;
        var el = document.createElement('canvas');
        el.setAttribute('width',  origPart.d[0]);
        el.setAttribute('height', origPart.d[1]);
        var ctx = el.getContext('2d');
        ctx.drawImage(imgEl, o.o[0], o.o[1], o.d[0], o.d[1], 0, 0, o.d[0], o.d[1]);
        return el;
    };
    
    var repositionTile = function(el, part) {
        el.style.left   = part.o[0] + 'px';
        el.style.top    = part.o[1] + 'px';
        el.style.width  = part.d[0] + 'px';
        el.style.height = part.d[1] + 'px';
    };
    
    var adjustSize = function(tilesEl, dims) {
        var sDims = [
            ~~(window.innerWidth  * FILL_RATIO),
            ~~(window.innerHeight * FILL_RATIO)
        ];
        var sX = sDims[0] / dims[0];
        var sY = sDims[1] / dims[1];
        var s = Math.min(sX, sY);
        tilesEl.style.transform = ['scale(', s, ', ', s, ')'].join('');
    };
    
    var onReady = function(imgEl) {
        var dims = getDims(imgEl);
        var tileEls, tilesEl;
        var partsOrig, parts, order;
        var selected = [];
        var nrMoves = 0;
        
        
        // create container
        tilesEl = document.createElement('div');
        tilesEl.className = 'tiles';
        tilesEl.style.width  = dims[0] + 'px';
        tilesEl.style.height = dims[1] + 'px';
        tilesEl.style.marginLeft = -dims[0]/2 + 'px';
        tilesEl.style.marginTop  = -dims[1]/2 + 'px';

        
        
        // prepare logic parts
        partsOrig = split(dims);
        
        order = seq(N);
        seq(SHUFFLE_TIMES).forEach(function() {
            shuffle(order);
        });
        parts = seq(N).map(function(i) {
            return clone( partsOrig[ order[i] ] );
        });
        
        
        
        // create visual tiles
        tileEls = new Array(N);
        seq(N).forEach(function(i) {
            var el = createTile(partsOrig[i], imgEl);
            repositionTile(el, parts[i]);
            el.setAttribute('data-index', i);
            tileEls[i] = el;
            tilesEl.appendChild(el);
        });
        
        
        
        document.body.appendChild(tilesEl);
        adjustSize(tilesEl, dims);
        window.addEventListener('resize', function() {
            adjustSize(tilesEl, dims);
        });
        
        
        
        var animating = false;
        tilesEl.addEventListener('click', function(ev) {
            if (animating) { return; }
            
            var el = ev.target;
            var i = parseInt(el.getAttribute('data-index'), 10);
            selected.push(i);

            if (selected.length === 1) {
                el.classList.add('selected');
            }
            else if (selected.length === 2) {
                var a = selected[0];
                var b = selected[1];
                if (a === b) {
                    tileEls[a].classList.remove('selected');
                    selected = [];
                    return;
                }

                tileEls[a].classList.remove('selected');
                tileEls[b].classList.remove('selected');
                tileEls[b].classList.add('moving');
                tileEls[b].classList.add('moving');
                
                ++nrMoves;

                if (o.onNrMovesChanged) {
                    o.onNrMovesChanged(nrMoves);
                }
                
                animating = true;

                //setTimeout(function() {
                    repositionTile(tileEls[a], parts[b]);
                    repositionTile(tileEls[b], parts[a]);

                    swap(parts, a, b);
                    swap(order, a, b);
                //}, 0);
                
                if (isSorted(order)) {
                    clearInterval(timer);
                
                    if (o.onGameCompleted) {
                        o.onGameCompleted({
                            nrMoves     : nrMoves,
                            elapsedTime : getElapsedTime()
                        });
                    }
                }
                
                setTimeout(function() {
                    selected = [];
                    tileEls[a].classList.remove('moving');
                    tileEls[b].classList.remove('moving');
                    animating = false;
                }, 500);
            }
        });
    };
    
    
    
    // fetch image to measure and serve as source for canvas tiles
    (function() {    
        var el = new Image();
        el.onload = function() {
            onReady(el);
        };
        el.onerror = function() {
            var err = 'Image "' + IMG_URI + '" not found or inaccessible!\n(prefix if with cors.io/ if it\'s a CORS problem)';
            if (o.onError) { o.onError(err); }
        };
        el.style.visibility = 'hidden';
        document.body.appendChild(el);
        el.src = IMG_URI;
    })();
};
