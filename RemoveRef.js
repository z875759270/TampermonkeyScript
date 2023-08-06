// ==UserScript==
// @name         店铺页面小工具
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  1.店铺页面新增去除REF访问；2
// @author       zhanc
// @match        https://www.amazon.co.uk/s?*marketplaceID=*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @connect      *
// @require      http://code.jquery.com/jquery-2.1.1.min.js
// @license      MIT
// ==/UserScript==

//防止与原页面的jquery冲突
this.$ = this.jQuery = jQuery.noConflict(true);
(function () {
    'use strict';
    //添加按钮去除REF
    // var list = document.querySelectorAll("div[class='sg-col sg-col-4-of-12 sg-col-4-of-16 sg-col-8-of-20 sg-col-8-of-24'] .sg-col-inner");
    // list.forEach(el => {
    //     let url = el.parentElement.parentElement.parentElement.querySelector("a").getAttribute("href").split("/ref=")[0];
    //     el.innerHTML = "<a href='" + url + "' target='_blank'><button style='width:100px;height:30px'>去除REF访问</button></a>";
    // });

    var list = document.querySelectorAll("div[class='a-section a-spacing-none puis-padding-right-small s-title-instructions-style']");
    list.forEach(el => {
        let a_link = el.querySelector("a");
        let url = a_link.getAttribute("href").split("/ref=")[0];
        let asin = url.split("/dp/")[1];

        //去除REF
        a_link.setAttribute("href", url);

        //显示ASIN
    })

    GM_notification({
        text: "清除Ref完成.",
        title: "zhanc",
        silent: true,
        timeout:3000
    });


    function remove_ref() {
        
    }
})();
