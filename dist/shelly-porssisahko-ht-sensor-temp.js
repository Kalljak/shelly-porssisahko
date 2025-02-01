/**
 * @license
 * 
 * shelly-porssisahko
 * shelly-porssisahko-en
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * https://github.com/jisotalo/shelly-porssisahko-en
 * 
 * License: GNU Affero General Public License v3.0 
 */
const CNST={INST_COUNT:"undefined"==typeof INSTANCE_COUNT?3:INSTANCE_COUNT,HIST_LEN:"undefined"==typeof HIST_LEN?24:HIST_LEN,ERR_LIMIT:3,ERR_DELAY:120,DEF_INST_ST:{chkTs:0,st:0,str:"",cmd:-1,configOK:0,fCmdTs:0,fCmd:0},DEF_CFG:{COM:{g:"fi",vat:25.5,day:0,night:0,names:[]},INST:{en:0,mode:0,m0:{c:0},m1:{l:0},m2:{p:24,c:0,l:-999,s:0,m:999,ps:0,pe:23,ps2:0,pe2:23,c2:0},b:0,e:0,o:[0],f:0,fc:0,i:0,m:60,oc:0}}};let _={s:{v:"3.1.1",dn:"",configOK:0,timeOK:0,errCnt:0,errTs:0,upTs:0,tz:"+02:00",tzh:0,enCnt:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},si:[CNST.DEF_INST_ST],p:[[],[]],h:[],c:{c:CNST.DEF_CFG.COM,i:[CNST.DEF_CFG.INST]}},_i=0,_j=0,_k=0,_inc=0,_cnt=0,_start=0,_end=0,cmd=[],prevEpoch=0,loopRunning=!1;function getKvsKey(e){let t="porssi";return t=0<=e?t+"-"+(e+1):t}function isCurrentHour(e,t){t-=e;return 0<=t&&t<3600}function limit(e,t,n){return Math.min(n,Math.max(e,t))}function epoch(e){return Math.floor((e?e.getTime():Date.now())/1e3)}function getDate(e){return e.getDate()}function updateTz(e){let t=e.toString(),n=0;"+0000"==(t=t.substring(3+t.indexOf("GMT")))?(t="Z",n=0):(n=+t.substring(0,3),t=t.substring(0,3)+":"+t.substring(3)),t!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=t,_.s.tzh=n}function log(e){console.log("shelly-porssisahko: "+e)}function addHistory(e){for(var t=0<_.s.enCnt?CNST.HIST_LEN/_.s.enCnt:CNST.HIST_LEN;0<CNST.HIST_LEN&&_.h[e].length>=t;)_.h[e].splice(0,1);_.h[e].push([epoch(),cmd[e]?1:0,_.si[e].st])}function reqLogic(){for(let e=0;e<CNST.INST_COUNT;e++)_.si[e].chkTs=0}function updateState(){var e=new Date,t=(_.s.timeOK=null!=Shelly.getComponentStatus("sys").unixtime&&2e3<e.getFullYear(),_.s.dn=Shelly.getComponentConfig("sys").device.name,epoch(e));for(_.s.timeOK&&300<Math.abs(t-prevEpoch)&&(log("Time changed 5 min+ -> refresh"),_.s.p[0].ts=0,_.s.p[0].now=0,_.s.p[1].ts=0,_.p[0]=[],_.p[1]=[]),prevEpoch=t,_.s.enCnt=0,_i=0;_i<CNST.INST_COUNT;_i++)_.c.i[_i].en&&_.s.enCnt++;!_.s.upTs&&_.s.timeOK&&(_.s.upTs=epoch(e))}function getConfig(p){var e=getKvsKey(p);Shelly.call("KVS.Get",{key:e},function(t,e,n){p<0?_.c.c=t?JSON.parse(t.value):{}:_.c.i[p]=t?JSON.parse(t.value):{},"function"==typeof USER_CONFIG&&USER_CONFIG(p,!0);{t=p;var s=function(e){p<0?_.s.configOK=e?1:0:(log("config for #"+(p+1)+" read, enabled: "+_.c.i[p].en),_.si[p].configOK=e?1:0,_.si[p].chkTs=0),loopRunning=!1,Timer.set(500,!1,loop)};let e=0;if(CNST.DEF_CFG.COM||CNST.DEF_CFG.INST){var o,i=t<0?CNST.DEF_CFG.COM:CNST.DEF_CFG.INST,r=t<0?_.c.c:_.c.i[t];for(o in i)if(void 0===r[o])r[o]=i[o],e++;else if("object"==typeof i[o])for(var c in i[o])void 0===r[o][c]&&(r[o][c]=i[o][c],e++);t>=CNST.INST_COUNT-1&&(CNST.DEF_CFG.COM=null,CNST.DEF_CFG.INST=null),0<e?(t=getKvsKey(t),Shelly.call("KVS.Set",{key:t,value:JSON.stringify(r)},function(e,t,n,s){t&&log("failed to set config: "+t+" - "+n),s(0==t)},s)):s(!0)}else s(!0)}})}function loop(){try{if(!loopRunning)if(loopRunning=!0,updateState(),_.s.configOK)if(pricesNeeded(0))getPrices(0);else if(pricesNeeded(1))getPrices(1);else{for(let e=0;e<CNST.INST_COUNT;e++)if(!_.si[e].configOK)return void getConfig(e);for(let e=0;e<CNST.INST_COUNT;e++)if(function(e){var t=_.si[e],n=_.c.i[e];if(1!=n.en)return void(_.h[e]=[]);var e=new Date,s=new Date(1e3*t.chkTs);return 0==t.chkTs||s.getHours()!=e.getHours()||s.getFullYear()!=e.getFullYear()||0<t.fCmdTs&&t.fCmdTs-epoch(e)<0||0==t.fCmdTs&&n.m<60&&e.getMinutes()>=n.m&&t.cmd+n.i==1}(e))return void Timer.set(500,!1,logic,e);"function"==typeof USER_LOOP?USER_LOOP():loopRunning=!1}else getConfig(-1)}catch(e){log("error at main loop:"+e),loopRunning=!1}}function pricesNeeded(e){var t=new Date;let n=!1;return n=1==e?_.s.timeOK&&0===_.s.p[1].ts&&15<=t.getHours():((e=getDate(new Date(1e3*_.s.p[0].ts))!==getDate(t))&&(_.s.p[1].ts=0,_.p[1]=[]),_.s.timeOK&&(0==_.s.p[0].ts||e)),_.s.errCnt>=CNST.ERR_LIMIT&&epoch(t)-_.s.errTs<CNST.ERR_DELAY?n=!1:_.s.errCnt>=CNST.ERR_LIMIT&&(_.s.errCnt=0),n}function getPrices(c){try{log("fetching prices for day "+c);let i=new Date;updateTz(i);var t=1==c?new Date(864e5+new Date(i.getFullYear(),i.getMonth(),i.getDate()).getTime()):i;let e=t.getFullYear()+"-"+(t.getMonth()<9?"0"+(1+t.getMonth()):1+t.getMonth())+"-"+(getDate(t)<10?"0"+getDate(t):getDate(t))+"T00:00:00"+_.s.tz.replace("+","%2b");var n=e.replace("T00:00:00","T23:59:59");let r={url:"https://dashboard.elering.ee/api/nps/price/csv?fields="+_.c.c.g+"&start="+e+"&end="+n,timeout:5,ssl_ca:"*"};i=null,e=null,Shelly.call("HTTP.GET",r,function(t,e,n){r=null;try{if(0!==e||null==t||200!==t.code||!t.body_b64)throw Error(e+"("+n+") - "+JSON.stringify(t));{t.headers=null,n=t.message=null,_.p[c]=[],_.s.p[c].avg=0,_.s.p[c].high=-999,_.s.p[c].low=999,t.body_b64=atob(t.body_b64),t.body_b64=t.body_b64.substring(1+t.body_b64.indexOf("\n"));let e=0;for(;0<=e;){t.body_b64=t.body_b64.substring(e);var s=[e=0,0];if(0===(e=1+t.body_b64.indexOf('"',e)))break;s[0]=+t.body_b64.substring(e,t.body_b64.indexOf('"',e)),e=2+t.body_b64.indexOf('"',e),e=2+t.body_b64.indexOf(';"',e),s[1]=+(""+t.body_b64.substring(e,t.body_b64.indexOf('"',e)).replace(",",".")),s[1]=s[1]/10*(100+(0<s[1]?_.c.c.vat:0))/100;var o=new Date(1e3*s[0]).getHours();s[1]+=7<=o&&o<22?_.c.c.day:_.c.c.night,_.p[c].push(s),_.s.p[c].avg+=s[1],s[1]>_.s.p[c].high&&(_.s.p[c].high=s[1]),s[1]<_.s.p[c].low&&(_.s.p[c].low=s[1]),e=t.body_b64.indexOf("\n",e)}if(t=null,_.s.p[c].avg=0<_.p[c].length?_.s.p[c].avg/_.p[c].length:0,_.s.p[c].ts=epoch(i),_.p[c].length<23)throw Error("invalid data received")}}catch(e){log("error getting prices: "+e),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[c].ts=0,_.p[c]=[]}0==c&&reqLogic(),loopRunning=!1,Timer.set(500,!1,loop)})}catch(e){log("error getting prices: "+e),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[c].ts=0,_.p[c]=[],0==c&&reqLogic(),loopRunning=!1,Timer.set(500,!1,loop)}}function logic(i){try{"function"==typeof USER_CONFIG&&USER_CONFIG(i,!1),cmd[i]=!1;var e,t,n=new Date;updateTz(n),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var t=epoch();for(let e=0;e<_.p[0].length;e++)if(isCurrentHour(_.p[0][e][0],t))return _.s.p[0].now=_.p[0][e][1];_.s.timeOK=!1,_.s.p[0].ts=0,_.s.errCnt+=1,_.s.errTs=epoch()}else _.s.p[0].ts,_.s.p[0].now=0}();let s=_.si[i],o=_.c.i[i];function r(e){if(null==e)loopRunning=!1;else if(cmd[i]!=e&&(s.st=12),cmd[i]=e,o.i&&(cmd[i]=!cmd[i]),log("logic for #"+(i+1)+" done, cmd: "+e+" -> output: "+cmd[i]),1==o.oc&&s.cmd==cmd[i])log("outputs already set for #"+(i+1)),addHistory(i),s.cmd=cmd[i]?1:0,s.chkTs=epoch(),loopRunning=!1;else{let t=0,n=0;for(let e=0;e<o.o.length;e++)!function(e,o,i){e="{id:"+o+",on:"+(cmd[e]?"true":"false")+"}",Shelly.call("Switch.Set",e,function(e,t,n,s){0!=t&&log("setting output "+o+" failed: "+t+" - "+n),i(0==t)},i)}(i,o.o[e],function(e){t++,e&&n++,t==o.o.length&&(n==t&&(addHistory(i),s.cmd=cmd[i]?1:0,s.chkTs=epoch(),Timer.set(500,!1,loop)),loopRunning=!1)})}}0===o.mode?(cmd[i]=1===o.m0.c,s.st=1):_.s.timeOK&&0<_.s.p[0].ts&&getDate(new Date(1e3*_.s.p[0].ts))===getDate(n)?1===o.mode?(cmd[i]=_.s.p[0].now<=("avg"==o.m1.l?_.s.p[0].avg:o.m1.l),s.st=cmd[i]?2:3):2===o.mode&&(cmd[i]=function(e){var t=_.c.i[e],n=(t.m2.ps=limit(0,t.m2.ps,23),t.m2.pe=limit(t.m2.ps,t.m2.pe,24),t.m2.ps2=limit(0,t.m2.ps2,23),t.m2.pe2=limit(t.m2.ps2,t.m2.pe2,24),t.m2.c=limit(0,t.m2.c,0<t.m2.p?t.m2.p:t.m2.pe-t.m2.ps),t.m2.c2=limit(0,t.m2.c2,t.m2.pe2-t.m2.ps2),[]);for(_inc=t.m2.p<0?1:t.m2.p,_i=0;_i<_.p[0].length;_i+=_inc)if(!((_cnt=-2==t.m2.p&&1<=_i?t.m2.c2:t.m2.c)<=0)){var s=[];for(_start=_i,_end=_i+t.m2.p,t.m2.p<0&&0==_i?(_start=t.m2.ps,_end=t.m2.pe):-2==t.m2.p&&1==_i&&(_start=t.m2.ps2,_end=t.m2.pe2),_j=_start;_j<_end&&!(_j>_.p[0].length-1);_j++)s.push(_j);if(t.m2.s){for(_avg=999,_startIndex=0,_j=0;_j<=s.length-_cnt;_j++){for(_sum=0,_k=_j;_k<_j+_cnt;_k++)_sum+=_.p[0][s[_k]][1];_sum/_cnt<_avg&&(_avg=_sum/_cnt,_startIndex=_j)}for(_j=_startIndex;_j<_startIndex+_cnt;_j++)n.push(s[_j])}else{for(_j=0,_k=1;_k<s.length;_k++){var o=s[_k];for(_j=_k-1;0<=_j&&_.p[0][o][1]<_.p[0][s[_j]][1];_j--)s[_j+1]=s[_j];s[_j+1]=o}for(_j=0;_j<_cnt;_j++)n.push(s[_j])}if(-1==t.m2.p||-2==t.m2.p&&1<=_i)break}let i=epoch(),r=!1;for(let e=0;e<n.length;e++)if(isCurrentHour(_.p[0][n[e]][0],i)){r=!0;break}return r}(i),s.st=cmd[i]?5:4,!cmd[i]&&_.s.p[0].now<=("avg"==o.m2.l?_.s.p[0].avg:o.m2.l)&&(cmd[i]=!0,s.st=6),cmd[i])&&_.s.p[0].now>("avg"==o.m2.m?_.s.p[0].avg:o.m2.m)&&(cmd[i]=!1,s.st=11):_.s.timeOK?(s.st=7,e=1<<n.getHours(),(o.b&e)==e&&(cmd[i]=!0)):(cmd[i]=1===o.e,s.st=8),_.s.timeOK&&0<o.f&&(t=1<<n.getHours(),(o.f&t)==t)&&(cmd[i]=(o.fc&t)==t,s.st=10),cmd[i]&&_.s.timeOK&&n.getMinutes()>=o.m&&(s.st=13,cmd[i]=!1),_.s.timeOK&&0<s.fCmdTs&&(0<s.fCmdTs-epoch(n)?(cmd[i]=1==s.fCmd,s.st=9):s.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(i,cmd[i],r):r(cmd[i])}catch(e){log("error running logic: "+JSON.stringify(e)),loopRunning=!1}}let _avg=999,_startIndex=0,_sum=0;log("v."+_.s.v),log("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),_.c.i.pop(),_.si.pop();for(let e=0;e<CNST.INST_COUNT;e++)_.si.push(Object.assign({},CNST.DEF_INST_ST)),_.c.i.push(Object.assign({},CNST.DEF_CFG.INST)),_.c.c.names.push("-"),_.h.push([]),cmd.push(!1);CNST.DEF_INST_ST=null,prevEpoch=epoch(),HTTPServer.registerEndpoint("",function(n,s){try{if(loopRunning)return n=null,s.code=503,void s.send();var o=function(e){var t={},n=e.split("&");for(let e=0;e<n.length;e++){var s=n[e].split("=");t[s[0]]=s[1]}return t}(n.query),i=parseInt(o.i);n=null;let e="application/json",t=(s.code=200,!0);var r="text/html",c="text/javascript";if("s"===o.r)updateState(),0<=i&&i<CNST.INST_COUNT&&(s.body=JSON.stringify({s:_.s,si:_.si[i],c:_.c.c,ci:_.c.i[i],p:_.p})),t=!1;else if("c"===o.r)updateState(),0<=i&&i<CNST.INST_COUNT?s.body=JSON.stringify(_.c.i[i]):s.body=JSON.stringify(_.c.c),t=!1;else if("h"===o.r)0<=i&&i<CNST.INST_COUNT&&(s.body=JSON.stringify(_.h[i])),t=!1;else if("r"===o.r){if(0<=i&&i<CNST.INST_COUNT)log("config changed for #"+(i+1)),_.si[i].configOK=!1;else{log("config changed");for(let e=0;e<CNST.INST_COUNT;e++)_.si[e].configOK=!1}_.s.configOK=!1,reqLogic(),loopRunning||(loopRunning=!0,getConfig(i)),_.s.p[0].ts=0,_.s.p[1].ts=0,s.code=204,t=!1}else"f"===o.r&&o.ts?(0<=i&&i<CNST.INST_COUNT&&(_.si[i].fCmdTs=+(""+o.ts),_.si[i].fCmd=+(""+o.c),_.si[i].chkTs=0),s.code=204,t=!1):o.r?"s.js"===o.r?(s.body=atob("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"),e=c):"s.css"===o.r?(s.body=atob("H4sIAAAAAAAACo1WTW/jNhD9K8QGBZJsZEvxOnVk1GhPCxTdopf2UvRAUUOLNUUKJBXbu8h/75CiZNpxsL3Y0nA+3sybGWp+f0/uiW1AymPWaWOtsLTZaeLFt+yO/NqjiAirHZWaZKRxrivn83+jZMYFKnqhRelWuKavZky3k8L8Hd+/CQbKQkk+//4n+YVzMJp8BgWGSvJHX0nBRhXyspjl5H6ORt9IpQ+ZFV+F2pb4bGowGYrW5BXf6uMDoajDtNSmJDfAeM6L8cwbU7bbGt2rGk8f2QKW+ZpIoSBrQGwbV5Ji9gnaNeFaOR8G4eWz50nCaSvksSR/gampomvS0kO2F7VrSvLp2Xi9+Fbk+Q/+2GyFQh+E9k6vSUfrOiBfdgdU6QLuGyecBESXBI0wBntM0DndBqtgwHR3PNfPZyuvT6XYqsyC5CXhEg4ZqHpNHBxcFo5KYnya3smMywP6qIXtJD0O6kHuaGXxoNNWOKG9CUjqxAusz8tX0Io9s8mkLCvg2sDD+Eq5AxPIUA4UlvbDh/UpHOpISIwnbQnUeGZdM576TKWm6EECH7A7i2GaFL7SanKXSVqBTE8rqdnugunH2Y9LX7OJkxyr/uglsa1M1EOqrJaixpSfaL5argnrjfUN1mmBuZkpbkwVI591wamUmKqWvUOkXzOhajigCvKjuxMcnyNiSXAVoa/Oas85X09dPvax7igT7hiMQ41K1gDbQf3xrCjfdzTkf8VPcPHxItUpbJFk9TiY6i5lYWsEdqP/zRy0KHOAfmTfKovW3IQh8Q/B2HYqKeTsMVThNKbD+wQ1vEeenKHKdtQgvonMMcexa6MYEY5H+0Z4YkbyaS16hLX0BFIlWjow6FEVNnQSNUQoLlQwm5IUKnRZ7LhX8vMOjtzQFiwZMvI9gX8BJA4MjrXBPengdvGU17C9Q5vXYTxmjG2c31wbZzauLrkw1mWsEbLG9q+2D1HNtugtPR13wz5Wq9ISC/8CxglG5bgKMPf3Rxq3Q9Zqz7MM84e7pBYGWFwJeh9ya6EW9DZdgitcandocXVHPXnK0m00DHTccmEMslV3SHrnO80yam5IqVwzJH+78PHn9+QL3eH8ENcAWZiaDMZkqzFxohBEIBFvlRBjOEXPZE6ycGUMtW1TBh7ITbXbvLddzmb+qv0FRzHvOPE+71NXhumb7rdh/eeJ27eMp7YF7qxKIrXDRPwPRof8LxU3tXiZgEYAEcIpovULICzQdNok7fzlPj69Lc8J8xW86UU5kMz8zCStg18G4+rlIl256D2McsAF/mbYG9oFxX2xyhPN1ei8dUV+4mOoYLycfTWKWK+w4ry6WaZFCZd5HrdlK5eXzI5RKmwfm7H2nfF8xdXR9e5vd+zgp6pHytU/lx8FhR+g19PYf7vyoRKzG8fjtCJ83KmuCw/qej1t3yJ+P7xv77n/AHPmnH4uCgAA"),e="text/css"):"status"===o.r?(s.body=atob("H4sIAAAAAAAACpWSTW7CMBCFr2Jl1SKRkEWlLoIPUFXqolxg4hjFxD9pPIFyH87QC+RiHRxiQUt/WNiLmfe+eWO5QCi1ZEKD98vEMCESXmBHp+LPoFCyDTBXb6D3VGKqWvp5ZSfJybfLHxf8JYiY3WMUCnOEVIAANk3TiRuUjZeWealpRNR7jLNfh0PdDB+W1coiXFCt2/ELlMf9vm1VFBhXyahYKQ2xo+za8SILO/OiUttp8bV+Z3TIWs6F08lFE8WxlzPTPXxrGMwXVCynwAyHgx0OdBVZSaNITTHCG4cErVpcDXCOWjmUPfYGfoGNNnKN1DPoqLoWX/8jft07I62Fn9LnN6T/g5V/zTzevm/5bNZC07j56eNlx1qYF5zbuH30iE61yDv59uTvEoLSVwLsfbrxyT3Zx/YnFqn0K+wCAAA="),e=r):"status.js"===o.r?(s.body=atob("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"),e=c):"history"===o.r?(s.body=atob("H4sIAAAAAAAACmWOuw7CMAxFfyXKBEOI2NNIrCwMfEFeUBejQGwQ/XtMeQipg23pnCvbLsNdJQxEnT7gQ0mZc40mVdTe/UlOL7cWyCFikdGk8k+reNR+A6cwg7t+CDea4X1B4OLstCfWPCrIHZkeiL3Q9xErH3w7pQYX9q1ct7TQEpiytY2rgfTS2Y9/AkYQ4FXSAAAA"),e=r):"history.js"===o.r?(s.body=atob("H4sIAAAAAAAAClVS227bMAz9FZVoB2l2vHbBXurIwS4F9tBiQOM9BUHLOEysTbUyiWkRuP6b/kl/bLKDAikgEBB5dA55qNYSC6Pni7xyTWCx1KyL9l+QEEa1CQwqM01D/md5c61hwr6Y8EpUzoYtNnpcXBnRw5w3iJNPvCpi8AV0+SN6UWkM+6YSPWV/9/qYOGe/b81a8vNzs7NW68DIpDzxzjdiKVUei8C4HB0U9qA1VmweqcSlGggpRY1PaFhsiH8go/x9ez1LYOp1/cFoSEycaeDBzP1VvdqJNBqzVcSqzFKz4fpIsSMbSETUl/PxSVTLKrd615E/dgPytfOShFsLkwXnWUpOvdKFn58vRhyDOrQZDs5BGrTsT6LvBxcthlhaG4bitI1cD8ileSDZ0JOI05C8oPFHGni6wdx7lQwvA+8taYhrcP7ytKX5xWIKG0/UwCV4WkHXMx7Sv+o/uAti+/ry+mItRcBbxpkA73jjm1n5tby6m5W3c5p/XiymmaetxYokCHkWBAY2ClKAt4YSOCz82JlEh67rKuSqlqza/mM5Sxl5H+1ilR6byF2XV1Kl37/Nsu0u1LJS3X/wNQ4RlAIAAA=="),e=c):"config"===o.r?(s.body=atob("H4sIAAAAAAAACpVW207jOBh+FSur1cBFejDsDKpaS7mYUQulHW0Lq710HUPcOHYmdsp2r/dR+gy8QF5snGMTl8KOBIH8x8/ff3DGPtsB5k/I07PLAeFYqYkmaI59rDEWvV5v3DcmaHy0A0rvOZ34TMUc70dCClqqS29HE7BxSpsnKbSr2L90NOxBGqG/519nq69r4JnHw515VME13nBa+0eAEMfIEvPro3uM8z9jRTklOofwjMYy1kwKsMM8NUkYWqUyYl0ppeiRJbIr5DtzMr1j2BJrNGdU6xSP+2WeOn2F6WV4M0Cr7BCE2asA3vyxgMREnBaIdliD/JSTKwR+r4GvGEu0jHCoUp2/D764EI7A0cvH+8aL9MO/ghaJkR4OEITu4EvbQ7DnQFs+JYH9gkG7DHmUs7VYTm+9hxX4baxiLIrSMhMnf0EfVqVNy1122OvsVansULDC8Ybymhy9j+mEBJSEG/lPnoQKBJaL/vLbt3G/sqz4WjBTwg6totEtgy1Olcax3QuR9Cmyi1aYa43zsnBTND971d3IMtWq5PG6cZqXlgLIIpmVSBKr6wbIYwIDjZOQGWRUKauphugRMwGiNDWNVajfgpmqiAljwiyERtoU2vxfuxiys4PQlAnaAXqGbSZ2TbZHnBgsSqdCFMly/SZs1NPsoM0P47gV9oNaJsm5Yn7HYSjdIlKoaHk2n2rMuKo7nP9h+E2jCCd7tCh66NCPGeNS50xViqoHTbKnoO5EFRWN7Ry7vl+FfnMOqiEw1P23mpVN/0v9vfy/dEQDl0T+CSPvQJrOFmvvT+/W+yVAUyZM1+Ettjpm6HIW2dvhfPJb7261XICp2Waz+3tvDdYPi8Xs443chuJtsdiaDSftsYRuTBNrYuA1gteBNSQQDaElu0E3luQz+mxJrpEd6QpdWRKI7MjuEJmFnL/kFIKLISjAX1pWsGsFSyt82QwwKHdmSUSAMAvxLjtwBi5CLi9H9RbVSd3r0CXlxJu4uMPZsXyGMlVXbzQYABd0lbSlrMdsnQrNonwnJNX2bbsQcbwsgi4aeAoHwDcAwXcRwS6kk/gdeG/ENwBhB2G5O6ixDsPswOrNcW7goKt+NCunWMdxnoybpQ9ca0LKNJWbGZR6QprPjFCZCyjIS37OK3pnqqrb1mkdUOEdLUFvzBXQtNcac06FwKj1YXVyZaP1cnY/WyyW6xMr83VW5Th+KnTS5MtSJoRW+Vqr2CzITfKBtxSEMxJOPr0w4cuXnoypuHD6zuWnMpyzCijnewECc46cLac+SPlUJGGxRgn9casuHEOUS6R4Ys+9rXLyCSrVPwFu6gV6dwoAAA=="),e=r):"config.js"===o.r?(s.body=atob("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"),e=c):s.code=404:(s.body=atob("H4sIAAAAAAAACqWT3W7TMBTHX8UYCbWiSdgd2mJPCCbBbuAC7Ra5zmlzWtcOPietKsTb8Ax7gb4YTtKOZWPSEDcnPh/+n5+P4/JFFSzvG6h543TZWeGMXyrwutwAG2FrEwlYtbzI3uqSkR3oL4fbSIR0+FWvD7dlMUSHDd5sQG0Rdk2ILGzwDJ6V3GHFtapgixay3pmhR0bjMrLGgTqTuqxwK6wzRIpDM7hYqb/2POaoQX/cQk1iLlL8ZHtD4MByV4qeWJehYQxebI1rQb3Rn+uVaUm8PCuLofLe5m6TDc1ev+rshbhuU3/xiQIbF8SkNKKOsFA1c0PnRbHCIZMvULCJyzS0b/M0zLW+lykLo6cPKU9nNnN64OsSfdOy6K5IRVNhGOZr+rmYeUZsOPHbGuwaEu7wPQmQFqUzc3BiEeKo/tQg69P6KzpTFsN6TJAdb7AfRvZH4tGo/wG6RuIQ909TPii4w/zYx/HZqEed/2FNmgtcPo06zt+Rvktvpl0n81zUQWdMOliyERvWqYBYfLi6UTv0VdjlLljT/ct5msgSfY7eurYCmsgu4+pALKcXDlhUKr3ydpP6zWwEw3DloPMUKF3lo9AEpjPTNOCr9zW6aqiYh2qf34t2RRG+X1OX/rE1UZAaq8gBOvWnnKJVCfsSzuVlVPI15BEaZyxMZHdwOZNy1HNC058zS48kHfp1EkyZJOCUJN47oBqAZVee94+xayQpT77s2w3LkXwKHPETZr4imd7jcca/AbWs7Y0PBQAA"),e=r);s.headers=[["Content-Type",e]],t&&s.headers.push(["Content-Encoding","gzip"])}catch(e){log("server error: "+e),s.code=500}s.send()}),Timer.set(1e4,!0,loop),loop();
//end

/**
 * Tämä käyttäjäskripti hyödyntää Shelly H&T:n (Gen 1, Plus, Gen 3) lähettämää lämpötilaa pörssisähköohjausten asetuksissa
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Tämä muuttaa ainoastaan #1 ohjauksen asetuksia, muihin ei kosketa.
 * 
 * Käyttöönotto:
 * -----
 * Shelly H&T gen 1
 * -----
 * Lisää Shelly H&T-asetuksiin "actions >- sensor reports" -osoitteisiin osoite
 *    http://ip-osoite/script/1/update-temp
 * missä ip-osoite on tämän shellyn osoite. 
 * Muista myös ottaa "sensor reports" -ominaisuus käyttöön
 * 
 * -----
 * Shelly H&T Plus ja H&T gen 3
 * -----
 * Lisää uusi Action->Temperature
 * Laita Then Do -kohdalla alle uusi osoite
 *    http://ip-osoite/script/1/update-temp?temp=$temperature
 * missä ip-osoite on tämän Shellyn osoite. 
 */

//Mitä ohjausta hienosäädetään (0 = ohjaus #1, 1 = ohjaus #2 jne.)
let INSTANCE = 0;

//Kuinka vanha lämpötilatieto sallitaan ohjauksessa (tunteina)
let TEMPERATURE_MAX_AGE_HOURS = 12;

//Viimeisin tiedossa oleva lämpötiladata
let data = null;

//Alkuperäiset muokkaamattomat asetukset
let originalConfig = {
  hours: 0,
  minutes: 60
};

function USER_CONFIG(inst, initialized) {
  //Jos kyseessä on jonkun muun asetukset niin ei tehdä mitään
  if (inst != INSTANCE) {
    return;
  }

  //Vähän apumuuttujia
  const state = _;
  const config = state.c.i[inst];

  //Jos asetuksia ei vielä ole, skipataan (uusi asennus)
  if (typeof config.m2 == "undefined") {
    console.log("Tallenna asetukset kerran käyttäjäskriptiä varten");
    return;
  }

  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    originalConfig.hours = config.m2.c;
    originalConfig.minutes = config.m;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {

    if (data == null) {
      console.log("Lämpötilatietoa ei ole saatavilla");
      state.si[inst].str = "Lämpötila ei tiedossa -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";

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
          //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
        }

        //------------------------------
        // Toimintalogiikka päättyy
        //------------------------------
        state.si[inst].str = "Lämpötila " + data.temp.toFixed(1) + "°C (" + age.toFixed(1) + "h sitten) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
        console.log("Lämpötila:", data.temp.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");

      } else {
        console.log("Lämpötilatieto on liian vanha -> ei käytetä");
        state.si[inst].str = "Lämpötilatieto liian vanha (" + age.toFixed(1) + " h) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
      }
    }
  } catch (err) {
    state.si[inst].str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa:", err);
  }

  //Asetetaan arvot asetuksiin
  config.m2.c = hours;
  config.m = minutes;
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

      _.si[INSTANCE].chkTs = 0; //Requesting to run logic again

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