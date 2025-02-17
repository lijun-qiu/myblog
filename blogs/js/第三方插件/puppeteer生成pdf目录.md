---
title: puppeteer生成pdf目录
date: 2024-01-26
tags:
  - puppeteer
categories:
  - puppeteer
---

# 使用 puppeteer 生成 pdf 目录
需要对一个网页报告生成pdf，使用puppeteer生成pdf目录
1.引入
```js
const puppeteer = require('puppeteer');
const path = require('path');
```

2.初始配置
```js
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']}); // 启动浏览器
    const page = await browser.newPage(); 

    const reactAppUrl = 'https://shuidi.cn/kcpdf?digest=5cef0e5e39cd7eecd1aa6bec77b0a915'; // 你的 React 应用的 URL
    const outputPath = path.join(__dirname, 'output.pdf'); // 输出 PDF 的路径   
    const scale = 1123 / 1755;  // 缩放比例

    await page.goto(reactAppUrl, {waitUntil: ['load', 'networkidle0'], 'timeout': 1000 * 60}); // 加载页面, 等待网络数据加载完成
```

3.pdfOptions配置
```js
	format: 'A4',
	scale,
	printBackground: true, // 是否打印背景
	margin: {
		top: 140 * scale,
		right: 20 * scale,
		bottom: 140 * scale,
		left: 20 * scale,
	},
	displayHeaderFooter: true, // 显示页眉和页脚。默认是不显示
    // 页脚模板，推荐使用base64图片
	footerTemplate: `<div style="width:100%; text-align: center;display: flex; justify-content: center; color: #666666; font-size:12px;">
      <div class="pageNumber" style="font-family: PingFangSC-Semibold; font-weight: bold; color: #BFBFBF;text-align: center; margin-bottom:30px;"></div>
    </div>`,
    // 页眉模板，推荐使用base64图片
	headerTemplate: `<div style="box-sizing: border-box; width: 658px; height:39px;display: flex; justify-content: center;margin-left:70px;align-items: center;text-align: center;margin-top:20px;">
    <img style="box-sizing: border-box;width:100%;height:100%;margin: 0 auto" src="data:image/png;base64,......" alt="">`,
```
4.生成目录，添加锚链接
```js
    // 目录
    const toc = [];
    const titles = await page.$$('.titleone,.titletwo'); //标题选择器
    for (let i = 0; i < titles.length; i++) {
        const title = titles[i];
        const text = await page.evaluate(el => el.textContent, title);
        const id = `toc-${i}`;
        await page.evaluate((el, id) => el.setAttribute('id', id), title, id);
        toc.push({text, id});
    }

    // 计算准确的页码
    const pageNumbers = await calculatePageNumbers(page, toc, pdfOptions);

    // 插入目录
    await page.evaluate(function (toc, pageNumbers) {
        const styleStr = `
            .dirEl{
                break-after: page; //强制换行
            }
            .pageTitleDiv{
                font-size: 63px;
                font-weight: bold;
                font-stretch: normal;
                line-height: 64px;
                letter-spacing: 0px;
                color: #327bf9;
                text-align: center;  
            }
            .dirItemWrapper{
                display: flex;
                justify-content: space-around;
                align-items: center;
                padding: 0 82px 0 92px;
            }
            .dirItemWrapper a{
                text-decoration: none;
                color: #222222; 
                font-size: 28px;
                font-weight: bold;
                line-height: 50px;
            }
            .dirItemWrapper__sepratorDiv{
                margin: 0 4px;
                border-bottom: 4px dotted #666;
                flex-grow: 1;
            }
        `;
        
        const styleEl = document.createElement('style');
        styleEl.appendChild(document.createTextNode(styleStr));

        const pageTitleDiv = document.createElement('h1');
        pageTitleDiv.appendChild(document.createTextNode('目录'));
        pageTitleDiv.classList.add('pageTitleDiv');

        const fragement = document.createDocumentFragment();
        
        toc.forEach(({text, id}, index) => {
            const dirItemWrapper = document.createElement('div');
            dirItemWrapper.classList.add('dirItemWrapper');

            const titleA = document.createElement('a');
            titleA.appendChild(document.createTextNode(text));
            titleA.setAttribute('href', `#${id}`);

            const sepratorDiv = document.createElement('div');
            sepratorDiv.classList.add('dirItemWrapper__sepratorDiv');

            const pageNumSpan = document.createElement('span');
            pageNumSpan.appendChild(document.createTextNode(pageNumbers[index] + 1));

            dirItemWrapper.appendChild(titleA);
            dirItemWrapper.appendChild(sepratorDiv);
            dirItemWrapper.appendChild(pageNumSpan);

            fragement.appendChild(dirItemWrapper);
        });

        const dirEl = document.createElement('div');
        dirEl.classList.add('dirEl');
        dirEl.appendChild(styleEl);
        dirEl.appendChild(pageTitleDiv);
        dirEl.appendChild(fragement);

        document.body.insertBefore(dirEl, document.body.firstChild);
    }, toc, pageNumbers);

    const pdfPath = path.resolve(__dirname, 'output.pdf');
    await page.pdf({path: pdfPath, ...pdfOptions});

    console.log(`PDF generated at ${pdfPath}`);
    await browser.close();
})();

async function calculatePageNumbers(page, toc, pdfOptions) {
    // 获取每个标题元素的位置
    const positions = await page.evaluate((toc) => {
        return toc.map(({id}) => {
            const element = document.getElementById(id);
            const {top} = element.getBoundingClientRect();
            return top;
        });
    }, toc);

    // 计算每页的高度（考虑缩放和边距）
    const pageHeight = (1755 - (pdfOptions.margin.top + pdfOptions.margin.bottom) / pdfOptions.scale);
    
    // 计算页码
    const pageNumbers = positions.map((top, index) => {
        const pageNum = Math.floor(top / pageHeight); // 计算页码
        return index === 0 ? null : Math.max(pageNum + 1, 0); // 目录页码设为null，其他页码加1
    });

    return pageNumbers;
}
```
总结：目前的基本配置是这些，后期的一些优化，后续再补充。