// ==UserScript==
// @name         定时下架
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modify the content of browser pages at a specific time and stop the timer
// @author       You
// @match        https://sellercentral.amazon.co.uk/inventory*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @require      http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

let timer;
//防止与原页面的jquery冲突
this.$ = this.jQuery = jQuery.noConflict(true);
var amz_host = "http://www.zhanc.fun:8091"
var shopName = await getShopName();
var ignoreList = await getIgnoreList(shopName);

//获取铺货ASIN
function getIgnoreList(shop_name) {
    return new Promise(ret => {
        GM_xmlhttpRequest({
            method: "GET",
            url: amz_host + '/ignoreAsin/list?shopName=' + shop_name,
            data: "",
            onload: function (res) {
                var resp = JSON.parse(res.response);
                var result = null
                if (resp.totalElements > 0) {
                    var entity = resp.content[0];
                    console.log("成功获取铺货ASIN");
                    result = entity.asinList;
                } else {
                    alert("未查询到该店铺下的铺货asin");
                }
                ret(result);
            }
        });
    });
}

//获取店名
function getShopName() {
    return new Promise(res => {
        let a = setInterval(() => {
            if (document.querySelector("#partner-switcher > button > span > b") != null) {
                res(document.querySelector("#partner-switcher > button > span > b").innerText.trim());
                clearInterval(a);
            }
        }, 500);
    })
}


function modifyPageContent() {
    var trList = $("table.a-bordered.a-horizontal-stripes.mt-table tbody")[0].children;
    for (let i = 1; i < trList.length; i++) {   //跳过第一条tr（表头）
        var id = trList[i].id;   //获取该行id
        var asin_str = $("#" + id + "-title-asin > div > span")[0].innerText;    //获取asin
        if (ignoreList.indexOf(asin_str) == -1) {
            var el = $("#" + id + "-quantity-quantity > div > span > input")[0];
            var lastValue = el.value;
            el.value = 0;
            let event = new Event("keyup", { bubbles: true });
            event.simulated = true;
            let tracker = el._valueTracker;
            if (tracker) {
                tracker.setValue(lastValue);
            }
            el.dispatchEvent(event);
        }
    }
    document.querySelector("#a-autoid-3-announce").click();
}

function scheduleContentModification() {
    const startTime = GM_getValue('contentModifier_startTime', '07:00');
    const startTimeParts = startTime.split(':');
    const startHour = parseInt(startTimeParts[0]);
    const startMinute = parseInt(startTimeParts[1]);

    const now = new Date();
    let contentModificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0, 0);

    if (now > contentModificationTime) {
        contentModificationTime.setDate(contentModificationTime.getDate() + 1);
    }

    const timeToStart = contentModificationTime - now;
    timer = setTimeout(modifyPageContent, timeToStart);
}

function setupUI() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div id="contentModifierCollapsedUI" style="position: fixed; z-index: 9999; bottom: 10px; right: 10px; background-color: white; padding: 5px 10px; border: 1px solid black; font-family: sans-serif; cursor: pointer; display: none;">
            Content Modifier
        </div>
        <div id="contentModifierExpandedUI" style="position: fixed; z-index: 9999; bottom: 10px; right: 10px; background-color: white; padding: 10px; border: 1px solid black; font-family: sans-serif;">
            <h4>Content Modifier</h4>
            <label for="startTime">Start time (HH:mm):</label>
            <input type="time" id="startTime" value="${GM_getValue('contentModifier_startTime', '12:00')}" />
            <button id="saveStartTime">Save</button>
            <button id="terminateTimer">Stop Timer</button>
        </div>
    `;
    document.body.appendChild(div);

    const expandedUI = div.querySelector('#contentModifierExpandedUI');
    const collapsedUI = div.querySelector('#contentModifierCollapsedUI');
    collapsedUI.style.display = 'block';
    expandedUI.style.display = 'none';

    collapsedUI.onclick = () => {
        collapsedUI.style.display = 'none';
        expandedUI.style.display = 'block';
    };

    const saveButton = div.querySelector('#saveStartTime');
    saveButton.onclick = () => {
        const startTime = div.querySelector('#startTime').value;
        GM_setValue('contentModifier_startTime', startTime);
        location.reload(); // Reload the page to apply the updated start time
    };

    const terminateButton = div.querySelector('#terminateTimer');
    terminateButton.onclick = () => {
        clearTimeout(timer);
        alert('Content modification timer stopped.');
    };
}

(function () {
    'use strict';
    scheduleContentModification(); // Schedule the content modification
    setupUI(); // Setup the UI for customization and termination
})();

