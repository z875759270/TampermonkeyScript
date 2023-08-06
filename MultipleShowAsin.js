// ==UserScript==
// @name         多变体显示Asin
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.amazon.co.uk/dp/*
// @match        https://www.amazon.co.uk/*/dp/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var li_list = document.querySelectorAll("#tp-inline-twister-dim-values-container > ul > li");
    for (let i = 1; i < li_list.length; i++) {
        let el = li_list[i];
        let asin = el.getAttribute("data-asin");
        el.innerHTML = ("<p style='margin:1px'>"+asin+"</p>")+el.innerHTML;
    }
})();