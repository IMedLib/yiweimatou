!function(e){function t(o){if(r[o])return r[o].exports;var n=r[o]={exports:{},id:o,loaded:!1};return e[o].call(n.exports,n,n.exports,t),n.loaded=!0,n.exports}var r={};return t.m=e,t.c=r,t.p="",t(0)}([function(e,t,r){var o=r(1);$(document).ready(function(){function e(e){var t=new RegExp("(^|&)"+e+"=([^&]*)(&|$)"),r=window.location.search.substr(1).match(t);return null!=r?r[2]:null}function t(e){return!(11!==e.length||!/^(((13)|(15)|(17)|(18))+\d{9})$/.test(e))}function r(e){$.ajax({url:url+"/Captcha/Add",data:{mobile:e},type:"POST"}).done(function(e){return 0!==e.code?($("#codeErr").text(""===e.msg?"获取失败，请重新尝试！":e.msg).fadeOut(5e3),!1):void alert(""===e.msg?"验证码已发送,请注意查收!":e.msg)}).fail(function(){$("#codeErr").text("请求超时！").fadeOut(5e3)})}function n(e){0===i?(e.removeAttr("disabled"),e.text("点击获取验证码"),i=60):(e.attr("disabled",!0),e.text("重新发送("+i+")"),i--,setTimeout(function(){n(e)},1e3))}var i=60;$("form").submit(function(){var r=$("#mobile").val(),n=$("#code").val();return t(r)?(6!=n.length&&$("#codeErr").text("验证码错误！").fadeOut(5e3),$.getJSON(url+"User/Add/Reg/",{mobile:r,recuid:$("#recuid").val(),verifycode:n}).done(function(t){if(0!==t.code)return $("#registerErr").text(""===t.msg?"注册失败，请重新尝试！":t.msg).fadeOut(5e3),!1;if(""!==t.token&&""!==t.key){var r=new Date;r.setDate(r.getDate()+parseInt(expire)),o.setCookie("key",t.key,r),o.setCookie("token",t.token,r);var n=decodeURIComponent(e("redirect"));("null"==n||""==n)&&(n="/"),window.location.href=n}}).fail(function(){$("#registerErr").text("请求超时！").fadeOut(5e3)}),!1):($("#mobileErr").text("非法手机号码！").fadeOut(5e3),!1)}),$("#codeGet").on("click",function(){var e=$("#mobile").val();return t(e)?(n($(this)),void r(e)):($("#mobileErr").text("非法手机号码！").fadeOut(5e3),!1)})})},function(e,t){e.exports={setCookie:function(e,t,r,o,n,i){if(!e||/^(?:expires|max\-age|path|domain|secure)$/i.test(e))return!1;var a="";if(r)switch(r.constructor){case Number:a=r===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+r;break;case String:a="; expires="+r;break;case Date:a="; expires="+r.toUTCString()}return document.cookie=e+"="+t+a+(n?"; domain="+n:"")+(o?"; path="+o:"")+(i?"; secure":""),!0}}}]);