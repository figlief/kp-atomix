/* Built from X 4.21 by XAG 1.0. 01Mar10 13:31 UT */
xLibrary={version:"4.21",license:"GNU LGPL",url:"http://cross-browser.com/"};function xModalDialog(sDialogId){
/*@cc_on @if (@_jscript_version >= 5.5) @*/
this.dialog=xGetElementById(sDialogId);xModalDialog.instances[sDialogId]=this;var e=xModalDialog.grey;if(!e){e=document.createElement("div");e.className="xModalDialogGreyElement";xModalDialog.grey=document.body.appendChild(e);
/*@end @*/
}}xModalDialog.prototype.show=function(){var a,b=xModalDialog.grey;if(b){this.dialog.greyZIndex=xGetComputedStyle(b,"z-index",1);b.style.zIndex=xGetComputedStyle(this.dialog,"z-index",1)-1;a=xDocSize();xMoveTo(b,0,0);xResizeTo(b,a.w,a.h);if(this.dialog){xMoveTo(this.dialog,xScrollLeft()+(xClientWidth()-this.dialog.offsetWidth)/2,xScrollTop()+(xClientHeight()-this.dialog.offsetHeight)/2)}}};xModalDialog.prototype.hide=function(a){var b=xModalDialog.grey;if(b){if(!a){xResizeTo(b,10,10);xMoveTo(b,-10,-10)}if(this.dialog){b.style.zIndex=this.dialog.greyZIndex;xMoveTo(this.dialog,-this.dialog.offsetWidth,0)}}};xModalDialog.grey=null;xModalDialog.instances={};function xAddClass(b,d){if((b=xGetElementById(b))!=null){var a="";if(b.className.length&&b.className.charAt(b.className.length-1)!=" "){a=" "}if(!xHasClass(b,d)){b.className+=a+d;return true}}return false}function xAddEventListener(d,c,b,a){if(!(d=xGetElementById(d))){return}c=c.toLowerCase();if(d.addEventListener){d.addEventListener(c,b,a||false)}else{if(d.attachEvent){d.attachEvent("on"+c,b)}else{var f=d["on"+c];d["on"+c]=typeof f=="function"?function(e){f(e);b(e)}:b}}}function xAniLine(e,x,y,t,a,oe){if(!(e=xGetElementById(e))){return}var x0=xLeft(e),y0=xTop(e);x=Math.round(x);y=Math.round(y);var dx=x-x0,dy=y-y0;var fq=1/t;if(a){fq*=(Math.PI/2)}var t0=new Date().getTime();var tmr=setInterval(function(){var et=new Date().getTime()-t0;if(et<t){var f=et*fq;if(a==1){f=Math.sin(f)}else{if(a==2){f=1-Math.cos(f)}}f=Math.abs(f);e.style.left=Math.round(f*dx+x0)+"px";e.style.top=Math.round(f*dy+y0)+"px"}else{clearInterval(tmr);e.style.left=x+"px";e.style.top=y+"px";if(typeof oe=="function"){oe()}else{if(typeof oe=="string"){eval(oe)}}}},10)}function xCamelize(d){var e,g,b,f;b=d.split("-");f=b[0];for(e=1;e<b.length;++e){g=b[e].charAt(0);f+=b[e].replace(g,g.toUpperCase())}return f}function xClientHeight(){var b=0,c=document,a=window;if((!c.compatMode||c.compatMode=="CSS1Compat")&&c.documentElement&&c.documentElement.clientHeight){b=c.documentElement.clientHeight}else{if(c.body&&c.body.clientHeight){b=c.body.clientHeight}else{if(xDef(a.innerWidth,a.innerHeight,c.width)){b=a.innerHeight;if(c.width>a.innerWidth){b-=16}}}}return b}function xClientWidth(){var b=0,c=document,a=window;if((!c.compatMode||c.compatMode=="CSS1Compat")&&!a.opera&&c.documentElement&&c.documentElement.clientWidth){b=c.documentElement.clientWidth}else{if(c.body&&c.body.clientWidth){b=c.body.clientWidth}else{if(xDef(a.innerWidth,a.innerHeight,c.height)){b=a.innerWidth;if(c.height>a.innerHeight){b-=16}}}}return b}function xDef(){for(var a=0;a<arguments.length;++a){if(typeof(arguments[a])=="undefined"){return false}}return true}function xDocSize(){var i=document.body,h=document.documentElement;var k=0,d=0,a=0,g=0,f=0,l=0,j=0,c=0;if(h){k=h.scrollWidth;d=h.offsetWidth;f=h.scrollHeight;l=h.offsetHeight}if(i){a=i.scrollWidth;g=i.offsetWidth;j=i.scrollHeight;c=i.offsetHeight}return{w:Math.max(k,d,a,g),h:Math.max(f,l,j,c)}}function xGetComputedStyle(g,f,c){if(!(g=xGetElementById(g))){return null}var d,a="undefined",b=document.defaultView;if(b&&b.getComputedStyle){d=b.getComputedStyle(g,"");if(d){a=d.getPropertyValue(f)}}else{if(g.currentStyle){a=g.currentStyle[xCamelize(f)]}else{return null}}return c?(parseInt(a)||0):a}function xGetElementById(a){if(typeof(a)=="string"){if(document.getElementById){a=document.getElementById(a)}else{if(document.all){a=document.all[a]}else{a=null}}}return a}function xHasClass(b,d){b=xGetElementById(b);if(!b||b.className==""){return false}var a=new RegExp("(^|\\s)"+d+"(\\s|$)");return a.test(b.className)}function xHeight(i,f){var d,g=0,c=0,b=0,j=0,a;if(!(i=xGetElementById(i))){return 0}if(xNum(f)){if(f<0){f=0}else{f=Math.round(f)}}else{f=-1}d=xDef(i.style);if(i==document||i.tagName.toLowerCase()=="html"||i.tagName.toLowerCase()=="body"){f=xClientHeight()}else{if(d&&xDef(i.offsetHeight)&&xStr(i.style.height)){if(f>=0){if(document.compatMode=="CSS1Compat"){a=xGetComputedStyle;g=a(i,"padding-top",1);if(g!==null){c=a(i,"padding-bottom",1);b=a(i,"border-top-width",1);j=a(i,"border-bottom-width",1)}else{if(xDef(i.offsetHeight,i.style.height)){i.style.height=f+"px";g=i.offsetHeight-f}}}f-=(g+c+b+j);if(isNaN(f)||f<0){return}else{i.style.height=f+"px"}}f=i.offsetHeight}else{if(d&&xDef(i.style.pixelHeight)){if(f>=0){i.style.pixelHeight=f}f=i.style.pixelHeight}}}return f}function xLeft(c,a){if(!(c=xGetElementById(c))){return 0}var b=xDef(c.style);if(b&&xStr(c.style.left)){if(xNum(a)){c.style.left=a+"px"}else{a=parseInt(c.style.left);if(isNaN(a)){a=xGetComputedStyle(c,"left",1)}if(isNaN(a)){a=0}}}else{if(b&&xDef(c.style.pixelLeft)){if(xNum(a)){c.style.pixelLeft=a}else{a=c.style.pixelLeft}}}return a}function xMoveTo(b,a,c){xLeft(b,a);xTop(b,c)}function xNum(){for(var a=0;a<arguments.length;++a){if(isNaN(arguments[a])||typeof(arguments[a])!="number"){return false}}return true}function xPreventDefault(a){if(a&&a.preventDefault){a.preventDefault()}else{if(window.event){window.event.returnValue=false}}}function xResizeTo(c,a,b){return{w:xWidth(c,a),h:xHeight(c,b)}}function xScrollLeft(c,b){var a,d=0;if(!xDef(c)||b||c==document||c.tagName.toLowerCase()=="html"||c.tagName.toLowerCase()=="body"){a=window;if(b&&c){a=c}if(a.document.documentElement&&a.document.documentElement.scrollLeft){d=a.document.documentElement.scrollLeft}else{if(a.document.body&&xDef(a.document.body.scrollLeft)){d=a.document.body.scrollLeft}}}else{c=xGetElementById(c);if(c&&xNum(c.scrollLeft)){d=c.scrollLeft}}return d}function xScrollTop(c,b){var a,d=0;if(!xDef(c)||b||c==document||c.tagName.toLowerCase()=="html"||c.tagName.toLowerCase()=="body"){a=window;if(b&&c){a=c}if(a.document.documentElement&&a.document.documentElement.scrollTop){d=a.document.documentElement.scrollTop}else{if(a.document.body&&xDef(a.document.body.scrollTop)){d=a.document.body.scrollTop}}}else{c=xGetElementById(c);if(c&&xNum(c.scrollTop)){d=c.scrollTop}}return d}function xStopPropagation(a){if(a&&a.stopPropagation){a.stopPropagation()}else{if(window.event){window.event.cancelBubble=true}}}function xStr(b){for(var a=0;a<arguments.length;++a){if(typeof(arguments[a])!="string"){return false}}return true}function xTop(b,c){if(!(b=xGetElementById(b))){return 0}var a=xDef(b.style);if(a&&xStr(b.style.top)){if(xNum(c)){b.style.top=c+"px"}else{c=parseInt(b.style.top);if(isNaN(c)){c=xGetComputedStyle(b,"top",1)}if(isNaN(c)){c=0}}}else{if(a&&xDef(b.style.pixelTop)){if(xNum(c)){b.style.pixelTop=c}else{c=b.style.pixelTop}}}return c}function xWidth(g,b){var d,f=0,i=0,h=0,c=0,a;if(!(g=xGetElementById(g))){return 0}if(xNum(b)){if(b<0){b=0}else{b=Math.round(b)}}else{b=-1}d=xDef(g.style);if(g==document||g.tagName.toLowerCase()=="html"||g.tagName.toLowerCase()=="body"){b=xClientWidth()}else{if(d&&xDef(g.offsetWidth)&&xStr(g.style.width)){if(b>=0){if(document.compatMode=="CSS1Compat"){a=xGetComputedStyle;f=a(g,"padding-left",1);if(f!==null){i=a(g,"padding-right",1);h=a(g,"border-left-width",1);c=a(g,"border-right-width",1)}else{if(xDef(g.offsetWidth,g.style.width)){g.style.width=b+"px";f=g.offsetWidth-b}}}b-=(f+i+h+c);if(isNaN(b)||b<0){return}else{g.style.width=b+"px"}}b=g.offsetWidth}else{if(d&&xDef(g.style.pixelWidth)){if(b>=0){g.style.pixelWidth=b}b=g.style.pixelWidth}}}return b}KP_ATOMIX=(function(){var M=39,H=41,B=20,A=0,i={"1":"hydrogen","2":"carbon","3":"oxygen","4":"nitrogen","5":"sulphur","6":"fluorine","7":"chlorine","8":"bromine","9":"phosphorus",o:"crystal",A:"connector-horizontal",B:"connector-slash",C:"connector-vertical",D:"connector-backslash"},g={a:"top-single",b:"top-right",c:"right-single",d:"bottom-right",e:"bottom-single",f:"bottom-left",g:"left-single",h:"top-left",A:"top-double",B:"right-double",C:"bottom-double",D:"left-double",E:"top-triple",F:"right-triple",G:"bottom-triple",H:"left-triple"},p,D,t,F,c,T,u,d,b,f,o,I=xGetElementById;function j(X,W){for(var V=0;V<X.length;V+=1){W(X[V],V,X)}}function G(W){var X=0,V=arguments;return W.replace(/\f/g,function(){X+=1;return(X<V.length)?V[X]:""})}function Q(V){return B+V*H}function m(V){return A+V*M}function r(V){return V.join("\n").split("\n")}function O(V){xAddEventListener(I(V),"click",function(W){h(W);x(V)},false)}function y(){z();T=false}function L(W,X,V){if(o.grid[X].charAt(V)==="."){xTop(W,m(X));xLeft(W,Q(V))}else{xLeft(W,-1000)}}function z(){var W=t.row,V=t.col;L(D[0],W,V-1);L(D[1],W,V+1);L(D[2],W-1,V);L(D[3],W+1,V)}function J(){j(D,function(V){xLeft(V,-1000)})}function s(){j("left right up down".split(" "),function(W){var V=P(F,"atom arrow-"+W,0,-1000);D.push(V);xAddEventListener(V,"click",function(X){N(W)},false)})}function v(Y,V){var W,X;for(W=0;W<p.length;W+=1){X=p[W];if(X.row===Y&&X.col===V){return X}}return null}function C(V){t=V;z(V)}function P(X,V,Z,Y){var W=document.createElement("div");if(X){X.appendChild(W)}xAddClass(W,V);xTop(W,Z);xLeft(W,Y);return W}function w(Z){var X,W,aa,V,Y;u=V=document.createElement("select");Z.appendChild(V);for(level=0;level<f.length;level+=1){W=G("Level \f: \f",level+1,f[level].name);Y=document.createElement("option");Y.text=W;V.appendChild(Y)}xAddEventListener(V,"change",function(ab){h(ab);setTimeout(function(){U(V,b)},1)},false);return}function h(V){xStopPropagation(V);xPreventDefault(V)}function k(V){V=V.split("-");V[0]=parseInt(V[0],10);V[1]=parseInt(V[1],10);V[2]=parseInt(V[2],10);V[3]=parseInt(V[3],10);return V}function U(){a(u.selectedIndex)}function E(){var V="test-dialog next-level prev-level history-reset history-undo history-redo";j(V.split(" "),O)}function x(X){var V,W;switch(X){case"test-dialog":xModalDialog.instances[X].show();case"next-level":W=f.length-1;if(d<W){u.selectedIndex=d+1;a(d+1)}return;case"prev-level":if(d>0){u.selectedIndex=d-1;a(d-1)}return;case"history-reset":a(d,true);return;case"history-undo":if(!o.history.length||T){return}V=o.history.pop();o.redo.push(V);V=k(V);t=v(V[2],V[3]);K(V[0],V[1]);return;case"history-redo":if(!o.redo.length|T){return}V=o.redo.pop();o.history.push(V);V=k(V);t=v(V[0],V[1]);K(V[2],V[3]);return;default:return}return}function n(V){C(V)}function N(W){var aa=t.row,V=t.col,Y=aa,ab=V,X=o.grid,Z=X[aa];switch(W){case"left":while(Z.charAt(V-1)==="."){V-=1}break;case"right":while(Z.charAt(V+1)==="."){V+=1}break;case"up":while(X[aa-1].charAt(V)==="."){aa-=1}break;case"down":while(X[aa+1].charAt(V)==="."){aa+=1}break;default:break}if(aa!==t.row||V!==t.col){o.history.push(G("\f-\f-\f-\f",Y,ab,aa,V));o.redo=[];K(aa,V)}}function K(Z,V){var W=o.grid,aa=t.col,X=t.row,Y;J();l();Y=W[X].charAt(aa);W[X]=W[X].slice(0,aa)+"."+W[X].slice(aa+1);W[Z]=W[Z].slice(0,V)+Y+W[Z].slice(V+1);t.row=Z;t.col=V;Y=100*Math.abs(X-Z+aa-V);T=true;xAniLine(t.atom,Q(V),m(Z),Y,1,y)}function q(aa,Z,ad,V){var ab=b.atoms[Z],X,W,Y,ac;X=P(aa,"atom",m(ad),Q(V));W={row:ad,col:V,atom:X};if(aa===F){p.push(W);xAddEventListener(X,"click",function(ae){n(W)},false)}P(X,i[ab[0]]+" atom");Y=ab[1];for(ac=0;ac<Y.length;ac+=1){P(X,"bond "+g[Y.charAt(ac)],0,0)}return X}function S(){var W,X,Y,V;for(Y=0;Y<o.grid.length;Y+=1){W=o.grid[Y];for(V=0;V<W.length;V+=1){switch(W.charAt(V)){case"#":P(F,"arena-wall",m(Y),Q(V));break;case".":break;default:q(F,W.charAt(V),Y,V)}}}xHeight(F,m(Y));xWidth(F,Q(V)+B);X=b.molecule;for(Y=0;Y<X.length;Y+=1){W=X[Y];for(V=0;V<W.length;V+=1){if(W.charAt(V)!=="."){q(c,W.charAt(V),Y,V)}}}xMoveTo(c,xLeft(F)+xWidth(F)+40,xTop("controls")+xHeight("controls")+40);xWidth("move-controls",xWidth("arena"));C(p[0]);s();z()}function l(){I("move-no").innerHTML=G("<b>(Move: \f )</b>",o.history.length)}function e(V){b.gameData=o={};o.grid=r(b.arena);o.history=[];o.redo=[]}function a(V,W){V=V||0;p=[];D=[];F=I("arena");F.innerHTML="&nbsp;";c=I("molecule");c.innerHTML="&nbsp;";b=f[V];d=V;if(!xDef(b.gameData)||W===true){e()}else{o=b.gameData}t=null;S();l()}function R(V){f=KP_ATOMIX.levels.katomic;E();w(I("selectors"));a(V);new xModalDialog("success-dialog")}return{init:R,levels:{}}}());