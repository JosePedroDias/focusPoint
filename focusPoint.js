var focusPoint = function(url, N, CUT_RATIO) {
  if (!N) {         N         = 20;   } // nr of tiles
  if (!CUT_RATIO) { CUT_RATIO = 0.25; } // 0 < cr < 1
  var SHUFFLE_TIMES = N;//10;
  
  var bEl = document.body;
  var cEl, cCtx;
  
  var createCanvas = function(dims) {
    var cEl = document.createElement('canvas');
    cEl.setAttribute('width',  dims[0]);
    cEl.setAttribute('height', dims[1]);
    return cEl;
  };
  
  var getDims = function(el) {
    return [
      el.offsetWidth,
      el.offsetHeight
    ];
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
  
  var maximize = function(maxSz, imgSz) {
    var arI = imgSz[0] / imgSz[1];
    var arM = maxSz[0] / maxSz[1];
    var s = (arI > arM) ? maxSz[0] / imgSz[0] : maxSz[1] / imgSz[1];
    var d =[ parseInt(imgSz[0] * s + 0.5, 10),
             parseInt(imgSz[1] * s + 0.5, 10) ];
    var p = [ ~~( (maxSz[0] - d[0]) / 2),
              ~~( (maxSz[1] - d[1]) / 2) ];
    return {d:d, p:p};
  };
  
  var wDims = getDims(bEl);
  var iDims;
  
  var onReady = function() {
    var o = maximize(wDims, iDims);
    var selected = [];
    var nrMoves = 0;
    var startTime = new Date().valueOf();
    
    cEl = createCanvas(o.d); // will hold playing area
    cEl.style.marginLeft = o.p[0] + 'px';
    cEl.style.marginTop  = o.p[1] + 'px';
    bEl.appendChild(cEl);
    cCtx = cEl.getContext('2d');
    cCtx.drawImage(iEl, 0, 0, o.d[0], o.d[1]);
    bEl.removeChild(iEl);
    
    var refEl = createCanvas(o.d); // will hold reference image
    var refCtx = refEl.getContext('2d');
    refCtx.drawImage(cEl, 0, 0, o.d[0], o.d[1]);
    
    var parts = [ {o:[0, 0], d:o.d.slice()} ];
    
    var calcArea = function(p) {
      return p.d[0] * p.d[1];
    };
    
    var areaSort = function(a, b) {
      return calcArea(a) - calcArea(b);
    };
    
    var split = function() {
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
    for (var i = 0, f = N-1; i < f; ++i) { split(); }
    
    // shuffle
    var partsOrig = clone(parts);
    var order = new Array(N);
    for (i = 0; i < N; ++i) {
      order[i] = i;
    }
    for (i = 0; i < SHUFFLE_TIMES; ++i) {
      shuffle(order);
    }
    for (i = 0; i < N; ++i) {
      parts[i] = clone( partsOrig[ order[i] ] );
    }

    var drawCell = function(i) {
      var p = parts[i];     // what is represents
      var q = partsOrig[i]; // where it is
      
      cCtx.drawImage(refEl, p.o[0], p.o[1], p.d[0], p.d[1], q.o[0], q.o[1], q.d[0], q.d[1]); // so sd do dd
    };
    
    for (i = 0; i < N; ++i) {
      drawCell(i);
    }

    var whichTileWasHit = function(pos) {
      var p;
      for (var i = 0, f = parts.length; i < f; ++i) {
        p = partsOrig[i];
        if (pos[0] >= p.o[0] &&
            pos[0] <  p.o[0] + p.d[0] &&
            pos[1] >= p.o[1] &&
            pos[1] <  p.o[1] + p.d[1]) {
          return i;
        }
      }
      return -1;
    };

    var getPointerPos = function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var pos;
      if (ev.type === 'touchstart') {
        pos = [ev.touches[0].pageX, ev.touches[0].pageY];
      }
      else {
        pos = [ev.pageX, ev.pageY];
      }
      pos[0] -= o.p[0];
      pos[1] -= o.p[1];
      return pos;
    };

    var onPointerDown = function(ev) {
      var pos = getPointerPos(ev);
      var i = whichTileWasHit(pos);
      if (i === -1) { return; }

      selected.push(i);

      if (selected.length === 2) {
        var a = selected[0];
        var b = selected[1];
        if (a === b) { return selected.pop(); }
        //console.log('selected', selected);
        
        ++nrMoves;

        swap(parts, a, b);
        swap(order, a, b);

        drawCell(a);
        drawCell(b);

        //console.log('order', order);
        if (isSorted(order)) {
          var dur = Math.round( (new Date().valueOf() - startTime) / 1000 );
          alert(['Completed in ', nrMoves, ' moves and ', dur, ' seconds!'].join(''));
        }
        selected = [];
      }
    };

    cEl.addEventListener('mousedown',  onPointerDown);
    cEl.addEventListener('touchstart', onPointerDown);
  };
  
  var iEl = new Image();
  iEl.onload = function() {
    iDims = getDims(iEl);
    onReady();
  };
  iEl.onerror = function() {
    alert('Image "' + url + '" not found or inaccessible!\n(prefix if with cors.io/ if it\'s a CORS problem)');
  };
  iEl.style.visibility = 'hidden';
  bEl.appendChild(iEl);
  iEl.src = url;
};
