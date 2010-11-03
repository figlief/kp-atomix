xLibrary={version:'4.21',license:'GNU LGPL',url:'http://cross-browser.com/'};

// xHttpRequest r10, Copyright 2006-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xHttpRequest() // object prototype
{
  // Private Properties
  var
    _i = this, // instance object
    _r = null, // XMLHttpRequest object
    _t = null, // timer
    _f = null, // callback function
    _x = false, // XML response pending
    _o = null, // user data object passed to _f
    _c = false; // self-clean after send() completed?
  // Public Properties
  _i.OK = 0;
  _i.NOXMLOBJ = 1;
  _i.REQERR = 2;
  _i.TIMEOUT = 4;
  _i.RSPERR = 8;
  _i.NOXMLCT = 16;
  _i.ABORTED = 32;
  _i.status = _i.OK;
  _i.error = null;
  _i.busy = false;
  // Private Methods
  function _clean()
  {
    _i = null;
    _r = null;
    _t = null;
    _f = null;
    _x = false;
    _o = null;
    _c = false;
  }
  function _clrTimer()
  {
    if (_t) {
      clearTimeout(_t);
    }
    _t = null;
  }
  function _endCall()
  {
    if (_f) {
      _f(_r, _i.status, _o);
    }
    _f = null; _x = false; _o = null;
    _i.busy = false;
    if (_c) {
      _clean();
    }
  }
  function _abort(s)
  {
    _clrTimer();
    try {
      _r.onreadystatechange = function(){};
      _r.abort();
    }
    catch (e) {
      _i.status |= _i.RSPERR;
      _i.error = e;
    }
    _i.status |= s;
    _endCall();
  }
  function _newXHR()
  {
    try { _r = new XMLHttpRequest(); }
    catch (e) { try { _r = new ActiveXObject('Msxml2.XMLHTTP'); }
    catch (e) { try { _r = new ActiveXObject('Microsoft.XMLHTTP'); }
    catch (e) { _r = null; _i.error = e; }}}
    if (!_r) { _i.status |= _i.NOXMLOBJ; }
  }
  // Private Event Listeners
  function _oc() // onReadyStateChange
  {
    var ct;
    if (_r.readyState == 4) {
      _clrTimer();
      try {
        if (_r.status != 200) _i.status |= _i.RSPERR;
        if (_x) {
          ct = _r.getResponseHeader('Content-Type');
          if (ct && ct.indexOf('xml') == -1) { _i.status |= _i.NOXMLCT; }
        }
        delete _r['onreadystatechange']; // _r.onreadystatechange = null;
      }
      catch (e) {
        _i.status |= _i.RSPERR;
        _i.error = e;
      }
      _endCall();
    }
  }
  function _ot() // onTimeout
  {
    _t = null;
    _abort(_i.TIMEOUT);
  }
  // Public Methods
  this.send = function(m, u, d, t, r, x, o, f, c)
  {
    if (!_r || _i.busy) { return false; }
    _c = (c ? true : false);
    m = m.toUpperCase();
    if (m != 'POST') {
      if (d) {
        d = '?' + d;
        if (r) { d += '&' + r + '=' + Math.round(10000*Math.random()); }
      }
      else { d = ''; }
    }
    _x = (x ? true : false);
    _o = o;
    _f = f;
    _i.busy = true;
    _i.status = _i.OK;
    _i.error = null;
    if (t) { _t = setTimeout(_ot, t); }
    try {
      if (m == 'GET') {
        _r.open(m, u + d, true);
        d = null;
        _r.setRequestHeader('Cache-Control', 'no-cache');
        var ct = 'text/' + (_x ? 'xml':'plain');
        if (_r.overrideMimeType) {_r.overrideMimeType(ct);}
        _r.setRequestHeader('Content-Type', ct);
      }
      else if (m == 'POST') {
        _r.open(m, u, true);
        _r.setRequestHeader('Method', 'POST ' + u + ' HTTP/1.1');
        _r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      else {
        _r.open(m, u + d, true);
        d = null;
      }
      _r.onreadystatechange = _oc;
      _r.send(d);
    }
    catch(e) {
      _clrTimer();
      _f = null; _x = false; _o = null;
      _i.busy = false;
      _i.status |= _i.REQERR;
      _i.error = e;
      if (_c) {
        _clean();
      }
      return false;
    }
    return true;
  };
  this.abort = function()
  {
    if (!_r || !_i.busy) { return false; }
    _abort(_i.ABORTED);
    return true;
  };
  this.reinit = function()
  {
    // Halt any HTTP request that may be in progress.
    this.abort();
    // Set all private vars to initial state.
    _clean();
    _i = this;
    // Set all (non-constant) public properties to initial state.
    _i.status = _i.OK;
    _i.error = null;
    _i.busy = false;
    // Create the private XMLHttpRequest object.
    _newXHR();
    return true;
  };
  // Constructor Code
  _newXHR();
}

// xPreventDefault r1, Copyright 2004-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xPreventDefault(e)
{
  if (e && e.preventDefault) e.preventDefault();
  else if (window.event) window.event.returnValue = false;
}

// xMoveTo r1, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xMoveTo(e,x,y)
{
  xLeft(e,x);
  xTop(e,y);
}

// xLeft r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xLeft(e, iX)
{
  if(!(e=xGetElementById(e))) return 0;
  var css=xDef(e.style);
  if (css && xStr(e.style.left)) {
    if(xNum(iX)) e.style.left=iX+'px';
    else {
      iX=parseInt(e.style.left);
      if(isNaN(iX)) iX=xGetComputedStyle(e,'left',1);
      if(isNaN(iX)) iX=0;
    }
  }
  else if(css && xDef(e.style.pixelLeft)) {
    if(xNum(iX)) e.style.pixelLeft=iX;
    else iX=e.style.pixelLeft;
  }
  return iX;
}

// xOffset r1, Copyright 2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xOffset(c, p)
{
  var o = {x:0, y:0};
  c = xGetElementById(c);
  p = xGetElementById(p);
  while (c && c != p) {
    o.x += c.offsetLeft;
    o.y += c.offsetTop;
    c = c.offsetParent;
  }
  return o;
}

// xAniLine r1, Copyright 2006-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xAniLine(e, x, y, t, a, oe)
{
  if (!(e=xGetElementById(e))) return;
  var x0 = xLeft(e), y0 = xTop(e); // start positions
  x = Math.round(x); y = Math.round(y);
  var dx = x - x0, dy = y - y0; // displacements
  var fq = 1 / t; // frequency
  if (a) fq *= (Math.PI / 2);
  var t0 = new Date().getTime(); // start time
  var tmr = setInterval(
    function() {
      var et = new Date().getTime() - t0; // elapsed time
      if (et < t) {
        var f = et * fq; // constant velocity
        if (a == 1) f = Math.sin(f); // sine acceleration
        else if (a == 2) f = 1 - Math.cos(f); // cosine acceleration
        f = Math.abs(f);
        e.style.left = Math.round(f * dx + x0) + 'px'; // instantaneous positions
        e.style.top = Math.round(f * dy + y0) + 'px';
      }
      else {
        clearInterval(tmr);
        e.style.left = x + 'px'; // target positions
        e.style.top = y + 'px';
        if (typeof oe == 'function') oe(); // 'onEnd' handler
        else if (typeof oe == 'string') eval(oe);
      }
    }, 10 // timer resolution
  );
}

// xEvent r11, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xEvent(evt) // object prototype
{
  var e = evt || window.event;
  if (!e) return;
  this.type = e.type;
  this.target = e.target || e.srcElement;
  this.relatedTarget = e.relatedTarget;
  /*@cc_on if (e.type == 'mouseover') this.relatedTarget = e.fromElement;
  else if (e.type == 'mouseout') this.relatedTarget = e.toElement; @*/
  if (xDef(e.pageX)) { this.pageX = e.pageX; this.pageY = e.pageY; }
  else if (xDef(e.clientX)) { this.pageX = e.clientX + xScrollLeft(); this.pageY = e.clientY + xScrollTop(); }
  if (xDef(e.offsetX)) { this.offsetX = e.offsetX; this.offsetY = e.offsetY; }
  else if (xDef(e.layerX)) { this.offsetX = e.layerX; this.offsetY = e.layerY; }
  else { this.offsetX = this.pageX - xPageX(this.target); this.offsetY = this.pageY - xPageY(this.target); }
  this.keyCode = e.keyCode || e.which || 0;
  this.shiftKey = e.shiftKey; this.ctrlKey = e.ctrlKey; this.altKey = e.altKey;
  if (typeof e.type == 'string') {
    if (e.type.indexOf('click') != -1) {this.button = 0;}
    else if (e.type.indexOf('mouse') != -1) {
      this.button = e.button;
      /*@cc_on if (e.button & 1) this.button = 0;
      else if (e.button & 4) this.button = 1;
      else if (e.button & 2) this.button = 2; @*/
    }
  }
}

// xEnableDrag r8, Copyright 2002-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xEnableDrag(id,fS,fD,fE)
{
  var mx = 0, my = 0, el = xGetElementById(id);
  if (el) {
    el.xDragEnabled = true;
    xAddEventListener(el, 'mousedown', dragStart, false);
  }
  // Private Functions
  function dragStart(e)
  {
    if (el.xDragEnabled) {
      var ev = new xEvent(e);
      xPreventDefault(e);
      mx = ev.pageX;
      my = ev.pageY;
      xAddEventListener(document, 'mousemove', drag, false);
      xAddEventListener(document, 'mouseup', dragEnd, false);
      if (fS) {
        fS(el, ev.pageX, ev.pageY, ev);
      }
    }
  }
  function drag(e)
  {
    var ev, dx, dy;
    xPreventDefault(e);
    ev = new xEvent(e);
    dx = ev.pageX - mx;
    dy = ev.pageY - my;
    mx = ev.pageX;
    my = ev.pageY;
    if (fD) {
      fD(el, dx, dy, ev);
    }
    else {
      xMoveTo(el, xLeft(el) + dx, xTop(el) + dy);
    }
  }
  function dragEnd(e)
  {
    var ev = new xEvent(e);
    xPreventDefault(e);
    xRemoveEventListener(document, 'mouseup', dragEnd, false);
    xRemoveEventListener(document, 'mousemove', drag, false);
    if (fE) {
      fE(el, ev.pageX, ev.pageY, ev);
    }
    if (xEnableDrag.drop) {
      xEnableDrag.drop(el, ev);
    }
  }
}

xEnableDrag.drops = []; // static property

// xResizeTo r2, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xResizeTo(e, w, h)
{
  return {
    w: xWidth(e, w),
    h: xHeight(e, h)
  };
}

// xHeight r7, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xHeight(e,h)
{
  var css, pt=0, pb=0, bt=0, bb=0, gcs;
  if(!(e=xGetElementById(e))) return 0;
  if (xNum(h)) {
    if (h<0) h = 0;
    else h=Math.round(h);
  }
  else h=-1;
  css=xDef(e.style);
  if (e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    h = xClientHeight();
  }
  else if(css && xDef(e.offsetHeight) && xStr(e.style.height)) {
    if(h>=0) {
      if (document.compatMode=='CSS1Compat') {
        gcs = xGetComputedStyle;
        pt=gcs(e,'padding-top',1);
        if (pt !== null) {
          pb=gcs(e,'padding-bottom',1);
          bt=gcs(e,'border-top-width',1);
          bb=gcs(e,'border-bottom-width',1);
        }
        // Should we try this as a last resort?
        // At this point getComputedStyle and currentStyle do not exist.
        else if(xDef(e.offsetHeight,e.style.height)){
          e.style.height=h+'px';
          pt=e.offsetHeight-h;
        }
      }
      h-=(pt+pb+bt+bb);
      if(isNaN(h)||h<0) return;
      else e.style.height=h+'px';
    }
    h=e.offsetHeight;
  }
  else if(css && xDef(e.style.pixelHeight)) {
    if(h>=0) e.style.pixelHeight=h;
    h=e.style.pixelHeight;
  }
  return h;
}

// xDef r1, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xDef()
{
  for(var i=0; i<arguments.length; ++i){if(typeof(arguments[i])=='undefined') return false;}
  return true;
}

// xTop r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xTop(e, iY)
{
  if(!(e=xGetElementById(e))) return 0;
  var css=xDef(e.style);
  if(css && xStr(e.style.top)) {
    if(xNum(iY)) e.style.top=iY+'px';
    else {
      iY=parseInt(e.style.top);
      if(isNaN(iY)) iY=xGetComputedStyle(e,'top',1);
      if(isNaN(iY)) iY=0;
    }
  }
  else if(css && xDef(e.style.pixelTop)) {
    if(xNum(iY)) e.style.pixelTop=iY;
    else iY=e.style.pixelTop;
  }
  return iY;
}

// xRemoveClass r3, Copyright 2005-2007 Daniel Frechette - modified by Mike Foster
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xRemoveClass(e, c)
{
  if(!(e=xGetElementById(e))) return false;
  e.className = e.className.replace(new RegExp("(^|\\s)"+c+"(\\s|$)",'g'),
    function(str, p1, p2) { return (p1 == ' ' && p2 == ' ') ? ' ' : ''; }
  );
  return true;
}

// xStopPropagation r1, Copyright 2004-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xStopPropagation(evt)
{
  if (evt && evt.stopPropagation) evt.stopPropagation();
  else if (window.event) window.event.cancelBubble = true;
}

// xWidth r7, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xWidth(e,w)
{
  var css, pl=0, pr=0, bl=0, br=0, gcs;
  if(!(e=xGetElementById(e))) return 0;
  if (xNum(w)) {
    if (w<0) w = 0;
    else w=Math.round(w);
  }
  else w=-1;
  css=xDef(e.style);
  if (e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    w = xClientWidth();
  }
  else if(css && xDef(e.offsetWidth) && xStr(e.style.width)) {
    if(w>=0) {
      if (document.compatMode=='CSS1Compat') {
        gcs = xGetComputedStyle;
        pl=gcs(e,'padding-left',1);
        if (pl !== null) {
          pr=gcs(e,'padding-right',1);
          bl=gcs(e,'border-left-width',1);
          br=gcs(e,'border-right-width',1);
        }
        // Should we try this as a last resort?
        // At this point getComputedStyle and currentStyle do not exist.
        else if(xDef(e.offsetWidth,e.style.width)){
          e.style.width=w+'px';
          pl=e.offsetWidth-w;
        }
      }
      w-=(pl+pr+bl+br);
      if(isNaN(w)||w<0) return;
      else e.style.width=w+'px';
    }
    w=e.offsetWidth;
  }
  else if(css && xDef(e.style.pixelWidth)) {
    if(w>=0) e.style.pixelWidth=w;
    w=e.style.pixelWidth;
  }
  return w;
}

// xObject r1, Copyright  Douglas Crockford (www.crockford.com)
function xObject(o) {
	function F() {}
	F.prototype = o;
	return new F();
}

// xModalDialog r1, Copyright 2010 http://github.com/bobledger/XLib
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
// Modified by xbob

function xxModalDialog(sId, baseClass) {

	var self = xObject(baseClass || xxModalDialogClass);

	xxModalDialog.instances[sId] = self;

	self.get = self.get || function (s) {
		return xGetElementById(sId + (s ? '-' + s : ''));
	};

	self.addBaseCss();

	return self;
}

xxModalDialogClass = {

	addBaseCss: function (c) {
		xAddClass(this.get(), c || 'xxModalDialog');
	},

	show: function () {
		this.zIndex(xShield.grab() + 1);
		return this.center();
	},

	hide: function () {
		var dialog = this.get();
		if (dialog) {
			xMoveTo(dialog, -xWidth(dialog), 0);
		}
		xShield.release();
	},

	center: function () {
		var dialog = this.get();
		dialog.style.height = 'auto';
		xCenter(dialog);
		return this;
	},

	zIndex: function (z) {
		xZIndex(this.get(), z);
	}

};
// Static Properties
xxModalDialog.instances = {};

// xAddClass r3, Copyright 2005-2007 Daniel Frechette - modified by Mike Foster
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xAddClass(e, c)
{
  if ((e=xGetElementById(e))!=null) {
    var s = '';
    if (e.className.length && e.className.charAt(e.className.length - 1) != ' ') {
      s = ' ';
    }
    if (!xHasClass(e, c)) {
      e.className += s + c;
      return true;
    }
  }
  return false;
}

// xAddEventListener r8, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xAddEventListener(e,eT,eL,cap)
{
  if(!(e=xGetElementById(e)))return;
  eT=eT.toLowerCase();
  if(e.addEventListener)e.addEventListener(eT,eL,cap||false);
  else if(e.attachEvent)e.attachEvent('on'+eT,eL);
  else {
    var o=e['on'+eT];
    e['on'+eT]=typeof o=='function' ? function(v){o(v);eL(v);} : eL;
  }
}

// xGetElementById r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xGetElementById(e)
{
  if (typeof(e) == 'string') {
    if (document.getElementById) e = document.getElementById(e);
    else if (document.all) e = document.all[e];
    else e = null;
  }
  return e;
}

// xScrollLeft r4, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xScrollLeft(e, bWin)
{
  var w, offset=0;
  if (!xDef(e) || bWin || e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    w = window;
    if (bWin && e) w = e;
    if(w.document.documentElement && w.document.documentElement.scrollLeft) offset=w.document.documentElement.scrollLeft;
    else if(w.document.body && xDef(w.document.body.scrollLeft)) offset=w.document.body.scrollLeft;
  }
  else {
    e = xGetElementById(e);
    if (e && xNum(e.scrollLeft)) offset = e.scrollLeft;
  }
  return offset;
}

// xTop r1, copyright 2010 http://github.com/bobledger/XLib
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xZIndex(e, z)
{
  if (!(
    (e = xGetElementById(e)) &&
    xDef(e.style, e.style.zIndex)
  )) {
    return 0;
  }
  if (xDef(z) && xNum(z)) {
      e.style.zIndex = z;
  }
  z = xGetComputedStyle(e, 'zIndex', 1);
  return isNaN(z) ? 0 : z;
}

// xRemoveEventListener r6, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xRemoveEventListener(e,eT,eL,cap)
{
  if(!(e=xGetElementById(e)))return;
  eT=eT.toLowerCase();
  if(e.removeEventListener)e.removeEventListener(eT,eL,cap||false);
  else if(e.detachEvent)e.detachEvent('on'+eT,eL);
  else e['on'+eT]=null;
}

// xHasClass r3, Copyright 2005-2007 Daniel Frechette - modified by Mike Foster
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xHasClass(e, c)
{
  e = xGetElementById(e);
  if (!e || e.className=='') return false;
  var re = new RegExp("(^|\\s)"+c+"(\\s|$)");
  return re.test(e.className);
}

// xCenter r1, Copyright 2009 Arthur Blake (http://arthur.blake.name)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
/**
 * Center a positioned element within the current client window space.
 * 
 * If w,h not specified, then the existing width and height of e are used.
 * 
 * @param e an existing absolutely positioned dom element (or an id to such an element)
 * @param w (optional) width to resize element to
 * @param h (optional) height  to resize element to
 */
function xCenter(e, w, h)
{
  var ww=xClientWidth(),wh=xClientHeight(),x=0,y=0;
  e = xGetElementById(e);
  if (e)
  {
    w = w || xWidth(e);
    h = h || xHeight(e);

    if (ww < w)
    {
      w = ww;
    }
    else
    {
      x = (ww - w) / 2;
    }
    if (wh < h)
    {
      h = wh;
    }
    else
    {
      y = (wh - h) / 2;
    }

    // adjust for any scrolling
    x += xScrollLeft();
    y += xScrollTop();
    
    xResizeTo(e, w, h);
    xMoveTo(e, x, y);
  }
}

// xClientHeight r6, Copyright 2001-2008 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xClientHeight()
{
  var v=0,d=document,w=window;
  if((!d.compatMode || d.compatMode == 'CSS1Compat') /* && !w.opera */ && d.documentElement && d.documentElement.clientHeight)
    {v=d.documentElement.clientHeight;}
  else if(d.body && d.body.clientHeight)
    {v=d.body.clientHeight;}
  else if(xDef(w.innerWidth,w.innerHeight,d.width)) {
    v=w.innerHeight;
    if(d.width>w.innerWidth) v-=16;
  }
  return v;
}

// xShield r1, Copyright 2010 http://github.com/bobledger/XLib
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL

function xShieldFactory(baseClass)  {

	var self = xObject(baseClass || xShieldClass)
	  , shield = null
	;

	self.shield = function () {
		shield = shield || self.create();
		return shield;
	};

	self.zList = [0];
	return self;

}

xShieldClass = {

	zMin: 10000,
	zIncr: 100,

	create: function () {
		var shield = document.createElement('div');
		shield.className = 'xShieldElement';
		document.body.appendChild(shield);
		return shield;
	},

	show: function (z) {
		var e = this.shield()
		  , ds = xDocSize()
		;
		this.zIndex(z);
		xMoveTo(e, 0, 0);
		xResizeTo(e,
			Math.max(ds.w, xClientWidth()),
			Math.max(ds.h, xClientHeight())
		)
	},

	hide: function () {
		var e = this.shield();
		xResizeTo(e, 10, 10);
		xMoveTo(e, -10, -10);
	},

	zNext: function (z) {
		return Math.max(this.zMin, z || 0, this.zList[0]) + this.zIncr;
	},

	zIndex: function (z) {
		return xZIndex(this.shield(), z);
	},

	grab: function (z) {
		z = this.zNext(z);
		this.zList.unshift(z);
		this.show(z);
		return z;
	},

	release: function () {

		var lst = this.zList;

		switch (lst.length) {
			case 0:
			case 1:
				break;
			default:
				this.show(lst.shift());
		}
		if (lst.length < 2) {
			this.hide();
		}
		return lst.length - 1;
	}
};

xShield = xShieldFactory();
// xPageX r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xPageX(e)
{
  var x = 0;
  e = xGetElementById(e);
  while (e) {
    if (xDef(e.offsetLeft)) x += e.offsetLeft;
    e = xDef(e.offsetParent) ? e.offsetParent : null;
  }
  return x;
}

// xClientWidth r5, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xClientWidth()
{
  var v=0,d=document,w=window;
  if((!d.compatMode || d.compatMode == 'CSS1Compat') && !w.opera && d.documentElement && d.documentElement.clientWidth)
    {v=d.documentElement.clientWidth;}
  else if(d.body && d.body.clientWidth)
    {v=d.body.clientWidth;}
  else if(xDef(w.innerWidth,w.innerHeight,d.height)) {
    v=w.innerWidth;
    if(d.height>w.innerHeight) v-=16;
  }
  return v;
}

// xGetComputedStyle r7, Copyright 2002-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xGetComputedStyle(e, p, i)
{
  if(!(e=xGetElementById(e))) return null;
  var s, v = 'undefined', dv = document.defaultView;
  if(dv && dv.getComputedStyle){
    s = dv.getComputedStyle(e,'');
    if (s) v = s.getPropertyValue(p);
  }
  else if(e.currentStyle) {
    v = e.currentStyle[xCamelize(p)];
  }
  else return null;
  return i ? (parseInt(v) || 0) : v;
}


// xPageY r4, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xPageY(e)
{
  var y = 0;
  e = xGetElementById(e);
  while (e) {
    if (xDef(e.offsetTop)) y += e.offsetTop;
    e = xDef(e.offsetParent) ? e.offsetParent : null;
  }
  return y;
}

// xScrollTop r4, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xScrollTop(e, bWin)
{
  var w, offset=0;
  if (!xDef(e) || bWin || e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    w = window;
    if (bWin && e) w = e;
    if(w.document.documentElement && w.document.documentElement.scrollTop) offset=w.document.documentElement.scrollTop;
    else if(w.document.body && xDef(w.document.body.scrollTop)) offset=w.document.body.scrollTop;
  }
  else {
    e = xGetElementById(e);
    if (e && xNum(e.scrollTop)) offset = e.scrollTop;
  }
  return offset;
}

// xStr r1, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xStr(s)
{
  for(var i=0; i<arguments.length; ++i){if(typeof(arguments[i])!='string') return false;}
  return true;
}

// xNum r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xNum()
{
  for(var i=0; i<arguments.length; ++i){if(isNaN(arguments[i]) || typeof(arguments[i])!='number') return false;}
  return true;
}

// xDocSize r1, Copyright 2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xDocSize()
{
  var b=document.body, e=document.documentElement;
  var esw=0, eow=0, bsw=0, bow=0, esh=0, eoh=0, bsh=0, boh=0;
  if (e) {
    esw = e.scrollWidth;
    eow = e.offsetWidth;
    esh = e.scrollHeight;
    eoh = e.offsetHeight;
  }
  if (b) {
    bsw = b.scrollWidth;
    bow = b.offsetWidth;
    bsh = b.scrollHeight;
    boh = b.offsetHeight;
  }
//  alert('compatMode: ' + document.compatMode + '\n\ndocumentElement.scrollHeight: ' + esh + '\ndocumentElement.offsetHeight: ' + eoh + '\nbody.scrollHeight: ' + bsh + '\nbody.offsetHeight: ' + boh + '\n\ndocumentElement.scrollWidth: ' + esw + '\ndocumentElement.offsetWidth: ' + eow + '\nbody.scrollWidth: ' + bsw + '\nbody.offsetWidth: ' + bow);
  return {w:Math.max(esw,eow,bsw,bow),h:Math.max(esh,eoh,bsh,boh)};
}

// xCamelize r1, Copyright 2007-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xCamelize(cssPropStr)
{
  var i, c, a, s;
  a = cssPropStr.split('-');
  s = a[0];
  for (i=1; i<a.length; ++i) {
    c = a[i].charAt(0);
    s += a[i].replace(c, c.toUpperCase());
  }
  return s;
}
