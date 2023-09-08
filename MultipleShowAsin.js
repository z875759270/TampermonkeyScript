// ==UserScript==
// @name         多变体显示Asin
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.amazon.co.uk/dp/*
// @match        https://www.amazon.co.uk/*/dp/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    function copyTextToClipboard(text) {
        // 使用 GM_setClipboard 复制文本到剪贴板
        GM_setClipboard(text, 'text');
        console.log('Copied to clipboard:', text);
    }

    function createAsinElement(asin) {
        // 创建一个 <span> 元素，并添加点击监听器以将 ASIN 复制到剪贴板
        const element = document.createElement('span');
        element.style.display = 'block';
        element.style.margin = '1px auto';
        element.style.cursor = 'pointer';
        element.textContent = asin;
        element.onclick = function() {
            copyTextToClipboard(asin);
        };
        return element;
    }

    var li_list = document.querySelectorAll("#tp-inline-twister-dim-values-container > ul > li");
    for (let i = 1; i < li_list.length; i++) {
        let el = li_list[i];
        let asin = el.getAttribute("data-asin");
        el.insertBefore(createAsinElement(asin), el.firstChild);
    }

    var image_list = document.querySelector("ul[role='radiogroup']").children;
    for (let i = 0; i < image_list.length; i++) {
        let el = image_list[i];
        let asin = el.getAttribute("data-defaultasin");
        el.insertBefore(createAsinElement(asin), el.firstChild);
    }
})();
