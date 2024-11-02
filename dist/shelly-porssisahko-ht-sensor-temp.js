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
const CNST={INST_COUNT:"undefined"==typeof INSTANCE_COUNT?3:INSTANCE_COUNT,HIST_LEN:24,ERR_LIMIT:3,ERR_DELAY:120,DEF_INST_ST:{chkTs:0,st:0,str:"",cmd:-1,configOK:0,fCmdTs:0,fCmd:0},DEF_CFG:{COM:{g:"fi",vat:25.5,day:0,night:0,names:[]},INST:{en:0,mode:0,m0:{c:0},m1:{l:0},m2:{p:24,c:0,l:-999,s:0,m:999,ps:0,pe:23,ps2:0,pe2:23,c2:0},b:0,e:0,o:[0],f:0,fc:0,i:0,m:60,oc:0}}};let _={s:{v:"3.0.0-dev1",dn:"",configOK:0,timeOK:0,errCnt:0,errTs:0,upTs:0,tz:"+02:00",tzh:0,enCnt:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},si:[CNST.DEF_INST_ST],p:[[],[]],h:[],c:{c:CNST.DEF_CFG.COM,i:[CNST.DEF_CFG.INST]}},_i=0,_j=0,_k=0,_inc=0,_cnt=0,_start=0,_end=0,cmd=[],loopRunning=!1;function getKvsKey(t){let e="porssi";return e=0<=t?e+"-"+(t+1):e}function isCurrentHour(t,e){e-=t;return 0<=e&&e<3600}function limit(t,e,s){return Math.min(s,Math.max(t,e))}function epoch(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function getDate(t){return t.getDate()}function updateTz(t){let e=t.toString(),s=0;"+0000"==(e=e.substring(3+e.indexOf("GMT")))?(e="Z",s=0):(s=+e.substring(0,3),e=e.substring(0,3)+":"+e.substring(3)),e!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=e,_.s.tzh=s}function log(t){console.log("shelly-porssisahko: "+t)}function addHistory(t){for(var e=0<_.s.enCnt?CNST.HIST_LEN/_.s.enCnt:CNST.HIST_LEN;0<CNST.HIST_LEN&&_.h[t].length>=e;)_.h[t].splice(0,1);_.h[t].push([epoch(),cmd?1:0,_.si[t].st])}function updateState(){var t=new Date;for(_.s.timeOK=2e3<t.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,_.s.enCnt=0,_i=0;_i<CNST.INST_COUNT;_i++)_.c.i[_i].en&&_.s.enCnt++;!_.s.upTs&&_.s.timeOK&&(_.s.upTs=epoch(t))}function getConfig(l){var t=getKvsKey(l);Shelly.call("KVS.Get",{key:t},function(e,t,s){l<0?_.c.c=e?JSON.parse(e.value):{}:_.c.i[l]=e?JSON.parse(e.value):{};{e=l;var n=function(t){l<0?_.s.configOK=t?1:0:(log("config for #"+l+" read, enabled: "+_.c.i[l].en),_.si[l].configOK=t?1:0,_.si[l].chkTs=0),loopRunning=!1,Timer.set(500,!1,loop)};let t=0;if(CNST.DEF_CFG.COM||CNST.DEF_CFG.INST){var o,i=e<0?CNST.DEF_CFG.COM:CNST.DEF_CFG.INST,r=e<0?_.c.c:_.c.i[e];for(o in i)if(void 0===r[o])r[o]=i[o],t++;else if("object"==typeof i[o])for(var p in i[o])void 0===r[o][p]&&(r[o][p]=i[o][p],t++);e>=CNST.INST_COUNT-1&&(CNST.DEF_CFG.COM=null,CNST.DEF_CFG.INST=null),0<t?(e=getKvsKey(e),Shelly.call("KVS.Set",{key:e,value:JSON.stringify(r)},function(t,e,s,n){e&&log("failed to set config: "+e+" - "+s),n(0==e)},n)):n(!0)}else n(!0)}})}function loop(){if(!loopRunning)if(loopRunning=!0,updateState(),_.s.configOK)if(pricesNeeded(0))getPrices(0);else if(pricesNeeded(1))getPrices(1);else{for(let t=0;t<CNST.INST_COUNT;t++)if(!_.si[t].configOK)return void getConfig(t);for(let t=0;t<CNST.INST_COUNT;t++)if(function(t){var e=_.si[t],s=_.c.i[t];if(1!=s.en)return void(_.h[t]=[]);var t=new Date,n=new Date(1e3*e.chkTs);return 0==e.chkTs||n.getMinutes()!=t.getMinutes()||n.getFullYear()!=t.getFullYear()||0<e.fCmdTs&&e.fCmdTs-epoch(t)<0||0==e.fCmdTs&&s.m<60&&t.getMinutes()>=s.m&&e.cmd+s.i==1}(t))return void Timer.set(500,!1,logic,t);loopRunning=!1}else getConfig(-1)}function pricesNeeded(t){var e=new Date;let s=!1;return s=1==t?_.s.timeOK&&0===_.s.p[1].ts&&15<=e.getHours():((t=getDate(new Date(1e3*_.s.p[0].ts))!==getDate(e))&&(_.s.p[1].ts=0,_.p[1]=[]),_.s.timeOK&&(0==_.s.p[0].ts||t)),_.s.errCnt>=CNST.ERR_LIMIT&&epoch(e)-_.s.errTs<CNST.ERR_DELAY?s=!1:_.s.errCnt>=CNST.ERR_LIMIT&&(_.s.errCnt=0),s}function getPrices(p){try{log("fetching prices for day "+p);let i=new Date;updateTz(i);var e=1==p?new Date(864e5+new Date(i.getFullYear(),i.getMonth(),i.getDate()).getTime()):i;let t=e.getFullYear()+"-"+(e.getMonth()<9?"0"+(1+e.getMonth()):1+e.getMonth())+"-"+(getDate(e)<10?"0"+getDate(e):getDate(e))+"T00:00:00"+_.s.tz.replace("+","%2b");var s=t.replace("T00:00:00","T23:59:59");let r={url:"https://dashboard.elering.ee/api/nps/price/csv?fields="+_.c.c.g+"&start="+t+"&end="+s,timeout:5,ssl_ca:"*"};i=null,t=null,Shelly.call("HTTP.GET",r,function(e,t,s){r=null;try{if(0!==t||null==e||200!==e.code||!e.body_b64)throw Error(t+"("+s+") - "+JSON.stringify(e));{e.headers=null,s=e.message=null,_.p[p]=[],_.s.p[p].avg=0,_.s.p[p].high=-999,_.s.p[p].low=999,e.body_b64=atob(e.body_b64),e.body_b64=e.body_b64.substring(1+e.body_b64.indexOf("\n"));let t=0;for(;0<=t;){e.body_b64=e.body_b64.substring(t);var n=[t=0,0];if(0===(t=1+e.body_b64.indexOf('"',t)))break;n[0]=+e.body_b64.substring(t,e.body_b64.indexOf('"',t)),t=2+e.body_b64.indexOf('"',t),t=2+e.body_b64.indexOf(';"',t),n[1]=+(""+e.body_b64.substring(t,e.body_b64.indexOf('"',t)).replace(",",".")),n[1]=n[1]/10*(100+(0<n[1]?_.c.c.vat:0))/100;var o=new Date(1e3*n[0]).getHours();n[1]+=7<=o&&o<22?_.c.c.day:_.c.c.night,_.p[p].push(n),_.s.p[p].avg+=n[1],n[1]>_.s.p[p].high&&(_.s.p[p].high=n[1]),n[1]<_.s.p[p].low&&(_.s.p[p].low=n[1]),t=e.body_b64.indexOf("\n",t)}if(e=null,_.s.p[p].avg=0<_.p[p].length?_.s.p[p].avg/_.p[p].length:0,_.s.p[p].ts=epoch(i),1==p&&_.p[p].length<23)throw Error("no prices tomorrow")}}catch(t){log("error getting prices: "+t),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[p].ts=0,_.p[p]=[]}loopRunning=!1,Timer.set(500,!1,loop)})}catch(t){log("error getting prices: "+t),_.s.p[p].ts=0,_.p[p]=[],loopRunning=!1}}function logic(i){try{cmd[i]=!1;var t,e,s=new Date;updateTz(s),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var e=epoch();for(let t=0;t<_.p[0].length;t++)if(isCurrentHour(_.p[0][t][0],e))return _.s.p[0].now=_.p[0][t][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}();let n=_.si[i],o=_.c.i[i];function r(t){if(null==t)loopRunning=!1;else if(cmd[i]!=t&&(n.st=12),cmd[i]=t,o.i&&(cmd[i]=!cmd[i]),log("logic for #"+i+" done, cmd: "+t+" -> output: "+cmd[i]),1==o.oc&&n.cmd==cmd[i])log("outputs already set for #"+i),addHistory(i),n.cmd=cmd[i]?1:0,n.chkTs=epoch(),loopRunning=!1;else{let e=0,s=0;for(let t=0;t<o.o.length;t++)!function(o,i){var t="{id:"+o+",on:"+(cmd?"true":"false")+"}";Shelly.call("Switch.Set",t,function(t,e,s,n){0!=e&&log("setting output "+o+" failed: "+e+" - "+s),i(0==e)},i)}(o.o[t],function(t){e++,t&&s++,e==o.o.length&&(s==e&&(addHistory(i),n.cmd=cmd[i]?1:0,n.chkTs=epoch(),Timer.set(500,!1,loop)),loopRunning=!1)})}}0===o.mode?(cmd[i]=1===o.m0.c,n.st=1):_.s.timeOK&&0<_.s.p[0].ts&&getDate(new Date(1e3*_.s.p[0].ts))===getDate(s)?1===o.mode?(cmd[i]=_.s.p[0].now<=("avg"==o.m1.l?_.s.p[0].avg:o.m1.l),n.st=cmd[i]?2:3):2===o.mode&&(cmd[i]=function(t){var e=_.c.i[t],s=(e.m2.ps=limit(0,e.m2.ps,23),e.m2.pe=limit(e.m2.ps,e.m2.pe,24),e.m2.ps2=limit(0,e.m2.ps2,23),e.m2.pe2=limit(e.m2.ps2,e.m2.pe2,24),e.m2.c=limit(0,e.m2.c,0<e.m2.p?e.m2.p:e.m2.pe-e.m2.ps),e.m2.c2=limit(0,e.m2.c2,e.m2.pe2-e.m2.ps2),[]);for(_inc=e.m2.p<0?1:e.m2.p,_i=0;_i<_.p[0].length;_i+=_inc)if(!((_cnt=-2==e.m2.p&&1<=_i?e.m2.c2:e.m2.c)<=0)){var n=[];for(_start=_i,_end=_i+e.m2.p,e.m2.p<0&&0==_i?(_start=e.m2.ps,_end=e.m2.pe):-2==e.m2.p&&1==_i&&(_start=e.m2.ps2,_end=e.m2.pe2),_j=_start;_j<_end&&!(_j>_.p[0].length-1);_j++)n.push(_j);if(e.m2.s){for(_avg=999,_startIndex=0,_j=0;_j<=n.length-_cnt;_j++){for(_sum=0,_k=_j;_k<_j+_cnt;_k++)_sum+=_.p[0][n[_k]][1];_sum/_cnt<_avg&&(_avg=_sum/_cnt,_startIndex=_j)}for(_j=_startIndex;_j<_startIndex+_cnt;_j++)s.push(n[_j])}else{for(_j=0,_k=1;_k<n.length;_k++){var o=n[_k];for(_j=_k-1;0<=_j&&_.p[0][o][1]<_.p[0][n[_j]][1];_j--)n[_j+1]=n[_j];n[_j+1]=o}for(_j=0;_j<_cnt;_j++)s.push(n[_j])}if(-1==e.m2.p||-2==e.m2.p&&1<=_i)break}let i=epoch(),r=!1;for(let t=0;t<s.length;t++)if(isCurrentHour(_.p[0][s[t]][0],i)){r=!0;break}return r}(i),n.st=cmd[i]?5:4,!cmd[i]&&_.s.p[0].now<=("avg"==o.m2.l?_.s.p[0].avg:o.m2.l)&&(cmd[i]=!0,n.st=6),cmd[i])&&_.s.p[0].now>("avg"==o.m2.m?_.s.p[0].avg:o.m2.m)&&(cmd[i]=!1,n.st=11):_.s.timeOK?(n.st=7,t=1<<s.getHours(),(o.b&t)==t&&(cmd[i]=!0)):(cmd[i]=1===o.e,n.st=8),_.s.timeOK&&0<o.f&&(e=1<<s.getHours(),(o.f&e)==e)&&(cmd[i]=(o.fc&e)==e,n.st=10),cmd[i]&&_.s.timeOK&&s.getMinutes()>=o.m&&(n.st=13,cmd[i]=!1),_.s.timeOK&&0<n.fCmdTs&&(0<n.fCmdTs-epoch(s)?(cmd[i]=1==n.fCmd,n.st=9):n.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(cmd[i],_,r):r(cmd[i])}catch(t){log("error running logic: "+JSON.stringify(t)),loopRunning=!1}}let _avg=999,_startIndex=0,_sum=0;log("v."+_.s.v),log("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),_.c.i.pop(),_.si.pop();for(let t=0;t<CNST.INST_COUNT;t++)_.si.push(Object.assign({},CNST.DEF_INST_ST)),_.c.i.push(Object.assign({},CNST.DEF_CFG.INST)),_.c.c.names.push("-"),_.h.push([]),cmd.push(!1);CNST.DEF_INST_ST=null,HTTPServer.registerEndpoint("",function(s,n){try{if(loopRunning)return s=null,n.code=503,n.headers=[["Access-Control-Allow-Origin","*"]],void n.send();var o=function(t){var e={},s=t.split("&");for(let t=0;t<s.length;t++){var n=s[t].split("=");e[n[0]]=n[1]}return e}(s.query),i=parseInt(o.i);s=null;let t="application/json",e=(n.code=200,!0);var r,p="text/html",l="text/javascript";"s"===o.r?(updateState(),0<=(r=parseInt(o.i))&&r<CNST.INST_COUNT?n.body=JSON.stringify({s:_.s,si:_.si[r],c:_.c.c,ci:_.c.i[r],p:_.p}):n.body=JSON.stringify(_),e=!1):"c"===o.r?(updateState(),0<=i&&i<CNST.INST_COUNT?n.body=JSON.stringify(_.c.i[i]):n.body=JSON.stringify(_.c.c),e=!1):"h"===o.r?(0<=i&&i<CNST.INST_COUNT&&(n.body=JSON.stringify(_.h[i])),e=!1):"r"===o.r?(log("config changed for #"+i),_.s.configOK=!1,_.si[i].configOK=!1,loopRunning||(loopRunning=!0,getConfig(i)),_.s.p[0].ts=0,_.s.p[1].ts=0,n.code=204,e=!1):"f"===o.r&&o.ts?(_.s.fCmdTs=+(""+o.ts),_.s.fCmd=+(""+o.c),_.s.chkTs=0,n.code=204,e=!1):o.r?"s.js"===o.r?(n.body=atob("H4sIAAAAAAAACo1W627bNhR+FYXLDBJiWLvb/thlgq7J1nZpO9RegSEIllOJiRnTpEMeuTVUvY2fYS/gFxsoyY6cpd3++EJ+h+f2nYtRmPzx/lwSwv94fz6O39oGlH0OGeqlmsDHeJa7TOYuK+bKIr8LEuVx7jJxVyi/GiujMnSeku9Iioyf/vyrpEwelxUfT55Pzv4aT97LC/LbZr2yVgdUuFlv1pbweBS0m95CEQgnL7VFSMAYlXi4Bbs7Whn94ETpZApmqecLDQlu1sZs1klE3MIsOGNgh/yfsForaAvJIhpXA4+2Oj+AnxdFwMJia21CowXaorsFnoCeQYJa5S4EYPHNzRo3a9QGtvAaovQe6neYzdzRFvF9SCCg3r9ALJJa7V4s5jALeq635sXAIm7Wt5u1TcLM68XOzJXRM+1vnUaE6OyksFbbpLmda1sUqDGZxQcU4opc8jfvTjsJe5idqJJw8jqGz7axnQNGG61GcskDAiq5dDpP+vzFz2N5ccnnqqYDIdw4t5joufLSFsZwt1A28gvCymYJyuOyETyQEns9QuL3ly8UJUH4eBSfLgJhPHM2OKOEcTc0cpXxT9rm7pMwLgPUzoophKnElDwhaY1IB6xDZxwtwScg7wIlkbAj6PUoiGyqspnK5UGfcUKkrO+zo4gQ2lrlX07enPd68Ak0Jgu3KAygOl1ZmOvsFBAopkRMcW4Ib8V4scgB1blzC3rQZxVXSzAvnEXQVvlxFjM1gZsgaeuAs8ZB3sSjrqBoKMrH3BNhYTRS8oSwUV2wdAE+qFcWKV4MLtmXLwN2NNiGmOJF/1IEozNFB4zx07MPJ17dvQ6U5GopbgNhw46xrOL/qu7nxlAiMBAmrp0/g2xKUR6jgDw/WyqL57GyrfKUZFOwN4rwmNCdfoHgbxQKnbOKMa6Miq3kVS6Py2vnaXQ01AEJMe67a/aIEQ2OMK5lf6SftWLCKHuD05FOU9YeXejLJnMT9RlPYvDpYzdseK0wm3bvgs+YwKmy9LqwWQw6zQGBlfFToPqM9OG9Z2WtwbOKVYx3HluAVxbfulwJr+ZuqV5Mtck76iL+EUK1PEAOkQroV+Xp2Ye6HmKnTsmJlyRF4dXCQKZoXSSEE8Luj7Z8JIzVpFeyoe+Nwoay/GDARkq42Qm9CxQ6TJdKRGe/xlkKjA0fipAz752Pr6O2N0mUHyYkVQI/Y5VBDDKyclu/KoIpsqrirT2tx8BVrMLW6Wi3bu1uEgVspK+pFm7GSqMwwbqdjLzCwtvkaf/HAym1aPpFr0dRqpNGXIvb4Cxlw+3fJpOMb9G8dLPhQZ9nLlfD3SF+xt2fSBheO4ZV1WrcdwhSEp3uCrDm3cEj714dllANk8Oyi68Selju21ixq0ZtdLW6D+ajJrSP0sPy9fjdWxHQa3ujr1cx2Oxq35qjQdeOr4h0VVf82vk5xISpuAdcHZYomgSqWBVuXMtSJhaQjxE80qec9AmrxGEZOy4dpLXAG2dxShl7BHjVIH4pjPlTgaes1RmHh4wV0fCjBr10hQ/fVJySIWlValug+g80hZOdwFhlzubfFhgSwjoxeWDj/QVFlpKEpPeu1LXdmRKdzt8dcuTV2/Hk+dsXZ81uxnhmFPj4gCuQ7oYq43FihYW2hImAK6PEUgf9URuNK0nq30aR0bao8EEz2HWV0NOSpLWqEda9oRnr2HSEOBpQo1GyORdB5Pbk/mdKkiMSg5KS3zd/+xB02Kyns83fpDYwvku6XaORzISFuQpiDgva9ryrZy6uMjZZgimUJJGi5Phds9p8d1hCOqhLB6tnTxrk8RXr6mjkakeGP/V/iPuEiKTv9VqPIqNZ3FP2Zhpl7Ovdit9LVtfagjGr8ptxn+o8V7a7/ASF2+Td557/pH5gVTXqmP/t0VpP/fuhvx2wtc/sX4vYvoMHfba3nbDdorBbk1jFRv8A/kxNzh0MAAA="),t=l):"s.css"===o.r?(n.body=atob("H4sIAAAAAAAACo1WTW/jNhD9K4MNFki8liwl621CoUF7WqAoih7aXooeKGpksaZIghwl8hr+7wWpDytOgu0lsMj5ePPezDCb1QpW4BtU6pBY47yXnjd7A+H4WtzAL533EqQ3xJWBBBoiyzabf8eTtJawioeebTY7SU1XpsK0s8Hmndi/SoHaI4Ovv/0JP9c1OgNfUaPjCn7vSiXFZAJPd2kGqw2s4Ail6RMvv0m9Y1AaV6FLStMXcILSVIc1cDiCMMo4Blco6qzOp7vgzMV+50ynKwZXt+IOt1kBSmpMGpS7hhjk6WdsC6iNppAGGWTpw3xS81aqA4O/0FVc8wJa3ifPsqKGwecHF+zGrzzLPoZrt5OaQQa8I1OA5VUVkW9tD3lmI+4rkqQQjsukI4zBPykNkWmjV3QQxh5e2mfpfbDnSu504lHVDGqFfYK6KoCwpyReMXChzBAkrVUPR6ikt4ofBvN4Trz0cARrvCRpggsqTvIJi5f05bwUD2J2YazE2jhcT5+8JnRRDE2oicGHD8U5HfFS4cJ5tlbIXVCWmuk2VKoMJwYK6wE7+TWkzRK+NnoOlyheolrelsqI/YXSt+kP28DZrEkGeXobTsa2cqOd7cEbJSu4yr/w7H5bgOicDw1mjdSEbs47lgrHl11wppKX3qiOsIBvidQV9gzyAsjYM5xQI4NsgSt32MIF+XVdF3ObT41sLBeSDtE7ksREg2KP1acXrHw/0EDAG3FiiE8Xtc5p80VZt4OrsUsZdk5WRfybELZWccJEGNW12jPIaxenJPyIzt7qBZPpbRyv85wO3zPU+D0KRY5rb7lDTbOaU41T247HZOx09dzIoMykPq9k5xlsg4Jcy5YPEgZUuY+txB1IXUsd3eYipY5tNrbcCX7a46F2vEUPQ0WhKeA4gKyNaxk4Q5zw+u5LVuHuBk5wGuYjFeKRwup6JPdIFaul85SIRqpqDWm5W49mvgVyy9tpOTyPbJVGVQU8oSMpuJp2ARn7/kzXqk9aE3RWcQCxTyrpUIw7wTzH2lqsJL9ebsH7zPY3cJy0/47Yc5c8AtPUDOiv70KAzQr+4G6HBNQgKO4JBnfguoKW7xEkQd0pNfRIeCBitsGKQQ4bSPLlwlwuQoHT6A4ctkum13BV7h/fWyMvhvtN/wstxjU+jnZY4ufui1M2P2TDns8WYV8ru/TNbQ+l4mI/dP7/UG5g59LwsZJPM9ARwAjhnNGHQY+bcjlVitvwik+/XtNzxvwG3uWLODSDeFeotJbL3fqxGEY24sLwBDw7bqPhc36fLSzvp+At5dlZj4HB8RUObOQjX3GVBXO3XZISX+1s3Iqt2l4qO2Up13DlE9G+M4YnkNp29DcdLP5YdkRG/3P5+udht53O43184z+SsbppjM6rIOSdeL0LmN6m03dty12Yi9fv2X9nyax8FgoAAA=="),t="text/css"):"status"===o.r?(n.body=atob("H4sIAAAAAAAACpWQS07DMBRFt2JlBIMkzQCJgesFICQGdAMvtqs49SfkvbTNfrIGNpCNoeZHC+XT8T0+PjYnyK1m0gLiOnJMykhwqgUnJZ7BkGYlsFCU0CAnxYxaY6z8jEznDtnjSrwMEPMtLaB0J4kCAvBJkszegdyh9gy1NaQXHmm5+7Xvil3/7llhPMGF1YeDuFAhtW1VmQVwQemF2BgLy2L8NgieDm8WXJn9/PCtPbKtPcYu5LEMNroYSZ62jLn64dvgKFtFgudzMKO+833Xd56nueCpMnvBxz8eCiqzuhpwrtoE0g01Dn6RjcdITtYz6Uhdy7f/yC+a4LT38FN9dkP9H67sa/Nn+QBcsY8EytpUJGr99oR3EUEeIwE1mJQY3fN0mj8AnRW/d9oCAAA="),t=p):"status.js"===o.r?(n.body=atob("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"),t=l):"history"===o.r?(n.body=atob("H4sIAAAAAAAACmWNOw7CMBBEr2K5gsJY9JuVaGkoOIF/IRuMDN5NlNweEQWElGaK90YzEGlUITvmRrd5Um2ezKN4E0rWCH9SwscdNYI4nxOCVASJP638TeOJ7m4DL13vBt7ga8okCeyy40ucFcWGTUcsCHY9sZHGb3Ko9BSs6XXmnRbnl26p86FnvQe7+jdGEOBV0gAAAA=="),t=p):"history.js"===o.r?(n.body=atob("H4sIAAAAAAAAClWS0WrbMBSGX0U9ZEOaHbdd2E0cOWxrYRctg8a7MmY9cY5jbaqVSSctwfXb9E36YsMOGynoRgfp+38+qbPEwuiiTCvXBhZrzTrr/gQJYdqYwKAS07bkv+W3NxoW7LMFb0TlbNhhq2fZtRHDMecN4uKcN9ninH0GffqIXlQaw6GtxIAc9l6fglP2h87Ukp+f2721WgdGJuWJ974Va6lSU0tgXE+PCQfQGis2j5TjWo1AilHjExoWW+IrZJQ/7m5WESy9bt4bDZFpA48cTNxvNaSdSaMx2SCjSiy1W25OEnuygYSp5aeL2ZnWmFRu86aRP7UBae28JOFqYZLgPEvJsVc688VFOeXiolTHmuFoDuKg5bAifT9atBiChtowZJOudv4BOTcPJFt6ElfIJC9p9oFGTj/KvVfReDPwwZKGylnn55OOistyCVtP1MIcPG2gH4jH8ffmF+6D2L2+vL5YSzD/P3EmwBtuNulW+ef8+ucqvyuo+FiWy8TTzmJFEoR8FwQGNgpigH+FIjg++KmZSIe+7yvkqpGsuuFjOUsJee+8ZBWfSuS+Tyup4q9fVsluHxpZqf4v8DUOEZQCAAA="),t=l):"config"===o.r?(n.body=atob("H4sIAAAAAAAACpVWS27jRhC9SkNBMPaC+nCcGcOgGtDCA8uWpSCSHWRZIltmmf3hsItylHWOwjP4ArxYQFKkRNqykRXR9X1dVa+aXoBb5kuwdtwjn617lnZSjDdGk2PxH3E16rtC8b9m19Pl9YpNlterh7vl9cobBLjlHsFaitpfMd/vcY8S7lHA7wGKj2eFFD4xDMZP3DMxodFsCzIV4w3yZWoUtqVC8EdMTFsot3wGtEXoiInPUBCl4A2qPHX6PaaX0eWQL/MsjPJXzSazxxIS6jgtEW2BWHHLscvZrzXwJWJCRkFkUyrOw++O616xg1cAu8bLH0R/ht6hiIpGQ+66zvD7sYfGp5A6PlUBB2UFudduQxHlZC8WN7eThyX7xbMx6CK6j9wbFAe+D1oEK+SbJ0fuo5LPZxAAAeh+v//GjlWpArSxhN2VNlp81Nzj6t7l2Y7yV2vz7Ki4tIvF2A+FH63N30USoTnzJKyFZBuTFMfFfLD48cMblMJmbOaosN0k3egW4TOkliDuTpYygeDdESjNiaBossyzMMhfqR3ZpGSrrlw0TrPKUjNTJuskMn5nhod8ghoYQRKhJRDWdkZ0xB8BNVNpSpSW6vdgplahTlPCDkKFuhkbhbp2ucuzPNMkUIsW0BO1R71tsj1CotLUUqp1mazQr6NGfZNnlGeEEj4PK5Kk3dMkOdHU3yGKjFNGjKyo7hgIApS25o38jXs2VQqSHZ+XI5UNYkRpqKjYXrEfSQzGm7AeTKtKuvQOXBrsQ7/Lrj21+F3+73JaUenTXXY87otPy6KGjq+CVmX2ok5xPkB3M52vJn9Mbif/C9sNaoIEnqEzRCNHouqun9PJbyd3y8Wc3Uxmj9P7+8mKrR7m8+nnK/8YyuQZ9DNE1nSZ6jqxSDokci+4exF2eOPykduRXfLLjuQb/9aRXPBupK/8a0fi8m5kZ8SNguJQlJCdjVgJ/rxj5bat3MoKzhtOs2opV4UIOWAE2zyTyM4iac6v6jVNST32ruNXS0ABg1bNDu1zndjW3bsaDpnD2kpxpKwZt0o1oSrWRNLay5WLrw+vUdhG476Fw9x3ALkfInLbkN7Eb8F7J76vyW0hrNaISPIsivIM6yVyioKuY38226fc0HGRTMo8Y06HIVWavZtEVTOk+Y+JLCoMi5af8lIfsGr/nPeOLmhhKyrQ65SoGa8VSCm0hvoZPzzSb/4M+GoxvZ/O54vVGyvy60yHP5JWsmJ7msQX+6xHu9lyb5184m20L9GPxl9eUAfmpW9ioc96g975lypcbxkKKXeahSBLmvTqi1g/wZh4In7e2rMewdrxjd7gU//Z9goGVer/AGSesiGRCgAA"),t=p):"config.js"===o.r?(n.body=atob("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"),t=l):n.code=404:(n.body=atob("H4sIAAAAAAAACqVT224TMRD9FWMklIjsLi0vqFm7QrQS9AUeUF+RY0+y0zj24plNFCH+hm/oD/TH0F4Sui2ViniZ3ZkzPud4Zrd84aLlfQ0Vb7wu2yi8CSsFQZcbYCNsZRIBq4aX2TtdMrIH/eXuNhEh3f2q1ne3ZdFX+wPBbEBtEXZ1TCxsDAyBldyh40o52KKFrEtmGJDR+Iys8aBOpC4dboX1hkhxrPsUnfqr5oBRjWE4QnXQZeFwe4hdIPBguW3FQKzLWDPGILbGN6De6M/VjWlIvDwZAydH4HQMnB6Bt2XRc9+Ta2VsrPeDo02lX7XpXFw1RCg+UWTjo5iURlQJlqpirumsKG6wR/IlCjZpBay+LbwJa30PKQujpw8veBiXWdCDXJcY6oZFu12VjMPYr8Z0IzWLjNhwQ8JWYNfg1PA8EJAWpTcL8GIZ06j/IJB1sP6K3pRF/z52kA3L76aS/aF4tKV/MF0hcUz7p10+aDja/NjV8dlWB57/8WpjWOLqaatj/Oj0PQE3awJ+rtWeZ+y0j2QT1qxtDMTi4vJa7TC4uMt9tKb9qPOYcIUhx2B944AmskV8FYnldO6BhVMu2mYDgWc2gWG49NBmCpR2+ag0genM1DUE96FC7/qORXT7/F61bUrw/Ypa+MfWJEFqzCJ703I6p5ySVReX1+dwJs+Tkq8hT1B7Y2Ei24vLmZQjzQlNf84sPaL0GNZyOrdEeQKvJPHeA1UALNv2vPsZWyFJuSWSnVz/OqK3RIP9iaT8huS0LIYZ/wa5CE3MSgUAAA=="),t=p),n.headers=[["Content-Type",t]],n.headers.push(["Access-Control-Allow-Origin","*"]),e&&n.headers.push(["Content-Encoding","gzip"])}catch(t){log("server error: "+t),n.code=500}n.send()}),Timer.set(1e4,!0,loop),loop();

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
          //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
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