(function dartProgram(){function copyProperties(a,b){var t=Object.keys(a)
for(var s=0;s<t.length;s++){var r=t[s]
b[r]=a[r]}}function mixinPropertiesHard(a,b){var t=Object.keys(a)
for(var s=0;s<t.length;s++){var r=t[s]
if(!b.hasOwnProperty(r)){b[r]=a[r]}}}function mixinPropertiesEasy(a,b){Object.assign(b,a)}var z=function(){var t=function(){}
t.prototype={p:{}}
var s=new t()
if(!(Object.getPrototypeOf(s)&&Object.getPrototypeOf(s).p===t.prototype.p))return false
try{if(typeof navigator!="undefined"&&typeof navigator.userAgent=="string"&&navigator.userAgent.indexOf("Chrome/")>=0)return true
if(typeof version=="function"&&version.length==0){var r=version()
if(/^\d+\.\d+\.\d+\.\d+$/.test(r))return true}}catch(q){}return false}()
function inherit(a,b){a.prototype.constructor=a
a.prototype["$i"+a.name]=a
if(b!=null){if(z){Object.setPrototypeOf(a.prototype,b.prototype)
return}var t=Object.create(b.prototype)
copyProperties(a.prototype,t)
a.prototype=t}}function inheritMany(a,b){for(var t=0;t<b.length;t++){inherit(b[t],a)}}function mixinEasy(a,b){mixinPropertiesEasy(b.prototype,a.prototype)
a.prototype.constructor=a}function mixinHard(a,b){mixinPropertiesHard(b.prototype,a.prototype)
a.prototype.constructor=a}function lazy(a,b,c,d){var t=a
a[b]=t
a[c]=function(){if(a[b]===t){a[b]=d()}a[c]=function(){return this[b]}
return a[b]}}function lazyFinal(a,b,c,d){var t=a
a[b]=t
a[c]=function(){if(a[b]===t){var s=d()
if(a[b]!==t){A.jx(b)}a[b]=s}var r=a[b]
a[c]=function(){return r}
return r}}function makeConstList(a){a.immutable$list=Array
a.fixed$length=Array
return a}function convertToFastObject(a){function t(){}t.prototype=a
new t()
return a}function convertAllToFastObject(a){for(var t=0;t<a.length;++t){convertToFastObject(a[t])}}var y=0
function instanceTearOffGetter(a,b){var t=null
return a?function(c){if(t===null)t=A.eU(b)
return new t(c,this)}:function(){if(t===null)t=A.eU(b)
return new t(this,null)}}function staticTearOffGetter(a){var t=null
return function(){if(t===null)t=A.eU(a).prototype
return t}}var x=0
function tearOffParameters(a,b,c,d,e,f,g,h,i,j){if(typeof h=="number"){h+=x}return{co:a,iS:b,iI:c,rC:d,dV:e,cs:f,fs:g,fT:h,aI:i||0,nDA:j}}function installStaticTearOff(a,b,c,d,e,f,g,h){var t=tearOffParameters(a,true,false,c,d,e,f,g,h,false)
var s=staticTearOffGetter(t)
a[b]=s}function installInstanceTearOff(a,b,c,d,e,f,g,h,i,j){c=!!c
var t=tearOffParameters(a,false,c,d,e,f,g,h,i,!!j)
var s=instanceTearOffGetter(c,t)
a[b]=s}function setOrUpdateInterceptorsByTag(a){var t=v.interceptorsByTag
if(!t){v.interceptorsByTag=a
return}copyProperties(a,t)}function setOrUpdateLeafTags(a){var t=v.leafTags
if(!t){v.leafTags=a
return}copyProperties(a,t)}function updateTypes(a){var t=v.types
var s=t.length
t.push.apply(t,a)
return s}function updateHolder(a,b){copyProperties(b,a)
return a}var hunkHelpers=function(){var t=function(a,b,c,d,e){return function(f,g,h,i){return installInstanceTearOff(f,g,a,b,c,d,[h],i,e,false)}},s=function(a,b,c,d){return function(e,f,g,h){return installStaticTearOff(e,f,a,b,c,[g],h,d)}}
return{inherit:inherit,inheritMany:inheritMany,mixin:mixinEasy,mixinHard:mixinHard,installStaticTearOff:installStaticTearOff,installInstanceTearOff:installInstanceTearOff,_instance_0u:t(0,0,null,["$0"],0),_instance_1u:t(0,1,null,["$1"],0),_instance_2u:t(0,2,null,["$2"],0),_instance_0i:t(1,0,null,["$0"],0),_instance_1i:t(1,1,null,["$1"],0),_instance_2i:t(1,2,null,["$2"],0),_static_0:s(0,null,["$0"],0),_static_1:s(1,null,["$1"],0),_static_2:s(2,null,["$2"],0),makeConstList:makeConstList,lazy:lazy,lazyFinal:lazyFinal,updateHolder:updateHolder,convertToFastObject:convertToFastObject,updateTypes:updateTypes,setOrUpdateInterceptorsByTag:setOrUpdateInterceptorsByTag,setOrUpdateLeafTags:setOrUpdateLeafTags}}()
function initializeDeferredHunk(a){x=v.types.length
a(hunkHelpers,v,w,$)}var J={
eZ(a,b,c,d){return{i:a,p:b,e:c,x:d}},
eV(a){var t,s,r,q,p,o=a[v.dispatchPropertyName]
if(o==null)if($.eX==null){A.je()
o=a[v.dispatchPropertyName]}if(o!=null){t=o.p
if(!1===t)return o.i
if(!0===t)return a
s=Object.getPrototypeOf(a)
if(t===s)return o.i
if(o.e===s)throw A.d(A.fp("Return interceptor for "+A.A(t(a,o))))}r=a.constructor
if(r==null)q=null
else{p=$.e4
if(p==null)p=$.e4=v.getIsolateTag("_$dart_js")
q=r[p]}if(q!=null)return q
q=A.jj(a)
if(q!=null)return q
if(typeof a=="function")return B.an
t=Object.getPrototypeOf(a)
if(t==null)return B.Y
if(t===Object.prototype)return B.Y
if(typeof r=="function"){p=$.e4
if(p==null)p=$.e4=v.getIsolateTag("_$dart_js")
Object.defineProperty(r,p,{value:B.x,enumerable:false,writable:true,configurable:true})
return B.x}return B.x},
hv(a,b){if(a>4294967295)throw A.d(A.ck(a,0,4294967295,"length",null))
return J.hw(new Array(a),b)},
hw(a,b){return J.cY(A.c(a,b.i("l<0>")),b)},
cY(a,b){a.fixed$length=Array
return a},
aV(a){if(typeof a=="number"){if(Math.floor(a)==a)return J.bl.prototype
return J.c2.prototype}if(typeof a=="string")return J.b2.prototype
if(a==null)return J.bm.prototype
if(typeof a=="boolean")return J.c1.prototype
if(Array.isArray(a))return J.l.prototype
if(typeof a!="object"){if(typeof a=="function")return J.au.prototype
if(typeof a=="symbol")return J.bp.prototype
if(typeof a=="bigint")return J.bo.prototype
return a}if(a instanceof A.y)return a
return J.eV(a)},
fV(a){if(typeof a=="string")return J.b2.prototype
if(a==null)return a
if(Array.isArray(a))return J.l.prototype
if(typeof a!="object"){if(typeof a=="function")return J.au.prototype
if(typeof a=="symbol")return J.bp.prototype
if(typeof a=="bigint")return J.bo.prototype
return a}if(a instanceof A.y)return a
return J.eV(a)},
en(a){if(a==null)return a
if(Array.isArray(a))return J.l.prototype
if(typeof a!="object"){if(typeof a=="function")return J.au.prototype
if(typeof a=="symbol")return J.bp.prototype
if(typeof a=="bigint")return J.bo.prototype
return a}if(a instanceof A.y)return a
return J.eV(a)},
bc(a,b){if(a==null)return b==null
if(typeof a!="object")return b!=null&&a===b
return J.aV(a).N(a,b)},
hc(a,b){return J.en(a).L(a,b)},
ap(a){return J.aV(a).gA(a)},
aq(a){return J.en(a).gE(a)},
cF(a){return J.fV(a).gn(a)},
hd(a){return J.aV(a).gB(a)},
aX(a,b,c){return J.en(a).a_(a,b,c)},
bd(a){return J.aV(a).j(a)},
c0:function c0(){},
c1:function c1(){},
bm:function bm(){},
c3:function c3(){},
aK:function aK(){},
ci:function ci(){},
bF:function bF(){},
au:function au(){},
bo:function bo(){},
bp:function bp(){},
l:function l(a){this.$ti=a},
cZ:function cZ(a){this.$ti=a},
aE:function aE(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
bn:function bn(){},
bl:function bl(){},
c2:function c2(){},
b2:function b2(){}},A={eG:function eG(){},
ax(a,b){a=a+b&536870911
a=a+((a&524287)<<10)&536870911
return a^a>>>6},
eM(a){a=a+((a&67108863)<<3)&536870911
a^=a>>>11
return a+((a&16383)<<15)&536870911},
eY(a){var t,s
for(t=$.a_.length,s=0;s<t;++s)if(a===$.a_[s])return!0
return!1},
fe(a,b,c,d){if(u.e.b(a))return new A.bi(a,b,c.i("@<0>").C(d).i("bi<1,2>"))
return new A.aM(a,b,c.i("@<0>").C(d).i("aM<1,2>"))},
eE(){return new A.bD("No element")},
c6:function c6(a){this.a=a},
dR:function dR(){},
j:function j(){},
x:function x(){},
aL:function aL(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
aM:function aM(a,b,c){this.a=a
this.b=b
this.$ti=c},
bi:function bi(a,b,c){this.a=a
this.b=b
this.$ti=c},
Z:function Z(a,b,c){var _=this
_.a=null
_.b=a
_.c=b
_.$ti=c},
z:function z(a,b,c){this.a=a
this.b=b
this.$ti=c},
aR:function aR(a,b,c){this.a=a
this.b=b
this.$ti=c},
bG:function bG(a,b,c){this.a=a
this.b=b
this.$ti=c},
P:function P(){},
h1(a){var t=v.mangledGlobalNames[a]
if(t!=null)return t
return"minified:"+a},
jY(a,b){var t
if(b!=null){t=b.x
if(t!=null)return t}return u.p.b(a)},
A(a){var t
if(typeof a=="string")return a
if(typeof a=="number"){if(a!==0)return""+a}else if(!0===a)return"true"
else if(!1===a)return"false"
else if(a==null)return"null"
t=J.bd(a)
return t},
bz(a){var t,s=$.fh
if(s==null)s=$.fh=Symbol("identityHashCode")
t=a[s]
if(t==null){t=Math.random()*0x3fffffff|0
a[s]=t}return t},
dk(a){return A.hH(a)},
hH(a){var t,s,r,q
if(a instanceof A.y)return A.V(A.ba(a),null)
t=J.aV(a)
if(t===B.am||t===B.ao||u.o.b(a)){s=B.C(a)
if(s!=="Object"&&s!=="")return s
r=a.constructor
if(typeof r=="function"){q=r.name
if(typeof q=="string"&&q!=="Object"&&q!=="")return q}}return A.V(A.ba(a),null)},
fi(a){if(a==null||typeof a=="number"||A.eR(a))return J.bd(a)
if(typeof a=="string")return JSON.stringify(a)
if(a instanceof A.at)return a.j(0)
if(a instanceof A.aA)return a.aC(!0)
return"Instance of '"+A.dk(a)+"'"},
K(a){var t
if(a<=65535)return String.fromCharCode(a)
if(a<=1114111){t=a-65536
return String.fromCharCode((B.f.a2(t,10)|55296)>>>0,t&1023|56320)}throw A.d(A.ck(a,0,1114111,null,null))},
eW(a){throw A.d(A.fQ(a))},
q(a,b){if(a==null)J.cF(a)
throw A.d(A.ek(a,b))},
ek(a,b){var t,s="index"
if(!A.fL(b))return new A.as(!0,b,s,null)
t=A.a7(J.cF(a))
if(b<0||b>=t)return A.fa(b,t,a,s)
return new A.bA(null,null,!0,b,s,"Value not in range")},
fQ(a){return new A.as(!0,a,null,null)},
d(a){return A.fX(new Error(),a)},
fX(a,b){var t
if(b==null)b=new A.bE()
a.dartException=b
t=A.jy
if("defineProperty" in Object){Object.defineProperty(a,"message",{get:t})
a.name=""}else a.toString=t
return a},
jy(){return J.bd(this.dartException)},
r(a){throw A.d(a)},
jw(a,b){throw A.fX(b,a)},
v(a){throw A.d(A.aF(a))},
ak(a){var t,s,r,q,p,o
a=A.jp(a.replace(String({}),"$receiver$"))
t=a.match(/\\\$[a-zA-Z]+\\\$/g)
if(t==null)t=A.c([],u.s)
s=t.indexOf("\\$arguments\\$")
r=t.indexOf("\\$argumentsExpr\\$")
q=t.indexOf("\\$expr\\$")
p=t.indexOf("\\$method\\$")
o=t.indexOf("\\$receiver\\$")
return new A.dZ(a.replace(new RegExp("\\\\\\$arguments\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$argumentsExpr\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$expr\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$method\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$receiver\\\\\\$","g"),"((?:x|[^x])*)"),s,r,q,p,o)},
e_(a){return function($expr$){var $argumentsExpr$="$arguments$"
try{$expr$.$method$($argumentsExpr$)}catch(t){return t.message}}(a)},
fo(a){return function($expr$){try{$expr$.$method$}catch(t){return t.message}}(a)},
eH(a,b){var t=b==null,s=t?null:b.method
return new A.c4(a,s,t?null:b.receiver)},
f1(a){if(a==null)return new A.dd(a)
if(typeof a!=="object")return a
if("dartException" in a)return A.aW(a,a.dartException)
return A.iX(a)},
aW(a,b){if(u.l.b(b))if(b.$thrownJsError==null)b.$thrownJsError=a
return b},
iX(a){var t,s,r,q,p,o,n,m,l,k,j,i,h
if(!("message" in a))return a
t=a.message
if("number" in a&&typeof a.number=="number"){s=a.number
r=s&65535
if((B.f.a2(s,16)&8191)===10)switch(r){case 438:return A.aW(a,A.eH(A.A(t)+" (Error "+r+")",null))
case 445:case 5007:A.A(t)
return A.aW(a,new A.by())}}if(a instanceof TypeError){q=$.h2()
p=$.h3()
o=$.h4()
n=$.h5()
m=$.h8()
l=$.h9()
k=$.h7()
$.h6()
j=$.hb()
i=$.ha()
h=q.I(t)
if(h!=null)return A.aW(a,A.eH(A.h(t),h))
else{h=p.I(t)
if(h!=null){h.method="call"
return A.aW(a,A.eH(A.h(t),h))}else if(o.I(t)!=null||n.I(t)!=null||m.I(t)!=null||l.I(t)!=null||k.I(t)!=null||n.I(t)!=null||j.I(t)!=null||i.I(t)!=null){A.h(t)
return A.aW(a,new A.by())}}return A.aW(a,new A.ct(typeof t=="string"?t:""))}if(a instanceof RangeError){if(typeof t=="string"&&t.indexOf("call stack")!==-1)return new A.bC()
t=function(b){try{return String(b)}catch(g){}return null}(a)
return A.aW(a,new A.as(!1,null,null,typeof t=="string"?t.replace(/^RangeError:\s*/,""):t))}if(typeof InternalError=="function"&&a instanceof InternalError)if(typeof t=="string"&&t==="too much recursion")return new A.bC()
return a},
f_(a){if(a==null)return J.ap(a)
if(typeof a=="object")return A.bz(a)
return J.ap(a)},
j2(a){if(typeof a=="number")return B.c.gA(a)
if(a instanceof A.cB)return A.bz(a)
if(a instanceof A.aA)return a.gA(a)
return A.f_(a)},
fU(a,b){var t,s,r,q=a.length
for(t=0;t<q;t=r){s=t+1
r=s+1
b.k(0,a[t],a[s])}return b},
iC(a,b,c,d,e,f){u.Z.a(a)
switch(A.a7(b)){case 0:return a.$0()
case 1:return a.$1(c)
case 2:return a.$2(c,d)
case 3:return a.$3(c,d,e)
case 4:return a.$4(c,d,e,f)}throw A.d(new A.e3("Unsupported number of arguments for wrapped closure"))},
j3(a,b){var t=a.$identity
if(!!t)return t
t=A.j4(a,b)
a.$identity=t
return t},
j4(a,b){var t
switch(b){case 0:t=a.$0
break
case 1:t=a.$1
break
case 2:t=a.$2
break
case 3:t=a.$3
break
case 4:t=a.$4
break
default:t=null}if(t!=null)return t.bind(a)
return function(c,d,e){return function(f,g,h,i){return e(c,d,f,g,h,i)}}(a,b,A.iC)},
hn(a1){var t,s,r,q,p,o,n,m,l,k,j=a1.co,i=a1.iS,h=a1.iI,g=a1.nDA,f=a1.aI,e=a1.fs,d=a1.cs,c=e[0],b=d[0],a=j[c],a0=a1.fT
a0.toString
t=i?Object.create(new A.cp().constructor.prototype):Object.create(new A.aZ(null,null).constructor.prototype)
t.$initialize=t.constructor
s=i?function static_tear_off(){this.$initialize()}:function tear_off(a2,a3){this.$initialize(a2,a3)}
t.constructor=s
s.prototype=t
t.$_name=c
t.$_target=a
r=!i
if(r)q=A.f8(c,a,h,g)
else{t.$static_name=c
q=a}t.$S=A.hj(a0,i,h)
t[b]=q
for(p=q,o=1;o<e.length;++o){n=e[o]
if(typeof n=="string"){m=j[n]
l=n
n=m}else l=""
k=d[o]
if(k!=null){if(r)n=A.f8(l,n,h,g)
t[k]=n}if(o===f)p=n}t.$C=p
t.$R=a1.rC
t.$D=a1.dV
return s},
hj(a,b,c){if(typeof a=="number")return a
if(typeof a=="string"){if(b)throw A.d("Cannot compute signature for static tearoff.")
return function(d,e){return function(){return e(this,d)}}(a,A.hh)}throw A.d("Error in functionType of tearoff")},
hk(a,b,c,d){var t=A.f6
switch(b?-1:a){case 0:return function(e,f){return function(){return f(this)[e]()}}(c,t)
case 1:return function(e,f){return function(g){return f(this)[e](g)}}(c,t)
case 2:return function(e,f){return function(g,h){return f(this)[e](g,h)}}(c,t)
case 3:return function(e,f){return function(g,h,i){return f(this)[e](g,h,i)}}(c,t)
case 4:return function(e,f){return function(g,h,i,j){return f(this)[e](g,h,i,j)}}(c,t)
case 5:return function(e,f){return function(g,h,i,j,k){return f(this)[e](g,h,i,j,k)}}(c,t)
default:return function(e,f){return function(){return e.apply(f(this),arguments)}}(d,t)}},
f8(a,b,c,d){if(c)return A.hm(a,b,d)
return A.hk(b.length,d,a,b)},
hl(a,b,c,d){var t=A.f6,s=A.hi
switch(b?-1:a){case 0:throw A.d(new A.cn("Intercepted function with no arguments."))
case 1:return function(e,f,g){return function(){return f(this)[e](g(this))}}(c,s,t)
case 2:return function(e,f,g){return function(h){return f(this)[e](g(this),h)}}(c,s,t)
case 3:return function(e,f,g){return function(h,i){return f(this)[e](g(this),h,i)}}(c,s,t)
case 4:return function(e,f,g){return function(h,i,j){return f(this)[e](g(this),h,i,j)}}(c,s,t)
case 5:return function(e,f,g){return function(h,i,j,k){return f(this)[e](g(this),h,i,j,k)}}(c,s,t)
case 6:return function(e,f,g){return function(h,i,j,k,l){return f(this)[e](g(this),h,i,j,k,l)}}(c,s,t)
default:return function(e,f,g){return function(){var r=[g(this)]
Array.prototype.push.apply(r,arguments)
return e.apply(f(this),r)}}(d,s,t)}},
hm(a,b,c){var t,s
if($.f4==null)$.f4=A.f3("interceptor")
if($.f5==null)$.f5=A.f3("receiver")
t=b.length
s=A.hl(t,c,a,b)
return s},
eU(a){return A.hn(a)},
hh(a,b){return A.bQ(v.typeUniverse,A.ba(a.a),b)},
f6(a){return a.a},
hi(a){return a.b},
f3(a){var t,s,r,q=new A.aZ("receiver","interceptor"),p=J.cY(Object.getOwnPropertyNames(q),u.X)
for(t=p.length,s=0;s<t;++s){r=p[s]
if(q[r]===a)return r}throw A.d(A.cL("Field name "+a+" not found."))},
eT(a){if(a==null)A.iZ("boolean expression must not be null")
return a},
iZ(a){throw A.d(new A.cv(a))},
jZ(a){throw A.d(new A.cw(a))},
ja(a){return v.getIsolateTag(a)},
jj(a){var t,s,r,q,p,o=A.h($.fW.$1(a)),n=$.el[o]
if(n!=null){Object.defineProperty(a,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
return n.i}t=$.er[o]
if(t!=null)return t
s=v.interceptorsByTag[o]
if(s==null){r=A.ip($.fP.$2(a,o))
if(r!=null){n=$.el[r]
if(n!=null){Object.defineProperty(a,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
return n.i}t=$.er[r]
if(t!=null)return t
s=v.interceptorsByTag[r]
o=r}}if(s==null)return null
t=s.prototype
q=o[0]
if(q==="!"){n=A.ew(t)
$.el[o]=n
Object.defineProperty(a,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
return n.i}if(q==="~"){$.er[o]=t
return t}if(q==="-"){p=A.ew(t)
Object.defineProperty(Object.getPrototypeOf(a),v.dispatchPropertyName,{value:p,enumerable:false,writable:true,configurable:true})
return p.i}if(q==="+")return A.fY(a,t)
if(q==="*")throw A.d(A.fp(o))
if(v.leafTags[o]===true){p=A.ew(t)
Object.defineProperty(Object.getPrototypeOf(a),v.dispatchPropertyName,{value:p,enumerable:false,writable:true,configurable:true})
return p.i}else return A.fY(a,t)},
fY(a,b){var t=Object.getPrototypeOf(a)
Object.defineProperty(t,v.dispatchPropertyName,{value:J.eZ(b,t,null,null),enumerable:false,writable:true,configurable:true})
return b},
ew(a){return J.eZ(a,!1,null,!!a.$iX)},
jl(a,b,c){var t=b.prototype
if(v.leafTags[a]===true)return A.ew(t)
else return J.eZ(t,c,null,null)},
je(){if(!0===$.eX)return
$.eX=!0
A.jf()},
jf(){var t,s,r,q,p,o,n,m
$.el=Object.create(null)
$.er=Object.create(null)
A.jd()
t=v.interceptorsByTag
s=Object.getOwnPropertyNames(t)
if(typeof window!="undefined"){window
r=function(){}
for(q=0;q<s.length;++q){p=s[q]
o=$.h_.$1(p)
if(o!=null){n=A.jl(p,t[p],o)
if(n!=null){Object.defineProperty(o,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
r.prototype=o}}}}for(q=0;q<s.length;++q){p=s[q]
if(/^[A-Za-z_]/.test(p)){m=t[p]
t["!"+p]=m
t["~"+p]=m
t["-"+p]=m
t["+"+p]=m
t["*"+p]=m}}},
jd(){var t,s,r,q,p,o,n=B.af()
n=A.b9(B.ag,A.b9(B.ah,A.b9(B.D,A.b9(B.D,A.b9(B.ai,A.b9(B.aj,A.b9(B.ak(B.C),n)))))))
if(typeof dartNativeDispatchHooksTransformer!="undefined"){t=dartNativeDispatchHooksTransformer
if(typeof t=="function")t=[t]
if(Array.isArray(t))for(s=0;s<t.length;++s){r=t[s]
if(typeof r=="function")n=r(n)||n}}q=n.getTag
p=n.getUnknownTag
o=n.prototypeForTag
$.fW=new A.eo(q)
$.fP=new A.ep(p)
$.h_=new A.eq(o)},
b9(a,b){return a(b)||b},
j6(a,b){var t=b.length,s=v.rttc[""+t+";"+a]
if(s==null)return null
if(t===0)return s
if(t===s.length)return s.apply(null,b)
return s(b)},
jv(a,b,c){var t=a.indexOf(b,c)
return t>=0},
jp(a){if(/[[\]{}()*+?.\\^$|]/.test(a))return a.replace(/[[\]{}()*+?.\\^$|]/g,"\\$&")
return a},
bL:function bL(a,b){this.a=a
this.b=b},
b_:function b_(){},
cQ:function cQ(a,b,c){this.a=a
this.b=b
this.c=c},
bf:function bf(a,b,c){this.a=a
this.b=b
this.$ti=c},
aS:function aS(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
bk:function bk(a,b){this.a=a
this.$ti=b},
b0:function b0(){},
bg:function bg(a,b,c){this.a=a
this.b=b
this.$ti=c},
aI:function aI(a,b){this.a=a
this.$ti=b},
dZ:function dZ(a,b,c,d,e,f){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f},
by:function by(){},
c4:function c4(a,b,c){this.a=a
this.b=b
this.c=c},
ct:function ct(a){this.a=a},
dd:function dd(a){this.a=a},
at:function at(){},
bU:function bU(){},
bV:function bV(){},
cq:function cq(){},
cp:function cp(){},
aZ:function aZ(a,b){this.a=a
this.b=b},
cw:function cw(a){this.a=a},
cn:function cn(a){this.a=a},
cv:function cv(a){this.a=a},
a1:function a1(a){var _=this
_.a=0
_.f=_.e=_.d=_.c=_.b=null
_.r=0
_.$ti=a},
d0:function d0(a){this.a=a},
d_:function d_(a){this.a=a},
d8:function d8(a,b){this.a=a
this.b=b
this.c=null},
a5:function a5(a,b){this.a=a
this.$ti=b},
bs:function bs(a,b,c){var _=this
_.a=a
_.b=b
_.d=_.c=null
_.$ti=c},
aJ:function aJ(a){var _=this
_.a=0
_.f=_.e=_.d=_.c=_.b=null
_.r=0
_.$ti=a},
eo:function eo(a){this.a=a},
ep:function ep(a){this.a=a},
eq:function eq(a){this.a=a},
aA:function aA(){},
b7:function b7(){},
aT(a,b,c){if(a>>>0!==a||a>=c)throw A.d(A.ek(b,a))},
c7:function c7(){},
ce:function ce(){},
c8:function c8(){},
b4:function b4(){},
bu:function bu(){},
bv:function bv(){},
c9:function c9(){},
ca:function ca(){},
cb:function cb(){},
cc:function cc(){},
cd:function cd(){},
cf:function cf(){},
cg:function cg(){},
bw:function bw(){},
ch:function ch(){},
bH:function bH(){},
bI:function bI(){},
bJ:function bJ(){},
bK:function bK(){},
fj(a,b){var t=b.c
return t==null?b.c=A.eP(a,b.x,!0):t},
eL(a,b){var t=b.c
return t==null?b.c=A.bO(a,"f9",[b.x]):t},
fk(a){var t=a.w
if(t===6||t===7||t===8)return A.fk(a.x)
return t===12||t===13},
hN(a){return a.as},
D(a){return A.cC(v.typeUniverse,a,!1)},
aB(a0,a1,a2,a3){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a=a1.w
switch(a){case 5:case 1:case 2:case 3:case 4:return a1
case 6:t=a1.x
s=A.aB(a0,t,a2,a3)
if(s===t)return a1
return A.fz(a0,s,!0)
case 7:t=a1.x
s=A.aB(a0,t,a2,a3)
if(s===t)return a1
return A.eP(a0,s,!0)
case 8:t=a1.x
s=A.aB(a0,t,a2,a3)
if(s===t)return a1
return A.fx(a0,s,!0)
case 9:r=a1.y
q=A.b8(a0,r,a2,a3)
if(q===r)return a1
return A.bO(a0,a1.x,q)
case 10:p=a1.x
o=A.aB(a0,p,a2,a3)
n=a1.y
m=A.b8(a0,n,a2,a3)
if(o===p&&m===n)return a1
return A.eN(a0,o,m)
case 11:l=a1.x
k=a1.y
j=A.b8(a0,k,a2,a3)
if(j===k)return a1
return A.fy(a0,l,j)
case 12:i=a1.x
h=A.aB(a0,i,a2,a3)
g=a1.y
f=A.iU(a0,g,a2,a3)
if(h===i&&f===g)return a1
return A.fw(a0,h,f)
case 13:e=a1.y
a3+=e.length
d=A.b8(a0,e,a2,a3)
p=a1.x
o=A.aB(a0,p,a2,a3)
if(d===e&&o===p)return a1
return A.eO(a0,o,d,!0)
case 14:c=a1.x
if(c<a3)return a1
b=a2[c-a3]
if(b==null)return a1
return b
default:throw A.d(A.bS("Attempted to substitute unexpected RTI kind "+a))}},
b8(a,b,c,d){var t,s,r,q,p=b.length,o=A.eb(p)
for(t=!1,s=0;s<p;++s){r=b[s]
q=A.aB(a,r,c,d)
if(q!==r)t=!0
o[s]=q}return t?o:b},
iV(a,b,c,d){var t,s,r,q,p,o,n=b.length,m=A.eb(n)
for(t=!1,s=0;s<n;s+=3){r=b[s]
q=b[s+1]
p=b[s+2]
o=A.aB(a,p,c,d)
if(o!==p)t=!0
m.splice(s,3,r,q,o)}return t?m:b},
iU(a,b,c,d){var t,s=b.a,r=A.b8(a,s,c,d),q=b.b,p=A.b8(a,q,c,d),o=b.c,n=A.iV(a,o,c,d)
if(r===s&&p===q&&n===o)return b
t=new A.cy()
t.a=r
t.b=p
t.c=n
return t},
c(a,b){a[v.arrayRti]=b
return a},
fS(a){var t=a.$S
if(t!=null){if(typeof t=="number")return A.jc(t)
return a.$S()}return null},
jg(a,b){var t
if(A.fk(b))if(a instanceof A.at){t=A.fS(a)
if(t!=null)return t}return A.ba(a)},
ba(a){if(a instanceof A.y)return A.o(a)
if(Array.isArray(a))return A.M(a)
return A.eQ(J.aV(a))},
M(a){var t=a[v.arrayRti],s=u.m
if(t==null)return s
if(t.constructor!==s.constructor)return s
return t},
o(a){var t=a.$ti
return t!=null?t:A.eQ(a)},
eQ(a){var t=a.constructor,s=t.$ccache
if(s!=null)return s
return A.iB(a,t)},
iB(a,b){var t=a instanceof A.at?Object.getPrototypeOf(Object.getPrototypeOf(a)).constructor:b,s=A.ij(v.typeUniverse,t.name)
b.$ccache=s
return s},
jc(a){var t,s=v.types,r=s[a]
if(typeof r=="string"){t=A.cC(v.typeUniverse,r,!1)
s[a]=t
return t}return r},
jb(a){return A.aU(A.o(a))},
eS(a){var t
if(a instanceof A.aA)return A.j7(a.$r,a.aw())
t=a instanceof A.at?A.fS(a):null
if(t!=null)return t
if(u.bW.b(a))return J.hd(a).a
if(Array.isArray(a))return A.M(a)
return A.ba(a)},
aU(a){var t=a.r
return t==null?a.r=A.fF(a):t},
fF(a){var t,s,r=a.as,q=r.replace(/\*/g,"")
if(q===r)return a.r=new A.cB(a)
t=A.cC(v.typeUniverse,q,!0)
s=t.r
return s==null?t.r=A.fF(t):s},
j7(a,b){var t,s,r=b,q=r.length
if(q===0)return u.F
if(0>=q)return A.q(r,0)
t=A.bQ(v.typeUniverse,A.eS(r[0]),"@<0>")
for(s=1;s<q;++s){if(!(s<r.length))return A.q(r,s)
t=A.fA(v.typeUniverse,t,A.eS(r[s]))}return A.bQ(v.typeUniverse,t,a)},
a8(a){return A.aU(A.cC(v.typeUniverse,a,!1))},
iA(a){var t,s,r,q,p,o,n=this
if(n===u.K)return A.an(n,a,A.iH)
if(!A.ao(n))t=n===u._
else t=!0
if(t)return A.an(n,a,A.iL)
t=n.w
if(t===7)return A.an(n,a,A.iy)
if(t===1)return A.an(n,a,A.fM)
s=t===6?n.x:n
r=s.w
if(r===8)return A.an(n,a,A.iD)
if(s===u.S)q=A.fL
else if(s===u.i||s===u.H)q=A.iG
else if(s===u.N)q=A.iJ
else q=s===u.y?A.eR:null
if(q!=null)return A.an(n,a,q)
if(r===9){p=s.x
if(s.y.every(A.jh)){n.f="$i"+p
if(p==="n")return A.an(n,a,A.iF)
return A.an(n,a,A.iK)}}else if(r===11){o=A.j6(s.x,s.y)
return A.an(n,a,o==null?A.fM:o)}return A.an(n,a,A.iw)},
an(a,b,c){a.b=c
return a.b(b)},
iz(a){var t,s=this,r=A.iv
if(!A.ao(s))t=s===u._
else t=!0
if(t)r=A.iq
else if(s===u.K)r=A.io
else{t=A.bR(s)
if(t)r=A.ix}s.a=r
return s.a(a)},
cD(a){var t=a.w,s=!0
if(!A.ao(a))if(!(a===u._))if(!(a===u.A))if(t!==7)if(!(t===6&&A.cD(a.x)))s=t===8&&A.cD(a.x)||a===u.a||a===u.T
return s},
iw(a){var t=this
if(a==null)return A.cD(t)
return A.ji(v.typeUniverse,A.jg(a,t),t)},
iy(a){if(a==null)return!0
return this.x.b(a)},
iK(a){var t,s=this
if(a==null)return A.cD(s)
t=s.f
if(a instanceof A.y)return!!a[t]
return!!J.aV(a)[t]},
iF(a){var t,s=this
if(a==null)return A.cD(s)
if(typeof a!="object")return!1
if(Array.isArray(a))return!0
t=s.f
if(a instanceof A.y)return!!a[t]
return!!J.aV(a)[t]},
iv(a){var t=this
if(a==null){if(A.bR(t))return a}else if(t.b(a))return a
A.fG(a,t)},
ix(a){var t=this
if(a==null)return a
else if(t.b(a))return a
A.fG(a,t)},
fG(a,b){throw A.d(A.i9(A.fq(a,A.V(b,null))))},
fq(a,b){return A.bj(a)+": type '"+A.V(A.eS(a),null)+"' is not a subtype of type '"+b+"'"},
i9(a){return new A.bM("TypeError: "+a)},
R(a,b){return new A.bM("TypeError: "+A.fq(a,b))},
iD(a){var t=this,s=t.w===6?t.x:t
return s.x.b(a)||A.eL(v.typeUniverse,s).b(a)},
iH(a){return a!=null},
io(a){if(a!=null)return a
throw A.d(A.R(a,"Object"))},
iL(a){return!0},
iq(a){return a},
fM(a){return!1},
eR(a){return!0===a||!1===a},
jN(a){if(!0===a)return!0
if(!1===a)return!1
throw A.d(A.R(a,"bool"))},
jP(a){if(!0===a)return!0
if(!1===a)return!1
if(a==null)return a
throw A.d(A.R(a,"bool"))},
jO(a){if(!0===a)return!0
if(!1===a)return!1
if(a==null)return a
throw A.d(A.R(a,"bool?"))},
fD(a){if(typeof a=="number")return a
throw A.d(A.R(a,"double"))},
jR(a){if(typeof a=="number")return a
if(a==null)return a
throw A.d(A.R(a,"double"))},
jQ(a){if(typeof a=="number")return a
if(a==null)return a
throw A.d(A.R(a,"double?"))},
fL(a){return typeof a=="number"&&Math.floor(a)===a},
a7(a){if(typeof a=="number"&&Math.floor(a)===a)return a
throw A.d(A.R(a,"int"))},
jT(a){if(typeof a=="number"&&Math.floor(a)===a)return a
if(a==null)return a
throw A.d(A.R(a,"int"))},
jS(a){if(typeof a=="number"&&Math.floor(a)===a)return a
if(a==null)return a
throw A.d(A.R(a,"int?"))},
iG(a){return typeof a=="number"},
il(a){if(typeof a=="number")return a
throw A.d(A.R(a,"num"))},
jU(a){if(typeof a=="number")return a
if(a==null)return a
throw A.d(A.R(a,"num"))},
im(a){if(typeof a=="number")return a
if(a==null)return a
throw A.d(A.R(a,"num?"))},
iJ(a){return typeof a=="string"},
h(a){if(typeof a=="string")return a
throw A.d(A.R(a,"String"))},
jV(a){if(typeof a=="string")return a
if(a==null)return a
throw A.d(A.R(a,"String"))},
ip(a){if(typeof a=="string")return a
if(a==null)return a
throw A.d(A.R(a,"String?"))},
fN(a,b){var t,s,r
for(t="",s="",r=0;r<a.length;++r,s=", ")t+=s+A.V(a[r],b)
return t},
iS(a,b){var t,s,r,q,p,o,n=a.x,m=a.y
if(""===n)return"("+A.fN(m,b)+")"
t=m.length
s=n.split(",")
r=s.length-t
for(q="(",p="",o=0;o<t;++o,p=", "){q+=p
if(r===0)q+="{"
q+=A.V(m[o],b)
if(r>=0)q+=" "+s[r];++r}return q+"})"},
fI(a3,a4,a5){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1=", ",a2=null
if(a5!=null){t=a5.length
if(a4==null)a4=A.c([],u.s)
else a2=a4.length
s=a4.length
for(r=t;r>0;--r)B.a.m(a4,"T"+(s+r))
for(q=u.X,p=u._,o="<",n="",r=0;r<t;++r,n=a1){m=a4.length
l=m-1-r
if(!(l>=0))return A.q(a4,l)
o=B.l.p(o+n,a4[l])
k=a5[r]
j=k.w
if(!(j===2||j===3||j===4||j===5||k===q))m=k===p
else m=!0
if(!m)o+=" extends "+A.V(k,a4)}o+=">"}else o=""
q=a3.x
i=a3.y
h=i.a
g=h.length
f=i.b
e=f.length
d=i.c
c=d.length
b=A.V(q,a4)
for(a="",a0="",r=0;r<g;++r,a0=a1)a+=a0+A.V(h[r],a4)
if(e>0){a+=a0+"["
for(a0="",r=0;r<e;++r,a0=a1)a+=a0+A.V(f[r],a4)
a+="]"}if(c>0){a+=a0+"{"
for(a0="",r=0;r<c;r+=3,a0=a1){a+=a0
if(d[r+1])a+="required "
a+=A.V(d[r+2],a4)+" "+d[r]}a+="}"}if(a2!=null){a4.toString
a4.length=a2}return o+"("+a+") => "+b},
V(a,b){var t,s,r,q,p,o,n,m=a.w
if(m===5)return"erased"
if(m===2)return"dynamic"
if(m===3)return"void"
if(m===1)return"Never"
if(m===4)return"any"
if(m===6)return A.V(a.x,b)
if(m===7){t=a.x
s=A.V(t,b)
r=t.w
return(r===12||r===13?"("+s+")":s)+"?"}if(m===8)return"FutureOr<"+A.V(a.x,b)+">"
if(m===9){q=A.iW(a.x)
p=a.y
return p.length>0?q+("<"+A.fN(p,b)+">"):q}if(m===11)return A.iS(a,b)
if(m===12)return A.fI(a,b,null)
if(m===13)return A.fI(a.x,b,a.y)
if(m===14){o=a.x
n=b.length
o=n-1-o
if(!(o>=0&&o<n))return A.q(b,o)
return b[o]}return"?"},
iW(a){var t=v.mangledGlobalNames[a]
if(t!=null)return t
return"minified:"+a},
ik(a,b){var t=a.tR[b]
for(;typeof t=="string";)t=a.tR[t]
return t},
ij(a,b){var t,s,r,q,p,o=a.eT,n=o[b]
if(n==null)return A.cC(a,b,!1)
else if(typeof n=="number"){t=n
s=A.bP(a,5,"#")
r=A.eb(t)
for(q=0;q<t;++q)r[q]=s
p=A.bO(a,b,r)
o[b]=p
return p}else return n},
ii(a,b){return A.fB(a.tR,b)},
ih(a,b){return A.fB(a.eT,b)},
cC(a,b,c){var t,s=a.eC,r=s.get(b)
if(r!=null)return r
t=A.fu(A.fs(a,null,b,c))
s.set(b,t)
return t},
bQ(a,b,c){var t,s,r=b.z
if(r==null)r=b.z=new Map()
t=r.get(c)
if(t!=null)return t
s=A.fu(A.fs(a,b,c,!0))
r.set(c,s)
return s},
fA(a,b,c){var t,s,r,q=b.Q
if(q==null)q=b.Q=new Map()
t=c.as
s=q.get(t)
if(s!=null)return s
r=A.eN(a,b,c.w===10?c.y:[c])
q.set(t,r)
return r},
am(a,b){b.a=A.iz
b.b=A.iA
return b},
bP(a,b,c){var t,s,r=a.eC.get(c)
if(r!=null)return r
t=new A.a3(null,null)
t.w=b
t.as=c
s=A.am(a,t)
a.eC.set(c,s)
return s},
fz(a,b,c){var t,s=b.as+"*",r=a.eC.get(s)
if(r!=null)return r
t=A.ie(a,b,s,c)
a.eC.set(s,t)
return t},
ie(a,b,c,d){var t,s,r
if(d){t=b.w
if(!A.ao(b))s=b===u.a||b===u.T||t===7||t===6
else s=!0
if(s)return b}r=new A.a3(null,null)
r.w=6
r.x=b
r.as=c
return A.am(a,r)},
eP(a,b,c){var t,s=b.as+"?",r=a.eC.get(s)
if(r!=null)return r
t=A.id(a,b,s,c)
a.eC.set(s,t)
return t},
id(a,b,c,d){var t,s,r,q
if(d){t=b.w
s=!0
if(!A.ao(b))if(!(b===u.a||b===u.T))if(t!==7)s=t===8&&A.bR(b.x)
if(s)return b
else if(t===1||b===u.A)return u.a
else if(t===6){r=b.x
if(r.w===8&&A.bR(r.x))return r
else return A.fj(a,b)}}q=new A.a3(null,null)
q.w=7
q.x=b
q.as=c
return A.am(a,q)},
fx(a,b,c){var t,s=b.as+"/",r=a.eC.get(s)
if(r!=null)return r
t=A.ib(a,b,s,c)
a.eC.set(s,t)
return t},
ib(a,b,c,d){var t,s
if(d){t=b.w
if(A.ao(b)||b===u.K||b===u._)return b
else if(t===1)return A.bO(a,"f9",[b])
else if(b===u.a||b===u.T)return u.bc}s=new A.a3(null,null)
s.w=8
s.x=b
s.as=c
return A.am(a,s)},
ig(a,b){var t,s,r=""+b+"^",q=a.eC.get(r)
if(q!=null)return q
t=new A.a3(null,null)
t.w=14
t.x=b
t.as=r
s=A.am(a,t)
a.eC.set(r,s)
return s},
bN(a){var t,s,r,q=a.length
for(t="",s="",r=0;r<q;++r,s=",")t+=s+a[r].as
return t},
ia(a){var t,s,r,q,p,o=a.length
for(t="",s="",r=0;r<o;r+=3,s=","){q=a[r]
p=a[r+1]?"!":":"
t+=s+q+p+a[r+2].as}return t},
bO(a,b,c){var t,s,r,q=b
if(c.length>0)q+="<"+A.bN(c)+">"
t=a.eC.get(q)
if(t!=null)return t
s=new A.a3(null,null)
s.w=9
s.x=b
s.y=c
if(c.length>0)s.c=c[0]
s.as=q
r=A.am(a,s)
a.eC.set(q,r)
return r},
eN(a,b,c){var t,s,r,q,p,o
if(b.w===10){t=b.x
s=b.y.concat(c)}else{s=c
t=b}r=t.as+(";<"+A.bN(s)+">")
q=a.eC.get(r)
if(q!=null)return q
p=new A.a3(null,null)
p.w=10
p.x=t
p.y=s
p.as=r
o=A.am(a,p)
a.eC.set(r,o)
return o},
fy(a,b,c){var t,s,r="+"+(b+"("+A.bN(c)+")"),q=a.eC.get(r)
if(q!=null)return q
t=new A.a3(null,null)
t.w=11
t.x=b
t.y=c
t.as=r
s=A.am(a,t)
a.eC.set(r,s)
return s},
fw(a,b,c){var t,s,r,q,p,o=b.as,n=c.a,m=n.length,l=c.b,k=l.length,j=c.c,i=j.length,h="("+A.bN(n)
if(k>0){t=m>0?",":""
h+=t+"["+A.bN(l)+"]"}if(i>0){t=m>0?",":""
h+=t+"{"+A.ia(j)+"}"}s=o+(h+")")
r=a.eC.get(s)
if(r!=null)return r
q=new A.a3(null,null)
q.w=12
q.x=b
q.y=c
q.as=s
p=A.am(a,q)
a.eC.set(s,p)
return p},
eO(a,b,c,d){var t,s=b.as+("<"+A.bN(c)+">"),r=a.eC.get(s)
if(r!=null)return r
t=A.ic(a,b,c,s,d)
a.eC.set(s,t)
return t},
ic(a,b,c,d,e){var t,s,r,q,p,o,n,m
if(e){t=c.length
s=A.eb(t)
for(r=0,q=0;q<t;++q){p=c[q]
if(p.w===1){s[q]=p;++r}}if(r>0){o=A.aB(a,b,s,0)
n=A.b8(a,c,s,0)
return A.eO(a,o,n,c!==n)}}m=new A.a3(null,null)
m.w=13
m.x=b
m.y=c
m.as=d
return A.am(a,m)},
fs(a,b,c,d){return{u:a,e:b,r:c,s:[],p:0,n:d}},
fu(a){var t,s,r,q,p,o,n,m=a.r,l=a.s
for(t=m.length,s=0;s<t;){r=m.charCodeAt(s)
if(r>=48&&r<=57)s=A.i3(s+1,r,m,l)
else if((((r|32)>>>0)-97&65535)<26||r===95||r===36||r===124)s=A.ft(a,s,m,l,!1)
else if(r===46)s=A.ft(a,s,m,l,!0)
else{++s
switch(r){case 44:break
case 58:l.push(!1)
break
case 33:l.push(!0)
break
case 59:l.push(A.az(a.u,a.e,l.pop()))
break
case 94:l.push(A.ig(a.u,l.pop()))
break
case 35:l.push(A.bP(a.u,5,"#"))
break
case 64:l.push(A.bP(a.u,2,"@"))
break
case 126:l.push(A.bP(a.u,3,"~"))
break
case 60:l.push(a.p)
a.p=l.length
break
case 62:A.i5(a,l)
break
case 38:A.i4(a,l)
break
case 42:q=a.u
l.push(A.fz(q,A.az(q,a.e,l.pop()),a.n))
break
case 63:q=a.u
l.push(A.eP(q,A.az(q,a.e,l.pop()),a.n))
break
case 47:q=a.u
l.push(A.fx(q,A.az(q,a.e,l.pop()),a.n))
break
case 40:l.push(-3)
l.push(a.p)
a.p=l.length
break
case 41:A.i2(a,l)
break
case 91:l.push(a.p)
a.p=l.length
break
case 93:p=l.splice(a.p)
A.fv(a.u,a.e,p)
a.p=l.pop()
l.push(p)
l.push(-1)
break
case 123:l.push(a.p)
a.p=l.length
break
case 125:p=l.splice(a.p)
A.i7(a.u,a.e,p)
a.p=l.pop()
l.push(p)
l.push(-2)
break
case 43:o=m.indexOf("(",s)
l.push(m.substring(s,o))
l.push(-4)
l.push(a.p)
a.p=l.length
s=o+1
break
default:throw"Bad character "+r}}}n=l.pop()
return A.az(a.u,a.e,n)},
i3(a,b,c,d){var t,s,r=b-48
for(t=c.length;a<t;++a){s=c.charCodeAt(a)
if(!(s>=48&&s<=57))break
r=r*10+(s-48)}d.push(r)
return a},
ft(a,b,c,d,e){var t,s,r,q,p,o,n=b+1
for(t=c.length;n<t;++n){s=c.charCodeAt(n)
if(s===46){if(e)break
e=!0}else{if(!((((s|32)>>>0)-97&65535)<26||s===95||s===36||s===124))r=s>=48&&s<=57
else r=!0
if(!r)break}}q=c.substring(b,n)
if(e){t=a.u
p=a.e
if(p.w===10)p=p.x
o=A.ik(t,p.x)[q]
if(o==null)A.r('No "'+q+'" in "'+A.hN(p)+'"')
d.push(A.bQ(t,p,o))}else d.push(q)
return n},
i5(a,b){var t,s=a.u,r=A.fr(a,b),q=b.pop()
if(typeof q=="string")b.push(A.bO(s,q,r))
else{t=A.az(s,a.e,q)
switch(t.w){case 12:b.push(A.eO(s,t,r,a.n))
break
default:b.push(A.eN(s,t,r))
break}}},
i2(a,b){var t,s,r,q=a.u,p=b.pop(),o=null,n=null
if(typeof p=="number")switch(p){case-1:o=b.pop()
break
case-2:n=b.pop()
break
default:b.push(p)
break}else b.push(p)
t=A.fr(a,b)
p=b.pop()
switch(p){case-3:p=b.pop()
if(o==null)o=q.sEA
if(n==null)n=q.sEA
s=A.az(q,a.e,p)
r=new A.cy()
r.a=t
r.b=o
r.c=n
b.push(A.fw(q,s,r))
return
case-4:b.push(A.fy(q,b.pop(),t))
return
default:throw A.d(A.bS("Unexpected state under `()`: "+A.A(p)))}},
i4(a,b){var t=b.pop()
if(0===t){b.push(A.bP(a.u,1,"0&"))
return}if(1===t){b.push(A.bP(a.u,4,"1&"))
return}throw A.d(A.bS("Unexpected extended operation "+A.A(t)))},
fr(a,b){var t=b.splice(a.p)
A.fv(a.u,a.e,t)
a.p=b.pop()
return t},
az(a,b,c){if(typeof c=="string")return A.bO(a,c,a.sEA)
else if(typeof c=="number"){b.toString
return A.i6(a,b,c)}else return c},
fv(a,b,c){var t,s=c.length
for(t=0;t<s;++t)c[t]=A.az(a,b,c[t])},
i7(a,b,c){var t,s=c.length
for(t=2;t<s;t+=3)c[t]=A.az(a,b,c[t])},
i6(a,b,c){var t,s,r=b.w
if(r===10){if(c===0)return b.x
t=b.y
s=t.length
if(c<=s)return t[c-1]
c-=s
b=b.x
r=b.w}else if(c===0)return b
if(r!==9)throw A.d(A.bS("Indexed base must be an interface type"))
t=b.y
if(c<=t.length)return t[c-1]
throw A.d(A.bS("Bad index "+c+" for "+b.j(0)))},
ji(a,b,c){var t,s=b.d
if(s==null)s=b.d=new Map()
t=s.get(c)
if(t==null){t=A.B(a,b,null,c,null,!1)?1:0
s.set(c,t)}if(0===t)return!1
if(1===t)return!0
return!0},
B(a,b,c,d,e,f){var t,s,r,q,p,o,n,m,l,k,j
if(b===d)return!0
if(!A.ao(d))t=d===u._
else t=!0
if(t)return!0
s=b.w
if(s===4)return!0
if(A.ao(b))return!1
t=b.w
if(t===1)return!0
r=s===14
if(r)if(A.B(a,c[b.x],c,d,e,!1))return!0
q=d.w
t=b===u.a||b===u.T
if(t){if(q===8)return A.B(a,b,c,d.x,e,!1)
return d===u.a||d===u.T||q===7||q===6}if(d===u.K){if(s===8)return A.B(a,b.x,c,d,e,!1)
if(s===6)return A.B(a,b.x,c,d,e,!1)
return s!==7}if(s===6)return A.B(a,b.x,c,d,e,!1)
if(q===6){t=A.fj(a,d)
return A.B(a,b,c,t,e,!1)}if(s===8){if(!A.B(a,b.x,c,d,e,!1))return!1
return A.B(a,A.eL(a,b),c,d,e,!1)}if(s===7){t=A.B(a,u.a,c,d,e,!1)
return t&&A.B(a,b.x,c,d,e,!1)}if(q===8){if(A.B(a,b,c,d.x,e,!1))return!0
return A.B(a,b,c,A.eL(a,d),e,!1)}if(q===7){t=A.B(a,b,c,u.a,e,!1)
return t||A.B(a,b,c,d.x,e,!1)}if(r)return!1
t=s!==12
if((!t||s===13)&&d===u.Z)return!0
p=s===11
if(p&&d===u.cY)return!0
if(q===13){if(b===u.g)return!0
if(s!==13)return!1
o=b.y
n=d.y
m=o.length
if(m!==n.length)return!1
c=c==null?o:o.concat(c)
e=e==null?n:n.concat(e)
for(l=0;l<m;++l){k=o[l]
j=n[l]
if(!A.B(a,k,c,j,e,!1)||!A.B(a,j,e,k,c,!1))return!1}return A.fK(a,b.x,c,d.x,e,!1)}if(q===12){if(b===u.g)return!0
if(t)return!1
return A.fK(a,b,c,d,e,!1)}if(s===9){if(q!==9)return!1
return A.iE(a,b,c,d,e,!1)}if(p&&q===11)return A.iI(a,b,c,d,e,!1)
return!1},
fK(a2,a3,a4,a5,a6,a7){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1
if(!A.B(a2,a3.x,a4,a5.x,a6,!1))return!1
t=a3.y
s=a5.y
r=t.a
q=s.a
p=r.length
o=q.length
if(p>o)return!1
n=o-p
m=t.b
l=s.b
k=m.length
j=l.length
if(p+k<o+j)return!1
for(i=0;i<p;++i){h=r[i]
if(!A.B(a2,q[i],a6,h,a4,!1))return!1}for(i=0;i<n;++i){h=m[i]
if(!A.B(a2,q[p+i],a6,h,a4,!1))return!1}for(i=0;i<j;++i){h=m[n+i]
if(!A.B(a2,l[i],a6,h,a4,!1))return!1}g=t.c
f=s.c
e=g.length
d=f.length
for(c=0,b=0;b<d;b+=3){a=f[b]
for(;!0;){if(c>=e)return!1
a0=g[c]
c+=3
if(a<a0)return!1
a1=g[c-2]
if(a0<a){if(a1)return!1
continue}h=f[b+1]
if(a1&&!h)return!1
h=g[c-1]
if(!A.B(a2,f[b+2],a6,h,a4,!1))return!1
break}}for(;c<e;){if(g[c+1])return!1
c+=3}return!0},
iE(a,b,c,d,e,f){var t,s,r,q,p,o=b.x,n=d.x
for(;o!==n;){t=a.tR[o]
if(t==null)return!1
if(typeof t=="string"){o=t
continue}s=t[n]
if(s==null)return!1
r=s.length
q=r>0?new Array(r):v.typeUniverse.sEA
for(p=0;p<r;++p)q[p]=A.bQ(a,b,s[p])
return A.fC(a,q,null,c,d.y,e,!1)}return A.fC(a,b.y,null,c,d.y,e,!1)},
fC(a,b,c,d,e,f,g){var t,s=b.length
for(t=0;t<s;++t)if(!A.B(a,b[t],d,e[t],f,!1))return!1
return!0},
iI(a,b,c,d,e,f){var t,s=b.y,r=d.y,q=s.length
if(q!==r.length)return!1
if(b.x!==d.x)return!1
for(t=0;t<q;++t)if(!A.B(a,s[t],c,r[t],e,!1))return!1
return!0},
bR(a){var t=a.w,s=!0
if(!(a===u.a||a===u.T))if(!A.ao(a))if(t!==7)if(!(t===6&&A.bR(a.x)))s=t===8&&A.bR(a.x)
return s},
jh(a){var t
if(!A.ao(a))t=a===u._
else t=!0
return t},
ao(a){var t=a.w
return t===2||t===3||t===4||t===5||a===u.X},
fB(a,b){var t,s,r=Object.keys(b),q=r.length
for(t=0;t<q;++t){s=r[t]
a[s]=b[s]}},
eb(a){return a>0?new Array(a):v.typeUniverse.sEA},
a3:function a3(a,b){var _=this
_.a=a
_.b=b
_.r=_.f=_.d=_.c=null
_.w=0
_.as=_.Q=_.z=_.y=_.x=null},
cy:function cy(){this.c=this.b=this.a=null},
cB:function cB(a){this.a=a},
cx:function cx(){},
bM:function bM(a){this.a=a},
hz(a,b){return new A.a1(a.i("@<0>").C(b).i("a1<1,2>"))},
E(a,b,c){return b.i("@<0>").C(c).i("eI<1,2>").a(A.fU(a,new A.a1(b.i("@<0>").C(c).i("a1<1,2>"))))},
G(a,b){return new A.a1(a.i("@<0>").C(b).i("a1<1,2>"))},
eJ(a){var t,s={}
if(A.eY(a))return"{...}"
t=new A.b6("")
try{B.a.m($.a_,a)
t.a+="{"
s.a=!0
a.H(0,new A.da(s,t))
t.a+="}"}finally{if(0>=$.a_.length)return A.q($.a_,-1)
$.a_.pop()}s=t.a
return s.charCodeAt(0)==0?s:s},
u:function u(){},
t:function t(){},
d9:function d9(a){this.a=a},
da:function da(a,b){this.a=a
this.b=b},
aP:function aP(){},
iO(a,b){var t,s,r,q=null
try{q=JSON.parse(a)}catch(s){t=A.f1(s)
r=A.W(String(t))
throw A.d(r)}r=A.ec(q)
return r},
ec(a){var t
if(a==null)return null
if(typeof a!="object")return a
if(!Array.isArray(a))return new A.cz(a,Object.create(null))
for(t=0;t<a.length;++t)a[t]=A.ec(a[t])
return a},
fb(a,b,c){return new A.bq(a,b)},
iu(a){return a.l()},
i0(a,b){return new A.e5(a,[],A.j5())},
i1(a,b,c){var t,s=new A.b6(""),r=A.i0(s,b)
r.aa(a)
t=s.a
return t.charCodeAt(0)==0?t:t},
cz:function cz(a,b){this.a=a
this.b=b
this.c=null},
cA:function cA(a){this.a=a},
bW:function bW(){},
bZ:function bZ(){},
bq:function bq(a,b){this.a=a
this.b=b},
c5:function c5(a,b){this.a=a
this.b=b},
d1:function d1(){},
d3:function d3(a){this.b=a},
d2:function d2(a){this.a=a},
e6:function e6(){},
e7:function e7(a,b){this.a=a
this.b=b},
e5:function e5(a,b,c){this.c=a
this.a=b
this.b=c},
hA(a,b,c,d){var t,s=J.hv(a,d)
if(a!==0&&b!=null)for(t=0;t<a;++t)s[t]=b
return s},
hB(a,b,c){var t,s,r=A.c([],c.i("l<0>"))
for(t=a.length,s=0;s<a.length;a.length===t||(0,A.v)(a),++s)B.a.m(r,c.a(a[s]))
return J.cY(r,c)},
J(a,b,c){var t
if(b)return A.fc(a,c)
t=J.cY(A.fc(a,c),c)
return t},
fc(a,b){var t,s
if(Array.isArray(a))return A.c(a.slice(0),b.i("l<0>"))
t=A.c([],b.i("l<0>"))
for(s=J.aq(a);s.t();)B.a.m(t,s.gv())
return t},
fd(a,b){var t=A.hB(a,!1,b)
t.fixed$length=Array
t.immutable$list=Array
return t},
fn(a,b,c){var t=J.aq(b)
if(!t.t())return a
if(c.length===0){do a+=A.A(t.gv())
while(t.t())}else{a+=A.A(t.gv())
for(;t.t();)a=a+c+A.A(t.gv())}return a},
bj(a){if(typeof a=="number"||A.eR(a)||a==null)return J.bd(a)
if(typeof a=="string")return JSON.stringify(a)
return A.fi(a)},
bS(a){return new A.be(a)},
cL(a){return new A.as(!1,null,null,a)},
ck(a,b,c,d,e){return new A.bA(b,c,!0,a,d,"Invalid value")},
hL(a,b,c){if(0>a||a>c)throw A.d(A.ck(a,0,c,"start",null))
if(b!=null){if(a>b||b>c)throw A.d(A.ck(b,a,c,"end",null))
return b}return c},
hK(a,b){return a},
fa(a,b,c,d){return new A.c_(b,!0,a,d,"Index out of range")},
aQ(a){return new A.cu(a)},
fp(a){return new A.cs(a)},
a4(a){return new A.bD(a)},
aF(a){return new A.bX(a)},
W(a){return new A.cU(a)},
hu(a,b,c){var t,s
if(A.eY(a)){if(b==="("&&c===")")return"(...)"
return b+"..."+c}t=A.c([],u.s)
B.a.m($.a_,a)
try{A.iM(a,t)}finally{if(0>=$.a_.length)return A.q($.a_,-1)
$.a_.pop()}s=A.fn(b,u.r.a(t),", ")+c
return s.charCodeAt(0)==0?s:s},
eF(a,b,c){var t,s
if(A.eY(a))return b+"..."+c
t=new A.b6(b)
B.a.m($.a_,a)
try{s=t
s.a=A.fn(s.a,a,", ")}finally{if(0>=$.a_.length)return A.q($.a_,-1)
$.a_.pop()}t.a+=c
s=t.a
return s.charCodeAt(0)==0?s:s},
iM(a,b){var t,s,r,q,p,o,n,m=a.gE(a),l=0,k=0
while(!0){if(!(l<80||k<3))break
if(!m.t())return
t=A.A(m.gv())
B.a.m(b,t)
l+=t.length+2;++k}if(!m.t()){if(k<=5)return
if(0>=b.length)return A.q(b,-1)
s=b.pop()
if(0>=b.length)return A.q(b,-1)
r=b.pop()}else{q=m.gv();++k
if(!m.t()){if(k<=4){B.a.m(b,A.A(q))
return}s=A.A(q)
if(0>=b.length)return A.q(b,-1)
r=b.pop()
l+=s.length+2}else{p=m.gv();++k
for(;m.t();q=p,p=o){o=m.gv();++k
if(k>100){while(!0){if(!(l>75&&k>3))break
if(0>=b.length)return A.q(b,-1)
l-=b.pop().length+2;--k}B.a.m(b,"...")
return}}r=A.A(q)
s=A.A(p)
l+=s.length+r.length+4}}if(k>b.length+2){l+=5
n="..."}else n=null
while(!0){if(!(l>80&&b.length>3))break
if(0>=b.length)return A.q(b,-1)
l-=b.pop().length+2
if(n==null){l+=5
n="..."}}if(n!=null)B.a.m(b,n)
B.a.m(b,r)
B.a.m(b,s)},
ff(a,b,c,d){var t
if(B.k===c){t=B.c.gA(a)
b=J.ap(b)
return A.eM(A.ax(A.ax($.eC(),t),b))}if(B.k===d){t=B.c.gA(a)
b=J.ap(b)
c=J.ap(c)
return A.eM(A.ax(A.ax(A.ax($.eC(),t),b),c))}t=B.c.gA(a)
b=J.ap(b)
c=J.ap(c)
d=J.ap(d)
d=A.eM(A.ax(A.ax(A.ax(A.ax($.eC(),t),b),c),d))
return d},
e2:function e2(){},
w:function w(){},
be:function be(a){this.a=a},
bE:function bE(){},
as:function as(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
bA:function bA(a,b,c,d,e,f){var _=this
_.e=a
_.f=b
_.a=c
_.b=d
_.c=e
_.d=f},
c_:function c_(a,b,c,d,e){var _=this
_.f=a
_.a=b
_.b=c
_.c=d
_.d=e},
cu:function cu(a){this.a=a},
cs:function cs(a){this.a=a},
bD:function bD(a){this.a=a},
bX:function bX(a){this.a=a},
bC:function bC(){},
e3:function e3(a){this.a=a},
cU:function cU(a){this.a=a},
f:function f(){},
C:function C(a,b,c){this.a=a
this.b=b
this.$ti=c},
bx:function bx(){},
y:function y(){},
b6:function b6(a){this.a=a},
hU(a){return B.a.F(B.aQ,new A.dU(a),new A.dV(a))},
hP(a){return B.a.F(B.aC,new A.dH(a),new A.dI(a))},
bh(a){return B.a.F(B.S,new A.cS(a),new A.cT(a))},
hx(a){return B.a.F(B.aT,new A.d4(a),new A.d5(a))},
hI(a){return B.a.F(B.aJ,new A.dl(a),new A.dm(a))},
he(a){return B.a.F(B.aL,new A.cG(a),new A.cH(a))},
hf(a){return B.a.F(B.aH,new A.cI(a),new A.cJ(a))},
hE(a){return B.a.F(B.aI,new A.df(a),new A.dg(a))},
hy(a){return B.a.F(B.aS,new A.d6(a),new A.d7(a))},
hC(a){return B.a.F(B.aK,new A.db(a),new A.dc(a))},
hV(a){return B.a.F(B.aU,new A.dW(a),new A.dX(a))},
hT(a){return B.a.F(B.aM,new A.dS(a),new A.dT(a))},
i_(a){return B.a.F(B.aR,new A.e0(a),new A.e1(a))},
dB(a){var t=A.h(a.h(0,"id")),s=A.a7(a.h(0,"schema_version")),r=A.h(a.h(0,"question_id")),q=A.hU(A.h(a.h(0,"topic"))),p=u.P,o=A.hQ(p.a(a.h(0,"scene"))),n=J.aX(u.b.a(a.h(0,"actors")),new A.dC(),u.J)
return new A.dA(t,s,r,q,o,A.J(n,!1,n.$ti.i("x.E")),A.hJ(p.a(a.h(0,"question"))),A.hM(p.a(a.h(0,"resolution"))))},
hQ(a){var t,s,r,q,p,o="tram_track",n="markings",m="conditions",l=A.hP(A.h(a.h(0,"type"))),k=u.b,j=J.aX(k.a(a.h(0,"roads")),new A.dJ(),u.L)
j=A.J(j,!1,j.$ti.i("x.E"))
t=a.h(0,o)==null?null:new A.dY(A.hV(A.h(u.P.a(a.h(0,o)).h(0,"along"))))
if(a.h(0,"signs")==null)s=B.aN
else{s=J.aX(k.a(a.h(0,"signs")),new A.dK(),u.c)
s=A.J(s,!1,s.$ti.i("x.E"))}if(a.h(0,n)==null)r=B.aO
else{r=J.aX(k.a(a.h(0,n)),new A.dL(),u.v)
r=A.J(r,!1,r.$ti.i("x.E"))}if(a.h(0,"lights")==null)k=B.aP
else{k=J.aX(k.a(a.h(0,"lights")),new A.dM(),u.h)
k=A.J(k,!1,k.$ti.i("x.E"))}if(a.h(0,m)==null)q=null
else{q=u.P.a(a.h(0,m))
p=q.h(0,"time")==null?B.w:A.hT(A.h(q.h(0,"time")))
q=new A.bY(p,q.h(0,"weather")==null?B.y:A.i_(A.h(q.h(0,"weather"))))}return new A.dE(l,j,t,s,r,k,q)},
hJ(a){var t,s=u.N
s=u.P.a(a.h(0,"text")).R(0,new A.dp(),s,s)
t=J.aX(u.b.a(a.h(0,"options")),new A.dq(),u.f)
return new A.dn(s,A.J(t,!1,t.$ti.i("x.E")),A.h(a.h(0,"correct")))},
hD(a){var t="refers_to",s=A.h(a.h(0,"id")),r=a.h(0,t)==null?null:A.h(a.h(0,t)),q=u.N
return new A.ab(s,r,u.P.a(a.h(0,"label")).R(0,new A.de(),q,q))},
hM(a){var t,s,r="wrong_outcomes",q=u.N,p=J.aX(u.b.a(a.h(0,"order")),new A.dv(),q)
p=A.J(p,!1,p.$ti.i("x.E"))
t=u.P
s=A.hO(t.a(a.h(0,"rule")))
return new A.du(p,s,a.h(0,r)==null?B.aZ:t.a(a.h(0,r)).R(0,new A.dw(),q,u.B))},
hO(a){var t=u.N
return new A.dy(A.h(a.h(0,"code")),u.P.a(a.h(0,"text")).R(0,new A.dz(),t,t))},
I:function I(a,b,c){this.c=a
this.a=b
this.b=c},
dU:function dU(a){this.a=a},
dV:function dV(a){this.a=a},
H:function H(a,b,c){this.c=a
this.a=b
this.b=c},
dH:function dH(a){this.a=a},
dI:function dI(a){this.a=a},
U:function U(a,b,c){this.c=a
this.a=b
this.b=c},
cS:function cS(a){this.a=a},
cT:function cT(a){this.a=a},
Q:function Q(a,b,c){this.c=a
this.a=b
this.b=c},
d4:function d4(a){this.a=a},
d5:function d5(a){this.a=a},
ag:function ag(a,b,c){this.c=a
this.a=b
this.b=c},
dl:function dl(a){this.a=a},
dm:function dm(a){this.a=a},
S:function S(a,b,c){this.c=a
this.a=b
this.b=c},
cG:function cG(a){this.a=a},
cH:function cH(a){this.a=a},
ar:function ar(a,b,c){this.c=a
this.a=b
this.b=c},
cI:function cI(a){this.a=a},
cJ:function cJ(a){this.a=a},
a2:function a2(a,b,c){this.c=a
this.a=b
this.b=c},
df:function df(a){this.a=a},
dg:function dg(a){this.a=a},
Y:function Y(a,b,c){this.c=a
this.a=b
this.b=c},
d6:function d6(a){this.a=a},
d7:function d7(a){this.a=a},
N:function N(a,b,c){this.c=a
this.a=b
this.b=c},
db:function db(a){this.a=a},
dc:function dc(a){this.a=a},
ay:function ay(a,b,c){this.c=a
this.a=b
this.b=c},
dW:function dW(a){this.a=a},
dX:function dX(a){this.a=a},
ai:function ai(a,b,c){this.c=a
this.a=b
this.b=c},
dS:function dS(a){this.a=a},
dT:function dT(a){this.a=a},
ad:function ad(a,b,c){this.c=a
this.a=b
this.b=c},
e0:function e0(a){this.a=a},
e1:function e1(a){this.a=a},
dA:function dA(a,b,c,d,e,f,g,h){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f
_.r=g
_.w=h},
dC:function dC(){},
dD:function dD(){},
dE:function dE(a,b,c,d,e,f,g){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f
_.r=g},
dJ:function dJ(){},
dK:function dK(){},
dL:function dL(){},
dM:function dM(){},
dN:function dN(){},
dO:function dO(){},
dP:function dP(){},
dQ:function dQ(){},
aw:function aw(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
dY:function dY(a){this.a=a},
ah:function ah(a,b){this.a=a
this.b=b},
a6:function a6(a,b){this.a=a
this.b=b},
aj:function aj(a,b){this.a=a
this.b=b},
bY:function bY(a,b){this.a=a
this.b=b},
a0:function a0(a,b,c,d,e,f,g){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f
_.r=g},
dn:function dn(a,b,c){this.a=a
this.b=b
this.c=c},
dp:function dp(){},
dq:function dq(){},
dr:function dr(){},
ab:function ab(a,b,c){this.a=a
this.b=b
this.c=c},
de:function de(){},
du:function du(a,b,c){this.a=a
this.b=b
this.c=c},
dv:function dv(){},
dw:function dw(){},
dx:function dx(){},
dy:function dy(a,b){this.a=a
this.b=b},
dz:function dz(){},
ac:function ac(a,b){this.a=a
this.b=b},
ds(a,b,c){var t=a.a,s=a.b
return new A.cl(t-b,s-c,t+b,s+c)},
cR(a){var t
switch(a.a){case 0:t=B.bW
break
case 1:t=B.bV
break
case 2:t=B.bX
break
case 3:t=B.c0
break
case 4:t=B.bY
break
case 5:t=B.c1
break
case 6:t=B.bZ
break
case 7:t=B.c_
break
default:t=null}return t},
ho(a){var t
switch(a.a){case 0:t=B.e
break
case 1:t=B.d
break
case 2:t=B.J
break
case 3:t=B.E
break
case 4:t=B.I
break
case 7:t=B.F
break
case 5:t=B.H
break
case 6:t=B.G
break
default:t=null}return t},
cE(a,b,c,d){var t=b.gal().q(0,c/2),s=b.gal(),r=new A.e(-s.b,s.a).q(0,d/2)
return A.c([a.u(0,t).u(0,r),a.p(0,t).u(0,r),a.p(0,t).p(0,r),a.u(0,t).p(0,r)],u.j)},
ef(a,b,c){var t=b.u(0,a),s=c.u(0,a),r=t.a*s.b-t.b*s.a
if(r>1e-9)return 1
if(r<-1e-9)return-1
return 0},
ee(a,b,c){var t=c.a,s=a.a,r=b.a,q=!1
if(t>=Math.min(s,r)-1e-9)if(t<=Math.max(s,r)+1e-9){t=c.b
s=a.b
r=b.b
t=t>=Math.min(s,r)-1e-9&&t<=Math.max(s,r)+1e-9}else t=q
else t=q
return t},
jt(a,b,c,d){var t=A.ef(a,b,c),s=A.ef(a,b,d),r=A.ef(c,d,a),q=A.ef(c,d,b)
if(t!==s&&r!==q)return!0
if(t===0&&A.ee(a,b,c))return!0
if(s===0&&A.ee(a,b,d))return!0
if(r===0&&A.ee(c,d,a))return!0
if(q===0&&A.ee(c,d,b))return!0
return!1},
jn(a,b){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e
for(t=[a,b],s=u.b4,r=0;r<2;++r){q=t[r]
for(p=0;o=q.length,p<o;p=n){n=p+1
o=q[n%o]
m=s.a(q[p])
l=o.a-m.a
m=-(o.b-m.b)
if(Math.sqrt(m*m+l*l)<1e-12)continue
for(o=a.length,k=1/0,j=-1/0,i=0;i<o;++i){h=a[i]
g=h.a*m+h.b*l
if(g<k)k=g
if(g>j)j=g}for(o=b.length,f=1/0,e=-1/0,i=0;i<o;++i){h=b[i]
g=h.a*m+h.b*l
if(g<f)f=g
if(g>e)e=g}if(j<=f+1e-9||e<=k+1e-9)return!1}}return!0},
e:function e(a,b){this.a=a
this.b=b},
cl:function cl(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
cW(a){var t,s,r,q,p,o,n,m,l,k,j,i,h,g=A.G(u.R,u.d1)
for(t=a.b,s=t.length,r=0;r<t.length;t.length===s||(0,A.v)(t),++r){q=t[r]
p=q.a
o=A.cR(p)
n=q.b
m=q.c
l=Math.max((n+m)*60/2,Math.max(n,m)*60)
k=A.cR(p)
n=k.a
if(n!==0)j=Math.min(1/0,500/Math.abs(n))
else j=1/0
n=k.b
if(n!==0)j=Math.min(j,500/Math.abs(n))
g.k(0,p,new A.cm(q,o,new A.e(-o.b,o.a),l,j))}for(t=g.ga9(),s=A.o(t),t=new A.Z(J.aq(t.a),t.b,s.i("Z<1,2>")),s=s.y[1],i=0,h=0;t.t();){p=t.a
if(p==null)p=s.a(p)
n=p.a.a
n=n===B.d||n===B.e
p=p.d
if(n)i=Math.max(i,p)
else h=Math.max(h,p)}if(i===0)i=h
return new A.cV(a,g,A.ds(B.j,i,h===0?i:h))},
aD(a){var t
switch(a.a){case 0:t=B.B
break
case 7:t=B.B
break
case 1:t=B.a9
break
case 2:t=B.ab
break
case 3:t=B.aa
break
case 4:t=B.ae
break
case 5:t=B.ad
break
case 6:t=B.ac
break
default:t=null}return t},
ju(a,b){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f=A.c([],u.U)
for(t=b.length,s=a.c,r=(s.c-s.a)/2,q=a.b,s=(s.d-s.b)/2,p=0;p<b.length;b.length===t||(0,A.v)(b),++p){o=b[p]
n=o.d
m=q.h(0,n)
if(m==null)A.r(A.a4("scene has no road facing "+n.j(0)))
l=A.aD(o.b)
k=n===B.d||n===B.e?s:r
j=k+(a.Z(n)?78:10)+14+l.a/2
k=o.f
i=m.b
h=i.a
i=i.b
g=m.c
k=-(k+0.5)*60
f.push(new A.aY(o,new A.e(500+h*j+g.a*k,500+i*j+g.b*k),new A.e(-h,-i),l))}return f},
cm:function cm(a,b,c,d,e){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e},
cV:function cV(a,b,c){this.a=a
this.b=b
this.c=c},
cX:function cX(a){this.a=a},
ae:function ae(a,b){this.a=a
this.b=b},
aY:function aY(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
eD(a,b,a0){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d=u.N,c=A.G(d,u.J)
for(t=b.length,s=0;r=b.length,s<r;b.length===t||(0,A.v)(b),++s){q=b[s]
c.k(0,q.a,q)}t=A.G(d,u.k)
for(s=0;p=b.length,s<p;b.length===r||(0,A.v)(b),++s){q=b[s]
t.k(0,q.a,A.h0(a,q))}r=u.i
o=A.G(d,r)
for(s=0;s<b.length;b.length===p||(0,A.v)(b),++s){q=b[s]
n=q.a
m=t.h(0,n).d-14-A.aD(q.b).a/2
o.k(0,n,m<0?0:m)}p=A.M(a0)
p=A.J(new A.aR(a0,p.i("k(1)").a(c.gbd()),p.i("aR<1>")),!0,d)
n=A.M(b)
l=n.i("z<1,b>")
B.a.G(p,new A.z(b,n.i("b(1)").a(new A.cN()),l).aU(0,l.i("k(x.E)").a(new A.cO(a0))))
k=A.G(d,r)
for(j=0;j<p.length;++j){i=p[j]
for(h=0,g=0;g<j;++g){if(!(g<p.length))return A.q(p,g)
f=p[g]
d=t.h(0,i)
d.toString
r=t.h(0,f)
r.toString
if(!A.f0(d,r))continue
d=t.h(0,f)
d.toString
r=o.h(0,f)
r.toString
n=k.h(0,f)
n.toString
e=new A.bt(r,n).an(d.f+A.aD(c.h(0,f).b).a/2)+0.4
if(e>h)h=e}k.k(0,i,h)}return A.f7(a,b,k)},
f7(a,b,c){var t,s,r,q,p,o,n,m,l,k=u.N,j=A.G(k,u.k)
for(t=b.length,s=0;r=b.length,s<r;b.length===t||(0,A.v)(b),++s){q=b[s]
j.k(0,q.a,A.h0(a,q))}k=A.G(k,u.bK)
for(s=0;t=b.length,s<t;b.length===r||(0,A.v)(b),++s){q=b[s]
t=q.a
p=j.h(0,t).d-14-A.aD(q.b).a/2
o=p<0?0:p
n=c.h(0,t)
k.k(0,t,new A.bt(o,n==null?0:n))}for(m=0,s=0;s<b.length;b.length===t||(0,A.v)(b),++s){q=b[s]
r=q.a
o=k.h(0,r)
o.toString
l=o.an(B.a.gJ(j.h(0,r).c.b)+A.aD(q.b).a/2)
if(l>m)m=l}return new A.cM(k,j,m)},
f0(a,b){var t,s,r,q,p,o,n=A.fE(a),m=A.fE(b)
for(t=n.length-1,s=m.length-1,r=0;r<t;r=q)for(q=r+1,p=0;p<s;p=o){o=p+1
if(A.jt(n[r],n[q],m[p],m[o]))return!0}return!1},
fE(a){var t,s,r,q,p=A.c([],u.j)
for(t=a.c,s=a.e,r=a.f-s,q=0;q<=24;++q)p.push(t.aM(s+r*q/24))
return p},
cM:function cM(a,b,c){this.a=a
this.b=b
this.c=c},
cN:function cN(){},
cO:function cO(a){this.a=a},
hg(a){var t,s,r,q,p,o,n,m,l,k=A.c([],u.j)
for(t=0;t<3;++t){s=a[t]
r=s.gab()
q=k.length===0?0:1
for(;q<=r;++q)B.a.m(k,s.ah(q/r))}p=A.c([0],u.n)
for(q=1;q<k.length;++q){o=q-1
if(!(o<p.length))return A.q(p,o)
n=p[o]
m=k[q]
o=k[o]
l=m.a-o.a
o=m.b-o.b
B.a.m(p,n+Math.sqrt(l*l+o*o))}return new A.cK(k,p)},
aG:function aG(){},
av:function av(a,b){this.a=a
this.b=b},
cj:function cj(a,b,c){this.a=a
this.b=b
this.c=c},
b1:function b1(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
cK:function cK(a,b){this.a=a
this.b=b},
iT(a){if(a<=0)return 0
if(a>=1)return 1
return a*a*a*(a*(a*6-15)+10)},
i8(){var t,s,r,q,p,o,n,m=new A.e9(),l=A.c([0],u.n)
for(t=0,s=1;s<=64;++s){r=(s-1)*0.015625
q=s*0.015625
p=m.$1(r)
o=m.$1((r+q)/2)
if(typeof o!=="number")return A.eW(o)
if(typeof p!=="number")return p.p()
n=m.$1(q)
if(typeof n!=="number")return A.eW(n)
t+=(q-r)/6*(p+4*o+n)*0.9
B.a.m(l,t)}return new A.e8(l,t)},
e8:function e8(a,b){this.a=a
this.b=b},
e9:function e9(){},
bt:function bt(a,b){this.a=a
this.b=b},
j1(a){var t,s,r,q,p=A.G(u.N,u.cm)
for(t=a.r.b,s=t.length,r=0;r<t.length;t.length===s||(0,A.v)(t),++r){q=t[r]
p.k(0,q.a,A.fR(a,q))}return p},
fR(a,a0){var t,s,r,q,p,o,n,m,l,k,j=null,i=A.cW(a.e),h=a.f,g=B.a.F(h,new A.ei(),new A.ej(a)),f=a.w.a,e=A.eD(i,h,f),d=g.a,c=e.am(d).b,b=a0.b
if(b===d)t=0
else t=b!=null?A.fO(e,g,b):A.iY(e,g,h)
s=A.G(u.N,u.i)
for(r=h.length,q=e.a,p=0;p<h.length;h.length===r||(0,A.v)(h),++p){o=h[p].a
if(o===d)n=t
else{m=q.h(0,o)
if(m==null)A.r(A.a4('no motion profile for actor "'+o+'"'))
n=m.b}s.k(0,o,n)}l=A.eK(A.f7(i,h,s),h)
s=l.c
if(s!=null){k=s.b
if(k===d)k=s.c
return new A.aN(a0.a,B.X,s,k,l)}if(t<c-0.000001)return new A.aN(a0.a,B.W,j,A.iQ(e,f,g),l)
if(t>c+0.000001)return new A.aN(a0.a,B.V,j,b,l)
return new A.aN(a0.a,j,j,j,l)},
fO(a,b,c){var t,s
if(!A.f0(a.a8(b.a),a.a8(c)))return 0
t=a.a8(c)
s=A.aD(t.a.b)
return a.am(c).an(t.f+s.a/2)+0.4},
iY(a,b,c){var t,s,r,q,p,o
for(t=c.length,s=b.a,r=0,q=0;q<c.length;c.length===t||(0,A.v)(c),++q){p=c[q].a
if(p===s)continue
o=A.fO(a,b,p)
if(o>r)r=o}return r},
iQ(a,b,c){var t,s,r,q,p,o,n,m,l='no trajectory for actor "'
for(t=b.length,s=a.b,r=c.a,q=l+r+'"',p=0;p<b.length;b.length===t||(0,A.v)(b),++p){o=b[p]
if(J.bc(o,r))break
n=s.h(0,r)
if(n==null)A.r(A.a4(q))
A.h(o)
m=s.h(0,o)
if(m==null)A.r(A.a4(l+o+'"'))
if(A.f0(n,m))return o}return null},
aN:function aN(a,b,c,d,e){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e},
ei:function ei(){},
ej:function ej(a){this.a=a},
eK(a,b){var t=A.hR(a,b)
return new A.dj(a,b,t.a,t.b)},
dj:function dj(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
hR(a7,a8){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1,a2,a3,a4=a7.c,a5=B.c.bc(a4*60),a6=A.G(u.N,u.i)
for(t=a8.length,s=0;s<a8.length;a8.length===t||(0,A.v)(a8),++s){r=a8[s]
q=r.a
p=r.b
o=A.aD(p).a
p=A.aD(p).b
a6.k(0,q,Math.sqrt(o*o+p*p)/2)}for(t=a7.b,q=a7.a,p=u.U,n=0;n<=a5;++n){m=n*0.016666666666666666
o=A.c([],p)
for(l=a8.length,s=0;s<a8.length;a8.length===l||(0,A.v)(a8),++s){r=a8[s]
k=r.a
j=q.h(0,k)
if(j==null)A.r(A.a4('no motion profile for actor "'+k+'"'))
i=j.Y(m)
h=t.h(0,k)
if(h==null)A.r(A.a4('no trajectory for actor "'+k+'"'))
if(!(i>=B.a.gJ(h.c.b)-1e-9))o.push(a7.aN(r,m))}for(g=0;g<o.length;g=f)for(f=g+1,e=f;l=o.length,e<l;++e){if(!(g<l))return A.q(o,g)
r=o[g]
d=o[e]
l=r.b
k=d.b
i=l.a
h=k.a
c=i-h
b=l.b
a=k.b
a0=b-a
a1=Math.sqrt(c*c+a0*a0)
c=r.a.a
a0=a6.h(0,c)
a0.toString
a2=d.a.a
a3=a6.h(0,a2)
a3.toString
if(a1>a0+a3)continue
a0=r.d
a3=d.d
if(A.jn(A.cE(l,r.c,a0.a,a0.b),A.cE(k,d.c,a3.a,a3.b)))return new A.co(new A.cP(n,c,a2,new A.e((i+h)*0.5,(b+a)*0.5)),m)}}return new A.co(null,a4)},
cP:function cP(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
co:function co(a,b){this.a=a
this.b=b},
jm(a,b){var t,s
if(a===b)return B.aY
if(b===A.ho(a))return B.aV
t=A.cR(a)
s=A.cR(b)
return-t.a*s.b- -t.b*s.a>0?B.aX:B.aW},
iR(a,b,c,d){var t=d.b,s=d.a,r=b.a*t-b.b*s
if(Math.abs(r)<1e-9)return null
return a.p(0,b.q(0,((c.a-a.a)*t-(c.b-a.b)*s)/r))},
iN(a,b,c,d,e){var t,s=A.iR(b,c,d,new A.e(-e.a,-e.b))
switch(a.a){case 0:if(d.u(0,b).u(0,c.q(0,d.u(0,b).aG(c))).gn(0)<1e-9)return new A.av(b,d)
t=d.u(0,b).aG(c)/2
return new A.b1(b,b.p(0,c.q(0,t)),d.u(0,e.q(0,t)),d)
case 2:return s==null?new A.av(b,d):new A.cj(b,s,d)
case 1:if(s==null)return new A.av(b,d)
return new A.b1(b,b.p(0,c.q(0,s.u(0,b).gn(0)*0.75)),d.u(0,e.q(0,s.u(0,d).gn(0)*0.75)),d)
case 3:t=d.u(0,b).gn(0)*1.6
return new A.b1(b,b.p(0,c.q(0,t)),d.u(0,e.q(0,t)),d)}},
h0(a,b){var t,s,r,q,p,o,n,m=b.d,l=a.aO(m),k=b.e,j=a.aO(k),i=A.jm(m,k),h=a.a3(m),g=a.a3(k)
k=b.f
t=l.aI(k,l.e)
s=l.aI(k,h)
k=b.r
r=j.aL(k,g)
q=j.aL(k,j.e)
k=l.b
p=A.hg(A.c([new A.av(t,s),A.iN(i,s,new A.e(-k.a,-k.b),r,j.b),new A.av(r,q)],u.w))
o=s.u(0,t).gn(0)
k=B.a.gJ(p.b)
n=q.u(0,r).gn(0)
return new A.cr(b,p,o-(a.aT(m)-h),o,o+(k-o-n))},
b3:function b3(a,b){this.a=a
this.b=b},
cr:function cr(a,b,c,d,e){var _=this
_.a=a
_.c=b
_.d=c
_.e=d
_.f=e},
al:function al(a,b){this.a=a
this.b=b},
T:function T(a,b,c){this.a=a
this.b=b
this.c=c},
fH(a){var t,s,r,q=u.n,p=A.c([],q)
for(t=a.length,s=0;s<a.length;a.length===t||(0,A.v)(a),++s){r=a[s]
B.a.G(p,A.c([r.a,r.b],q))}return p},
aa:function aa(a,b){this.a=a
this.b=b},
O:function O(){},
F:function F(a,b,c,d){var _=this
_.c=a
_.d=b
_.a=c
_.b=d},
L:function L(a,b,c,d,e,f,g){var _=this
_.c=a
_.d=b
_.e=c
_.f=d
_.r=e
_.a=f
_.b=g},
af:function af(a,b,c,d,e){var _=this
_.c=a
_.d=b
_.e=c
_.a=d
_.b=e},
bB:function bB(a,b,c,d,e){var _=this
_.c=a
_.d=b
_.e=c
_.a=d
_.b=e},
br:function br(a,b,c,d,e){var _=this
_.c=a
_.d=b
_.e=c
_.a=d
_.b=e},
b5:function b5(a){this.a=a},
dt:function dt(){},
aC(a,b,c){var t,s,r=new A.ex(a,b,c),q=r.$1(24)
if(typeof q!=="number")return q.ap()
t=r.$1(16)
if(typeof t!=="number")return t.ap()
s=r.$1(8)
if(typeof s!=="number")return s.ap()
r=r.$1(0)
if(typeof r!=="number")return A.eW(r)
return(q<<24|t<<16|s<<8|r)>>>0},
hF(a){var t
switch(a.a){case 0:t=B.b9
break
case 1:t=B.ba
break
case 2:t=B.bb
break
default:t=null}return t},
hG(a){var t,s,r,q,p,o=4290363849,n=a==null?B.al:a,m=A.hF(n.a)
switch(n.b.a){case 0:t=m
break
case 1:t=m.aK(new A.dh()).bf(A.aC(m.b,4280297004,0.45),573785173)
break
case 2:t=A.aC(m.a,4294244346,0.75)
s=A.aC(m.b,4290166470,0.3)
r=A.aC(m.c,4293915639,0.55)
q=A.aC(m.d,o,0.45)
p=A.aC(m.e,o,0.35)
p=m.ai(s,452984831,A.aC(m.f,o,0.35),t,r,q,p)
t=p
break
case 3:t=m.aK(new A.di()).be(1019858643)
break
default:t=null}return t},
ex:function ex(a,b,c){this.a=a
this.b=b
this.c=c},
aO:function aO(a,b,c,d,e,f,g,h,i,j,k,l,m){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f
_.r=g
_.w=h
_.x=i
_.y=j
_.z=k
_.Q=l
_.as=m},
dh:function dh(){},
di:function di(){},
fl(a){var t=A.c([],u.Q),s=A.c([],u.t),r=a.e
return new A.dF(a,A.cW(r),A.hG(r.r),t,s)},
bT:function bT(a,b){this.a=a
this.b=b},
dF:function dF(a,b,c,d,e){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e},
fm(a,b){var t=A.fl(a),s=t.aD(),r=A.J(s.b,!0,u.E)
B.a.G(r,A.iP(b))
return new A.dG(b,t,s.a.a,r)},
iP(a){var t
if(a.c!=null)return B.R
t=a.d
if(t>=4&&t<=9)return B.R
return A.c([new A.T(B.c7,"resolution.order","choreographed playback runs "+B.c.ao(t,1)+"s, outside the 4-9s window")],u.t)},
dG:function dG(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
j9(a){var t,s,r,q=4294441209,p=null,o=4280494126,n=4291570475,m=4280246184,l=a.e/2,k=a.d,j=B.a.gaj(k.split(".")),i=new A.em(a)
switch(k){case"2.1":return A.c([new A.F(i.$3(4,l,-1.5707963267948966),q,B.b,p),new A.F(i.$3(4,l*0.62,-1.5707963267948966),4294099504,B.b,p),new A.L(i.$3(4,l,-1.5707963267948966),o,2,!0,p,B.b,p)],u.Q)
case"2.4":t=i.$3(3,l,1.5707963267948966)
return A.c([new A.F(t,n,B.b,p),new A.F(i.$3(3,l*0.7,1.5707963267948966),q,B.b,p),new A.L(t,o,2,!0,p,B.b,p)],u.Q)
case"2.5":s=i.$3(8,l,0.39269908169872414)
return A.c([new A.F(s,n,B.b,p),new A.L(i.$3(8,l*0.78,0.39269908169872414),q,3,!0,p,B.b,p),new A.L(s,o,2,!0,p,B.b,p)],u.Q)}$label0$1:{if("1"===j){k=A.c([new A.F(i.$3(3,l,-1.5707963267948966),n,B.b,p),new A.F(i.$3(3,l*0.7,-1.5707963267948966),q,B.b,p),new A.L(i.$3(3,l,-1.5707963267948966),o,2,!0,p,B.b,p)],u.Q)
break $label0$1}if("3"===j){k=a.c
k=A.c([new A.af(k,l,n,B.b,p),new A.af(k,l*0.72,q,B.b,p)],u.Q)
break $label0$1}if("4"===j){k=a.c
k=A.c([new A.af(k,l,q,B.b,p),new A.af(k,l*0.88,m,B.b,p)],u.Q)
break $label0$1}if("5"===j||"6"===j){k=a.c
r=l*0.86
r=A.c([new A.F(A.ds(k,l,l).gP(),q,B.b,p),new A.F(A.ds(k,r,r).gP(),m,B.b,p)],u.Q)
k=r
break $label0$1}k=A.c([new A.af(a.c,l,q,B.b,p),new A.L(i.$3(24,l,0),o,2,!0,p,B.b,p)],u.Q)
break $label0$1}return k},
j8(a){var t,s,r,q,p,o,n=a.e,m=n*0.42,l=n*1.05
n=a.c
t=l/2
s=A.c([new A.F(A.ds(n,m/2,t).gP(),4280494126,B.t,null)],u.Q)
r=B.b_.h(0,a.d)
q=m*0.32
for(p=n.a,t=n.b-t,o=0;o<3;++o){n=o===r?B.aG[o]:4282139209
B.a.m(s,new A.af(new A.e(p,t+l*(o+0.5)/3),q,n,B.t,null))}return s},
fT(a){var t,s,r,q,p,o,n=A.c([],u.Q)
for(t=a.gbp(),s=t.length,r=0;r<t.length;t.length===s||(0,A.v)(t),++r){q=t[r]
p=q instanceof A.bB
o=p?q:null
if(p){B.a.G(n,A.j9(o))
continue}p=q instanceof A.br
o=p?q:null
if(p){B.a.G(n,A.j8(o))
continue}B.a.m(n,q)}return new A.b5(n)},
em:function em(a){this.a=a},
j0(a){return A.ed(new A.eh(a))},
j_(a,b){return A.ed(new A.eg(a,b))},
jq(a){return A.ed(new A.eA(a))},
jo(a,b,c){return A.ed(new A.ez(a,b,c))},
ed(a){var t,s,r
try{s=B.i.aH(a.$0(),null)
return s}catch(r){t=A.f1(r)
s=u.N
s=B.i.aH(A.E(["error",J.bd(t)],s,s),null)
return s}},
jk(){var t,s,r,q,p="Attempting to rewrap a JS function.",o=self,n=A.fJ(new A.es()),m=new A.et()
if(typeof m=="function")A.r(A.cL(p))
t=function(a,b){return function(c,d){return a(b,c,d,arguments.length)}}(A.is,m)
s=$.eB()
t[s]=m
m=A.fJ(new A.eu())
r=new A.ev()
if(typeof r=="function")A.r(A.cL(p))
q=function(a,b){return function(c,d,e){return a(b,c,d,e,arguments.length)}}(A.it,r)
q[s]=r
o.__engineRegister.apply(o,[n,t,m,q,"0.1.0"])},
eh:function eh(a){this.a=a},
eg:function eg(a,b){this.a=a
this.b=b},
eA:function eA(a){this.a=a},
ez:function ez(a,b,c){this.a=a
this.b=b
this.c=c},
ey:function ey(a){this.a=a},
es:function es(){},
et:function et(){},
eu:function eu(){},
ev:function ev(){},
jx(a){A.jw(new A.c6("Field '"+a+"' has been assigned during initialization."),new Error())},
fJ(a){var t
if(typeof a=="function")throw A.d(A.cL("Attempting to rewrap a JS function."))
t=function(b,c){return function(d){return b(c,d,arguments.length)}}(A.ir,a)
t[$.eB()]=a
return t},
ir(a,b,c){u.Z.a(a)
if(A.a7(c)>=1)return a.$1(b)
return a.$0()},
is(a,b,c,d){u.Z.a(a)
A.a7(d)
if(d>=2)return a.$2(b,c)
if(d===1)return a.$1(b)
return a.$0()},
it(a,b,c,d,e){u.Z.a(a)
A.a7(e)
if(e>=3)return a.$3(b,c,d)
if(e===2)return a.$2(b,c)
if(e===1)return a.$1(b)
return a.$0()},
js(a){var t,s,r,q,p,o,n,m=A.fl(a),l=m.aD(),k=A.J(l.a.a,!0,u.C)
B.a.G(k,m.aP(A.ju(m.b,m.a.f)))
k=new A.b5(k)
t=A.fT(k)
m=u.Y
s=A.c([],m)
for(r=t.a,q=r.length,p=0;p<r.length;r.length===q||(0,A.v)(r),++p)s.push(r[p].l())
m=A.c([],m)
for(k=new A.bT(k,l.b).b,r=k.length,q=u.N,o=u.z,p=0;p<k.length;k.length===r||(0,A.v)(k),++p){n=k[p]
m.push(A.E(["code",n.a.b,"path",n.b,"detail",n.c],q,o))}return A.E(["id",a.a,"canvas",1000,"ops",s,"warnings",m],q,o)},
fZ(a,b,c){var t,s,r,q,p,o,n,m,l=A.J(a.c,!0,u.C)
B.a.G(l,a.b.aP(a.a.bq(c)))
t=a.d
s=A.fT(new A.b5(l))
l=u.Y
r=A.c([],l)
for(q=s.a,p=q.length,o=0;o<q.length;q.length===p||(0,A.v)(q),++o)r.push(q[o].l())
l=A.c([],l)
for(q=t.length,p=u.N,n=u.z,o=0;o<t.length;t.length===q||(0,A.v)(t),++o){m=t[o]
l.push(A.E(["code",m.a.b,"path",m.b,"detail",m.c],p,n))}return A.E(["id",b,"canvas",1000,"t",c,"ops",r,"warnings",l],p,n)},
jr(a){var t,s,r,q,p,o,n,m,l="duration",k=a.f,j=A.eK(A.eD(A.cW(a.e),k,a.w.a),k),i=A.j1(a)
k=u.N
t=u.z
s=A.G(k,t)
s.k(0,"id",a.a)
s.k(0,l,j.d)
r=j.c
if(r!=null)s.k(0,"collision",r.l())
r=A.G(k,u.P)
for(q=i.gbi(),q=q.gE(q);q.t();){p=q.gv()
o=p.a
p=p.b
n=p.l()
m=A.hz(k,t)
m.G(0,n)
m.k(0,l,p.e.d)
r.k(0,o,m)}s.k(0,"options",r)
return s}},B={}
var w=[A,J,B]
var $={}
A.eG.prototype={}
J.c0.prototype={
N(a,b){return a===b},
gA(a){return A.bz(a)},
j(a){return"Instance of '"+A.dk(a)+"'"},
gB(a){return A.aU(A.eQ(this))}}
J.c1.prototype={
j(a){return String(a)},
gA(a){return a?519018:218159},
gB(a){return A.aU(u.y)},
$ip:1,
$ik:1}
J.bm.prototype={
N(a,b){return null==b},
j(a){return"null"},
gA(a){return 0},
$ip:1}
J.c3.prototype={}
J.aK.prototype={
gA(a){return 0},
j(a){return String(a)}}
J.ci.prototype={}
J.bF.prototype={}
J.au.prototype={
j(a){var t=a[$.eB()]
if(t==null)return this.aV(a)
return"JavaScript function for "+J.bd(t)},
$iaH:1}
J.bo.prototype={
gA(a){return 0},
j(a){return String(a)}}
J.bp.prototype={
gA(a){return 0},
j(a){return String(a)}}
J.l.prototype={
m(a,b){A.M(a).c.a(b)
if(!!a.fixed$length)A.r(A.aQ("add"))
a.push(b)},
G(a,b){var t
A.M(a).i("f<1>").a(b)
if(!!a.fixed$length)A.r(A.aQ("addAll"))
if(Array.isArray(b)){this.aW(a,b)
return}for(t=J.aq(b);t.t();)a.push(t.gv())},
aW(a,b){var t,s
u.m.a(b)
t=b.length
if(t===0)return
if(a===b)throw A.d(A.aF(a))
for(s=0;s<t;++s)a.push(b[s])},
aF(a){if(!!a.fixed$length)A.r(A.aQ("clear"))
a.length=0},
a_(a,b,c){var t=A.M(a)
return new A.z(a,t.C(c).i("1(2)").a(b),t.i("@<1>").C(c).i("z<1,2>"))},
F(a,b,c){var t,s,r,q=A.M(a)
q.i("k(1)").a(b)
q.i("1()?").a(c)
t=a.length
for(s=0;s<t;++s){r=a[s]
if(A.eT(b.$1(r)))return r
if(a.length!==t)throw A.d(A.aF(a))}if(c!=null)return c.$0()
throw A.d(A.eE())},
bj(a,b){return this.F(a,b,null)},
L(a,b){if(!(b<a.length))return A.q(a,b)
return a[b]},
gaj(a){if(a.length>0)return a[0]
throw A.d(A.eE())},
gJ(a){var t=a.length
if(t>0)return a[t-1]
throw A.d(A.eE())},
bb(a,b){var t,s
A.M(a).i("k(1)").a(b)
t=a.length
for(s=0;s<t;++s){if(A.eT(b.$1(a[s])))return!0
if(a.length!==t)throw A.d(A.aF(a))}return!1},
aS(a,b){var t,s,r,q,p,o=A.M(a)
o.i("a(1,1)?").a(b)
if(!!a.immutable$list)A.r(A.aQ("sort"))
t=a.length
if(t<2)return
if(t===2){s=a[0]
r=a[1]
o=b.$2(s,r)
if(typeof o!=="number")return o.bw()
if(o>0){a[0]=r
a[1]=s}return}q=0
if(o.c.b(null))for(p=0;p<a.length;++p)if(a[p]===void 0){a[p]=null;++q}a.sort(A.j3(b,2))
if(q>0)this.b7(a,q)},
b7(a,b){var t,s=a.length
for(;t=s-1,s>0;s=t)if(a[t]===null){a[t]=void 0;--b
if(b===0)break}},
O(a,b){var t
for(t=0;t<a.length;++t)if(J.bc(a[t],b))return!0
return!1},
gaJ(a){return a.length!==0},
j(a){return A.eF(a,"[","]")},
gE(a){return new J.aE(a,a.length,A.M(a).i("aE<1>"))},
gA(a){return A.bz(a)},
gn(a){return a.length},
h(a,b){if(!(b>=0&&b<a.length))throw A.d(A.ek(a,b))
return a[b]},
k(a,b,c){A.M(a).c.a(c)
if(!!a.immutable$list)A.r(A.aQ("indexed set"))
if(!(b>=0&&b<a.length))throw A.d(A.ek(a,b))
a[b]=c},
$ij:1,
$if:1,
$in:1}
J.cZ.prototype={}
J.aE.prototype={
gv(){var t=this.d
return t==null?this.$ti.c.a(t):t},
t(){var t,s=this,r=s.a,q=r.length
if(s.b!==q){r=A.v(r)
throw A.d(r)}t=s.c
if(t>=q){s.sau(null)
return!1}s.sau(r[t]);++s.c
return!0},
sau(a){this.d=this.$ti.i("1?").a(a)},
$ia9:1}
J.bn.prototype={
W(a,b){var t
A.il(b)
if(a<b)return-1
else if(a>b)return 1
else if(a===b){if(a===0){t=this.ga7(b)
if(this.ga7(a)===t)return 0
if(this.ga7(a))return-1
return 1}return 0}else if(isNaN(a)){if(isNaN(b))return 0
return 1}else return-1},
ga7(a){return a===0?1/a<0:a<0},
bc(a){var t,s
if(a>=0){if(a<=2147483647){t=a|0
return a===t?t:t+1}}else if(a>=-2147483648)return a|0
s=Math.ceil(a)
if(isFinite(s))return s
throw A.d(A.aQ(""+a+".ceil()"))},
bk(a){var t,s
if(a>=0){if(a<=2147483647)return a|0}else if(a>=-2147483648){t=a|0
return a===t?t:t-1}s=Math.floor(a)
if(isFinite(s))return s
throw A.d(A.aQ(""+a+".floor()"))},
br(a){if(a>0){if(a!==1/0)return Math.round(a)}else if(a>-1/0)return 0-Math.round(0-a)
throw A.d(A.aQ(""+a+".round()"))},
aE(a,b,c){if(B.f.W(b,c)>0)throw A.d(A.fQ(b))
if(this.W(a,b)<0)return b
if(this.W(a,c)>0)return c
return a},
ao(a,b){var t
if(b>20)throw A.d(A.ck(b,0,20,"fractionDigits",null))
t=a.toFixed(b)
if(a===0&&this.ga7(a))return"-"+t
return t},
j(a){if(a===0&&1/a<0)return"-0.0"
else return""+a},
gA(a){var t,s,r,q,p=a|0
if(a===p)return p&536870911
t=Math.abs(a)
s=Math.log(t)/0.6931471805599453|0
r=Math.pow(2,s)
q=t<1?t/r:r/t
return((q*9007199254740992|0)+(q*3542243181176521|0))*599197+s*1259&536870911},
a2(a,b){var t
if(a>0)t=this.aB(a,b)
else{t=b>31?31:b
t=a>>t>>>0}return t},
aB(a,b){return b>31?0:a>>>b},
gB(a){return A.aU(u.H)},
$ii:1,
$ibb:1}
J.bl.prototype={
gB(a){return A.aU(u.S)},
$ip:1,
$ia:1}
J.c2.prototype={
gB(a){return A.aU(u.i)},
$ip:1}
J.b2.prototype={
p(a,b){return a+b},
a0(a,b,c){return a.substring(b,A.hL(b,c,a.length))},
j(a){return a},
gA(a){var t,s,r
for(t=a.length,s=0,r=0;r<t;++r){s=s+a.charCodeAt(r)&536870911
s=s+((s&524287)<<10)&536870911
s^=s>>6}s=s+((s&67108863)<<3)&536870911
s^=s>>11
return s+((s&16383)<<15)&536870911},
gB(a){return A.aU(u.N)},
gn(a){return a.length},
$ip:1,
$ifg:1,
$ib:1}
A.c6.prototype={
j(a){return"LateInitializationError: "+this.a}}
A.dR.prototype={}
A.j.prototype={}
A.x.prototype={
gE(a){var t=this
return new A.aL(t,t.gn(t),A.o(t).i("aL<x.E>"))},
gM(a){return this.gn(this)===0},
a_(a,b,c){var t=A.o(this)
return new A.z(this,t.C(c).i("1(x.E)").a(b),t.i("@<x.E>").C(c).i("z<1,2>"))}}
A.aL.prototype={
gv(){var t=this.d
return t==null?this.$ti.c.a(t):t},
t(){var t,s=this,r=s.a,q=J.fV(r),p=q.gn(r)
if(s.b!==p)throw A.d(A.aF(r))
t=s.c
if(t>=p){s.sS(null)
return!1}s.sS(q.L(r,t));++s.c
return!0},
sS(a){this.d=this.$ti.i("1?").a(a)},
$ia9:1}
A.aM.prototype={
gE(a){return new A.Z(J.aq(this.a),this.b,A.o(this).i("Z<1,2>"))},
gn(a){return J.cF(this.a)}}
A.bi.prototype={$ij:1}
A.Z.prototype={
t(){var t=this,s=t.b
if(s.t()){t.sS(t.c.$1(s.gv()))
return!0}t.sS(null)
return!1},
gv(){var t=this.a
return t==null?this.$ti.y[1].a(t):t},
sS(a){this.a=this.$ti.i("2?").a(a)},
$ia9:1}
A.z.prototype={
gn(a){return J.cF(this.a)},
L(a,b){return this.b.$1(J.hc(this.a,b))}}
A.aR.prototype={
gE(a){return new A.bG(J.aq(this.a),this.b,this.$ti.i("bG<1>"))}}
A.bG.prototype={
t(){var t,s
for(t=this.a,s=this.b;t.t();)if(A.eT(s.$1(t.gv())))return!0
return!1},
gv(){return this.a.gv()},
$ia9:1}
A.P.prototype={}
A.bL.prototype={$r:"+(1,2)",$s:1}
A.b_.prototype={
gM(a){return this.gn(this)===0},
j(a){return A.eJ(this)},
R(a,b,c,d){var t=A.G(c,d)
this.H(0,new A.cQ(this,A.o(this).C(c).C(d).i("C<1,2>(3,4)").a(b),t))
return t},
$im:1}
A.cQ.prototype={
$2(a,b){var t=A.o(this.a),s=this.b.$2(t.c.a(a),t.y[1].a(b))
this.c.k(0,s.a,s.b)},
$S(){return A.o(this.a).i("~(1,2)")}}
A.bf.prototype={
gn(a){return this.b.length},
gb3(){var t=this.$keys
if(t==null){t=Object.keys(this.a)
this.$keys=t}return t},
X(a){if(typeof a!="string")return!1
if("__proto__"===a)return!1
return this.a.hasOwnProperty(a)},
h(a,b){if(!this.X(b))return null
return this.b[this.a[b]]},
H(a,b){var t,s,r,q
this.$ti.i("~(1,2)").a(b)
t=this.gb3()
s=this.b
for(r=t.length,q=0;q<r;++q)b.$2(t[q],s[q])}}
A.aS.prototype={
gv(){var t=this.d
return t==null?this.$ti.c.a(t):t},
t(){var t=this,s=t.c
if(s>=t.b){t.sT(null)
return!1}t.sT(t.a[s]);++t.c
return!0},
sT(a){this.d=this.$ti.i("1?").a(a)},
$ia9:1}
A.bk.prototype={
V(){var t=this,s=t.$map
if(s==null){s=new A.aJ(t.$ti.i("aJ<1,2>"))
A.fU(t.a,s)
t.$map=s}return s},
h(a,b){return this.V().h(0,b)},
H(a,b){this.$ti.i("~(1,2)").a(b)
this.V().H(0,b)},
gn(a){return this.V().a}}
A.b0.prototype={}
A.bg.prototype={
gn(a){return this.b},
gE(a){var t,s=this,r=s.$keys
if(r==null){r=Object.keys(s.a)
s.$keys=r}t=r
return new A.aS(t,t.length,s.$ti.i("aS<1>"))},
O(a,b){if(typeof b!="string")return!1
if("__proto__"===b)return!1
return this.a.hasOwnProperty(b)}}
A.aI.prototype={
gn(a){return this.a.length},
gE(a){var t=this.a
return new A.aS(t,t.length,this.$ti.i("aS<1>"))},
V(){var t,s,r,q,p=this,o=p.$map
if(o==null){o=new A.aJ(p.$ti.i("aJ<1,1>"))
for(t=p.a,s=t.length,r=0;r<t.length;t.length===s||(0,A.v)(t),++r){q=t[r]
o.k(0,q,q)}p.$map=o}return o},
O(a,b){return this.V().X(b)}}
A.dZ.prototype={
I(a){var t,s,r=this,q=new RegExp(r.a).exec(a)
if(q==null)return null
t=Object.create(null)
s=r.b
if(s!==-1)t.arguments=q[s+1]
s=r.c
if(s!==-1)t.argumentsExpr=q[s+1]
s=r.d
if(s!==-1)t.expr=q[s+1]
s=r.e
if(s!==-1)t.method=q[s+1]
s=r.f
if(s!==-1)t.receiver=q[s+1]
return t}}
A.by.prototype={
j(a){return"Null check operator used on a null value"}}
A.c4.prototype={
j(a){var t,s=this,r="NoSuchMethodError: method not found: '",q=s.b
if(q==null)return"NoSuchMethodError: "+s.a
t=s.c
if(t==null)return r+q+"' ("+s.a+")"
return r+q+"' on '"+t+"' ("+s.a+")"}}
A.ct.prototype={
j(a){var t=this.a
return t.length===0?"Error":"Error: "+t}}
A.dd.prototype={
j(a){return"Throw of null ('"+(this.a===null?"null":"undefined")+"' from JavaScript)"}}
A.at.prototype={
j(a){var t=this.constructor,s=t==null?null:t.name
return"Closure '"+A.h1(s==null?"unknown":s)+"'"},
$iaH:1,
gbv(){return this},
$C:"$1",
$R:1,
$D:null}
A.bU.prototype={$C:"$0",$R:0}
A.bV.prototype={$C:"$2",$R:2}
A.cq.prototype={}
A.cp.prototype={
j(a){var t=this.$static_name
if(t==null)return"Closure of unknown static method"
return"Closure '"+A.h1(t)+"'"}}
A.aZ.prototype={
N(a,b){if(b==null)return!1
if(this===b)return!0
if(!(b instanceof A.aZ))return!1
return this.$_target===b.$_target&&this.a===b.a},
gA(a){return(A.f_(this.a)^A.bz(this.$_target))>>>0},
j(a){return"Closure '"+this.$_name+"' of "+("Instance of '"+A.dk(this.a)+"'")}}
A.cw.prototype={
j(a){return"Reading static variable '"+this.a+"' during its initialization"}}
A.cn.prototype={
j(a){return"RuntimeError: "+this.a}}
A.cv.prototype={
j(a){return"Assertion failed: "+A.bj(this.a)}}
A.a1.prototype={
gn(a){return this.a},
gM(a){return this.a===0},
gK(){return new A.a5(this,A.o(this).i("a5<1>"))},
ga9(){var t=A.o(this)
return A.fe(new A.a5(this,t.i("a5<1>")),new A.d0(this),t.c,t.y[1])},
X(a){var t,s
if(typeof a=="string"){t=this.b
if(t==null)return!1
return t[a]!=null}else if(typeof a=="number"&&(a&0x3fffffff)===a){s=this.c
if(s==null)return!1
return s[a]!=null}else return this.bm(a)},
bm(a){var t=this.d
if(t==null)return!1
return this.a6(t[this.a5(a)],a)>=0},
G(a,b){A.o(this).i("m<1,2>").a(b).H(0,new A.d_(this))},
h(a,b){var t,s,r,q,p=null
if(typeof b=="string"){t=this.b
if(t==null)return p
s=t[b]
r=s==null?p:s.b
return r}else if(typeof b=="number"&&(b&0x3fffffff)===b){q=this.c
if(q==null)return p
s=q[b]
r=s==null?p:s.b
return r}else return this.bn(b)},
bn(a){var t,s,r=this.d
if(r==null)return null
t=r[this.a5(a)]
s=this.a6(t,a)
if(s<0)return null
return t[s].b},
k(a,b,c){var t,s,r=this,q=A.o(r)
q.c.a(b)
q.y[1].a(c)
if(typeof b=="string"){t=r.b
r.aq(t==null?r.b=r.af():t,b,c)}else if(typeof b=="number"&&(b&0x3fffffff)===b){s=r.c
r.aq(s==null?r.c=r.af():s,b,c)}else r.bo(b,c)},
bo(a,b){var t,s,r,q,p=this,o=A.o(p)
o.c.a(a)
o.y[1].a(b)
t=p.d
if(t==null)t=p.d=p.af()
s=p.a5(a)
r=t[s]
if(r==null)t[s]=[p.ag(a,b)]
else{q=p.a6(r,a)
if(q>=0)r[q].b=b
else r.push(p.ag(a,b))}},
H(a,b){var t,s,r=this
A.o(r).i("~(1,2)").a(b)
t=r.e
s=r.r
for(;t!=null;){b.$2(t.a,t.b)
if(s!==r.r)throw A.d(A.aF(r))
t=t.c}},
aq(a,b,c){var t,s=A.o(this)
s.c.a(b)
s.y[1].a(c)
t=a[b]
if(t==null)a[b]=this.ag(b,c)
else t.b=c},
ag(a,b){var t=this,s=A.o(t),r=new A.d8(s.c.a(a),s.y[1].a(b))
if(t.e==null)t.e=t.f=r
else t.f=t.f.c=r;++t.a
t.r=t.r+1&1073741823
return r},
a5(a){return J.ap(a)&1073741823},
a6(a,b){var t,s
if(a==null)return-1
t=a.length
for(s=0;s<t;++s)if(J.bc(a[s].a,b))return s
return-1},
j(a){return A.eJ(this)},
af(){var t=Object.create(null)
t["<non-identifier-key>"]=t
delete t["<non-identifier-key>"]
return t},
$ieI:1}
A.d0.prototype={
$1(a){var t=this.a,s=A.o(t)
t=t.h(0,s.c.a(a))
return t==null?s.y[1].a(t):t},
$S(){return A.o(this.a).i("2(1)")}}
A.d_.prototype={
$2(a,b){var t=this.a,s=A.o(t)
t.k(0,s.c.a(a),s.y[1].a(b))},
$S(){return A.o(this.a).i("~(1,2)")}}
A.d8.prototype={}
A.a5.prototype={
gn(a){return this.a.a},
gM(a){return this.a.a===0},
gE(a){var t=this.a,s=new A.bs(t,t.r,this.$ti.i("bs<1>"))
s.c=t.e
return s}}
A.bs.prototype={
gv(){return this.d},
t(){var t,s=this,r=s.a
if(s.b!==r.r)throw A.d(A.aF(r))
t=s.c
if(t==null){s.sT(null)
return!1}else{s.sT(t.a)
s.c=t.c
return!0}},
sT(a){this.d=this.$ti.i("1?").a(a)},
$ia9:1}
A.aJ.prototype={
a5(a){return A.j2(a)&1073741823},
a6(a,b){var t,s
if(a==null)return-1
t=a.length
for(s=0;s<t;++s)if(J.bc(a[s].a,b))return s
return-1}}
A.eo.prototype={
$1(a){return this.a(a)},
$S:5}
A.ep.prototype={
$2(a,b){return this.a(a,b)},
$S:29}
A.eq.prototype={
$1(a){return this.a(A.h(a))},
$S:43}
A.aA.prototype={
j(a){return this.aC(!1)},
aC(a){var t,s,r,q,p,o=this.b1(),n=this.aw(),m=(a?""+"Record ":"")+"("
for(t=o.length,s="",r=0;r<t;++r,s=", "){m+=s
q=o[r]
if(typeof q=="string")m=m+q+": "
if(!(r<n.length))return A.q(n,r)
p=n[r]
m=a?m+A.fi(p):m+A.A(p)}m+=")"
return m.charCodeAt(0)==0?m:m},
b1(){var t,s=this.$s
for(;$.ea.length<=s;)B.a.m($.ea,null)
t=$.ea[s]
if(t==null){t=this.b_()
B.a.k($.ea,s,t)}return t},
b_(){var t,s,r,q=this.$r,p=q.indexOf("("),o=q.substring(1,p),n=q.substring(p),m=n==="()"?0:n.replace(/[^,]/g,"").length+1,l=A.c(new Array(m),u.G)
for(t=0;t<m;++t)l[t]=t
if(o!==""){s=o.split(",")
t=s.length
for(r=m;t>0;){--r;--t
B.a.k(l,r,s[t])}}return A.fd(l,u.K)}}
A.b7.prototype={
aw(){return[this.a,this.b]},
N(a,b){if(b==null)return!1
return b instanceof A.b7&&this.$s===b.$s&&J.bc(this.a,b.a)&&J.bc(this.b,b.b)},
gA(a){return A.ff(this.$s,this.a,this.b,B.k)}}
A.c7.prototype={
gB(a){return B.bJ},
$ip:1}
A.ce.prototype={}
A.c8.prototype={
gB(a){return B.bK},
$ip:1}
A.b4.prototype={
gn(a){return a.length},
$iX:1}
A.bu.prototype={
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ij:1,
$if:1,
$in:1}
A.bv.prototype={$ij:1,$if:1,$in:1}
A.c9.prototype={
gB(a){return B.bL},
$ip:1}
A.ca.prototype={
gB(a){return B.bM},
$ip:1}
A.cb.prototype={
gB(a){return B.bN},
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ip:1}
A.cc.prototype={
gB(a){return B.bO},
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ip:1}
A.cd.prototype={
gB(a){return B.bP},
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ip:1}
A.cf.prototype={
gB(a){return B.bR},
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ip:1}
A.cg.prototype={
gB(a){return B.bS},
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ip:1}
A.bw.prototype={
gB(a){return B.bT},
gn(a){return a.length},
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ip:1}
A.ch.prototype={
gB(a){return B.bU},
gn(a){return a.length},
h(a,b){A.aT(b,a,a.length)
return a[b]},
$ip:1}
A.bH.prototype={}
A.bI.prototype={}
A.bJ.prototype={}
A.bK.prototype={}
A.a3.prototype={
i(a){return A.bQ(v.typeUniverse,this,a)},
C(a){return A.fA(v.typeUniverse,this,a)}}
A.cy.prototype={}
A.cB.prototype={
j(a){return A.V(this.a,null)}}
A.cx.prototype={
j(a){return this.a}}
A.bM.prototype={}
A.u.prototype={
gE(a){return new A.aL(a,this.gn(a),A.ba(a).i("aL<u.E>"))},
L(a,b){return this.h(a,b)},
gaJ(a){return this.gn(a)!==0},
a_(a,b,c){var t=A.ba(a)
return new A.z(a,t.C(c).i("1(u.E)").a(b),t.i("@<u.E>").C(c).i("z<1,2>"))},
j(a){return A.eF(a,"[","]")}}
A.t.prototype={
H(a,b){var t,s,r,q=A.o(this)
q.i("~(t.K,t.V)").a(b)
for(t=this.gK(),t=t.gE(t),q=q.i("t.V");t.t();){s=t.gv()
r=this.h(0,s)
b.$2(s,r==null?q.a(r):r)}},
gbi(){return this.gK().a_(0,new A.d9(this),A.o(this).i("C<t.K,t.V>"))},
R(a,b,c,d){var t,s,r,q,p,o=A.o(this)
o.C(c).C(d).i("C<1,2>(t.K,t.V)").a(b)
t=A.G(c,d)
for(s=this.gK(),s=s.gE(s),o=o.i("t.V");s.t();){r=s.gv()
q=this.h(0,r)
p=b.$2(r,q==null?o.a(q):q)
t.k(0,p.a,p.b)}return t},
gn(a){var t=this.gK()
return t.gn(t)},
gM(a){var t=this.gK()
return t.gM(t)},
j(a){return A.eJ(this)},
$im:1}
A.d9.prototype={
$1(a){var t=this.a,s=A.o(t)
s.i("t.K").a(a)
t=t.h(0,a)
if(t==null)t=s.i("t.V").a(t)
return new A.C(a,t,s.i("C<t.K,t.V>"))},
$S(){return A.o(this.a).i("C<t.K,t.V>(t.K)")}}
A.da.prototype={
$2(a,b){var t,s=this.a
if(!s.a)this.b.a+=", "
s.a=!1
s=this.b
t=A.A(a)
t=s.a+=t
s.a=t+": "
t=A.A(b)
s.a+=t},
$S:6}
A.aP.prototype={
j(a){return A.eF(this,"{","}")},
$ij:1,
$if:1}
A.cz.prototype={
h(a,b){var t,s=this.b
if(s==null)return this.c.h(0,b)
else if(typeof b!="string")return null
else{t=s[b]
return typeof t=="undefined"?this.b6(b):t}},
gn(a){return this.b==null?this.c.a:this.a1().length},
gM(a){return this.gn(0)===0},
gK(){if(this.b==null){var t=this.c
return new A.a5(t,A.o(t).i("a5<1>"))}return new A.cA(this)},
H(a,b){var t,s,r,q,p=this
u.cQ.a(b)
if(p.b==null)return p.c.H(0,b)
t=p.a1()
for(s=0;s<t.length;++s){r=t[s]
q=p.b[r]
if(typeof q=="undefined"){q=A.ec(p.a[r])
p.b[r]=q}b.$2(r,q)
if(t!==p.c)throw A.d(A.aF(p))}},
a1(){var t=u.aL.a(this.c)
if(t==null)t=this.c=A.c(Object.keys(this.a),u.s)
return t},
b6(a){var t
if(!Object.prototype.hasOwnProperty.call(this.a,a))return null
t=A.ec(this.a[a])
return this.b[a]=t}}
A.cA.prototype={
gn(a){return this.a.gn(0)},
L(a,b){var t=this.a
if(t.b==null)t=t.gK().L(0,b)
else{t=t.a1()
if(!(b<t.length))return A.q(t,b)
t=t[b]}return t},
gE(a){var t=this.a
if(t.b==null){t=t.gK()
t=t.gE(t)}else{t=t.a1()
t=new J.aE(t,t.length,A.M(t).i("aE<1>"))}return t}}
A.bW.prototype={}
A.bZ.prototype={}
A.bq.prototype={
j(a){var t=A.bj(this.a)
return(this.b!=null?"Converting object to an encodable object failed:":"Converting object did not return an encodable object:")+" "+t}}
A.c5.prototype={
j(a){return"Cyclic error in JSON stringify"}}
A.d1.prototype={
a4(a,b){var t=A.iO(a,this.gbg().a)
return t},
aH(a,b){var t=A.i1(a,this.gbh().b,null)
return t},
gbh(){return B.aq},
gbg(){return B.ap}}
A.d3.prototype={}
A.d2.prototype={}
A.e6.prototype={
aR(a){var t,s,r,q,p,o,n=a.length
for(t=this.c,s=0,r=0;r<n;++r){q=a.charCodeAt(r)
if(q>92){if(q>=55296){p=q&64512
if(p===55296){o=r+1
o=!(o<n&&(a.charCodeAt(o)&64512)===56320)}else o=!1
if(!o)if(p===56320){p=r-1
p=!(p>=0&&(a.charCodeAt(p)&64512)===55296)}else p=!1
else p=!0
if(p){if(r>s)t.a+=B.l.a0(a,s,r)
s=r+1
p=A.K(92)
t.a+=p
p=A.K(117)
t.a+=p
p=A.K(100)
t.a+=p
p=q>>>8&15
p=A.K(p<10?48+p:87+p)
t.a+=p
p=q>>>4&15
p=A.K(p<10?48+p:87+p)
t.a+=p
p=q&15
p=A.K(p<10?48+p:87+p)
t.a+=p}}continue}if(q<32){if(r>s)t.a+=B.l.a0(a,s,r)
s=r+1
p=A.K(92)
t.a+=p
switch(q){case 8:p=A.K(98)
t.a+=p
break
case 9:p=A.K(116)
t.a+=p
break
case 10:p=A.K(110)
t.a+=p
break
case 12:p=A.K(102)
t.a+=p
break
case 13:p=A.K(114)
t.a+=p
break
default:p=A.K(117)
t.a+=p
p=A.K(48)
t.a+=p
p=A.K(48)
t.a+=p
p=q>>>4&15
p=A.K(p<10?48+p:87+p)
t.a+=p
p=q&15
p=A.K(p<10?48+p:87+p)
t.a+=p
break}}else if(q===34||q===92){if(r>s)t.a+=B.l.a0(a,s,r)
s=r+1
p=A.K(92)
t.a+=p
p=A.K(q)
t.a+=p}}if(s===0)t.a+=a
else if(s<n)t.a+=B.l.a0(a,s,n)},
ac(a){var t,s,r,q
for(t=this.a,s=t.length,r=0;r<s;++r){q=t[r]
if(a==null?q==null:a===q)throw A.d(new A.c5(a,null))}B.a.m(t,a)},
aa(a){var t,s,r,q,p=this
if(p.aQ(a))return
p.ac(a)
try{t=p.b.$1(a)
if(!p.aQ(t)){r=A.fb(a,null,p.gaz())
throw A.d(r)}r=p.a
if(0>=r.length)return A.q(r,-1)
r.pop()}catch(q){s=A.f1(q)
r=A.fb(a,s,p.gaz())
throw A.d(r)}},
aQ(a){var t,s,r,q=this
if(typeof a=="number"){if(!isFinite(a))return!1
t=q.c
s=B.c.j(a)
t.a+=s
return!0}else if(a===!0){q.c.a+="true"
return!0}else if(a===!1){q.c.a+="false"
return!0}else if(a==null){q.c.a+="null"
return!0}else if(typeof a=="string"){t=q.c
t.a+='"'
q.aR(a)
t.a+='"'
return!0}else if(u.b.b(a)){q.ac(a)
q.bt(a)
t=q.a
if(0>=t.length)return A.q(t,-1)
t.pop()
return!0}else if(u.bC.b(a)){q.ac(a)
r=q.bu(a)
t=q.a
if(0>=t.length)return A.q(t,-1)
t.pop()
return r}else return!1},
bt(a){var t,s,r=this.c
r.a+="["
t=J.en(a)
if(t.gaJ(a)){this.aa(t.h(a,0))
for(s=1;s<t.gn(a);++s){r.a+=","
this.aa(t.h(a,s))}}r.a+="]"},
bu(a){var t,s,r,q,p,o,n=this,m={}
if(a.gM(a)){n.c.a+="{}"
return!0}t=a.gn(a)*2
s=A.hA(t,null,!1,u.X)
r=m.a=0
m.b=!0
a.H(0,new A.e7(m,s))
if(!m.b)return!1
q=n.c
q.a+="{"
for(p='"';r<t;r+=2,p=',"'){q.a+=p
n.aR(A.h(s[r]))
q.a+='":'
o=r+1
if(!(o<t))return A.q(s,o)
n.aa(s[o])}q.a+="}"
return!0}}
A.e7.prototype={
$2(a,b){var t,s
if(typeof a!="string")this.a.b=!1
t=this.b
s=this.a
B.a.k(t,s.a++,a)
B.a.k(t,s.a++,b)},
$S:6}
A.e5.prototype={
gaz(){var t=this.c.a
return t.charCodeAt(0)==0?t:t}}
A.e2.prototype={
j(a){return this.D()}}
A.w.prototype={}
A.be.prototype={
j(a){var t=this.a
if(t!=null)return"Assertion failed: "+A.bj(t)
return"Assertion failed"}}
A.bE.prototype={}
A.as.prototype={
gae(){return"Invalid argument"+(!this.a?"(s)":"")},
gad(){return""},
j(a){var t=this,s=t.c,r=s==null?"":" ("+s+")",q=t.d,p=q==null?"":": "+q,o=t.gae()+r+p
if(!t.a)return o
return o+t.gad()+": "+A.bj(t.gak())},
gak(){return this.b}}
A.bA.prototype={
gak(){return A.im(this.b)},
gae(){return"RangeError"},
gad(){var t,s=this.e,r=this.f
if(s==null)t=r!=null?": Not less than or equal to "+A.A(r):""
else if(r==null)t=": Not greater than or equal to "+A.A(s)
else if(r>s)t=": Not in inclusive range "+A.A(s)+".."+A.A(r)
else t=r<s?": Valid value range is empty":": Only valid value is "+A.A(s)
return t}}
A.c_.prototype={
gak(){return A.a7(this.b)},
gae(){return"RangeError"},
gad(){if(A.a7(this.b)<0)return": index must not be negative"
var t=this.f
if(t===0)return": no indices are valid"
return": index should be less than "+t},
gn(a){return this.f}}
A.cu.prototype={
j(a){return"Unsupported operation: "+this.a}}
A.cs.prototype={
j(a){return"UnimplementedError: "+this.a}}
A.bD.prototype={
j(a){return"Bad state: "+this.a}}
A.bX.prototype={
j(a){var t=this.a
if(t==null)return"Concurrent modification during iteration."
return"Concurrent modification during iteration: "+A.bj(t)+"."}}
A.bC.prototype={
j(a){return"Stack Overflow"},
$iw:1}
A.e3.prototype={
j(a){return"Exception: "+this.a}}
A.cU.prototype={
j(a){var t=this.a,s=""!==t?"FormatException: "+t:"FormatException"
return s}}
A.f.prototype={
a_(a,b,c){var t=A.o(this)
return A.fe(this,t.C(c).i("1(f.E)").a(b),t.i("f.E"),c)},
bs(a,b){var t=A.o(this)
return new A.aR(this,t.i("k(f.E)").a(b),t.i("aR<f.E>"))},
gn(a){var t,s=this.gE(this)
for(t=0;s.t();)++t
return t},
L(a,b){var t,s
A.hK(b,"index")
t=this.gE(this)
for(s=b;t.t();){if(s===0)return t.gv();--s}throw A.d(A.fa(b,b-s,this,"index"))},
j(a){return A.hu(this,"(",")")}}
A.C.prototype={
j(a){return"MapEntry("+A.A(this.a)+": "+A.A(this.b)+")"}}
A.bx.prototype={
gA(a){return A.y.prototype.gA.call(this,0)},
j(a){return"null"}}
A.y.prototype={$iy:1,
N(a,b){return this===b},
gA(a){return A.bz(this)},
j(a){return"Instance of '"+A.dk(this)+"'"},
gB(a){return A.jb(this)},
toString(){return this.j(this)}}
A.b6.prototype={
gn(a){return this.a.length},
j(a){var t=this.a
return t.charCodeAt(0)==0?t:t},
$ihS:1}
A.I.prototype={
D(){return"Topic."+this.b},
l(){return this.c}}
A.dU.prototype={
$1(a){return u.u.a(a).c===this.a},
$S:41}
A.dV.prototype={
$0(){return A.r(A.W("unknown Topic: "+this.a))},
$S:0}
A.H.prototype={
D(){return"SceneType."+this.b},
l(){return this.c}}
A.dH.prototype={
$1(a){return u.cI.a(a).c===this.a},
$S:45}
A.dI.prototype={
$0(){return A.r(A.W("unknown SceneType: "+this.a))},
$S:0}
A.U.prototype={
D(){return"Dir."+this.b},
l(){return this.c}}
A.cS.prototype={
$1(a){return u.R.a(a).c===this.a},
$S:8}
A.cT.prototype={
$0(){return A.r(A.W("unknown Dir: "+this.a))},
$S:0}
A.Q.prototype={
D(){return"LightPlacement."+this.b},
l(){return this.c}}
A.d4.prototype={
$1(a){return u.D.a(a).c===this.a},
$S:9}
A.d5.prototype={
$0(){return A.r(A.W("unknown LightPlacement: "+this.a))},
$S:0}
A.ag.prototype={
D(){return"Priority."+this.b},
l(){return this.c}}
A.dl.prototype={
$1(a){return u.W.a(a).c===this.a},
$S:10}
A.dm.prototype={
$0(){return A.r(A.W("unknown Priority: "+this.a))},
$S:0}
A.S.prototype={
D(){return"ActorKind."+this.b},
l(){return this.c}}
A.cG.prototype={
$1(a){return u.d.a(a).c===this.a},
$S:11}
A.cH.prototype={
$0(){return A.r(A.W("unknown ActorKind: "+this.a))},
$S:0}
A.ar.prototype={
D(){return"ActorRole."+this.b},
l(){return this.c}}
A.cI.prototype={
$1(a){return u.I.a(a).c===this.a},
$S:12}
A.cJ.prototype={
$0(){return A.r(A.W("unknown ActorRole: "+this.a))},
$S:0}
A.a2.prototype={
D(){return"OutcomeType."+this.b},
l(){return this.c}}
A.df.prototype={
$1(a){return u.cu.a(a).c===this.a},
$S:13}
A.dg.prototype={
$0(){return A.r(A.W("unknown OutcomeType: "+this.a))},
$S:0}
A.Y.prototype={
D(){return"LightState."+this.b},
l(){return this.c}}
A.d6.prototype={
$1(a){return u.V.a(a).c===this.a},
$S:14}
A.d7.prototype={
$0(){return A.r(A.W("unknown LightState: "+this.a))},
$S:0}
A.N.prototype={
D(){return"MarkingType."+this.b},
l(){return this.c}}
A.db.prototype={
$1(a){return u.ac.a(a).c===this.a},
$S:7}
A.dc.prototype={
$0(){return A.r(A.W("unknown MarkingType: "+this.a))},
$S:0}
A.ay.prototype={
D(){return"TramAxis."+this.b},
l(){return this.c}}
A.dW.prototype={
$1(a){return u.cG.a(a).c===this.a},
$S:16}
A.dX.prototype={
$0(){return A.r(A.W("unknown TramAxis: "+this.a))},
$S:0}
A.ai.prototype={
D(){return"TimeOfDay."+this.b},
l(){return this.c}}
A.dS.prototype={
$1(a){return u.aw.a(a).c===this.a},
$S:17}
A.dT.prototype={
$0(){return A.r(A.W("unknown TimeOfDay: "+this.a))},
$S:0}
A.ad.prototype={
D(){return"Weather."+this.b},
l(){return this.c}}
A.e0.prototype={
$1(a){return u.M.a(a).c===this.a},
$S:18}
A.e1.prototype={
$0(){return A.r(A.W("unknown Weather: "+this.a))},
$S:0}
A.dA.prototype={
l(){var t=this,s=t.f,r=A.M(s),q=r.i("z<1,m<b,@>>")
return A.E(["id",t.a,"schema_version",t.b,"question_id",t.c,"topic",t.d.c,"scene",t.e.l(),"actors",A.J(new A.z(s,r.i("m<b,@>(1)").a(new A.dD()),q),!1,q.i("x.E")),"question",t.r.l(),"resolution",t.w.l()],u.N,u.z)}}
A.dC.prototype={
$1(a){var t,s,r,q,p,o,n="lane_out"
u.P.a(a)
t=A.h(a.h(0,"id"))
s=A.he(A.h(a.h(0,"kind")))
r=a.h(0,"role")==null?B.A:A.hf(A.h(a.h(0,"role")))
q=A.bh(A.h(a.h(0,"from")))
p=A.bh(A.h(a.h(0,"to")))
o=a.h(0,"lane_in")==null?0:A.a7(a.h(0,"lane_in"))
return new A.a0(t,s,r,q,p,o,a.h(0,n)==null?0:A.a7(a.h(0,n)))},
$S:19}
A.dD.prototype={
$1(a){return u.J.a(a).l()},
$S:20}
A.dE.prototype={
l(){var t,s,r,q=this,p=u.N,o=u.z,n=A.G(p,o)
n.k(0,"type",q.a.c)
t=q.b
s=A.M(t)
r=s.i("z<1,m<b,@>>")
n.k(0,"roads",A.J(new A.z(t,s.i("m<b,@>(1)").a(new A.dN()),r),!1,r.i("x.E")))
t=q.c
if(t!=null)n.k(0,"tram_track",A.E(["along",t.a.c],p,o))
p=q.d
o=A.M(p)
t=o.i("z<1,m<b,@>>")
n.k(0,"signs",A.J(new A.z(p,o.i("m<b,@>(1)").a(new A.dO()),t),!1,t.i("x.E")))
t=q.e
o=A.M(t)
p=o.i("z<1,m<b,@>>")
n.k(0,"markings",A.J(new A.z(t,o.i("m<b,@>(1)").a(new A.dP()),p),!1,p.i("x.E")))
p=q.f
o=A.M(p)
t=o.i("z<1,m<b,@>>")
n.k(0,"lights",A.J(new A.z(p,o.i("m<b,@>(1)").a(new A.dQ()),t),!1,t.i("x.E")))
p=q.r
if(p!=null)n.k(0,"conditions",p.l())
return n}}
A.dJ.prototype={
$1(a){u.P.a(a)
return new A.aw(A.bh(A.h(a.h(0,"dir"))),A.a7(a.h(0,"lanes_in")),A.a7(a.h(0,"lanes_out")),A.hI(A.h(a.h(0,"priority"))))},
$S:21}
A.dK.prototype={
$1(a){u.P.a(a)
return new A.ah(A.bh(A.h(a.h(0,"at"))),A.h(a.h(0,"code")))},
$S:22}
A.dL.prototype={
$1(a){var t
u.P.a(a)
t=A.hC(A.h(a.h(0,"type")))
return new A.a6(t,a.h(0,"at")==null?null:A.bh(A.h(a.h(0,"at"))))},
$S:23}
A.dM.prototype={
$1(a){u.P.a(a)
return new A.aj(A.hx(A.h(a.h(0,"at"))),A.hy(A.h(a.h(0,"state"))))},
$S:24}
A.dN.prototype={
$1(a){return u.L.a(a).l()},
$S:25}
A.dO.prototype={
$1(a){return u.c.a(a).l()},
$S:26}
A.dP.prototype={
$1(a){return u.v.a(a).l()},
$S:27}
A.dQ.prototype={
$1(a){return u.h.a(a).l()},
$S:28}
A.aw.prototype={
l(){var t=this
return A.E(["dir",t.a.c,"lanes_in",t.b,"lanes_out",t.c,"priority",t.d.c],u.N,u.z)}}
A.dY.prototype={
l(){return A.E(["along",this.a.c],u.N,u.z)}}
A.ah.prototype={
l(){return A.E(["at",this.a.c,"code",this.b],u.N,u.z)}}
A.a6.prototype={
l(){var t,s=A.G(u.N,u.z)
s.k(0,"type",this.a.c)
t=this.b
if(t!=null)s.k(0,"at",t.c)
return s}}
A.aj.prototype={
l(){return A.E(["at",this.a.c,"state",this.b.c],u.N,u.z)}}
A.bY.prototype={
l(){return A.E(["time",this.a.c,"weather",this.b.c],u.N,u.z)}}
A.a0.prototype={
l(){var t=this
return A.E(["id",t.a,"kind",t.b.c,"role",t.c.c,"from",t.d.c,"to",t.e.c,"lane_in",t.f,"lane_out",t.r],u.N,u.z)}}
A.dn.prototype={
l(){var t=this.b,s=A.M(t),r=s.i("z<1,m<b,@>>")
return A.E(["text",this.a,"options",A.J(new A.z(t,s.i("m<b,@>(1)").a(new A.dr()),r),!1,r.i("x.E")),"correct",this.c],u.N,u.z)}}
A.dp.prototype={
$2(a,b){return new A.C(A.h(a),A.h(b),u.q)},
$S:2}
A.dq.prototype={
$1(a){return A.hD(u.P.a(a))},
$S:30}
A.dr.prototype={
$1(a){return u.f.a(a).l()},
$S:47}
A.ab.prototype={
l(){var t,s=A.G(u.N,u.z)
s.k(0,"id",this.a)
t=this.b
if(t!=null)s.k(0,"refers_to",t)
s.k(0,"label",this.c)
return s}}
A.de.prototype={
$2(a,b){return new A.C(A.h(a),A.h(b),u.q)},
$S:2}
A.du.prototype={
l(){var t=u.N
return A.E(["order",this.a,"rule",this.b.l(),"wrong_outcomes",this.c.R(0,new A.dx(),t,u.P)],t,u.z)}}
A.dv.prototype={
$1(a){return A.h(a)},
$S:32}
A.dw.prototype={
$2(a,b){var t
A.h(a)
u.P.a(b)
t=A.hE(A.h(b.h(0,"type")))
return new A.C(a,new A.ac(t,b.h(0,"with")==null?null:A.h(b.h(0,"with"))),u.cd)},
$S:33}
A.dx.prototype={
$2(a,b){return new A.C(A.h(a),u.B.a(b).l(),u.bE)},
$S:34}
A.dy.prototype={
l(){return A.E(["code",this.a,"text",this.b],u.N,u.z)}}
A.dz.prototype={
$2(a,b){return new A.C(A.h(a),A.h(b),u.q)},
$S:2}
A.ac.prototype={
l(){var t,s=A.G(u.N,u.z)
s.k(0,"type",this.a.c)
t=this.b
if(t!=null)s.k(0,"with",t)
return s}}
A.e.prototype={
p(a,b){return new A.e(this.a+b.a,this.b+b.b)},
u(a,b){return new A.e(this.a-b.a,this.b-b.b)},
q(a,b){return new A.e(this.a*b,this.b*b)},
gn(a){var t=this.a,s=this.b
return Math.sqrt(t*t+s*s)},
aG(a){return this.a*a.a+this.b*a.b},
gal(){var t=this.gn(0)
return t===0?B.a1:new A.e(this.a/t,this.b/t)},
j(a){return"("+B.c.ao(this.a,2)+", "+B.c.ao(this.b,2)+")"},
N(a,b){if(b==null)return!1
return b instanceof A.e&&b.a===this.a&&b.b===this.b},
gA(a){return A.ff(this.a,this.b,B.k,B.k)}}
A.cl.prototype={
gP(){var t=this,s=t.a,r=t.b,q=t.c,p=t.d
return A.c([new A.e(s,r),new A.e(q,r),new A.e(q,p),new A.e(s,p)],u.j)}}
A.cm.prototype={
bl(a){return this.c.q(0,-(a+0.5)*60)},
aI(a,b){return B.j.p(0,this.b.q(0,b)).p(0,this.bl(a))},
aL(a,b){return B.j.p(0,this.b.q(0,b)).p(0,this.c.q(0,(a+0.5)*60))},
gn(a){return this.e}}
A.cV.prototype={
aO(a){var t=this.b.h(0,a)
if(t==null)throw A.d(A.a4("scene has no road facing "+a.j(0)))
return t},
a3(a){var t=a===B.d||a===B.e,s=this.c
return t?(s.d-s.b)/2:(s.c-s.a)/2},
Z(a){return B.a.bb(this.a.e,new A.cX(a))},
aT(a){var t=this.a3(a)
return t+(this.Z(a)?78:10)}}
A.cX.prototype={
$1(a){u.v.a(a)
return a.a===B.u&&a.b===this.a},
$S:35}
A.ae.prototype={
gn(a){return this.a}}
A.aY.prototype={}
A.cM.prototype={
am(a){var t=this.a.h(0,a)
if(t==null)throw A.d(A.a4('no motion profile for actor "'+a+'"'))
return t},
a8(a){var t=this.b.h(0,a)
if(t==null)throw A.d(A.a4('no trajectory for actor "'+a+'"'))
return t},
aN(a,b){var t,s,r,q,p,o,n=a.a,m=this.a8(n),l=this.am(n).Y(b)
n=m.c
t=n.aM(l)
s=n.aA(B.c.aE(l,0,B.a.gJ(n.b)))
n=n.a
r=n.length
q=s<r-1?s+1:s
p=q===s?s-1:s
if(!(q<r))return A.q(n,q)
o=n[q]
if(!(p>=0&&p<r))return A.q(n,p)
return new A.aY(a,t,o.u(0,n[p]).gal(),A.aD(a.b))}}
A.cN.prototype={
$1(a){return u.J.a(a).a},
$S:36}
A.cO.prototype={
$1(a){return!B.a.O(this.a,A.h(a))},
$S:37}
A.aG.prototype={}
A.av.prototype={
ah(a){var t=this.a
return t.p(0,this.b.u(0,t).q(0,a))},
gab(){return 1}}
A.cj.prototype={
ah(a){var t=1-a
return this.a.q(0,t*t).p(0,this.b.q(0,2*t*a)).p(0,this.c.q(0,a*a))},
gab(){return 96}}
A.b1.prototype={
ah(a){var t=this,s=1-a,r=3*s
return t.a.q(0,s*s*s).p(0,t.b.q(0,r*s*a)).p(0,t.c.q(0,r*a*a)).p(0,t.d.q(0,a*a*a))},
gab(){return 96}}
A.cK.prototype={
gn(a){return B.a.gJ(this.b)},
aA(a){var t,s,r=this.b,q=r.length,p=q-1
for(t=0;t<p;){s=B.f.a2(t+p+1,1)
if(!(s<q))return A.q(r,s)
if(r[s]<=a)t=s
else p=s-1}return t},
aM(a){var t,s,r,q,p,o,n,m=this
if(a<=0)return B.a.gaj(m.a)
t=m.b
if(a>=B.a.gJ(t))return B.a.gJ(m.a)
s=m.aA(a)
r=s+1
q=t.length
if(!(r<q))return A.q(t,r)
p=t[r]
if(!(s<q))return A.q(t,s)
t=t[s]
o=p-t
if(o===0){t=m.a
if(!(s<t.length))return A.q(t,s)
return t[s]}q=m.a
p=q.length
if(!(s<p))return A.q(q,s)
n=q[s]
if(!(r<p))return A.q(q,r)
return n.p(0,q[r].u(0,n).q(0,(a-t)/o))}}
A.e8.prototype={
Y(a){var t,s,r,q,p,o
if(a<=0)return 0
if(a>=0.9)return this.b+(a-0.9)*290
t=a/0.9*64
s=B.c.bk(t)
r=this.a
q=r.length
if(!(s>=0&&s<q))return A.q(r,s)
p=r[s]
o=s+1
if(!(o<q))return A.q(r,o)
return p+(r[o]-p)*(t-s)},
gn(a){return this.b}}
A.e9.prototype={
$1(a){return 290*A.iT(a)},
$S:38}
A.bt.prototype={
Y(a){var t=a-this.b
if(t<=0)return this.a
return this.a+$.f2().Y(t)},
an(a){var t,s,r,q,p,o=this,n=a-o.a
if(n<=0)return o.b
t=$.f2()
s=t.b
if(n<=s)for(t=t.a,r=t.length,q=1;q<r;++q){p=t[q]
if(p>=n){s=q-1
r=t[s]
return o.b+(s+(n-r)/(p-r))/64*0.9}}return o.b+0.9+(n-s)/290}}
A.aN.prototype={
l(){var t,s,r=this,q=A.G(u.N,u.z)
q.k(0,"option",r.a)
t=r.b
s=t==null
q.k(0,"clean",s)
if(!s)q.k(0,"type",t.c)
t=r.d
if(t!=null)q.k(0,"with",t)
t=r.c
if(t!=null)q.k(0,"collision",t.l())
return q}}
A.ei.prototype={
$1(a){return u.J.a(a).c===B.p},
$S:39}
A.ej.prototype={
$0(){return A.r(A.a4("scenario "+this.a.a+" has no player actor to classify"))},
$S:0}
A.dj.prototype={
bq(a){var t,s,r,q,p,o,n,m,l,k=Math.min(a,this.d),j=A.c([],u.U)
for(t=this.b,s=t.length,r=this.a,q=r.a,p=0;p<t.length;t.length===s||(0,A.v)(t),++p){o=t[p]
n=o.a
m=q.h(0,n)
if(m==null)A.r(A.a4('no motion profile for actor "'+n+'"'))
l=m.Y(k)
a=r.b.h(0,n)
if(a==null)A.r(A.a4('no trajectory for actor "'+n+'"'))
if(!(l>=B.a.gJ(a.c.b)-1e-9))j.push(r.aN(o,k))}return j}}
A.cP.prototype={
l(){var t=this,s=t.d
return A.E(["tick",t.a,"actorA",t.b,"actorB",t.c,"point",A.c([s.a,s.b],u.n)],u.N,u.z)}}
A.co.prototype={}
A.b3.prototype={
D(){return"Manoeuvre."+this.b}}
A.cr.prototype={
gn(a){return B.a.gJ(this.c.b)}}
A.al.prototype={
D(){return"WarningCode."+this.b}}
A.T.prototype={
l(){return A.E(["code",this.a.b,"path",this.b,"detail",this.c],u.N,u.z)},
j(a){return"["+this.a.b+"] "+this.b+": "+this.c}}
A.aa.prototype={
D(){return"Layer."+this.b}}
A.O.prototype={
U(a){var t,s=A.G(u.N,u.z)
s.k(0,"op",a)
s.k(0,"layer",this.a.b)
t=this.b
if(t!=null)s.k(0,"actorId",t)
return s}}
A.F.prototype={
l(){var t=this.U("fillPolygon")
t.G(0,A.E(["points",A.fH(this.c),"colour",this.d],u.N,u.z))
return t}}
A.L.prototype={
l(){var t,s=this,r=s.U("strokePath"),q=A.G(u.N,u.z)
q.k(0,"points",A.fH(s.c))
q.k(0,"colour",s.d)
q.k(0,"width",s.e)
q.k(0,"closed",s.f)
t=s.r
if(t!=null)q.k(0,"dash",t)
r.G(0,q)
return r}}
A.af.prototype={
l(){var t=this,s=t.U("fillCircle"),r=t.c
s.G(0,A.E(["centre",A.c([r.a,r.b],u.n),"radius",t.d,"colour",t.e],u.N,u.z))
return s}}
A.bB.prototype={
l(){var t=this,s=t.U("signGlyph"),r=t.c
s.G(0,A.E(["centre",A.c([r.a,r.b],u.n),"code",t.d,"size",t.e],u.N,u.z))
return s}}
A.br.prototype={
l(){var t=this,s=t.U("lightGlyph"),r=t.c
s.G(0,A.E(["centre",A.c([r.a,r.b],u.n),"state",t.d.c,"size",t.e],u.N,u.z))
return s}}
A.b5.prototype={
gbp(){var t,s,r,q,p=A.c([],u.x)
for(t=this.a,s=0;s<t.length;++s)p.push(new A.bL(s,t[s]))
B.a.aS(p,new A.dt())
t=A.c([],u.Q)
for(r=p.length,q=0;q<p.length;p.length===r||(0,A.v)(p),++q)t.push(p[q].b)
return t}}
A.dt.prototype={
$2(a,b){var t,s=u.av
s.a(a)
s.a(b)
t=B.f.W(a.b.a.a,b.b.a.a)
return t!==0?t:B.f.W(a.a,b.a)},
$S:40}
A.ex.prototype={
$1(a){var t=B.f.a2(this.a,a)&255
return B.f.aE(B.c.br(t+((B.f.aB(this.b,a)&255)-t)*this.c),0,255)},
$S:3}
A.aO.prototype={
aK(a){var t=this
u.cU.a(a)
return new A.aO(a.$1(t.a),a.$1(t.b),a.$1(t.c),a.$1(t.d),a.$1(t.e),a.$1(t.f),a.$1(t.r),a.$1(t.w),a.$1(t.x),a.$1(t.y),a.$1(t.z),a.$1(t.Q),t.as)},
ai(a,b,c,d,e,f,g){var t=this,s=d==null?t.a:d,r=a==null?t.b:a,q=e==null?t.c:e,p=f==null?t.d:f,o=g==null?t.e:g,n=c==null?t.f:c
return new A.aO(s,r,q,p,o,n,t.r,t.w,t.x,t.y,t.z,t.Q,b)},
bf(a,b){var t=null
return this.ai(a,b,t,t,t,t,t)},
be(a){var t=null
return this.ai(t,a,t,t,t,t,t)}}
A.dh.prototype={
$1(a){return A.aC(a,4280955192,0.18)},
$S:3}
A.di.prototype={
$1(a){return A.aC(a,4288323750,0.34)},
$S:3}
A.bT.prototype={}
A.dF.prototype={
aD(){var t,s,r=this,q=r.d
B.a.aF(q)
t=r.e
B.a.aF(t)
s=r.a.e.a
if(!B.bp.O(0,s))B.a.m(t,new A.T(B.c5,"scene.type",'no layout rule for "'+s.c+'"; roads are drawn generically and geometry may be wrong'))
B.a.m(q,new A.F(B.Z.gP(),r.c.a,B.ar,null))
r.b8()
r.b2()
r.b4()
r.aY()
r.ba()
r.b9()
r.b5()
r.aX()
return new A.bT(new A.b5(A.J(q,!0,u.C)),A.fd(t,u.E))},
b8(){var t,s,r,q,p,o,n,m,l,k,j
for(t=this.b,s=t.b.ga9(),r=A.o(s),s=new A.Z(J.aq(s.a),s.b,r.i("Z<1,2>")),q=this.d,p=u.j,o=this.c.b,r=r.y[1];s.t();){n=s.a
if(n==null)n=r.a(n)
m=n.c
l=n.d
k=m.a*l
l=m.b*l
m=n.b
n=n.e
j=500+m.a*n
n=500+m.b*n
B.a.m(q,new A.F(A.c([new A.e(500-k,500-l),new A.e(500+k,500+l),new A.e(j+k,n+l),new A.e(j-k,n-l)],p),o,B.q,null))}B.a.m(q,new A.F(t.c.gP(),o,B.q,null))},
b2(){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c
for(t=this.b,s=t.b.ga9(),r=A.o(s),s=new A.Z(J.aq(s.a),s.b,r.i("Z<1,2>")),q=this.d,p=u.j,o=this.c.c,r=r.y[1],t=t.c,n=(t.d-t.b)/2;s.t();){m=s.a
if(m==null)m=r.a(m)
l=m.a.a
k=l===B.d||l===B.e?n:(t.c-t.a)/2
for(l=[-1,1],j=m.c,i=m.d,h=j.a,j=j.b,g=m.b,f=g.a,e=f*k,g=g.b,k=g*k,m=m.e,f*=m,m=g*m,d=0;d<2;++d){g=i*l[d]
c=h*g
g=j*g
B.a.m(q,new A.L(A.c([new A.e(500+e+c,500+k+g),new A.e(500+f+c,500+m+g)],p),o,5,!1,null,B.q,null))}}},
aZ(a){var t,s,r,q,p,o,n
for(t=this.a.e.e,s=t.length,r=a.a,q=r.a,p=0;p<s;++p){o=t[p]
if(o.b!==q)continue
n=o.a
if(n===B.v||n===B.m||n===B.n)return n}return Math.max(r.b,r.c)>=2?B.n:B.m},
b4(){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1,a2,a3,a4,a5,a6,a7=this,a8=null
for(t=a7.b,s=t.b.ga9(),r=A.o(s),s=new A.Z(J.aq(s.a),s.b,r.i("Z<1,2>")),q=a7.d,p=u.j,o=a7.c.d,r=r.y[1],t=t.c,n=(t.d-t.b)/2;s.t();){m=s.a
if(m==null)m=r.a(m)
l=m.a
k=l.a
j=k===B.d||k===B.e?n:(t.c-t.a)/2
i=m.e
k=m.b
h=k.a
k=k.b
g=500+h*j
f=500+k*j
e=new A.e(g,f)
h=500+h*i
k=500+k*i
d=new A.e(h,k)
c=l.b
if(c>0&&l.c>0)switch(a7.aZ(m).a){case 5:for(b=[-3,3],a=m.c,a0=a.a,a=a.b,a1=0;a1<2;++a1){a2=b[a1]
a3=a0*a2
a4=a*a2
B.a.m(q,new A.L(A.c([new A.e(g+a3,f+a4),new A.e(h+a3,k+a4)],p),o,3,!1,a8,B.h,a8))}break
case 3:B.a.m(q,new A.L(A.c([e,d],p),o,4,!1,a8,B.h,a8))
break
default:B.a.m(q,new A.L(A.c([e,d],p),o,4,!1,B.aF,B.h,a8))}for(k=m.c,h=k.a,k=k.b,g=h*-30,f=k*-30,a5=1;a5<c;++a5){b=-(a5+0.5)*60
a7.av(m,j,i,new A.e(h*b-g,k*b-f))}for(l=l.c,g=h*30,f=k*30,a6=1;a6<l;++a6){c=(a6+0.5)*60
a7.av(m,j,i,new A.e(h*c-g,k*c-f))}for(l=[-1,1],m=m.d-6,g=e.a,f=e.b,c=d.a,b=d.b,a1=0;a1<2;++a1){a=m*l[a1]
a0=h*a
a=k*a
B.a.m(q,new A.L(A.c([new A.e(g+a0,f+a),new A.e(c+a0,b+a)],p),o,3,!1,a8,B.h,a8))}}},
av(a,b,c,d){var t=a.b
B.a.m(this.d,new A.L(A.c([B.j.p(0,t.q(0,b)).p(0,d),B.j.p(0,t.q(0,c)).p(0,d)],u.j),this.c.d,3,!1,B.aE,B.h,null))},
aY(){var t,s,r,q,p,o,n,m,l,k,j,i=this,h=i.a.e.e
for(t=i.b,s=t.b,r=t.c,q=(r.d-r.b)/2,p=i.e,o=0;o<h.length;++o){n=h[o]
m="scene.markings["+o+"]"
l=n.a
if(!B.bq.O(0,l)){B.a.m(p,new A.T(B.c2,m,'marking "'+l.c+'" is declared but the renderer has no artwork for it, so it will not appear'))
continue}k=n.b
if(k==null){B.a.m(p,new A.T(B.c3,m,'marking "'+l.c+'" needs an "at" road to be placed against'))
continue}if(!s.X(k)){B.a.m(p,new A.T(B.o,m,'marking "'+l.c+'" is attached to '+k.c+" but no road faces that direction"))
continue}j=s.h(0,k)
if(j==null)A.r(A.a4("scene has no road facing "+k.j(0)))
switch(l.a){case 0:l=k===B.d||k===B.e?q:(r.c-r.a)/2
i.ar(j,l+(t.Z(k)?78:10),9,null)
break
case 1:l=k===B.d||k===B.e?q:(r.c-r.a)/2
i.ar(j,l+(t.Z(k)?78:10),7,B.aD)
break
case 2:i.b0(j)
break
default:break}}},
ar(a,b,c,d){var t,s,r
u.b_.a(d)
t=a.a
s=t.b
if(s===0){B.a.m(this.e,new A.T(B.c6,"scene.roads["+t.a.c+"]","a stop or give-way line was requested but the road has no incoming lanes"))
return}r=B.j.p(0,a.b.q(0,b))
B.a.m(this.d,new A.L(A.c([r,r.p(0,a.c.q(0,-s*60))],u.j),this.c.e,c,!1,d,B.h,null))},
b0(a){var t,s,r,q,p,o,n,m,l,k,j,i=this.b.a3(a.a.a)+8,h=i+60,g=a.d-4,f=-g
for(t=a.c,s=t.a,t=t.b,r=this.d,q=a.b,p=q.a,q=q.b,o=u.j,n=this.c.f,m=500+p*i,i=500+q*i,p=500+p*h,h=500+q*h;q=f+16,q<=g;){l=s*f
k=t*f
j=s*q
q=t*q
B.a.m(r,new A.F(A.c([new A.e(m+l,i+k),new A.e(m+j,i+q),new A.e(p+j,h+q),new A.e(p+l,h+k)],o),n,B.h,null))
f+=30}},
ba(){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1,a2,a3,a4,a5=this,a6=a5.a.e.c
if(a6==null)return
for(t=a5.d,s=u.j,r=a5.c.r,q=a5.b.b,p=a6.a.c,o="track runs along "+p+" but no road faces ",n=a5.e,m=0;m<8;++m){l=B.S[m]
k=l.c
if(!A.jv(p,k,0))continue
j=q.h(0,l)
if(j==null){B.a.m(n,new A.T(B.o,"scene.tram_track",o+k))
continue}k=A.c([],s)
i=j.a
if(i.b>0){h=j.c
k.push(new A.e(h.a*-30,h.b*-30))}if(i.c>0){i=j.c
k.push(new A.e(i.a*30,i.b*30))}for(i=k.length,h=j.c,g=h.a,h=h.b,f=j.b,e=j.e,d=f.a*e,e=f.b*e,c=0;c<k.length;k.length===i||(0,A.v)(k),++c){b=k[c]
for(f=[-15,15],a=b.a,a0=b.b,a1=0;a1<2;++a1){a2=f[a1]
a3=a+g*a2
a4=a0+h*a2
B.a.m(t,new A.L(A.c([new A.e(500+a3,500+a4),new A.e(500+d+a3,500+e+a4)],s),r,4,!1,null,B.as,null))}}}},
aP(a){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d
u.aB.a(a)
t=A.c([],u.Q)
for(s=a.length,r=this.c,q=r.z,p=r.Q,o=r.w,n=r.x,r=r.y,m=0;m<a.length;a.length===s||(0,A.v)(a),++m){l=a[m]
k=l.a
$label0$0:{if(B.z===k.b){j=r
break $label0$0}j=k.c===B.p?n:o
break $label0$0}i=k.a
k=l.b
h=l.c
g=l.d
f=g.a
g=g.b
B.a.m(t,new A.F(A.cE(k,h,f,g),j,B.r,i))
B.a.m(t,new A.L(A.cE(k,h,f,g),p,3,!0,null,B.r,i))
j=h.a
e=h.b
d=Math.sqrt(j*j+e*e)
j=d===0?B.a1:new A.e(j/d,e/d)
e=f*0.22
B.a.m(t,new A.F(A.cE(new A.e(k.a+j.a*e,k.b+j.b*e),h,f*0.26,g*0.72),q,B.r,i))}return t},
b9(){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e=this,d=e.a.e.d
for(t=e.d,s=e.b,r=s.b,q=e.e,p=s.c,o=(p.d-p.b)/2,n=0;n<d.length;++n){m=d[n]
l=m.a
k=r.h(0,l)
if(k==null){B.a.m(q,new A.T(B.o,"scene.signs["+n+"]","sign "+m.b+" is attached to "+l.c+" but no road faces that direction"))
continue}j=m.b
if(!B.br.O(0,j))B.a.m(q,new A.T(B.c4,"scene.signs["+n+"]","sign "+j+' has no dedicated artwork; a generic shape for family "'+A.A(B.a.gaj(j.split(".")))+'" was drawn instead'))
i=l===B.d||l===B.e?o:(p.c-p.a)/2
i=i+(s.Z(l)?78:10)+26
h=k.b
g=k.c
f=-(k.d+24)
B.a.m(t,new A.bB(new A.e(500+h.a*i+g.a*f,500+h.b*i+g.b*f),j,44,B.b,null))}},
b5(){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1,a2=this,a3=a2.a.e.f
for(t=a2.d,s=a2.b,r=u.R,q=s.b,s=s.c,p=(s.d-s.b)/2,o=a2.e,n=u.O,m=A.o(q).i("a5<1>"),l=m.i("f.E"),k=0;k<a3.length;++k){j=a3[k]
i=j.b
if(i===B.N)continue
h=j.a
g=h===B.K?A.J(new A.a5(q,m),!0,l):A.c([A.bh(h.c)],n)
for(h=g.length,f="scene.lights["+k+"]",e=0;e<g.length;g.length===h||(0,A.v)(g),++e){d=g[e]
c=q.h(0,d)
if(c==null){B.a.m(o,new A.T(B.o,f,"light is attached to "+d.c+" but no road faces that direction"))
continue}r.a(d)
b=(d===B.d||d===B.e?p:(s.c-s.a)/2)+14
a=c.b
a0=c.c
a1=-(c.d+20)
B.a.m(t,new A.br(new A.e(500+a.a*b+a0.a*a1,500+a.b*b+a0.b*a1),i,34,B.t,null))}}},
aX(){var t=this.c.as
if(t===0)return
B.a.m(this.d,new A.F(B.Z.gP(),t,B.at,null))}}
A.dG.prototype={}
A.em.prototype={
$3(a,b,c){var t,s,r,q,p=A.c([],u.j)
for(t=this.a.c,s=t.a,t=t.b,r=0;r<a;++r){q=c+r*2*3.141592653589793/a
p.push(new A.e(s+b*Math.cos(q),t+b*Math.sin(q)))}return p},
$S:42}
A.eh.prototype={
$0(){return A.js(A.dB(u.P.a(B.i.a4(this.a,null))))},
$S:1}
A.eg.prototype={
$0(){var t=A.dB(u.P.a(B.i.a4(this.a,null))),s=t.f
return A.fZ(A.fm(t,A.eK(A.eD(A.cW(t.e),s,t.w.a),s)),t.a,this.b)},
$S:1}
A.eA.prototype={
$0(){return A.jr(A.dB(u.P.a(B.i.a4(this.a,null))))},
$S:1}
A.ez.prototype={
$0(){var t=A.dB(u.P.a(B.i.a4(this.a,null)))
return A.fZ(A.fm(t,A.fR(t,B.a.bj(t.r.b,new A.ey(this.b))).e),t.a,this.c)},
$S:1}
A.ey.prototype={
$1(a){return u.f.a(a).a===this.a},
$S:44}
A.es.prototype={
$1(a){return A.j0(A.h(a))},
$S:4}
A.et.prototype={
$2(a,b){return A.j_(A.h(a),A.fD(b))},
$S:46}
A.eu.prototype={
$1(a){return A.jq(A.h(a))},
$S:4}
A.ev.prototype={
$3(a,b,c){return A.jo(A.h(a),A.h(b),A.fD(c))},
$S:31};(function aliases(){var t=J.aK.prototype
t.aV=t.j
t=A.f.prototype
t.aU=t.bs})();(function installTearOffs(){var t=hunkHelpers._instance_1u,s=hunkHelpers._static_1
t(A.a1.prototype,"gbd","X",15)
s(A,"j5","iu",5)})();(function inheritance(){var t=hunkHelpers.mixin,s=hunkHelpers.inherit,r=hunkHelpers.inheritMany
s(A.y,null)
r(A.y,[A.eG,J.c0,J.aE,A.w,A.dR,A.f,A.aL,A.Z,A.bG,A.P,A.aA,A.b_,A.at,A.aS,A.aP,A.dZ,A.dd,A.t,A.d8,A.bs,A.a3,A.cy,A.cB,A.u,A.bW,A.bZ,A.e6,A.e2,A.bC,A.e3,A.cU,A.C,A.bx,A.b6,A.dA,A.dE,A.aw,A.dY,A.ah,A.a6,A.aj,A.bY,A.a0,A.dn,A.ab,A.du,A.dy,A.ac,A.e,A.cl,A.cm,A.cV,A.ae,A.aY,A.cM,A.aG,A.cK,A.e8,A.bt,A.aN,A.dj,A.cP,A.co,A.cr,A.T,A.O,A.b5,A.aO,A.bT,A.dF,A.dG])
r(J.c0,[J.c1,J.bm,J.c3,J.bo,J.bp,J.bn,J.b2])
r(J.c3,[J.aK,J.l,A.c7,A.ce])
r(J.aK,[J.ci,J.bF,J.au])
s(J.cZ,J.l)
r(J.bn,[J.bl,J.c2])
r(A.w,[A.c6,A.bE,A.c4,A.ct,A.cw,A.cn,A.be,A.cx,A.bq,A.as,A.cu,A.cs,A.bD,A.bX])
r(A.f,[A.j,A.aM,A.aR])
r(A.j,[A.x,A.a5])
s(A.bi,A.aM)
r(A.x,[A.z,A.cA])
s(A.b7,A.aA)
s(A.bL,A.b7)
r(A.at,[A.bV,A.bU,A.cq,A.d0,A.eo,A.eq,A.d9,A.dU,A.dH,A.cS,A.d4,A.dl,A.cG,A.cI,A.df,A.d6,A.db,A.dW,A.dS,A.e0,A.dC,A.dD,A.dJ,A.dK,A.dL,A.dM,A.dN,A.dO,A.dP,A.dQ,A.dq,A.dr,A.dv,A.cX,A.cN,A.cO,A.e9,A.ei,A.ex,A.dh,A.di,A.em,A.ey,A.es,A.eu,A.ev])
r(A.bV,[A.cQ,A.d_,A.ep,A.da,A.e7,A.dp,A.de,A.dw,A.dx,A.dz,A.dt,A.et])
r(A.b_,[A.bf,A.bk])
s(A.b0,A.aP)
r(A.b0,[A.bg,A.aI])
s(A.by,A.bE)
r(A.cq,[A.cp,A.aZ])
s(A.cv,A.be)
r(A.t,[A.a1,A.cz])
s(A.aJ,A.a1)
r(A.ce,[A.c8,A.b4])
r(A.b4,[A.bH,A.bJ])
s(A.bI,A.bH)
s(A.bu,A.bI)
s(A.bK,A.bJ)
s(A.bv,A.bK)
r(A.bu,[A.c9,A.ca])
r(A.bv,[A.cb,A.cc,A.cd,A.cf,A.cg,A.bw,A.ch])
s(A.bM,A.cx)
s(A.c5,A.bq)
s(A.d1,A.bW)
r(A.bZ,[A.d3,A.d2])
s(A.e5,A.e6)
r(A.as,[A.bA,A.c_])
r(A.e2,[A.I,A.H,A.U,A.Q,A.ag,A.S,A.ar,A.a2,A.Y,A.N,A.ay,A.ai,A.ad,A.b3,A.al,A.aa])
r(A.bU,[A.dV,A.dI,A.cT,A.d5,A.dm,A.cH,A.cJ,A.dg,A.d7,A.dc,A.dX,A.dT,A.e1,A.ej,A.eh,A.eg,A.eA,A.ez])
r(A.aG,[A.av,A.cj,A.b1])
r(A.O,[A.F,A.L,A.af,A.bB,A.br])
t(A.bH,A.u)
t(A.bI,A.P)
t(A.bJ,A.u)
t(A.bK,A.P)})()
var v={typeUniverse:{eC:new Map(),tR:{},eT:{},tPV:{},sEA:[]},mangledGlobalNames:{a:"int",i:"double",bb:"num",b:"String",k:"bool",bx:"Null",n:"List",y:"Object",m:"Map"},mangledNames:{},types:["0&()","m<b,@>()","C<b,b>(b,@)","a(a)","b(b)","@(@)","~(y?,y?)","k(N)","k(U)","k(Q)","k(ag)","k(S)","k(ar)","k(a2)","k(Y)","k(y?)","k(ay)","k(ai)","k(ad)","a0(@)","m<b,@>(a0)","aw(@)","ah(@)","a6(@)","aj(@)","m<b,@>(aw)","m<b,@>(ah)","m<b,@>(a6)","m<b,@>(aj)","@(@,b)","ab(@)","b(b,b,i)","b(@)","C<b,ac>(b,@)","C<b,m<b,@>>(b,ac)","k(a6)","b(a0)","k(b)","i(i)","k(a0)","a(+(a,O),+(a,O))","k(I)","n<e>(a,i,i)","@(b)","k(ab)","k(H)","b(b,i)","m<b,@>(ab)"],interceptorsByTag:null,leafTags:null,arrayRti:Symbol("$ti"),rttc:{"2;":(a,b)=>c=>c instanceof A.bL&&a.b(c.a)&&b.b(c.b)}}
A.ii(v.typeUniverse,JSON.parse('{"ci":"aK","bF":"aK","au":"aK","c1":{"k":[],"p":[]},"bm":{"p":[]},"l":{"n":["1"],"j":["1"],"f":["1"]},"cZ":{"l":["1"],"n":["1"],"j":["1"],"f":["1"]},"aE":{"a9":["1"]},"bn":{"i":[],"bb":[]},"bl":{"i":[],"a":[],"bb":[],"p":[]},"c2":{"i":[],"bb":[],"p":[]},"b2":{"b":[],"fg":[],"p":[]},"c6":{"w":[]},"j":{"f":["1"]},"x":{"j":["1"],"f":["1"]},"aL":{"a9":["1"]},"aM":{"f":["2"],"f.E":"2"},"bi":{"aM":["1","2"],"j":["2"],"f":["2"],"f.E":"2"},"Z":{"a9":["2"]},"z":{"x":["2"],"j":["2"],"f":["2"],"f.E":"2","x.E":"2"},"aR":{"f":["1"],"f.E":"1"},"bG":{"a9":["1"]},"bL":{"b7":[],"aA":[]},"b_":{"m":["1","2"]},"bf":{"b_":["1","2"],"m":["1","2"]},"aS":{"a9":["1"]},"bk":{"b_":["1","2"],"m":["1","2"]},"b0":{"aP":["1"],"j":["1"],"f":["1"]},"bg":{"b0":["1"],"aP":["1"],"j":["1"],"f":["1"]},"aI":{"b0":["1"],"aP":["1"],"j":["1"],"f":["1"]},"by":{"w":[]},"c4":{"w":[]},"ct":{"w":[]},"at":{"aH":[]},"bU":{"aH":[]},"bV":{"aH":[]},"cq":{"aH":[]},"cp":{"aH":[]},"aZ":{"aH":[]},"cw":{"w":[]},"cn":{"w":[]},"cv":{"w":[]},"a1":{"t":["1","2"],"eI":["1","2"],"m":["1","2"],"t.K":"1","t.V":"2"},"a5":{"j":["1"],"f":["1"],"f.E":"1"},"bs":{"a9":["1"]},"aJ":{"a1":["1","2"],"t":["1","2"],"eI":["1","2"],"m":["1","2"],"t.K":"1","t.V":"2"},"b7":{"aA":[]},"c7":{"p":[]},"c8":{"p":[]},"b4":{"X":["1"]},"bu":{"u":["i"],"n":["i"],"X":["i"],"j":["i"],"f":["i"],"P":["i"]},"bv":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"]},"c9":{"u":["i"],"n":["i"],"X":["i"],"j":["i"],"f":["i"],"P":["i"],"p":[],"u.E":"i"},"ca":{"u":["i"],"n":["i"],"X":["i"],"j":["i"],"f":["i"],"P":["i"],"p":[],"u.E":"i"},"cb":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"],"p":[],"u.E":"a"},"cc":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"],"p":[],"u.E":"a"},"cd":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"],"p":[],"u.E":"a"},"cf":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"],"p":[],"u.E":"a"},"cg":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"],"p":[],"u.E":"a"},"bw":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"],"p":[],"u.E":"a"},"ch":{"u":["a"],"n":["a"],"X":["a"],"j":["a"],"f":["a"],"P":["a"],"p":[],"u.E":"a"},"cx":{"w":[]},"bM":{"w":[]},"t":{"m":["1","2"]},"aP":{"j":["1"],"f":["1"]},"cz":{"t":["b","@"],"m":["b","@"],"t.K":"b","t.V":"@"},"cA":{"x":["b"],"j":["b"],"f":["b"],"f.E":"b","x.E":"b"},"bq":{"w":[]},"c5":{"w":[]},"i":{"bb":[]},"a":{"bb":[]},"n":{"j":["1"],"f":["1"]},"b":{"fg":[]},"be":{"w":[]},"bE":{"w":[]},"as":{"w":[]},"bA":{"w":[]},"c_":{"w":[]},"cu":{"w":[]},"cs":{"w":[]},"bD":{"w":[]},"bX":{"w":[]},"bC":{"w":[]},"b6":{"hS":[]},"av":{"aG":[]},"cj":{"aG":[]},"b1":{"aG":[]},"F":{"O":[]},"L":{"O":[]},"af":{"O":[]},"bB":{"O":[]},"br":{"O":[]},"ht":{"n":["a"],"j":["a"],"f":["a"]},"hZ":{"n":["a"],"j":["a"],"f":["a"]},"hY":{"n":["a"],"j":["a"],"f":["a"]},"hr":{"n":["a"],"j":["a"],"f":["a"]},"hW":{"n":["a"],"j":["a"],"f":["a"]},"hs":{"n":["a"],"j":["a"],"f":["a"]},"hX":{"n":["a"],"j":["a"],"f":["a"]},"hp":{"n":["i"],"j":["i"],"f":["i"]},"hq":{"n":["i"],"j":["i"],"f":["i"]}}'))
A.ih(v.typeUniverse,JSON.parse('{"j":1,"b4":1,"bW":2,"bZ":2}'))
var u=(function rtii(){var t=A.D
return{J:t("a0"),d:t("S"),I:t("ar"),E:t("T"),R:t("U"),C:t("O"),e:t("j<@>"),l:t("w"),Z:t("aH"),r:t("f<@>"),U:t("l<aY>"),t:t("l<T>"),w:t("l<aG>"),O:t("l<U>"),Q:t("l<O>"),Y:t("l<m<b,@>>"),G:t("l<y>"),x:t("l<+(a,O)>"),s:t("l<b>"),j:t("l<e>"),n:t("l<i>"),m:t("l<@>"),T:t("bm"),g:t("au"),p:t("X<@>"),D:t("Q"),V:t("Y"),aB:t("n<aY>"),b:t("n<@>"),cd:t("C<b,ac>"),q:t("C<b,b>"),bE:t("C<b,m<b,@>>"),P:t("m<b,@>"),bC:t("m<@,@>"),v:t("a6"),ac:t("N"),bK:t("bt"),a:t("bx"),K:t("y"),f:t("ab"),B:t("ac"),cm:t("aN"),cu:t("a2"),W:t("ag"),cY:t("jC"),F:t("+()"),av:t("+(a,O)"),L:t("aw"),d1:t("cm"),cI:t("H"),c:t("ah"),N:t("b"),aw:t("ai"),u:t("I"),h:t("aj"),k:t("cr"),cG:t("ay"),bW:t("p"),o:t("bF"),b4:t("e"),M:t("ad"),y:t("k"),i:t("i"),z:t("@"),S:t("a"),cU:t("a(a)"),A:t("0&*"),_:t("y*"),bc:t("f9<bx>?"),b_:t("n<i>?"),aL:t("n<@>?"),X:t("y?"),H:t("bb"),cQ:t("~(b,@)")}})();(function constants(){var t=hunkHelpers.makeConstList
B.am=J.c0.prototype
B.a=J.l.prototype
B.f=J.bl.prototype
B.c=J.bn.prototype
B.l=J.b2.prototype
B.an=J.au.prototype
B.ao=J.c3.prototype
B.Y=J.ci.prototype
B.x=J.bF.prototype
B.z=new A.S("tram",3,"tram")
B.p=new A.ar("player",0,"player")
B.A=new A.ar("traffic",1,"traffic")
B.a9=new A.ae(130,50)
B.aa=new A.ae(150,48)
B.ab=new A.ae(150,50)
B.ac=new A.ae(30,30)
B.ad=new A.ae(55,24)
B.ae=new A.ae(60,26)
B.B=new A.ae(90,44)
B.C=function getTagFallback(o) {
  var s = Object.prototype.toString.call(o);
  return s.substring(8, s.length - 1);
}
B.af=function() {
  var toStringFunction = Object.prototype.toString;
  function getTag(o) {
    var s = toStringFunction.call(o);
    return s.substring(8, s.length - 1);
  }
  function getUnknownTag(object, tag) {
    if (/^HTML[A-Z].*Element$/.test(tag)) {
      var name = toStringFunction.call(object);
      if (name == "[object Object]") return null;
      return "HTMLElement";
    }
  }
  function getUnknownTagGenericBrowser(object, tag) {
    if (object instanceof HTMLElement) return "HTMLElement";
    return getUnknownTag(object, tag);
  }
  function prototypeForTag(tag) {
    if (typeof window == "undefined") return null;
    if (typeof window[tag] == "undefined") return null;
    var constructor = window[tag];
    if (typeof constructor != "function") return null;
    return constructor.prototype;
  }
  function discriminator(tag) { return null; }
  var isBrowser = typeof HTMLElement == "function";
  return {
    getTag: getTag,
    getUnknownTag: isBrowser ? getUnknownTagGenericBrowser : getUnknownTag,
    prototypeForTag: prototypeForTag,
    discriminator: discriminator };
}
B.ak=function(getTagFallback) {
  return function(hooks) {
    if (typeof navigator != "object") return hooks;
    var userAgent = navigator.userAgent;
    if (typeof userAgent != "string") return hooks;
    if (userAgent.indexOf("DumpRenderTree") >= 0) return hooks;
    if (userAgent.indexOf("Chrome") >= 0) {
      function confirm(p) {
        return typeof window == "object" && window[p] && window[p].name == p;
      }
      if (confirm("Window") && confirm("HTMLElement")) return hooks;
    }
    hooks.getTag = getTagFallback;
  };
}
B.ag=function(hooks) {
  if (typeof dartExperimentalFixupGetTag != "function") return hooks;
  hooks.getTag = dartExperimentalFixupGetTag(hooks.getTag);
}
B.aj=function(hooks) {
  if (typeof navigator != "object") return hooks;
  var userAgent = navigator.userAgent;
  if (typeof userAgent != "string") return hooks;
  if (userAgent.indexOf("Firefox") == -1) return hooks;
  var getTag = hooks.getTag;
  var quickMap = {
    "BeforeUnloadEvent": "Event",
    "DataTransfer": "Clipboard",
    "GeoGeolocation": "Geolocation",
    "Location": "!Location",
    "WorkerMessageEvent": "MessageEvent",
    "XMLDocument": "!Document"};
  function getTagFirefox(o) {
    var tag = getTag(o);
    return quickMap[tag] || tag;
  }
  hooks.getTag = getTagFirefox;
}
B.ai=function(hooks) {
  if (typeof navigator != "object") return hooks;
  var userAgent = navigator.userAgent;
  if (typeof userAgent != "string") return hooks;
  if (userAgent.indexOf("Trident/") == -1) return hooks;
  var getTag = hooks.getTag;
  var quickMap = {
    "BeforeUnloadEvent": "Event",
    "DataTransfer": "Clipboard",
    "HTMLDDElement": "HTMLElement",
    "HTMLDTElement": "HTMLElement",
    "HTMLPhraseElement": "HTMLElement",
    "Position": "Geoposition"
  };
  function getTagIE(o) {
    var tag = getTag(o);
    var newTag = quickMap[tag];
    if (newTag) return newTag;
    if (tag == "Object") {
      if (window.DataView && (o instanceof window.DataView)) return "DataView";
    }
    return tag;
  }
  function prototypeForTagIE(tag) {
    var constructor = window[tag];
    if (constructor == null) return null;
    return constructor.prototype;
  }
  hooks.getTag = getTagIE;
  hooks.prototypeForTag = prototypeForTagIE;
}
B.ah=function(hooks) {
  var getTag = hooks.getTag;
  var prototypeForTag = hooks.prototypeForTag;
  function getTagFixed(o) {
    var tag = getTag(o);
    if (tag == "Document") {
      if (!!o.xmlVersion) return "!Document";
      return "!HTMLDocument";
    }
    return tag;
  }
  function prototypeForTagFixed(tag) {
    if (tag == "Document") return null;
    return prototypeForTag(tag);
  }
  hooks.getTag = getTagFixed;
  hooks.prototypeForTag = prototypeForTagFixed;
}
B.D=function(hooks) { return hooks; }

B.i=new A.d1()
B.k=new A.dR()
B.w=new A.ai("day",0,"day")
B.y=new A.ad("clear",0,"clear")
B.al=new A.bY(B.w,B.y)
B.E=new A.U("E",2,"e")
B.F=new A.U("NE",4,"ne")
B.G=new A.U("NW",5,"nw")
B.d=new A.U("N",0,"n")
B.H=new A.U("SE",6,"se")
B.I=new A.U("SW",7,"sw")
B.e=new A.U("S",1,"s")
B.J=new A.U("W",3,"w")
B.ap=new A.d2(null)
B.aq=new A.d3(null)
B.ar=new A.aa(0,"ground")
B.q=new A.aa(1,"roadSurface")
B.h=new A.aa(2,"markings")
B.as=new A.aa(3,"tramTrack")
B.r=new A.aa(4,"vehicles")
B.b=new A.aa(5,"signs")
B.t=new A.aa(6,"lights")
B.at=new A.aa(7,"overlays")
B.K=new A.Q("all",8,"all")
B.N=new A.Y("off",0,"off")
B.a_=new A.H("crossroads_4way",0,"crossroads4way")
B.a0=new A.H("t_junction",1,"tJunction")
B.bo=new A.H("y_junction",2,"yJunction")
B.bk=new A.H("roundabout",3,"roundabout")
B.bm=new A.H("straight_road",4,"straightRoad")
B.bj=new A.H("overtaking",5,"overtaking")
B.bg=new A.H("pedestrian_crossing",6,"pedestrianCrossing")
B.bh=new A.H("railway_crossing",7,"railwayCrossing")
B.bi=new A.H("narrow_road",8,"narrowRoad")
B.bl=new A.H("parking_stopping",9,"parkingStopping")
B.bf=new A.H("residential_yard",10,"residentialYard")
B.bn=new A.H("tunnel",11,"tunnel")
B.aC=A.c(t([B.a_,B.a0,B.bo,B.bk,B.bm,B.bj,B.bg,B.bh,B.bi,B.bl,B.bf,B.bn]),A.D("l<H>"))
B.aD=A.c(t([18,18]),u.n)
B.aE=A.c(t([34,34]),u.n)
B.aF=A.c(t([40,32]),u.n)
B.aG=A.c(t([4293016379,4294099504,4282365276]),A.D("l<a>"))
B.aH=A.c(t([B.p,B.A]),A.D("l<ar>"))
B.X=new A.a2("collision",0,"collision")
B.W=new A.a2("priority_violation",1,"priorityViolation")
B.b7=new A.a2("sign_violation",2,"signViolation")
B.b6=new A.a2("marking_violation",3,"markingViolation")
B.V=new A.a2("unnecessary_wait",4,"unnecessaryWait")
B.b8=new A.a2("unsafe_but_legal",5,"unsafeButLegal")
B.aI=A.c(t([B.X,B.W,B.b7,B.b6,B.V,B.b8]),A.D("l<a2>"))
B.bd=new A.ag("main",0,"main")
B.be=new A.ag("secondary",1,"secondary")
B.bc=new A.ag("equal",2,"equal")
B.aJ=A.c(t([B.bd,B.be,B.bc]),A.D("l<ag>"))
B.U=new A.N("stop_line",0,"stopLine")
B.T=new A.N("give_way_line",1,"giveWayLine")
B.u=new A.N("crosswalk",2,"crosswalk")
B.v=new A.N("solid_line",3,"solidLine")
B.m=new A.N("dashed_line",4,"dashedLine")
B.n=new A.N("double_solid",5,"doubleSolid")
B.b3=new A.N("stop_box",6,"stopBox")
B.b2=new A.N("no_stopping",7,"noStopping")
B.b1=new A.N("no_parking",8,"noParking")
B.b0=new A.N("lane_arrow",9,"laneArrow")
B.aK=A.c(t([B.U,B.T,B.u,B.v,B.m,B.n,B.b3,B.b2,B.b1,B.b0]),A.D("l<N>"))
B.a4=new A.S("car",0,"car")
B.a8=new A.S("truck",1,"truck")
B.a3=new A.S("bus",2,"bus")
B.a6=new A.S("motorcycle",4,"motorcycle")
B.a2=new A.S("bicycle",5,"bicycle")
B.a7=new A.S("pedestrian",6,"pedestrian")
B.a5=new A.S("emergency",7,"emergency")
B.aL=A.c(t([B.a4,B.a8,B.a3,B.z,B.a6,B.a2,B.a7,B.a5]),A.D("l<S>"))
B.bt=new A.ai("night",1,"night")
B.bs=new A.ai("dusk",2,"dusk")
B.aM=A.c(t([B.w,B.bt,B.bs]),A.D("l<ai>"))
B.R=A.c(t([]),u.t)
B.aO=A.c(t([]),A.D("l<a6>"))
B.aN=A.c(t([]),A.D("l<ah>"))
B.aP=A.c(t([]),A.D("l<aj>"))
B.bA=new A.I("priority_and_intersections",0,"priorityAndIntersections")
B.bF=new A.I("signs",1,"signs")
B.bD=new A.I("markings",2,"markings")
B.by=new A.I("traffic_lights_and_signals",3,"trafficLightsAndSignals")
B.bB=new A.I("speed_and_distance",4,"speedAndDistance")
B.bz=new A.I("overtaking_and_passing",5,"overtakingAndPassing")
B.bx=new A.I("stopping_and_parking",6,"stoppingAndParking")
B.bu=new A.I("pedestrians_and_crossings",7,"pedestriansAndCrossings")
B.bG=new A.I("railway_crossings",8,"railwayCrossings")
B.bw=new A.I("special_vehicles",9,"specialVehicles")
B.bv=new A.I("vehicle_condition",10,"vehicleCondition")
B.bE=new A.I("documents_and_liability",11,"documentsAndLiability")
B.bC=new A.I("first_aid",12,"firstAid")
B.aQ=A.c(t([B.bA,B.bF,B.bD,B.by,B.bB,B.bz,B.bx,B.bu,B.bG,B.bw,B.bv,B.bE,B.bC]),A.D("l<I>"))
B.c9=new A.ad("rain",1,"rain")
B.ca=new A.ad("snow",2,"snow")
B.c8=new A.ad("fog",3,"fog")
B.aR=A.c(t([B.y,B.c9,B.ca,B.c8]),A.D("l<ad>"))
B.O=new A.Y("red",1,"red")
B.P=new A.Y("yellow",2,"yellow")
B.L=new A.Y("green",3,"green")
B.M=new A.Y("green_blink",4,"greenBlink")
B.Q=new A.Y("yellow_blink",5,"yellowBlink")
B.aS=A.c(t([B.N,B.O,B.P,B.L,B.M,B.Q]),A.D("l<Y>"))
B.ax=new A.Q("N",0,"n")
B.aA=new A.Q("S",1,"s")
B.au=new A.Q("E",2,"e")
B.aB=new A.Q("W",3,"w")
B.av=new A.Q("NE",4,"ne")
B.aw=new A.Q("NW",5,"nw")
B.ay=new A.Q("SE",6,"se")
B.az=new A.Q("SW",7,"sw")
B.aT=A.c(t([B.ax,B.aA,B.au,B.aB,B.av,B.aw,B.ay,B.az,B.K]),A.D("l<Q>"))
B.S=A.c(t([B.d,B.e,B.E,B.J,B.F,B.G,B.H,B.I]),u.O)
B.bI=new A.ay("NS",0,"ns")
B.bH=new A.ay("EW",1,"ew")
B.aU=A.c(t([B.bI,B.bH]),A.D("l<ay>"))
B.aV=new A.b3(0,"straight")
B.aW=new A.b3(1,"left")
B.aX=new A.b3(2,"right")
B.aY=new A.b3(3,"uTurn")
B.b5={}
B.aZ=new A.bf(B.b5,[],A.D("bf<b,ac>"))
B.b_=new A.bk([B.O,0,B.P,1,B.Q,1,B.L,2,B.M,2],A.D("bk<Y,a>"))
B.b9=new A.aO(4292666325,4283849827,4288324008,4293783537,4294309623,4294112501,4282007107,4282285009,4292431677,4292911918,4280166451,4280494126,0)
B.ba=new A.aO(4279967785,4281218108,4283060570,4291349971,4292205280,4291349971,4279506973,4283075296,4293156941,4293440586,4278980888,4278848785,0)
B.bb=new A.aO(4288521105,4282731348,4286284427,4292731366,4293191916,4292731366,4280494126,4282679510,4292761412,4292913212,4279508005,4279638559,0)
B.Z=new A.cl(0,0,1000,1000)
B.bp=new A.aI([B.a_,B.a0],A.D("aI<H>"))
B.bq=new A.aI([B.U,B.T,B.u,B.v,B.m,B.n],A.D("aI<N>"))
B.b4={"2.1":0,"2.4":1,"2.5":2}
B.br=new A.bg(B.b4,3,A.D("bg<b>"))
B.bJ=A.a8("jz")
B.bK=A.a8("jA")
B.bL=A.a8("hp")
B.bM=A.a8("hq")
B.bN=A.a8("hr")
B.bO=A.a8("hs")
B.bP=A.a8("ht")
B.bQ=A.a8("y")
B.bR=A.a8("hW")
B.bS=A.a8("hX")
B.bT=A.a8("hY")
B.bU=A.a8("hZ")
B.a1=new A.e(0,0)
B.bV=new A.e(0,1)
B.bW=new A.e(0,-1)
B.bX=new A.e(1,0)
B.bY=new A.e(0.7071067811865476,-0.7071067811865476)
B.j=new A.e(500,500)
B.bZ=new A.e(0.7071067811865476,0.7071067811865476)
B.c_=new A.e(-0.7071067811865476,0.7071067811865476)
B.c0=new A.e(-1,0)
B.c1=new A.e(-0.7071067811865476,-0.7071067811865476)
B.c2=new A.al(0,"markingNotRendered")
B.c3=new A.al(1,"markingMissingTarget")
B.o=new A.al(2,"attachmentUnresolved")
B.c4=new A.al(3,"signArtworkGeneric")
B.c5=new A.al(4,"sceneTypeUnsupported")
B.c6=new A.al(5,"laneUnavailable")
B.c7=new A.al(6,"playbackDurationOutOfRange")})();(function staticFields(){$.e4=null
$.a_=A.c([],u.G)
$.fh=null
$.f5=null
$.f4=null
$.fW=null
$.fP=null
$.h_=null
$.el=null
$.er=null
$.eX=null
$.ea=A.c([],A.D("l<n<y>?>"))})();(function lazyInitializers(){var t=hunkHelpers.lazyFinal
t($,"jB","eB",()=>A.ja("_$dart_dartClosure"))
t($,"jD","h2",()=>A.ak(A.e_({
toString:function(){return"$receiver$"}})))
t($,"jE","h3",()=>A.ak(A.e_({$method$:null,
toString:function(){return"$receiver$"}})))
t($,"jF","h4",()=>A.ak(A.e_(null)))
t($,"jG","h5",()=>A.ak(function(){var $argumentsExpr$="$arguments$"
try{null.$method$($argumentsExpr$)}catch(s){return s.message}}()))
t($,"jJ","h8",()=>A.ak(A.e_(void 0)))
t($,"jK","h9",()=>A.ak(function(){var $argumentsExpr$="$arguments$"
try{(void 0).$method$($argumentsExpr$)}catch(s){return s.message}}()))
t($,"jI","h7",()=>A.ak(A.fo(null)))
t($,"jH","h6",()=>A.ak(function(){try{null.$method$}catch(s){return s.message}}()))
t($,"jM","hb",()=>A.ak(A.fo(void 0)))
t($,"jL","ha",()=>A.ak(function(){try{(void 0).$method$}catch(s){return s.message}}()))
t($,"jW","eC",()=>A.f_(B.bQ))
t($,"jX","f2",()=>A.i8())})();(function nativeSupport(){!function(){var t=function(a){var n={}
n[a]=1
return Object.keys(hunkHelpers.convertToFastObject(n))[0]}
v.getIsolateTag=function(a){return t("___dart_"+a+v.isolateTag)}
var s="___dart_isolate_tags_"
var r=Object[s]||(Object[s]=Object.create(null))
var q="_ZxYxX"
for(var p=0;;p++){var o=t(q+"_"+p+"_")
if(!(o in r)){r[o]=1
v.isolateTag=o
break}}v.dispatchPropertyName=v.getIsolateTag("dispatch_record")}()
hunkHelpers.setOrUpdateInterceptorsByTag({ArrayBuffer:A.c7,ArrayBufferView:A.ce,DataView:A.c8,Float32Array:A.c9,Float64Array:A.ca,Int16Array:A.cb,Int32Array:A.cc,Int8Array:A.cd,Uint16Array:A.cf,Uint32Array:A.cg,Uint8ClampedArray:A.bw,CanvasPixelArray:A.bw,Uint8Array:A.ch})
hunkHelpers.setOrUpdateLeafTags({ArrayBuffer:true,ArrayBufferView:false,DataView:true,Float32Array:true,Float64Array:true,Int16Array:true,Int32Array:true,Int8Array:true,Uint16Array:true,Uint32Array:true,Uint8ClampedArray:true,CanvasPixelArray:true,Uint8Array:false})
A.b4.$nativeSuperclassTag="ArrayBufferView"
A.bH.$nativeSuperclassTag="ArrayBufferView"
A.bI.$nativeSuperclassTag="ArrayBufferView"
A.bu.$nativeSuperclassTag="ArrayBufferView"
A.bJ.$nativeSuperclassTag="ArrayBufferView"
A.bK.$nativeSuperclassTag="ArrayBufferView"
A.bv.$nativeSuperclassTag="ArrayBufferView"})()
Function.prototype.$0=function(){return this()}
Function.prototype.$1=function(a){return this(a)}
Function.prototype.$2=function(a,b){return this(a,b)}
Function.prototype.$3=function(a,b,c){return this(a,b,c)}
Function.prototype.$4=function(a,b,c,d){return this(a,b,c,d)}
Function.prototype.$1$1=function(a){return this(a)}
Function.prototype.$2$1=function(a){return this(a)}
convertAllToFastObject(w)
convertToFastObject($);(function(a){if(typeof document==="undefined"){a(null)
return}if(typeof document.currentScript!="undefined"){a(document.currentScript)
return}var t=document.scripts
function onLoad(b){for(var r=0;r<t.length;++r){t[r].removeEventListener("load",onLoad,false)}a(b.target)}for(var s=0;s<t.length;++s){t[s].addEventListener("load",onLoad,false)}})(function(a){v.currentScript=a
var t=A.jk
if(typeof dartMainRunner==="function"){dartMainRunner(t,[])}else{t([])}})})()
//# sourceMappingURL=engine.js.map
