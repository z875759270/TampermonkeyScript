// ==UserScript==
// @name         推荐信息获取
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.amazon.co.uk/dp/*
// @match        https://www.amazon.co.uk/*/dp/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function () {
    'use strict';

    //加载js
    let script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.12.0/toastify.min.js";
    document.documentElement.appendChild(script);
    //加载css
    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.12.0/toastify.min.css";
    document.documentElement.appendChild(link);

    const div = document.createElement('div');
    div.innerHTML = '<div id="dg" style="z-index: 99999999; position: fixed ! important; right: 0px; top: 20px;">' +
        '<table width=""100% style="position: absolute; width:260px; right: 0px; top: 0px;">' +
        '<button type="button" id="getRecommendInfo">推荐信息获取</button>' +
        '</table></div>';
    document.body.appendChild(div);

    document.querySelector("#getRecommendInfo").onclick = async () => {
        var li_list = document.querySelector(".a-carousel").children;
        for (let i = 0; i < li_list.length; i++) {
            const el = li_list[i];
            var url = el.querySelector("a").getAttribute("href");
            var asin = url.split("/dp/")[1].slice(0, 10);
            var productDetails = await getProductDetails(asin);
            //品牌查询
            var search_res = await searchTrademarkUK(productDetails.brand);
            console.log('UK Trademarks for brand:', productDetails.brand, search_res);
            //产品描述
            var el_product_details = productDetails.dom;

            el_product_details.id = 'productDetails_' + asin; // 为el_product_details元素添加唯一ID
            search_res.id = 'search_' + asin;

            (function (el, el_product_details,search_res) {
                el.onmouseover = function () {
                    showProductDetails(el_product_details.id);
                    showBrandSearch(search_res.id);
                };

                el.onmouseout = function () {
                    hideProductDetails(el_product_details.id);
                    hideBrandSearch(search_res.id);
                };
            })(el, el_product_details,search_res);

            // 将el_product_details添加到页面并隐藏
            // const bodyContents = Array.from(search_res.body.childNodes);
            // bodyContents.forEach(node => {
            //     el_product_details.appendChild(node.cloneNode(true));
            // });
            document.body.appendChild(search_res);
            document.body.appendChild(el_product_details);
            el_product_details.style.display = "none";
        }
        toast("推荐信息加载成功！", "success");
    }


    //获取Product details       #detailBulletsWrapper_feature_div   #prodDetails
    function getProductDetails(asin) {
        return new Promise(res => {
            GM_xmlhttpRequest({
                method: "GET",
                url: 'https://www.amazon.co.uk/dp/' + asin,
                data: '',
                onload: function (resp) {
                    var parser = new DOMParser();
                    var page = parser.parseFromString(resp.responseText, "text/html");

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

                    //产品描述
                    let dom;
                    if (page.querySelector("#prodDetails")) {
                        dom = page.querySelector("#prodDetails");
                    } else if (page.querySelector("#detailBulletsWrapper_feature_div")) {
                        dom = page.querySelector("#detailBulletsWrapper_feature_div");
                    }

                    var final_res = {
                        dom: dom,
                        brand: brand
                    }
                    res(final_res);
                }
            });
        })
    }

    function showProductDetails(detailsId) {
        const el_product_details = document.getElementById(detailsId);
        el_product_details.style.position = 'fixed';
        el_product_details.style.zIndex = '10000';
        el_product_details.style.display = 'block';
        el_product_details.style.right = '20px';
        el_product_details.style.bottom = '20px';
        el_product_details.style.border = "2px solid #000";
        el_product_details.style.backgroundColor = "#fff";
        el_product_details.style.borderRadius = '5px';
        el_product_details.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';


    }

    function hideProductDetails(detailsId) {
        const el_product_details = document.getElementById(detailsId);
        el_product_details.style.display = 'none';
    }

    function showBrandSearch(id) {
        const search = document.getElementById(id);
        search.style.position = 'fixed';
        search.style.zIndex = '10000';
        search.style.display = 'block';
        search.style.left = '20px';
        search.style.bottom = '20px';
        search.style.border = "2px solid #000";
        search.style.backgroundColor = "#fff";
        search.style.borderRadius = '5px';
        search.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }

    function hideBrandSearch(id) {
        const search = document.getElementById(id);
        search.style.display = 'none';
    }

    function searchTrademarkUK(brandName) {
        return new Promise((resolve, reject) => {
            ;
            // 创建一个新的 FormData 对象
            const formData = new FormData();

            formData.append('csrfToken', '87fd76b2af71c60a4e975dbb6316e2cd1735778c-1695371021339-79da2fde158957cc9febc0e7');
            formData.append('sectionIndex', '0');
            formData.append('searchType', 'WORD');
            formData.append('wordSearchType', 'EXACT');
            formData.append('wordSearchPhrase', brandName);
            formData.append('wordSearchMatchType', 'ALLWORDS');
            formData.append('ViennaClassesCategoriesDropDownOne', '');
            formData.append('ViennaClassesDivisionsDropDownOne', '');
            formData.append('ViennaClassesSectionsDropDownOne', '');
            formData.append('firstOperator', 'NO');
            formData.append('ViennaClassesCategoriesDropDownTwo', '');
            formData.append('ViennaClassesDivisionsDropDownTwo', '');
            formData.append('ViennaClassesSectionsDropDownTwo', '');
            formData.append('secondOperator', 'NO');
            formData.append('ViennaClassesCategoriesDropDownThree', '');
            formData.append('ViennaClassesDivisionsDropDownThree', '');
            formData.append('ViennaClassesSectionsDropDownThree', '');
            formData.append('filedFrom.day', '1');
            formData.append('filedFrom.month', '1');
            formData.append('filedFrom', '1876');
            formData.append('filedTo.day', '22');
            formData.append('filedTo.month', '9');
            formData.append('filedTo', '2023');
            formData.append('legalStatus', 'ALLLEGALSTATUSES');
            formData.append('pageSize', '10');

            // 获取 formData 的边界字符串
            const boundary = `----WebKitFormBoundary${Math.random().toString().substr(2, 16)}`;

            // 转换 formData 为字符串
            const formDataAsString = [...formData.entries()]
                .map(entry => {
                    const [key, value] = entry;
                    return `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}`;
                })
                .join('\r\n') + `\r\n--${boundary}--\r\n`;

            GM_xmlhttpRequest({
                method: 'POST',
                url: 'https://trademarks.ipo.gov.uk/ipo-tmtext',
                headers: {
                    // 使用动态生成的边界字符串
                    'content-type': `multipart/form-data; boundary=${boundary}`,
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                    'cache-control': 'max-age=0',
                    'sec-ch-ua': '"Microsoft Edge";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                },
                data: formDataAsString,
                onload: function (response) {
                    if (response.status === 200) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        const body = doc.body;
                        // 选择 header 元素
                        const headerElement = body.querySelector('header');
                        // 如果存在 header 元素，则移除它
                        if (headerElement) {
                            headerElement.remove();
                        }

                        // 选择 footer 元素
                        const footerElement = body.querySelector('footer');
                        // 如果存在 footer 元素，则移除它
                        if (footerElement) {
                            footerElement.remove();
                        }

                        const scaleRatio = 0.5;
                        body.style.transform = `scale(${scaleRatio})`;
                        body.style.transformOrigin = 'bottom left';

                        resolve(body);
                    } else {
                        console.error("Error fetching IPO UK data:", response.statusText);
                        reject(response.statusText);
                    }
                },
            });
        });
    }




    function toast(msg, type, func) {
        let back = "linear-gradient(to right, #00b09b, #96c93d)";
        switch (type) {
            case "success":
                back = "linear-gradient(to right, #00f05a, #00c74b)";
                break;
            case "info":
                back = "linear-gradient(to right, #c7ae00, #00f0d2)";
                break;
            case "warning":
                back = "linear-gradient(to right, #ffdf00, #e8cb00)";
                break;
            case "error":
                back = "linear-gradient(to right, #d3001a, #d30083)";
                break;
            default:
                break;
        }
        Toastify({
            text: msg,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: back,
            },
            onClick: func // Callback after click
        }).showToast();
    }

})();
