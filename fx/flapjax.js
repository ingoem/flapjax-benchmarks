var F=F||{};F.internal_={};F.dom_={};F.xhr_={};F.doNotPropagate={};F.mkArray=function(a){return Array.prototype.slice.call(a)};F.internal_.Pulse=function(a,b){this.stamp=a;this.value=b};
F.internal_.PQ=function(){var a=this;a.val=[];this.insert=function(b){a.val.push(b);for(var c=a.val.length-1;0<c&&b.k<a.val[Math.floor((c-1)/2)].k;){var d=c,c=Math.floor((c-1)/2);a.val[d]=a.val[c];a.val[c]=b}};this.isEmpty=function(){return 0===a.val.length};this.pop=function(){if(1===a.val.length)return a.val.pop();var b=a.val.shift();a.val.unshift(a.val.pop());for(var c=0,d=a.val[0];;){var e=2*c+1<a.val.length?a.val[2*c+1].k:d.k+1,f=2*c+2<a.val.length?a.val[2*c+2].k:d.k+1;if(e>d.k&&f>d.k)break;
e<f?(a.val[c]=a.val[2*c+1],a.val[2*c+1]=d,c=2*c+1):(a.val[c]=a.val[2*c+2],a.val[2*c+2]=d,c=2*c+2)}return b}};F.internal_.lastRank=0;F.internal_.stamp=1;F.internal_.nextStamp=function(){return++F.internal_.stamp};
F.internal_.propagatePulse=function(a,b){var c=new F.internal_.PQ;for(c.insert({k:b.rank,n:b,v:a});!c.isEmpty();){var d=c.pop(),e=d.n.updater(new F.internal_.Pulse(d.v.stamp,d.v.value));if(e!=F.doNotPropagate)for(var f=0;f<d.n.sendsTo.length;f++)c.insert({k:d.n.sendsTo[f].rank,n:d.n.sendsTo[f],v:e})}};F.EventStream=function(a,b){this.updater=b;this.sendsTo=[];this.rank=++F.internal_.lastRank;for(var c=0;c<a.length;c++)a[c].attachListener(this)};
F.EventStream.prototype.attachListener=function(a){if(!(a instanceof F.EventStream))throw"attachListener: expected an F.EventStream";this.sendsTo.push(a);if(this.rank>a.rank)for(a=[a];a.length;){var b=a.splice(0,1)[0];b.rank=++F.internal_.lastRank;a=a.concat(b.sendsTo)}};
F.EventStream.prototype.removeListener=function(a){if(!(a instanceof F.EventStream))throw"removeListener: expected an F.EventStream";for(var b=!1,c=0;c<this.sendsTo.length&&!b;c++)this.sendsTo[c]===a&&(this.sendsTo.splice(c,1),b=!0);return b};F.internal_.internalE=function(a){return new F.EventStream(a||[],function(a){return a})};F.zeroE=function(){return new F.EventStream([],function(a){throw"zeroE : received a value; zeroE should not receive a value; the value was "+a.value;})};
F.oneE=function(a){var b=!1,c=new F.EventStream([],function(a){if(b)throw"oneE : received an extra value";b=!0;return a});window.setTimeout(function(){F.sendEvent(c,a)},0);return c};F.mergeE=function(a){if(0===arguments.length)return F.zeroE();var b=F.mkArray(arguments);return F.internal_.internalE(b)};F.EventStream.prototype.mergeE=function(){var a=F.mkArray(arguments);a.push(this);return F.internal_.internalE(a)};
F.EventStream.prototype.constantE=function(a){return new F.EventStream([this],function(b){b.value=a;return b})};F.Behavior=function(a,b,c){if(!(a instanceof F.EventStream))throw"F.Behavior: expected event as second arg";var d=this;this.last=b;this.underlyingRaw=a;this.underlying=new F.EventStream([a],c?function(a){d.last=c(a.value);a.value=d.last;return a}:function(a){d.last=a.value;return a})};F.Behavior.prototype.index=function(a){return this.liftB(function(b){return b[a]})};
F.receiverE=function(){var a=F.internal_.internalE();a.sendEvent=function(b){F.internal_.propagatePulse(new F.internal_.Pulse(F.internal_.nextStamp(),b),a)};return a};F.sendEvent=function(a,b){if(!(a instanceof F.EventStream))throw"sendEvent: expected Event as first arg";F.internal_.propagatePulse(new F.internal_.Pulse(F.internal_.nextStamp(),b),a)};
F.EventStream.prototype.bindE=function(a){var b=!1,c=new F.EventStream([],function(a){return a});c.name="bind outE";(new F.EventStream([this],function(d){b&&b.removeListener(c,!0);b=a(d.value);if(b instanceof F.EventStream)b.attachListener(c);else throw"bindE : expected F.EventStream";return F.doNotPropagate})).name="bind inE";return c};
F.EventStream.prototype.mapE=function(a){if(!(a instanceof Function))throw"mapE : expected a function as the first argument; received "+a;return new F.EventStream([this],function(b){b.value=a(b.value);return b})};F.EventStream.prototype.notE=function(){return this.mapE(function(a){return!a})};F.EventStream.prototype.filterE=function(a){if(!(a instanceof Function))throw"filterE : expected predicate; received "+a;return new F.EventStream([this],function(b){return a(b.value)?b:F.doNotPropagate})};
F.EventStream.prototype.onceE=function(){var a=!1;return this.filterE(function(){return!a?a=!0:!1})};F.EventStream.prototype.skipFirstE=function(){var a=!1;return this.filterE(function(){return!a?(a=!0,!1):!0})};F.EventStream.prototype.collectE=function(a,b){var c=a;return this.mapE(function(a){return c=a=b(a,c)})};F.EventStream.prototype.switchE=function(){return this.bindE(function(a){return a})};F.recE=function(a){var b=F.receiverE(),a=a(b);a.mapE(function(a){b.sendEvent(a)});return a};
F.internal_.delayStaticE=function(a,b){var c=F.internal_.internalE();new F.EventStream([a],function(a){setTimeout(function(){F.sendEvent(c,a.value)},b);return F.doNotPropagate});return c};
F.EventStream.prototype.delayE=function(a){var b=this;if(a instanceof F.Behavior){var c=F.internal_.internalE(),d=b,e=F.internal_.delayStaticE(b,a.valueNow()),f=new F.EventStream([a.changes()],function(a){d.removeListener(e);d=b;e=F.internal_.delayStaticE(b,a.value);F.sendEvent(c,e);return F.doNotPropagate}),g=c.switchE();F.sendEvent(f,a.valueNow());return g}return F.internal_.delayStaticE(b,a)};
F.mapE=function(a){for(var b=F.mkArray(arguments),c=[],d=0,e=[],f=0;f<b.length;f++)b[f]instanceof F.EventStream?(e.push(b[f]),c.push(function(a){return function(b){return b[a]}}(d)),d++):c.push(function(a){return function(){return a}}(b[f]));var g=c.slice(1);if(0===e.length)return F.oneE(a.apply(null,b));if(1===e.length&&a instanceof Function)return e[0].mapE(function(){var b=arguments;return a.apply(null,g.map(function(a){return a(b)}))});if(1===e.length)return a.mapE(function(a){var b=arguments;
return a.apply(null,g.map(function(a){return a(b)}))});throw"unknown mapE case";};F.EventStream.prototype.snapshotE=function(a){return new F.EventStream([this],function(b){b.value=a.valueNow();return b})};F.EventStream.prototype.filterRepeatsE=function(a){var b=void 0===a?!1:!0,c=a;return this.filterE(function(a){return!b||c!==a?(b=!0,c=a,!0):!1})};
F.EventStream.prototype.calmE=function(a){a instanceof F.Behavior||(a=F.constantB(a));var b=F.internal_.internalE();new F.EventStream([this],function(){var c=null;return function(d){null!==c&&clearTimeout(c);c=setTimeout(function(){c=null;F.sendEvent(b,d.value)},a.valueNow());return F.doNotPropagate}}());return b};
F.EventStream.prototype.blindE=function(a){return new F.EventStream([this],function(){var b=a instanceof F.Behavior?function(){return a.valueNow()}:function(){return a},c=(new Date).getTime()-b()-1;return function(a){var e=(new Date).getTime();return e-c>b()?(c=e,a):F.doNotPropagate}}())};F.EventStream.prototype.startsWith=function(a){return new F.Behavior(this,a)};F.Behavior.prototype.valueNow=function(){return this.last};F.Behavior.prototype.changes=function(){return this.underlying};
F.Behavior.prototype.switchB=function(){var a=this.valueNow(),b=null,c=F.internal_.internalE(),d=new F.EventStream([this.changes()],function(a){if(!(a.value instanceof F.Behavior))throw"switchB: expected F.Behavior as value of F.Behavior of first argument";null!=b&&b.removeListener(c);b=a.value.changes();b.attachListener(c);F.sendEvent(c,a.value.valueNow());return F.doNotPropagate});a instanceof F.Behavior&&F.sendEvent(d,a);return c.startsWith(a instanceof F.Behavior?a.valueNow():a)};F.timerB=function(a){return F.timerE(a).startsWith((new Date).getTime())};
F.Behavior.prototype.delayB=function(a,b){a instanceof F.Behavior||(a=F.constantB(a));return this.changes().delayE(a).startsWith(3<arguments.length?b:this.valueNow())};F.Behavior.prototype.sendBehavior=function(a){F.sendEvent(this.underlyingRaw,a)};F.Behavior.prototype.ifB=function(a,b){a instanceof F.Behavior||(a=F.constantB(a));b instanceof F.Behavior||(b=F.constantB(b));return F.liftB(function(a,b,e){return a?b:e},this,a,b)};
F.condB=function(a){var b=F.mkArray(arguments);return F.liftB.apply({},[function(){for(var a=0;a<b.length;a++)if(arguments[a])return arguments[b.length+a]}].concat(b.map(function(a){return a[0]}).concat(b.map(function(a){return a[1]}))))};F.constantB=function(a){return new F.Behavior(F.internal_.internalE(),a)};
F.liftB=function(a,b){var c=Array.prototype.slice.call(arguments,1),d=F.mkArray(arguments).filter(function(a){return a instanceof F.Behavior}).map(function(a){return a.changes()}),e=function(a){return a instanceof F.Behavior?a.last:a},f=function(){return e(a).apply(null,c.map(e))};if(1===d.length)return new F.Behavior(d[0],f(),f);var g=-1,d=new F.EventStream(d,function(a){return a.stamp!=g?(g=a.stamp,a):F.doNotPropagate});return new F.Behavior(d,f(),f)};
F.Behavior.prototype.ap=function(a){var b=[this].concat(F.mkArray(arguments));return F.liftB.apply(null,b)};F.Behavior.prototype.liftB=function(a){return F.liftB(a,this)};F.Behavior.andB=function(a){return F.liftB.apply({},[function(){for(var a=0;a<arguments.length;a++)if(!arguments[a])return!1;return!0}].concat(F.mkArray(arguments)))};F.Behavior.orB=function(a){return F.liftB.apply({},[function(){for(var a=0;a<arguments.length;a++)if(arguments[a])return!0;return!1}].concat(F.mkArray(arguments)))};
F.Behavior.prototype.notB=function(){return this.liftB(function(a){return!a})};F.Behavior.prototype.blindB=function(a){return this.changes().blindE(a).startsWith(this.valueNow())};F.Behavior.prototype.calmB=function(a){return this.changes().calmE(a).startsWith(this.valueNow())};
F.dom_.swapDom=function(a,b){if(null===a||void 0===a)throw"swapDom: expected dom node or id, received: "+a;var c=F.dom_.getObj(a);if(!(0<c.nodeType))throw"swapDom expected a Dom node as first arg, received "+c;if(b){var d=F.dom_.getObj(b);if(!(0<d.nodeType))throw"swapDom: can only swap with a DOM object";try{if(null===c.parentNode)return d;d!=c&&c.parentNode.replaceChild(d,c)}catch(e){throw"swapDom error in replace call: withMeD: "+d+", replaceMe Parent: "+c+", "+e+", parent: "+c.parentNode;}}else c.parentNode.removeChild(c);
return c};F.dom_.getObj=function(a){if("object"===typeof a)return a;if("null"===typeof a||"undefined"===typeof a)throw"getObj: expects a Dom obj or Dom id as first arg";var b;if(document.getElementById)b=document.getElementById(a);else if(document.all)b=document.all[a];else if(document.layers)b=document.layers[a];else throw"getObj: flapjax: cannot access object";if(null===b||void 0===b)throw"getObj: no obj to get: "+a;return b};F.$=F.dom_.getObj;
F.dom_.getMostDom=function(a,b){var c=F.dom_.getObj(a);if(!(null===b||void 0===b||1>b.length))for(var d=0;d<b.length-1;d++)c=c[b[d]];return c};F.dom_.getDomVal=function(a,b){var c=F.dom_.getMostDom(a,b);b&&0<b.length&&(c=c[b[b.length-1]]);return c};F.timerE=function(a){a instanceof F.Behavior||(a=F.constantB(a));var b=F.receiverE(),c=function(){b.sendEvent((new Date).getTime())},d=null;a.liftB(function(a){d&&(clearInterval(d),d=null);"number"===typeof a&&0<a&&(d=setInterval(c,a))});return b};
F.dom_.deepEach=function(a,b){for(var c=0;c<a.length;c++)a[c]instanceof Array?F.dom_.deepEach(a[c],b):b(a[c])};F.dom_.mapWithKeys=function(a,b){for(var c in a)Object.prototype&&Object.prototype[c]===a[c]||b(c,a[c])};F.dom_.insertAfter=function(a,b,c){"undefined"!=typeof c&&c.nextSibling?a.insertBefore(b,c.nextSibling):a.appendChild(b)};
F.dom_.swapChildren=function(a,b,c){var d=Math.min(b.length,c.length),e;for(e=0;e<d;e++)a.replaceChild(c[e],b[e]);if(d<b.length)for(e=d;e<b.length;e++)a.removeChild(b[e]);else if(d<c.length)for(e=d;e<c.length;e++)F.dom_.insertAfter(a,c[e],c[e-1])};F.dom_.elementize=function(a){return 0<a.nodeType?a:document.createTextNode(a.toString())};F.dom_.staticEnstyle=function(a,b,c){c instanceof Object||(a[b]=c)};
F.dom_.dynamicEnstyle=function(a,b,c){c instanceof F.Behavior?(F.dom_.staticEnstyle(a,b,c.valueNow()),c.liftB(function(c){F.dom_.staticEnstyle(a,b,c)})):c instanceof Object?F.dom_.mapWithKeys(c,function(c,e){F.dom_.dynamicEnstyle(a[b],c,e)}):a[b]=c};
F.dom_.makeTagB=function(a){return function(){var b,c;"object"===typeof arguments[0]&&!(0<arguments[0].nodeType||arguments[0]instanceof F.Behavior||arguments[0]instanceof Array)?(b=arguments[0],c=Array.prototype.slice.call(arguments,1)):(b={},c=F.mkArray(arguments));var d=document.createElement(a);F.dom_.mapWithKeys(b,function(a,b){if(b instanceof F.Behavior){d[a]=b.valueNow();b.liftB(function(b){F.dom_.staticEnstyle(d,a,b)})}else F.dom_.dynamicEnstyle(d,a,b)});F.dom_.deepEach(c,function(a){if(a instanceof
F.Behavior){var b=a.valueNow();if(b instanceof Array){b=b.map(F.dom_.elementize);b.forEach(function(a){d.appendChild(a)});a.liftB(function(a){a=a.map(F.dom_.elementize);F.dom_.swapChildren(d,b,a);b=a})}else{b=F.dom_.elementize(b);d.appendChild(b);a.liftB(function(a){a=F.dom_.elementize(a);b.parentNode!=d?d.appendChild(a):d.replaceChild(a,b);b=a})}}else d.appendChild(F.dom_.elementize(a))});return d}};
"a,b,blockquote,br,button,canvas,div,fieldset,form,font,h1,h2,h3,h4,hr,iframe,input,label,legend,li,ol,optgroup,option,p,select,span,strong,table,tbody,td,textarea,tfoot,th,thead,tr,tt,ul".split(",").forEach(function(a){window[a.toUpperCase()]=F.dom_.makeTagB(a)});F.elt=function(a,b,c){return F.dom_.makeTagB(a).apply(null,F.mkArray(arguments).slice(1))};F.text=function(a){a instanceof F.Behavior||(a=F.constantB(a));return a.changes().mapE(function(a){return document.createTextNode(a)}).startsWith(document.createTextNode(a.valueNow()))};
var DIV=F.dom_.makeTagB("div"),SPAN=F.dom_.makeTagB("span"),A=F.dom_.makeTagB("a"),TEXTAREA=F.dom_.makeTagB("TEXTAREA"),OPTION=F.dom_.makeTagB("OPTION"),INPUT=F.dom_.makeTagB("INPUT"),SELECT=F.dom_.makeTagB("SELECT"),IMG=F.dom_.makeTagB("IMG"),PRE=F.dom_.makeTagB("pre"),TEXT=function(a){return document.createTextNode(a)};
F.tagRec=function(a,b){if(!(a instanceof Array))throw"tagRec: expected array of event names as first arg";if(!(b instanceof Function))throw"tagRec: expected function as second arg";var c=a.length,d=[],e;for(e=0;e<c;e++)d.push(F.internal_.internalE());var f=b.apply(null,d);for(e=0;e<c;e++)F.extractEventE(f,a[e]).attachListener(d[e]);return f};
F.dom_.extractEventDynamicE=function(a,b,c){"undefined"===typeof c&&(c=!1);var d=F.receiverE(),e=function(a){d.sendEvent(a)},f=!1;a.liftB(function(a){f&&f.removeEventListener(b,e,c);(f=a)&&a.addEventListener&&a.removeEventListener&&a.addEventListener(b,e,c)});return d};F.dom_.extractEventStaticE=function(a,b,c){"undefined"===typeof c&&(c=!1);var d=F.receiverE();a.addEventListener(b,function(a){d.sendEvent(a)},c);return d};
F.extractEventE=function(a,b,c){return a instanceof F.Behavior?F.dom_.extractEventDynamicE(a,b,c):F.dom_.extractEventStaticE(a,b,c)};F.oneEvent=function(a,b){return F.recE(function(c){return F.extractEventE(c.constantE(!1).startsWith(a),b)})};F.extractEventsE=function(a,b){var c=Array.prototype.slice.call(arguments,1),c=(0===c.length?[]:c).map(function(b){return F.extractEventE(a,b)});return F.mergeE.apply(null,c)};
F.extractDomFieldOnEventE=function(a,b,c){if(!(a instanceof F.EventStream))throw"extractDomFieldOnEventE: expected Event as first arg";var d=Array.prototype.slice.call(arguments,2);return a.mapE(function(){return F.dom_.getDomVal(b,d)})};F.extractValueE=function(a){return F.extractValueB.apply(null,arguments).changes()};F.extractValueOnEventB=function(a,b){return F.dom_.extractValueStaticB(b,a)};
F.dom_.extractValueStaticB=function(a,b){var c;try{if(c=F.dom_.getObj(a),"string"===typeof a&&c.id!=a)throw"Make a radio group";}catch(d){c={type:"radio-group",name:a}}var e;switch(c.type){case "checkbox":e=F.extractDomFieldOnEventE(b?b:F.extractEventsE(c,"click","keyup","change"),c,"checked").filterRepeatsE(c.checked).startsWith(c.checked);break;case "select-one":e=function(){return-1<c.selectedIndex?c.options[c.selectedIndex].value?c.options[c.selectedIndex].value:c.options[c.selectedIndex].innerText:
void 0};e=(b?b:F.extractEventsE(c,"click","keyup","change")).mapE(e).filterRepeatsE().startsWith(e());break;case "select-multiple":e=function(){for(var a=[],b=0;b<c.options.length;b++)c.options[b].selected&&a.push(c.options[b].value?c.options[b].value:c.options[b].innerText);return a};e=(b?b:F.extractEventsE(c,"click","keyup","change")).mapE(e).startsWith(e());break;case "text":case "textarea":case "hidden":case "password":e=F.extractDomFieldOnEventE(b?b:F.extractEventsE(c,"click","keyup","change"),
c,"value").filterRepeatsE(c.value).startsWith(c.value);break;case "button":e=F.extractDomFieldOnEventE(b?b:F.extractEventsE(c,"click","keyup","change"),c,"value").startsWith(c.value);break;case "radio":case "radio-group":var f=F.mkArray(document.getElementsByTagName("input")).filter(function(a){return"radio"===a.type&&a.getAttribute("name")===c.name});e="radio"===c.type?function(){return c.checked}:function(){for(var a=0;a<f.length;a++)if(f[a].checked)return f[a].value};e=(b?b:F.mergeE.apply(null,
f.map(function(a){return F.extractEventsE(a,"click","keyup","change")}))).mapE(e).filterRepeatsE(e()).startsWith(e());break;default:throw'extractValueStaticB: unknown value type "'+c.type+'"';}return e};F.extractValueB=function(a){return a instanceof F.Behavior?a.liftB(function(a){return F.dom_.extractValueStaticB(a)}).switchB():F.dom_.extractValueStaticB(a)};F.$B=F.extractValueB;
F.dom_.deepStaticUpdate=function(a,b,c){b=b instanceof F.Behavior?b.valueNow():b;if("object"===typeof b)for(var d in b){if(!Object.prototype||!Object.prototype[d])F.dom_.deepStaticUpdate(c?a[c]:a,b[d],d)}else a[c]=b};
F.dom_.deepDynamicUpdate=function(a,b,c){var d=b instanceof F.Behavior?b.valueNow():b;if("object"===typeof d){if(b instanceof F.Behavior)throw"deepDynamicUpdate: dynamic collections not supported";for(var e in d)if(!Object.prototype||!Object.prototype[e])F.dom_.deepDynamicUpdate(c?a[c]:a,d[e],e)}else b instanceof F.Behavior&&new F.EventStream([b.changes()],function(b){c?a[c]=b.value:a=b.value;return F.doNotPropagate})};
F.insertValue=function(a,b){var c=Array.prototype.slice.call(arguments,2),d=F.dom_.getMostDom(b,c);F.dom_.deepStaticUpdate(d,a,c?c[c.length-1]:void 0)};F.insertValueE=function(a,b){if(!(a instanceof F.EventStream))throw"insertValueE: expected Event as first arg";var c=Array.prototype.slice.call(arguments,2),d=F.dom_.getMostDom(b,c);a.mapE(function(a){F.dom_.deepStaticUpdate(d,a,c?c[c.length-1]:void 0)})};
F.insertValueB=function(a,b,c){var d=Array.prototype.slice.call(arguments,2),e=F.dom_.getMostDom(b,d);F.dom_.deepStaticUpdate(e,a,d?d[d.length-1]:void 0);F.dom_.deepDynamicUpdate(e,a,d?d[d.length-1]:void 0)};F.insertDomE=function(a,b){if(!(a instanceof F.EventStream))throw"insertDomE: expected Event as first arg";var c=F.dom_.getObj(b);return a.mapE(function(a){"object"===typeof a&&1===a.nodeType||(a=SPAN({},a));F.dom_.swapDom(c,a);return c=a})};
F.dom_.insertDomInternal=function(a,b,c){switch(c){case void 0:case null:case "over":F.dom_.swapDom(a,b);break;case "before":a.parentNode.insertBefore(b,a);break;case "after":a.nextSibling?a.parentNode.insertBefore(b,a.nextSibling):a.parentNode.appendChild(b);break;case "leftMost":a.parentNode.firstChild?a.parentNode.insertBefore(b,a.parentNode.firstChild):a.parentNode.appendChild(b);break;case "rightMost":a.parentNode.appendChild(b);break;case "beginning":a.firstChild?a.insertBefore(b,a.firstChild):
a.appendChild(b);break;case "end":a.appendChild(b);break;default:throw"domInsert: unknown position: "+c;}};F.insertDom=function(a,b,c){F.dom_.insertDomInternal(F.dom_.getObj(b),"object"===typeof a&&0<a.nodeType?a:document.createTextNode(a),c)};
F.insertDomB=function(a,b,c){a instanceof F.Behavior||(a=F.constantB(a));var a=a.liftB(function(a){if("object"===typeof a&&0<a.nodeType)return a;var b=document.createElement("span");b.appendChild(document.createTextNode(a));return b}),d=a.valueNow();if(!("object"===typeof d&&1===d.nodeType))throw"insertDomB: initial value conversion failed: "+d;F.dom_.insertDomInternal(null===b||void 0===b?F.dom_.getObj(d.getAttribute("id")):F.dom_.getObj(b),d,c);return F.insertDomE(a.changes(),d).startsWith(d)};
F.mouseE=function(a){return F.extractEventE(a,"mousemove").mapE(function(a){return a.pageX|a.pageY?{left:a.pageX,top:a.pageY}:a.clientX||a.clientY?{left:a.clientX+document.body.scrollLeft,top:a.clientY+document.body.scrollTop}:{left:0,top:0}})};F.mouseB=function(a){return F.mouseE(a).startsWith({left:0,top:0})};F.clicksE=function(a){return F.extractEventE(a,"click")};
F.xhr_.ajaxRequest=function(a,b,c,d,e){var f=new window.XMLHttpRequest;f.onload=function(){e(f)};f.open(a,b,d);"POST"===a&&f.setRequestHeader("Content-Type","application/x-www-form-urlencoded");f.send(c);return f};F.xhr_.encodeREST=function(a){var b="",c;for(c in a)"function"!==typeof a[c]&&(""!=b&&(b+="&"),b+=c+"="+encodeURIComponent(a[c]));return b};
F.EventStream.prototype.xhrWithBody_=function(a,b){var c=F.receiverE();this.mapE(function(d){var e=new window.XMLHttpRequest;e.onload=function(){4===e.readyState&&c.sendEvent({request:d,response:e.responseText,xhr:e})};e.open(a,b,!0);e.send(d)});return c};F.EventStream.prototype.POST=function(a){return this.xhrWithBody_("POST",a)};F.EventStream.prototype.index=function(a){return this.mapE(function(b){if("object"!==typeof b&&null!==b)throw"expected object";return b[a]})};
F.EventStream.prototype.JSONParse=function(){return this.mapE(function(a){return JSON.parse(a)})};F.EventStream.prototype.JSONStringify=function(){return this.mapE(function(a){return JSON.stringify(a)})};
F.getWebServiceObjectE=function(a){var b=F.receiverE();a.mapE(function(a){var d="",e="GET",f=a.url;if("get"===a.request)a.fields&&(f+="?"+F.xhr_.encodeREST(a.fields)),d="",e="GET";else if("post"===a.request)d=JSON.stringify(a.fields),e="POST";else if("rawPost"===a.request)d=a.body,e="POST";else if("rest"===a.request)d=F.xhr_.encodeREST(a.fields),e="POST";else throw"Invalid request type: "+a.request;var g=!1!==a.async;if("json"===a.response)F.xhr_.ajaxRequest(e,f,d,g,function(a){b.sendEvent(JSON.parse(a.responseText))});
else if("xml"===a.response)F.xhr_.ajaxRequest(e,f,d,g,function(a){b.sendEvent(a.responseXML)});else if("plain"===a.response||!a.response)F.xhr_.ajaxRequest(e,f,d,g,function(a){b.sendEvent(a.responseText)});else throw"Unknown response format: "+a.response;return F.doNotPropagate});return b};
