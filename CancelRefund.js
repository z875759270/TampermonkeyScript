// ==UserScript==
// @name         点击取消退款
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  从URI中获取参数进行取消退款
// @author       You
// @match        https://www.baidu.com/*
// @match        https://sellercentral.amazon.co.uk/orders-v3/order/*?isCancel=true
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function () {
    'use strict';

    //https://sellercentral.amazon.co.uk/orders-v3/order/202-5509553-2233951?dmCode=orderCancelSuccess

    var host = window.location.host
    if (host.indexOf("amazon") > -1) {
        orderPageHandle(url)
        return;
    }
    window.ws = new WebSocket('ws://127.0.0.1:8765/');
    ws.onopen = function () {
        console.log("连接服务器成功");
        ws.send("Browser connected.");
    };
    ws.onclose = function () {
        console.log("服务器关闭");
    };
    ws.onerror = function () {
        console.log("连接出错");
    };
    ws.onmessage = function (evt) {
        console.log(evt)
        handleMessage(evt.data)
    }

    var newTap;

    var onpenNewTap = function (order_url) {
        newTap = GM_openInTab(order_url, { active: true, setParent: true });
        GM_setValue("isSuccess", 0);
    };
    //关闭页面
    var closeNewTap = function () {
        newTap.close();
    };

    //监听新标签页的状态
    var listenNewTap = function () {
        GM_addValueChangeListener('isSuccess', function (name, old_value, new_value, remote) {
            if (new_value == 1) {
                ws.send("取消退款成功！")
            } else if (new_value == -1) {
                //取消失败
                ws.send("取消退款失败...");
            }
            closeNewTap();
        })
    };


    function handleMessage(msg) {
        console.log("handle...");
        try {
            var dict = JSON.parse(msg);
        } catch (error) {
            return;
        }


        //打开新页面
        onpenNewTap(dict.url);
        listenNewTap();
    }

    async function orderPageHandle() {
        await waitForElementToClick();

        function waitForElementToClick() {
            return new Promise(res => {
                var error_count = 0;
                let a = setInterval(() => {
                    if (document.querySelector("input[value='取消退款']") != null) {
                        document.querySelector("input[value='取消退款']").click();
                        GM_setValue("isSuccess", 1);
                        clearInterval(a);
                    } else {
                        error_count++;
                        if (error_count > 30) {
                            GM_setValue("isSuccess", -1);
                            clearInterval(a);
                        }
                    }
                }, 500);
            })
        }
    }



})();