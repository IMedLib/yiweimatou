/**
 * Created by zhangruofan on 2015/12/23.
 */
var cookie=require('../lib/cookie.js');
$(document).ready(function () {
    var wait = 60;
    function getUrlParam(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r!=null) return r[2]; return null;
    }
    $('form').submit(function () {
        var mobile = $('#mobile').val();
        var code = $('#code').val();
        if (!isMobile(mobile)) {
            $('#mobileErr').text('非法手机号码！').fadeOut(5000);
            return false;
        }
        if (code.length != 6) {
            $('#codeErr').text('验证码错误！').fadeOut(5000);
        }
        $.getJSON(url + 'User/Put/Login/', {
            mobile: mobile,
            verifycode: code
        }).done(function (data) {
            if (data.code !== 0) {
                $('#loginErr').text(data.msg === "" ? "登录失败，请重新尝试！" : data.msg)
                    .fadeOut(5000);
                return false;
            }
            if (data.token !== '' && data.key !== '') {
                var now = new Date();
                now.setDate(now.getDate()+parseInt(expire));
                cookie.setCookie('key', data.key, now);
                cookie.setCookie('token', data.token, now);
                var redirect=decodeURIComponent(getUrlParam('redirect'));
                if(redirect=='null' || redirect=='')
                {
                    redirect='/';
                }
                window.location.href = redirect;
            }
        }).fail(function () {
            $('#loginErr').text("请求超时！").fadeOut(5000);
        });
        return false;
    });
    $('#codeGet').on('click', function () {
        var mobile=$('#mobile').val();
        if (!isMobile(mobile)) {
            $('#mobileErr').text('非法手机号码！').fadeOut(5000);
            return false;
        }
        setTime($(this));
        getCode(mobile);
    });
    function isMobile(mobile){
        return !!(mobile.length === 11 && /^(((13)|(15)|(17)|(18))+\d{9})$/.test(mobile));

    }
    function getCode(mobile) {
        $.ajax({
            url: url + '/Captcha/Add',
            data: {
                mobile: mobile
            },
            type: 'POST'
        }).done(function(data){
            if (data.code !== 0) {
                $('#codeErr').text(data.msg === "" ? "获取验证码失败，请重新尝试！" : data.msg)
                    .fadeOut(5000);
                return false;
            }
            alert(data.msg===''?'验证码已发送,请注意查收!':data.msg);
        }).fail(function () {
            $('#codeErr').text("请求超时！").fadeOut(5000);
        });
    }

    function setTime(object) {
        if (wait === 0) {
            object.removeAttr('disabled');
            object.text("点击获取验证码");
            wait = 60;
        } else {
            object.attr('disabled', true);
            object.text("重新发送(" + wait + ")");
            wait--;
            setTimeout(function () {
                setTime(object);
            }, 1000);
        }
    }
});