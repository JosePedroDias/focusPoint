window.focusPoint = function(o) {

    'use strict';

    
    
    if (!o.imgUri) {
        var err = 'imgUri argument is required!';
        if (o.onError) { o.onError(err); }
        else { window.alert(err); }
        return;
    }

    
    
    var IMG_URI       = o.imgUri;
    var N             = o.nrTiles  || 20;
    var CUT_RATIO     = o.cutRatio || 0.25; // 0 < cr < 0.5
    var SHUFFLE_TIMES = N;

    
    
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

    /*var shuffleX = function(arr) {
        var a = rndInt(arr.length);
        var b = rndInt(arr.length);
        swap(arr, a, b);
    };*/

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
    
    var createTile = function(origPart, imgEl) {
        var o = origPart;
        var el = document.createElement('canvas');
        el.setAttribute('width',  origPart.d[0]);
        el.setAttribute('height', origPart.d[1]);
        var ctx = el.getContext('2d');
        //drawImage(image, sx,sy, sw,sh, dx,dy, dw,dh)
        ctx.drawImage(imgEl, o.o[0], o.o[1], o.d[0], o.d[1], 0, 0, o.d[0], o.d[1]);
        return el;
    };
    
    var repositionTile = function(el, part) {
        el.style.left   = part.o[0] + 'px';
        el.style.top    = part.o[1] + 'px';
        el.style.width  = part.d[0] + 'px';
        el.style.height = part.d[1] + 'px';
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
    
    var onReady = function(imgEl) {
        var dims = getDims(imgEl);
        var tileEls, tilesEl;
        var partsOrig, parts, order;
        var selected = [];
        var nrMoves = 0;
        
        
        
        tilesEl = document.createElement('div');
        tilesEl.className = 'tiles';
        tilesEl.style.width  = dims[0] + 'px';
        tilesEl.style.height = dims[1] + 'px';
        tilesEl.style.marginLeft = -dims[0]/2 + 'px';
        tilesEl.style.marginTop  = -dims[1]/2 + 'px';
        document.body.appendChild(tilesEl);
        
        
        
        // prepare 
        partsOrig = split(dims);
        
        order = seq(N);
        seq(SHUFFLE_TIMES).forEach(function() {
            shuffle(order);
        });
        parts = seq(N).map(function(i) {
            return clone( partsOrig[ order[i] ] );
        });
        
        
        
        // create tiles
        tileEls = new Array(N);
        seq(N).forEach(function(i) {
            var el = createTile(partsOrig[i], imgEl);
            repositionTile(el, parts[i]);
            el.setAttribute('data-index', i);
            tileEls[i] = el;
            tilesEl.appendChild(el);
        });
        
        
        var animating = false;
        tilesEl.addEventListener('click', function(ev) {
            if (animating) { return; }
            
            var el = ev.target;
            var i = parseInt(el.getAttribute('data-index'), 10);
            selected.push(i);
            el.classList.add('selected');
            
            if (selected.length === 2) {
                var a = selected[0];
                var b = selected[1];
                if (a === b) {
                    el.classList.remove('selected');
                    return selected.pop();
                }
                
                ++nrMoves;

                if (o.onNrMovesChanged) {
                    o.onNrMovesChanged(nrMoves);
                }
                
                animating = true;
                
                repositionTile(tileEls[a], parts[b]);
                repositionTile(tileEls[b], parts[a]);
                
                swap(parts, a, b);
                swap(order, a, b);
                
                if (isSorted(order)) {
                    if (o.complete) {
                        o.complete({
                            nrMoves     : nrMoves,
                            elapsedTime : getElapsedTime()
                        });
                    }
                    else {
                        alert(['Completed in ', nrMoves, ' moves and ', getElapsedTime(), ' seconds!'].join(''));
                    }
                }
                
                setTimeout(function() {
                    tileEls[a].classList.remove('selected');
                    tileEls[b].classList.remove('selected');
                    selected = [];
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
            else { window.alert(err); }
        };
        el.style.visibility = 'hidden';
        document.body.appendChild(el);
        el.src = IMG_URI;
    })();
};
