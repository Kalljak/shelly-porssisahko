/**
 * @license
 * 
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
let C_HIST=24,C_ERRC=3,C_ERRD=120,C_DEF={mode:0,m0:{cmd:0},m1:{lim:0},m2:{per:24,cnt:0,lim:-999,sq:0,m:999},vat:24,day:0,night:0,bk:0,err:0,outs:[0],fh:0,fhCmd:0,inv:0,min:60},_={s:{v:"2.11.0",dn:"",st:0,str:"",cmd:0,chkTs:0,errCnt:0,errTs:0,upTs:0,timeOK:0,configOK:0,fCmdTs:0,fCmd:0,tz:"+02:00",tzh:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},p:[[],[]],h:[],c:C_DEF},l=!1,i=!1;function r(t,s){s-=t;return 0<=s&&s<3600}function a(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function n(t,s,e){let n=t.toString();for(;n.length<s;)n=e?e+n:" "+n;return n}function o(t){return t.getDate()}function u(t){let s=t.toString(),e=0;"+0000"==(s=s.substring(3+s.indexOf("GMT")))?(s="Z",e=0):(e=+s.substring(0,3),s=s.substring(0,3)+":"+s.substring(3)),s!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=s,_.s.tzh=e}function d(t){console.log((new Date).toString().substring(16,24)+":",t)}function c(){var t=new Date;_.s.timeOK=2e3<t.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,!_.s.upTs&&_.s.timeOK&&(_.s.upTs=a(t))}function h(t){Shelly.call("KVS.Get",{key:"porssi-config"},function(s,t,e,n){_.c=s?s.value:{},"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!0));{s=function(t){_.s.configOK=t?1:0,_.s.chkTs=0,n&&(l=!1,f())};let t=0;if(C_DEF){for(var o in null==_.c.fhCmd&&null!=_.c.fh&&(_.c.fhCmd=_.c.fh),C_DEF)if(void 0===_.c[o])_.c[o]=C_DEF[o],t++;else if("object"==typeof C_DEF[o])for(var i in C_DEF[o])void 0===_.c[o][i]&&(_.c[o][i]=C_DEF[o][i],t++);void 0!==_.c.out&&(_.c.outs=[_.c.out],_.c.out=void 0),C_DEF=null,0<t?Shelly.call("KVS.Set",{key:"porssi-config",value:_.c},function(t,s,e,n){0!==s&&d("chkConfig() - save failed:"+s+" - "+e),n&&n(0===s)},s):s&&s(!0)}else s&&s(!0)}},t)}function f(){try{l||(l=!0,c(),_.s.configOK?t(0)?s(0):!function(){if(0==_.s.chkTs)return 1;var t=new Date,s=new Date(1e3*_.s.chkTs);return s.getHours()!=t.getHours()||s.getFullYear()!=t.getFullYear()||0<_.s.fCmdTs&&_.s.fCmdTs-a(t)<0||0==_.s.fCmdTs&&_.c.min<60&&t.getMinutes()>=_.c.min&&_.s.cmd+_.c.inv==1}()?t(1)?s(1):l=!1:A():h(!0))}catch(t){d("loop() - "+t),l=!1}}function t(t){var s=new Date;let e=!1;if(1==t)e=_.s.timeOK&&0===_.s.p[1].ts&&s.getHours()>=13+_.s.tzh;else{let t=o(new Date(1e3*_.s.p[0].ts))!==o(s);t&&0<_.s.p[1].ts&&o(new Date(1e3*_.s.p[1].ts))!==o(s)&&(_.TOMORROW_PRICES_USED=!0,_.p[0]=_.p[1],_.s.p[0]=_.s.p[1],_.s.p[1].ts=0,_.p[1]=[],t=!1),e=_.s.timeOK&&(0==_.s.p[0].ts||t)}return _.s.errCnt>=C_ERRC&&a(s)-_.s.errTs<C_ERRD?e=!1:_.s.errCnt>=C_ERRC&&(_.s.errCnt=0),e}function s(c){try{let i=new Date;u(i);var s=1==c?new Date(864e5+new Date(i.getFullYear(),i.getMonth(),i.getDate()).getTime()):i;let t=s.getFullYear()+"-"+n(1+s.getMonth(),2,"0")+"-"+n(o(s),2,"0")+"T00:00:00"+_.s.tz.replace("+","%2b");var e=t.replace("T00:00:00","T23:59:59");let r={url:"https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start="+t+"&end="+e,timeout:5,ssl_ca:"*"};i=null,t=null,Shelly.call("HTTP.GET",r,function(s,t,e){r=null;try{if(0!==t||null==s||200!==s.code||!s.body_b64)throw Error("virhe: "+t+"("+e+") - "+JSON.stringify(s));{s.headers=null,e=s.message=null,_.s.p[c].high=-999,_.s.p[c].low=999,s.body_b64=atob(s.body_b64),s.body_b64=s.body_b64.substring(1+s.body_b64.indexOf("\n"));let t=0;for(;0<=t;){s.body_b64=s.body_b64.substring(t);var n=[t=0,0];if(0===(t=1+s.body_b64.indexOf('"',t)))break;n[0]=+s.body_b64.substring(t,s.body_b64.indexOf('"',t)),t=2+s.body_b64.indexOf('"',t),t=2+s.body_b64.indexOf(';"',t),n[1]=+(""+s.body_b64.substring(t,s.body_b64.indexOf('"',t)).replace(",",".")),n[1]=n[1]/10*(100+(0<n[1]?_.c.vat:0))/100;var o=new Date(1e3*n[0]).getHours();n[1]+=7<=o&&o<22?_.c.day:_.c.night,_.p[c].push(n),_.s.p[c].avg+=n[1],n[1]>_.s.p[c].high&&(_.s.p[c].high=n[1]),n[1]<_.s.p[c].low&&(_.s.p[c].low=n[1]),t=s.body_b64.indexOf("\n",t)}if(s=null,_.s.p[c].avg=0<_.p[c].length?_.s.p[c].avg/_.p[c].length:0,_.s.p[c].ts=a(i),1==c&&_.p[c].length<23)throw Error("huomisen hintoja ei saatu")}}catch(t){d("getPrices() - "+t),_.s.errCnt+=1,_.s.errTs=a(),_.s.p[c].ts=0,_.p[c]=[]}1==c?l=!1:(_.PRICE_READ_HTTP=a(),A())})}catch(t){d("getPrices() - "+t),_.s.p[c].ts=0,_.p[c]=[],1==c?l=!1:A()}}function g(s){_.c.inv&&(i=!i);let e=0,n=0;for(let t=0;t<_.c.outs.length;t++)!function(o,t){var s="{id:"+o+",on:"+(i?"true":"false")+"}";Shelly.call("Switch.Set",s,function(t,s,e,n){0!=s&&d("setRelay() - ohjaus #"+o+" epäonnistui: "+s+" - "+e),n(0==s)},t)}(_.c.outs[t],function(t){if(e++,t&&n++,e==_.c.outs.length)if(n==e){for(;_.h.length>=C_HIST;)_.h.splice(0,1);_.h.push([a(),i?1:0,_.s.st]),_.s.cmd=i?1:0,s(!0)}else s(!1)})}function A(){try{"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!1)),i=!1;var t,s,e=new Date;function n(t){i!=t&&(_.s.st=12,d("HUOMIO: käyttäjäskripti muutti ohjausta")),i=t,g(function(t){t&&(_.s.chkTs=a()),l=!1})}u(e),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var s=a();for(let t=0;t<_.p[0].length;t++)if(r(_.p[0][t][0],s))return _.s.p[0].now=_.p[0][t][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}(),0===_.c.mode?(i=1===_.c.m0.cmd,_.s.st=1):_.s.timeOK&&0<_.s.p[0].ts&&o(new Date(1e3*_.s.p[0].ts))===o(e)?1===_.c.mode?(i=_.s.p[0].now<=("avg"==_.c.m1.lim?_.s.p[0].avg:_.c.m1.lim),_.s.st=i?2:3):2===_.c.mode&&(i=function(){if(0!=_.c.m2.cn){_.c.m2.cnt=Math.min(_.c.m2.cnt,_.c.m2.per);var n=[];for(v=0;v<_.p[0].length;v+=_.c.m2.per){var o=[];for(ind=v;ind<v+_.c.m2.per&&!(ind>_.p[0].length-1);ind++)o.push(ind);if(_.c.m2.sq){let s=999,e=0;for(p=0;p<=o.length-_.c.m2.cnt;p++){let t=0;for(m=p;m<p+_.c.m2.cnt;m++)t+=_.p[0][o[m]][1];t/_.c.m2.cnt<s&&(s=t/_.c.m2.cnt,e=p)}for(p=e;p<e+_.c.m2.cnt;p++)n.push(o[p])}else{for(p=1;p<o.length;p++){var t=o[p];for(m=p-1;0<=m&&_.p[0][t][1]<_.p[0][o[m]][1];m--)o[m+1]=o[m];o[m+1]=t}for(p=0;p<_.c.m2.cnt;p++)n.push(o[p])}}var e=a();let s=!1;for(let t=0;t<n.length;t++)if(r(_.p[0][n[t]][0],e)){s=!0;break}return v=null,p=null,m=null,s}}(),_.s.st=i?5:4,!i&&_.s.p[0].now<=("avg"==_.c.m2.lim?_.s.p[0].avg:_.c.m2.lim)&&(i=!0,_.s.st=6),i)&&_.s.p[0].now>("avg"==_.c.m2.m?_.s.p[0].avg:_.c.m2.m)&&(i=!1,_.s.st=11):_.s.timeOK?(_.s.st=7,t=1<<e.getHours(),(_.c.bk&t)==t&&(i=!0)):(i=1===_.c.err,_.s.st=8),_.s.timeOK&&0<_.c.fh&&(s=1<<e.getHours(),(_.c.fh&s)==s)&&(i=(_.c.fhCmd&s)==s,_.s.st=10),i&&_.s.timeOK&&e.getMinutes()>=_.c.min&&(_.s.st=13,i=!1),_.s.timeOK&&0<_.s.fCmdTs&&(0<_.s.fCmdTs-a(e)?(i=1==_.s.fCmd,_.s.st=9):_.s.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(i,_,n):n(i)}catch(t){d("logic() virhe:"+t),l=!1}}let v=0,p=0,m=0;d("shelly-porssisahko v."+_.s.v),d("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),HTTPServer.registerEndpoint("",function(e,n){try{if(l)return e=null,n.code=503,void n.send();var o=function(t){var s={},e=t.split("&");for(let t=0;t<e.length;t++){var n=e[t].split("=");s[n[0]]=n[1]}return s}(e.query);e=null;let t="application/json",s=(n.code=200,!0);var i="text/html",r="text/javascript";"s"===o.r?(c(),n.body=JSON.stringify(_),s=!1):"r"===o.r?(h(_.s.configOK=!1),_.s.p[0].ts=0,_.s.p[1].ts=0,n.code=204,s=!1):"f"===o.r&&o.ts?(_.s.fCmdTs=+(""+o.ts),_.s.fCmd=+(""+o.c),_.s.chkTs=0,n.code=204,s=!1):o.r?"s.js"===o.r?(n.body=atob("H4sIAAAAAAAACo1W4W7bNhB+FYXrAhJmCKft/thTjbbJ1nVJM9RegaEoFkaiI9o06ZAnt4art8mb5MV2lGRHCdx2f+KY/O7uu7vvjjYKkr/fn6WEcPwYx8+bkEL6IndZuVAWxE2p/HqsjMrAeQqMn7z6PaUsfbGp+HjycnL673jyPv1I/ry7XVurAyi4u727tYTHo6BdMZNlwG9vtAWZSGNU4uVM2t3R2uhHJ0onhTQrvVhqmaA7Y+5uk4iYyXlwxsgd8n/C6qhSW5ksI7kaeLSN+UH6RVkGKC20bBMaGaClm0mOdnN0r1XuQpAs+ry7xWigjdzCawjadFF/yfncHW0RP4dEBtAPLwDKpA77oBYLZK8XeksvFhYw3gyLmoS518sdTUTPtZ85DSBjspMSO2CT5nahbVmChmQeHSiANfnEzy9OOg173J0YEv9/G8tn29ouJESOVgOaB5Cg0pXTedLnr1+N04+f+ELVckDluKWyE3mVyrC2WYIi2jTIgzSFw0NC4ufXrxRSAvLqKPrC0Ix/1jZ3n4VxmcTMrChkKFIYrqRPZHoTKPmJ9IAN5eEhlSIrVDZXeXrQZ5yQNG0A2VGECG2t8m8m52eHh/KzxNSXblkapHyytnKhsxMJkkKPiAIWBhNt7SquVtK8dlgBjQ7GWazxRF6HlLbcnDVO5k1itfbbVOk+7iKUVwG8ttf0uLcXgGfqy8U0ZsYYht8/bC+NoUQAlkhMnT+VWYGlewFC5vnpCtFncdiQLyVZIe21Ihw6zEBgP68VCJ2zijGOTmOIP3LEoDsayxvqTEOs4e6a7SHR4LBVOu0P9a+tmTDKXkMx1L0ea48+6k9NEybqC4xiVem+GzaYKsB0OnfBZ0xAoSydljaLpaI5dott4l8BaEQf33u2qSN4zK9ivONsKT3m8s7lSni1cCv1utAm74SL+D3aaBsMXMYeg19vTk4/1IqNy7FHRj5FvaDPpZGZorWMUUbYoN3RVlrY2FrBKm2UiJ1o1McPjtlQCTcfUSy77Ig2VSIm+y0xIpYNHpuQU++dj94B9ZZE+0FCekrAF6hQclEzbJM5i/tQCRXBeFBVvOXTZoxB40S1SUfeuuXdNEqyoZ5SjazZxuCTAaktjRl6BaW3ydP+cxxtLZqJxjGFVI0acy1muEooG2y/Np1EJbVovnHzwUGfZ9iswe4Q2e++RMHwOjGoqjbiw4Rkj8Skuwas8Xu8x+/lk42sBsmTTRdfJRSPH3Cs2GUTNqZa3RdzL4XWKTp5O754J5rx19N1LDa7fMjm6LjL4xsm3dAVx4HFPXwSly/OOFqCaBqo4lS4cbNtGAo/H+PYA33KSZ+wSjzZUEJ6uIdqg3NUVYHV3wO8bBC/YcB/lPSUtTEnOu53nAjURxTJMYsrCJFvXOnDd6NjV0gbF58iUD9AUznaGYwVljf/vsGARCM1ImIXxRgdvmv5bGfZKem+FO9vsR09guq6L0eEcsV4ucQeqTPnlp2HoX6OwlJbXAoB1iiQlQ76ShsN65TU/xtFhtsxg0frYbdncOsPIW6J5smFejUMfuk/i4+oiDrCOWvuokhYfI0fPBPY5m8vAH5vWU3xZ5Ex6x8wL3SeK/w5ElRdA1cCvc+fH6vnuFSGuC1HXt28RU+5WuHoY63vUZQN/wMZPoY6bwoAAA=="),t=r):"s.css"===o.r?(n.body=atob("H4sIAAAAAAAACo1VS2/jNhD+K8QGBZJsJEvOeutIaNCeFiiKopf2UvRAkUOLNUUKJOXHLvzfd0g9LDsO2ostzovffPPg4vGRPBJXg1LHpDXWOelovTUkiO/ZA/m1QxGRzniqDElI7X1bLBb/DpJUSDQMQofSjfR1V6XMNJPB4p3Yv0kG2kFBvvz+J/lFCLCGfAENliryR1cpyUYTsntOM/K4QKdvpDKHxMmvUm8K/LYcbIKikpzwxI9PhKINM8rYgtwBE5nIR11wpmy7sabTHLVL9gyrrCRKakhqkJvaFyRPP0FTEmG0D9cgvCx9mSSCNlIdC/IXWE41LUlDD8lecl8X5NOLDXbDKc+yH4LabqTGGIR23pSkpZxH5Kv2gCZtxH3npVeA6GaXDjB6f0zQe9NEr+jATHu8tM/SdbCnSm504kCJgggFhwQ0L4mHg0+iqiA2pBmCpEIdMAaXrlX02JtHuaeVQ0VrnPTSBBdQ1MsdlJf05bRiL2xyKYoKhLHwNB6p8GBjMbQHjdR++FCer0MbBTPnyVoBtaGyvh61IVNlKEZQIHrs3s2ha6OnUImiFai5tlKGba+qvEx/XAW+pnpkyPgySIaWsoMdlskZJTmm+5lm61VJWGddaK7WSMzLTvcOaeLNFx1wphHTNKrziPRrIjWHA5pgbUx7hhPyQywzXDn2FLkiXghRTi0+NrFpKZP+GL0jQQWrgW2Bf7xg5b8D9QTciBNDfLzKdbo2n6W17F1NOy/DxkpsxfCbeGhQ5gHjqK7RDr2FjRMSPqKza3XswchxAju8zY2FHvlNl3HgzpPbn6cE4nkon7dUu5ZajDPVeMx8bORBjLhH1b6WoV5jT1AuO0SxCnWlWja0L2zAmrvYYNQSqYXU0e1Eft7CUVjagCN9QqEn8C+iwWHBkba4Iz3cP3/OOGwe0OfUj0bK2KsPW+vV21fPCyGt8wmrpeI4YdXmaTBzDUaba8e9sB9oqYxC3ndgvWRUjWsAk3x/nHEzJI0JZVZx9nCPcGmBDevA7GNuDXBJ7+cLcI0L7SGkF5E1c/w3BvJiTE63nK7SGpbhMCRhFZ4rFvt1eg76bZnNwr4lae6b45hXCtnou+V/kNB37rXhK5e7CegAYIBwvtGFkYk7Z96JirbhLRy/3tJzxnwD7/xd6YePhTrM9j4+pOO2EnK+pTB6bPOIC8KM7S1to+E+X2czy/XwXqWNz7NzPXoGRx2ykQ98xaUQzO1qTsqEsVGr66qOquqJ3LmENe908wmnrO383/7Ywk9Vh+XW/1y/n3nYBafzlHy78aYPmfVv88w2kj1y+hww3abSdQ3CD0/x21fhOwHDFYdYCQAA"),t="text/css"):"status"===o.r?(n.body=atob("H4sIAAAAAAAACr2STU7DMBCFr2J5BYvmZ4HEIrXEDqFKLOgFJrZL3PonxBNK7pMzcIFcDKdJU9J0wYqFvXjv88ybkTOEXEvCNXi/poZwTlmGVThiFI/pY8Jeiz3UntgGe0OJtV9xI9gGBCCAjaJofDSQBy8t8VIrlBPv8VyYvXVtcei+LSmURZhVte54jRHsWtu14ZooAQ2bNfTYNGWpJsA4ISdiAwpRhkRWmQsi7ARslYZJV3bnWBaf9sIyoT7Py9npLxJOqJ2vuNN0ZiLvvZSY6mFhGEyTIOZs61DWWBv4NVKch2aBD0GGjrPlUyT5O2VP6gAL8blf3kId1hHy92VyJ5phqjK5zDS0uxVe/yl8UTsjrYV/y55eZ79McAJu5B0IzytVIqvkx4u/o6FE+IWAtY/2nt5n8Wj/AJpnCRcEAwAA"),t=i):"status.js"===o.r?(n.body=atob("H4sIAAAAAAAACoVW727bNhB/FZntXHGSFcktNiQSbaxthg5t0WIRsA+GMbMSHamWSVeknQa2vvVR8gx9Ab/YjpSlWKnTIY5NnX539+Px/nBbMGUlZOK7/tSdk0EQbmhpMULlLU9sTEZbVd5u87m9EXlq+T1CpKKKYS3q1UuVleLGuixLUdqICyuliiIcasOrGu3GZOVJN4PvxNhXxI9W3sorGL9WmcuInYpkvWRceSpXBSOzp9vYS/lYfznIGljoAqHq4/57KWUu93fZYv995n6RNnoiB8kyRdjLOWflm/j9OxJ7IBmjj/tv+2/v3u2/ge7HD39doS5eqtuCeYkoRNloXJeMcUCXLG3BS5GyjvX3H15f/nsV/z3JPP1u2gBT/oBEync7FOWjy9yikimm1Do6y0etZS5uOhoKdrua+FMPXnhK/Jl/Zak9xLD95GzxT6Yj0KhK1dG0zwkBh1KNr+I/4pqdfpx6JVsVNGE2+kUidy7KJVWv4UDifMlszm4s/WAH7PmvsTd/tUxjid1egPHFAzvYsTPwtxkjy17s7/Z3XLGcM441Kewi1DPuy37fPsnQISj6VI70P3IMErdho7cPojB7y+Qip+VGXFg6DUxM6Ob6KCZVHRJt7w0tNjk/Qhad6B0h39KiYB1oll9nP2JnR4HO+Vx06EFi+hGkS7aI5Rh9yD7TtbQULRe5NCdsIacO86kQGy2ILoobBUq5JYwRRT3PQxWk+syxtQvDUIGTDLxTZWX0f+0fVLQHUILKy5kSn6lRBU/aQRv3TXdbb/d3t5zXm7iFCP08V9YrvY/KJINRg5IEJdtugdi7ZjVHPDilfP8an4H47Ddff4YvcHseKEDgYbW/yzc64zBEZsNKmQsIUOxtXLt0c92fdD+hZDINoSNBf4K2Mimnh85i2tQQiqOuVQy7snVfgv4TqqgDDZWjUUNvxUpsjApttNFgRIUsUk4D6fd7Nht1LAwCHDLHwcJbrWVmM6wZGbz8gre1kfPzc5eD88ashLWMiGhMGHjCVSjB0Lahek9CAgnptCjtDnjXNCZiwqbTSTAN1VmDiBiUJHBvBeBd4ureIAeDvGuQ1vy1NVyxQrITPAJQa0gbJRMxSbSSgSnCYJb4EVH9/oGe1Nyilqs6cB0MMDw4wZRoWXhYyyOOPjh7nGEFUU7AZE+3QHMcSu52PiFwRnMQdlPyjViXEpJumx9lP0Lh4TAgPL0g/HmaHDa7bMKupm5KOjm+hDqsByBMNr9Nv34ffn09ana74Ei61HEhNoIeh4w08Ip8OT7sBqQXjQzvdsMjRQp7SIp1yqSt8Ak7Q++hFZA8sHFC6Ufnw4NzSOd51g+iSGFC9A9klxbB6DiWYl0dJ7AQii4ch2asmBztMeyqEZFHJWbL+5rUJ8OxuT0UZBYpyDY9wAl6uk2PDvaR8za+yzGaC64GNwz6vrr4JIo0NPeKp1s+Rp9osrguxZqnF09Yqv/ql2g0cwti64+jHadWUlApCZrnCo2aTml6WaqHZxWdqXQ0w47Gwnsd4BMDqQtiY9R/8nX4e/Cidlq/dhD8wsgM8+NRWlR1ctvzR3Lb1eVwXwxVydS65Na94Dj3n0EoR2ZXopArygl6jvSVZZOzApo6jJBUSEkNIcPmWQVtzvabObLyEXiEvG8F0LehKhOqEt0Et4ngUsBNi5kLInRFaA1kBGCGuyX4yG0OxXlBLZa3VH5yj6tvbqq9jx2W5qZ1WNf3ucODJt8sg3ZZD/3Dg77IVBXsGLuvXl41rb36D0CLg8I4CwAA"),t=r):"history"===o.r?(n.body=atob("H4sIAAAAAAAACmWOuw7CMAxFfyXKBEOI2NNIrCwMfEFeUBejQGwQ/XtMeQipg23pnCvbLsNdJQxEnT7gQ0mZc40mVdTe/UlOL7cWyCFikdGk8k+reNR+A6cwg7t+CDea4X1B4OLstCfWPCrIHZkeiL3Q9xErH3w7pQYX9q1ct7TQEpiytY2rgfTS2Y9/AkYQ4FXSAAAA"),t=i):"history.js"===o.r?(n.body=atob("H4sIAAAAAAAACnVR204cMQz9lWAoSrrDdKFvzGYRtEh9AFXqzttqBdGMl5kqTLa2Aa1G+Rv+hB9rshShPiDlZh+fY8cePYpCO60eHSmxjrdDo42dj0LbsV/rx9C3arpnLYsTNNm19/qUjsKTuiQKpGEIqnXiwPzT2YVUKVjKzqZdciDRWgpK2rScro4kHaaYzjLocbiT7vAQU55kJySD4x/WsM9HXc8CpuyHAelHfX1lAap1SpozkQprlShmzBZbmAnNoWCr85rY25m0qvGOE7TuBeYHY6LeO6n7e9QDPqnvqVB9jF8/56qMibMv0s5vzWTHZNl6tNAEH+j0YKTl8eoM7ghxgFMgbCFmxVf3z+63e2C1eXl+efYeU8CbJ/QM/+kmzqI+ry9vFvWvJS1PVquzknDjXYMalP7EyrH0BgqAt4ImkO70teqDpkwsR3xvXoyxcdJ0WszYhIGDxxJ3oxJTfNRXibESbYpvF4ty88CZHP8C4awwCiACAAA="),t=r):"config"===o.r?(n.body=atob("H4sIAAAAAAAACp1U7U7bMBR9FSvSBPwIaUMHaEot5QeoLWuK1sC0n65jiBvHDrFT1v3eo/QZeIG82JzPNtkAMalV0+t77rk591w7Ad0AzJCUY0NhsDLgj69X0+WV71j6BDoKrRhpEmKAsaFjqf4GdfB5eDmAi3CNMqlQgvQBdCRhBCtAg3EsAgIdqwo0yDJdKbRBCrB8Fwb5iypxlCdZCROZkkDSX2Q8akE3+S7fcUUoJxyIkvAApLYJGeOQ4GglfhYlKN+00KUmifIXDtyv912iooWSx4bgU5tOaapEjCKZlX0NLkzb/gL2qABtWxS2ou+hs1cxVsMBtG1zcHGI4PQxVD1MLXDFeY/SONMSZpzTgrQAraL2eJLvlP5Qht5/c5KmEDgMrQgDDyIt/y88a3F97VhltK16i6JImGXFSJJqBgFRiDLZvA37rMeZxTFKt9DLd1vdhZVQyoRCeqz1Qe0Szf0QNl6RMSik0HaxylP9W5fu2CCTMeVZpmjPATrayqWf2yJduxYMhWdv8t/L6WIyc++W/+Hbt8SMByaOg46edagn6dsNTqae735zZ+6H2ptQrlCK1qinzdBkNO676U3+mXuzXHhgohdgOp+7PvDvPG/6sSV314iv9VKI/o7bZkJ0tkgUFRxsEMt0XyNoj7qhoQ2Hdjd0CS+7gXN43g2MYK/KGTzrMUG7vWBA2HjLz7iicXFlpPmuJ59tYr5fxhZyS3RqFOU72uzCa56wTfnUutilHIGkYGL6MgNmb14VTQ3TY2vmVaPnWlAa07CY9Guo+P0ZGwfvJ9GGVE2vMqVanXzEGOEcwXro/zaKv5jOp5638P/KUrjh2F90HZpi/UWKSc13cLnolV+l76AFx4ziaHz0THkgnk9FQvixYRknR1W5ZUgY2zbNS5zSRMGUPM3ksaFlMbHgD/TxdC2NE22H6vgP2ZOGgt0GAAA="),t=i):"config.js"===o.r?(n.body=atob("H4sIAAAAAAAACoVWbW/bNhD+KwoXuGQtK7JX5INl2tiaFNvaJEOdFQWGYWZkOmatt4hnt4aif9N/0j+2IyXLUpNtX2zdC++Od/c8UhFJcCJ+MgzCNNHgaE6lC4xPFxNYTicqybbgwD6TnORiqVLiJCJG4bSQJXF2ItpaAUoynZzhiUWwE7kjudD7JKQYp4B8X6gV3aVq6fgnnGsQIHu9k6jXs4+sMCfiSu+FwYOm5Ic4XUrCPJUkMv/l9uodv7q5uPx7fvvei0VGmxLTDFSadMswlU3OKst0wdx2vMox9oxYGdIt6JbBiN6nVCWUuKQ+q5IdeoRrGW7kEn1QnpFaJGNCKq+dgFYclCr1UuxbapQqdaLu121/KwdmFsAJCVZpTo0guR/IyehVIPt9Bn2+6AzE1nCXfiGOWnLy0Y5kOonEnYwcjNCoTgtKSF8yLxPLOYgc6MglPmHYJus8dRZV1+82nZ6Dl8ssEqH8KYoo+YgduSPMFik4mUA+NStyu01A2dEb6ebNm+Z5cNReV49neOZfLifM5eqQ/1GvtWpTTF+6PiuPwmDYlobWOZ/WF1utOxcTTy62wos9W1fVF1vNYQNo7N1tesPJRDLOzZ97WMhimYbbWCbgPWxlvp/LSIaQ5ibL4k+LGzOQvxbMw1yXIlxTyaeyCSzrdeDASkaxJrwIJlut28lmVvM6XnaUw7E/xg7U4FFJe9dVUu2czPPOHqP8zB7H/iCMlx3H2PdQ9ZzvcBCpuJ1r6KGiNo4GmczbxpGHisYYJtA1oqIx6oduBSNPPzxXwGgQd4Mck39X2chWhkznl2UowPSeFYbz0kiaVuDwJSvLQFLmvv557mVbbVyqcFrsDH2I5fJyh+N9pzRIXCZKwkiFG+JatsPFmRbSy3JpfC7kSmwjoCwwBGgoTjQUV+Ec3fvVogcVA6KCiN094RyTyrr2mVWNgbZ0LBCWwrjVdtmNucKyGH9Cb57OIgWW2CyLYjrAkOYAUhp/ynVmq9CIXHZI1CI5cwzp7GBp8ZyxWD472DpkZ6x3G24Cr9aItCPqRLXXbfQVT+HX61EbwPw8WgjY7tn71iBbWZSN6wOLOnEwGJ5wbY9jYvNjj7uHtPX/ozYxS2F2gj/FTd0TBFXT/CPaWG25ErDGFn+hvls94vvkvD5m+10hij8LuEMGCyUet2BmtBZDTeoOxGo7wog3WQ8n3OOJFu5YfUQ/8OeAd6hkdKxk1K6k0aHGDiHk4rNQ4NxLuBAg6B/v3/VfnOVZePb2w9ybS5ht5J6TLM21VgME30rdk14F0Rf93+Y3156GXCX3arWngrFg5Puch16I+z1rBZ33ySzn5uKwlolZ5EJEEt8T5FZEkUSeB9ieYJnmw6bE+1R4b9wWH1S+lmPH7AlbINmOv9eHHnwBa2u4os5Qu+BKerHUWtwb1qhpAnc5/H+esF9F9ivJBW4ZIMvTOMPYv4vNJh2k609iu9EycTZSQ+oAvmGlSsTMob7DHZzm1kn2m71KZMIIdknpa3FNgT0+4h39CcwykWv5awL0aWAQItmkjs2hnezb129fsWMOHTL8ilJOliqNadgMWWKIsXEBqui4Kxgevhvw4rQw4yhxGqsecs5pYdLb7VtFKSL7whBekn6m7Gwof+yf+y/h5bmPYcteyBd9s7O2rSP/Fb72qkGTm7cnSPFNo8HMguGUyn8Aduejt60KAAA="),t=r):n.code=404:(n.body=atob("H4sIAAAAAAAACqVTS27bMBC9CstFYaOWjO6KRGRQtAHarLooui1ocmxNTJMqZ2TDKHqbniEXyMVKfeJEaYIG6GakmTd8781IrF65aPnYQM07r6suCm/CRkHQ1Q7YCFubRMCq5XXxTleM7EF/ub1JREi3v+vt7U21HKrDgWB2oPYIhyYmFjYGhsBKHtBxrRzs0ULRJwsMyGh8QdZ4UG+lrhzuhfWGSHFshhSdelozg6cOajCMB6nJziegjc1Rv+7iubhqM4X4TJGNj2JWGVEnWKuauaGz5fIaB6Rco2CTNnnu76u8j61+gFRLo+ejxL3QaNus6FGuKwxNy6LbskrGYRxWZPrRzKogNtxSXjTYLWS7w/OOgLSovFmBF+uYJv13AkUP66/oTbUc3qcOivEj9Mso7in080P803SNxDEdn3f5qOFk81NfxxdbHXn+x2vmXOPmeatT/OT0ff7t220OL7U68EydDpFswoZ1biAWHy+/qQMGFw+lj9YwxlDmjWwwlBisbx3QTHaIryOxnJ97YOFUvqjtLustbALDcOmhyxQo7cpJaQbzhWkaCO5Djd4NHavojuWDateU4McVdfDPvUmC1JRFDqazPpWUrMq2L+BMXiQl30CZoPHGwkx2g8uFlBPNGc1/LSz9RekxbDNhRjKBV5L46IFqAJZde9lfxk5IUplz2csNrxP6XBjtZ5vlNcl8H8cd/wFnTmKS0gQAAA=="),t=i),n.headers=[["Content-Type",t]],s&&n.headers.push(["Content-Encoding","gzip"])}catch(t){d(t),n.code=500}n.send()}),Timer.set(1e4,!0,f),f();

/**
 * Tämä esimerkki hyödyntää Shelly H&T:n lähettämää lämpötilaa pörssisähköohjausten asetuksissa
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Käyttöönotto:
 * -----
 * Lisää Shelly H&T-asetuksiin "actions -> sensor reports" -osoitteisiin osoite
 *    http://ip-osoite/script/1/update-temp
 * missä ip-osoite on tämän shellyn osoite. 
 * Muista myös ottaa "sensor reports" -ominaisuus käyttöön
 */

//Kuinka vanha lämpötilatieto sallitaan ohjauksessa (tunteina)
let TEMPERATURE_MAX_AGE_HOURS = 12;

//Viimeisin tiedossa oleva lämpötiladata
let data = null;
//Alkuperäiset muokkaamattomat asetukset
let originalConfig = {
  hours: 0,
  minutes: 60
};

function USER_CONFIG(config, state, initialized) {
  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    originalConfig.hours = config.m2.cnt;
    originalConfig.minutes = config.min;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {

    if (data == null) {
      console.log("Lämpötilatietoa ei ole saatavilla");
      state.s.str = "Lämpötila ei tiedossa -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";

    } else {
      let age = (Date.now() - data.ts) / 1000.0 / 60.0 / 60.0;
      console.log("Lämpötila on tiedossa (päivittynyt " + age.toFixed(2) + " h sitten):", data);

      if (age <= TEMPERATURE_MAX_AGE_HOURS * 60) {
        //------------------------------
        // Toimintalogiikka
        // muokkaa haluamaksesi
        //------------------------------

        //Muutetaan lämpötilan perusteella lämmitystuntien määrää ja minuutteja
        if (data.temp <= -15) {
          hours = 8;
          minutes = 60;

        } else if (data.temp <= -10) {
          hours = 7;
          minutes = 45;

        } else if (data.temp <= -5) {
          hours = 6;
          minutes = 45;
        } else {
          hours = 6;
          minutes = 45;
        }

        //------------------------------
        // Toimintalogiikka päättyy
        //------------------------------
        state.s.str = "Lämpötila " + data.temp.toFixed(1) + "°C (" + age.toFixed(1) + "h sitten) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
        console.log("Lämpötila:", data.temp.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");

      } else {
        console.log("Lämpötilatieto on liian vanha -> ei käytetä");
        state.s.str = "Lämpötilatieto liian vanha (" + age.toFixed(1) + " h) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
      }
    }
  } catch (err) {
    state.s.str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa. Virhe:", err);
  }

  //Asetetaan arvot asetuksiin
  config.m2.cnt = hours;
  config.min = minutes;

  return config;
}

/**
 * Apufunktio, joka kerää parametrit osoitteesta
 */
function parseParams(params) {
  let res = {};
  let splitted = params.split("&");

  for (let i = 0; i < splitted.length; i++) {
    let pair = splitted[i].split("=");

    res[pair[0]] = pair[1];
  }

  return res;
}

/**
 * Takaisinkutsu, joka suoritetaan kun saadaan HTTP-pyyntö
 */
function onHttpRequest(request, response) {
  try {
    let params = parseParams(request.query);
    request = null;

    if (params.temp != undefined) {
      data = {
        temp: Number(params.temp),
        ts: Math.floor(Date.now())
      };

      console.log("Lämpötilatiedot päivitetty, pyydetään pörssisähkölogiikan ajoa. Data:", data);
      _.s.chkTs = 0;
      response.code = 200;

    } else {
      console.log("Lämpötilatiedojen päivitys epäonnistui, 'temp' puuttuu parametreista:", params);
      response.code = 400;
    }

    response.send();

  } catch (err) {
    console.log("Virhe:", err);
  }
}

//Rekisteröidään /script/x/update-temp -osoite
HTTPServer.registerEndpoint('update-temp', onHttpRequest);