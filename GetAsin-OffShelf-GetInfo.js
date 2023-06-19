// ==UserScript==
// @name         获取Asin&一键下架&获取当前发货人
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://sellercentral.amazon.co.uk/inventory*
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      *
// @require      http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

//防止与原页面的jquery冲突
this.$ = this.jQuery = jQuery.noConflict(true);
(function () {
    'use strict';


    $("body").append('<div id="dg" style="z-index: 99999999; position: fixed ! important; right: 0px; top: 0px;"><table width=""100% style="position: absolute; width:260px; right: 0px; top: 0px;"><button type="button" id="downloadAllImgBtn">获取当前页面ASIN</button><button type="button" id="setBtn">一键设0库存</button><button type="button" id="getFB">获取信息</button></table></div>');
    $("#downloadAllImgBtn").click(function () {
        var arr = $("div[data-column='asin'] > div > span");
        var asinList = ""
        for (let i = 0; i < arr.length; i++) {
            asinList += arr[i].innerText + ",";
        }
        asinList = asinList.substring(0, asinList.length - 1);
        console.log("共" + arr.length + "个ASIN")
        GM_setClipboard(asinList)
    })

    var ignoreList = "B0BZLMH8SV,B0BZLN6TTT,B0BZLJLBRK,B0BZLMJHQJ,B0BZLD2FJF,B0BZLFSMNG,B0BZL8ZZPW,B0BZL8P1J6,B0BZDS2D2M,B0BZDV8N2Q,B0BZDSV55R,B0BZDRKB1V,B0BZDRCFKW,B0BZ8J8SSV,B0BZ8K8J89,B0BZ8DX49C,B0BZ86RQZM,B0BZ7NMK4K,B0BZ7KPXNX,B0BYT5TQKT,B0BYT5QSKH,B0BYT5M8BJ,B0BYT1277H,B0BYK3FZGG,B0BYK17BBM,B0BYJZ8C1P,B0BYJVRPK4,B08MVBXYL6".split(",");    //铺货list


    $("#setBtn").click(function () {
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
    });

    //获取信息（含品牌）较慢
    $("#getFB").click(async function () {
        var isBrand = false;
        if(confirm("是否需要获取品牌？（获取品牌时间较久）")){
            isBrand = true;
        }
        var trList = $("table.a-bordered.a-horizontal-stripes.mt-table tbody")[0].children;
        for (let i = 1; i < trList.length; i++) {   //跳过第一条tr（表头）
            var id = trList[i].id;   //获取该行id
            var asin_str = $("#" + id + "-title-asin > div > span")[0].innerText;    //获取asin
            if (ignoreList.indexOf(asin_str) == -1) {
                let df = "";
                if(isBrand){
                    df = await getDispatchFrom(asin_str);
                }else{
                    df = await getDispatchFromNoBrand(asin_str);
                }
                var arr = df.split("|");
                let disp_from = arr[0];
                if (disp_from.indexOf("Amazon") != -1) {
                    disp_from = "<span style='color:orange'>" + disp_from + "</span>"
                }
                let seller = arr[1];
                let seller_count = arr[2];
                let cart_price = arr[3];
                let delivery_time = arr[4];
                let final_str = "";
                if(isBrand){
                    let brand = arr[5];
                    final_str = "<br><hr style='margin:0 auto'>" + "发货：" + disp_from + " [" + seller_count + "]<br>"
                    + "卖家：" + seller + "<br>"
                    + "品牌：" + brand + "<br>"
                    + "购物车价格：" + cart_price + "<br>"
                    + "预计送达时间：" + delivery_time + "<br><br>";
                }else{
                    final_str = "<br><hr style='margin:0 auto'>" + "发货：" + disp_from + " [" + seller_count + "]<br>"
                    + "卖家：" + seller + "<br>"
                    + "购物车价格：" + cart_price + "<br>"
                    + "预计送达时间：" + delivery_time + "<br><br>";
                }
                $("#" + id + "-title-asin > div").append(final_str);
            }
        }
    })

    function getDispatchFrom(asin) {
        return new Promise(res => {
            GM_xmlhttpRequest({
                method: "GET",
                url: 'https://www.amazon.co.uk/dp/' + asin + '/ref=olp-opf-redir?aod=1&ie=UTF8&condition=NEW',
                //url: 'https://www.amazon.co.uk/gp/product/ajax/ref=auto_load_aod?asin=' + asin + '&pc=dp&experienceId=aodAjaxMain',
                data: '',
                onload: function (resp) {
                    //console.log(resp);
                    var parser = new DOMParser();
                    var page = parser.parseFromString(resp.responseText, "text/html");
                    //发货
                    var dispatch_from = "";
                    try {
                        dispatch_from = page.querySelector("#tabular-buybox > div.tabular-buybox-container > div:nth-child(4) > div > span").innerText.trim();
                    } catch (error) {
                        dispatch_from = "未查询到发货方式";
                    }
                    
                    //当前卖家
                    var seller = "";
                    try {
                        seller = page.querySelector("#sellerProfileTriggerId").outerHTML;
                    } catch (error) {
                        seller = "未查询到卖家";
                    }
                    
                    //购物车价格
                    let cart_price = "";
                    try {
                        cart_price = page.querySelector("#twister-plus-price-data-price-unit").value + page.querySelector("#twister-plus-price-data-price").value;    
                    } catch (error) {
                        cart_price = "未查询到购物车价格";
                    }
                    
                    //预计送达时间
                    let delivery_time = "";
                    try {
                        delivery_time = page.querySelector("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE > span > span").innerText;
                    } catch (error) {
                        delivery_time = "未查询到预计送达时间";
                    }
                    
                    //品牌
                    let brand = "";
                    try {
                        brand = page.querySelector("#bylineInfo").innerText.trim();
                        if (brand.indexOf('Visit the ') != -1) {
                            brand = brand.replace('Visit the', '');
                            brand = brand.replace(' Store', '');
                        } else {
                            brand = brand.split(':')[1].trim();
                        }
                    } catch (error) {
                        brand = "未查询到品牌";
                    }

                    //获取跟卖数量
                    let seller_count = 0;
                    try {
                        var seller_str = page.querySelector("#olpLinkWidget_feature_div > div.a-section.olp-link-widget > span > a > div > div > span:nth-child(1)").innerText;
                        seller_count = seller_str.slice(seller_str.indexOf("(")+1, seller_str.indexOf(")"));
                    } catch (error) {
                        seller_count = 0;
                    }

                    var final_res = dispatch_from + "|" + seller + "|" + seller_count + "|" + cart_price + "|" + delivery_time + "|" + brand;
                    res(final_res);

                }
            });
        })
    }

    function getDispatchFromNoBrand(asin) {
        return new Promise(res => {
            GM_xmlhttpRequest({
                method: "GET",
                url: 'https://www.amazon.co.uk/gp/product/ajax/ref=auto_load_aod?asin=' + asin + '&pc=dp&experienceId=aodAjaxMain',
                data: '',
                onload: function (resp) {
                    //console.log(resp);
                    var parser = new DOMParser();
                    var page = parser.parseFromString(resp.responseText, "text/html");
                    //发货
                    var dispatch_from = "";
                    try {
                        dispatch_from = page.querySelector("#aod-offer-shipsFrom > div > div > div.a-fixed-left-grid-col.a-col-right > span").innerText.trim();
                    } catch (error) {
                        dispatch_from = "未查询到发货方式";
                    }
                    
                    //当前卖家
                    var seller = "";
                    try {
                        seller = page.querySelector("#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right > a").outerHTML;
                    } catch (error) {
                        seller = "未查询到卖家";
                    }
                    
                    //购物车价格
                    let cart_price = "";
                    try {
                        cart_price = page.querySelector("#aod-price-0 > div > span > span.a-offscreen").innerText;    
                    } catch (error) {
                        cart_price = "未查询到购物车价格";
                    }
                    
                    //预计送达时间
                    let delivery_time = "";
                    try {
                        delivery_time = page.querySelector("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE > span > span").innerText;
                    } catch (error) {
                        delivery_time = "未查询到预计送达时间";
                    }

                    //获取跟卖数量
                    let seller_count = 0;
                    try {
                        var seller_str = page.querySelector("#aod-filter-offer-count-string").innerText.trim();
                        if(!isNaN(seller_str.charAt(0))){   //如果第一位是数字
                            seller_count = seller_str.split(' ')[0];
                        }else{
                            seller_count = 0;
                        }
                    } catch (error) {
                        seller_count = 0;
                    }

                    var final_res = dispatch_from + "|" + seller + "|" + seller_count + "|" + cart_price + "|" + delivery_time;
                    res(final_res);

                }
            });
        })
    }
})();