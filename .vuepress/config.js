//md文件自动生成头部注释
// var fs = require("fs");
// var path = require("path");

// function readFileList(dir, filesList = []) {
//   const files = fs.readdirSync(dir);
//   files.forEach((item, index) => {
//     var fullPath = path.join(dir, item);
//     const stat = fs.statSync(fullPath);
//     if (stat.isDirectory()) {
//       readFileList(path.join(dir, item), filesList); //递归读取文件
//     } else {
//       console.log(dir);
//       // filesList.push(dir);
//       const text = fs.readFileSync(path.join(dir, item), "utf-8");
//       if (!text.startsWith("---")) {
//         // console.log(text);
//         const newText = `
//           ---
//           title: 测试
//           date: ${new Date()}
//           tags:
//           - tag1
//           categories:
//           - js
//           ---
//         `;
//         // fs.writeFileSync(path.join(dir, item), newText + text);
//       }
//     }
//   });
//   // return filesList;
// }

// var filesList = [];
// readFileList(path.join(__dirname, "../blogs"), filesList);

module.exports = {
  title: "lijun's blog",
  description: "A simple and beautiful vuepress blog theme .",
  dest: "public",
  base: "/lijun.github.io/", //github地址
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ],
  ],
  theme: "reco",
  themeConfig: {
    nav: [
      { text: "Home", link: "/", icon: "reco-home" },
      { text: "TimeScreening", link: "/timeline/", icon: "reco-date" },
      {
        text: "Blog",
        items: [
          { text: "vue", link: "/blogs/vue/" },
          { text: "js", link: "/blogs/js/" },
          { text: "thirdPartyPlugin ", link: "/blogs/third_party/" },
          { text: "python", link: "/blogs/python/" },
          { text: "css", link: "/blogs/css/" },
          { text: "git", link: "/blogs/git/" },
          { text: "miniProgram", link: "/blogs/miniProgram/" },
        ],
      },
      {
        text: "Document",
        icon: "reco-message",
        items: [
          { text: "个人文档", link: "/docs/theme-reco/" },
          { text: "shareWork", link: "/blogs/share-work/" },
        ],
      },
      {
        text: "GitHub",
        icon: "reco-message",
        items: [
          {
            text: "GitHub",
            link: "https://github.com/lijun-qiu/myblog",
            icon: "reco-github",
          },
        ],
      },
    ],
    sidebar: {
      "/docs/theme-reco/": ["", "blogbuild", "copy"],
      "/blogs/css/": ["", "图片渐隐消失之术", "3D卡片反光闪烁动效","自定义导航栏"],
      "/blogs/git/": ["", "github连接超时问题",'git命令'],
      "/blogs/js/": [
        {
          title: "功能",
          collapsable: true,
          children: [
            ["/blogs/js/功能/js发布与订阅.md", "js发布与订阅"],
            ["/blogs/js/功能/封装storage.md", "封装storage"],
            ["/blogs/js/功能/展开收起效果.md", "css展开收起"],
            ["/blogs/js/功能/文字向上轮播.md", "文字向上轮播"],
            ["/blogs/js/功能/轮播图.md", "轮播图"],
            ["/blogs/js/功能/悬浮隐藏加拖动.md", "悬浮隐藏加拖动"],
          ],
        },
        {
          title: "优化",
          collapsable: true,
          children: [
            ["/blogs/js/优化/图片懒加载.md", "图片懒加载"],
            [
              "/blogs/js/优化/图片懒加载之IntersectionObserver.md",
              "图片懒加载之IntersectionObserver",
            ],
            ["/blogs/js/优化/字体自适应一行展示.md", "字体自适应一行展示"],
            ["/blogs/js/优化/任务切片.md", "任务切片"],
          ],
        },
        {
          title: "数组",
          collapsable: true,
          children: [
            ["/blogs/js/数组/js数组常用方法实现.md", "js数组常用方法实现"],
          ],
        },
        {
          title: "第三方插件",
          collapsable: true,
          children: [["/blogs/js/第三方插件/d3js使用demo.md", "d3js使用demo"]],
        },
      ],
      "/blogs/miniProgram/":['uniapp签名实现','小程序'],
      "/blogs/vue/": ["Vue开发技巧", "tree组件自身递归调用"],
      "/blogs/third_party/": ["", "高德地图库使用demo"],
      "/blogs/python/": ["python将图片生成视频"],
      "/blogs/share-work/": [
        {
          title: "1",
          collapsable: true,
          children: [
            [
              "/blogs/share-work/1/Chrome_DevTools分享.md",
              "Chrome_DevTools分享.md",
            ],
          ],
        },
        {
          title: "2",
          collapsable: true,
          children: [
            ["/blogs/share-work/2/js分支优化分享.md", "js分支优化分享.md"],
          ],
        },
        {
          title: "3",
          collapsable: true,
          children: [
            ["/blogs/share-work/3/will-change分享.md", "will-change分享.md"],
            [
              "/blogs/share-work/3/vue中动态引入图片require.md",
              "vue中动态引入图片require.md",
            ],
            ["/blogs/share-work/3/问题.md", "问题.md"],
          ],
        },
        {
          title: "4",
          collapsable: true,
          children: [
            ["/blogs/share-work/4/share-work.md", "share-work.md"],
            [
              "/blogs/share-work/4/postMessage替换setTimeout.md",
              "postMessage替换setTimeout.md",
            ],
          ],
        },
        {
          title: "5",
          collapsable: true,
          children: [
            ["/blogs/share-work/5/分享.md", "分享.md"],
          ],
        },
      ],
    },
    type: "blog",
    // 博客设置
    blogConfig: {
      tag: {
        location: 3, // 在导航栏菜单中所占的位置，默认3
        text: "Label", // 默认 “标签”
      },
    },
    friendLink: [
      // {
      //   title: "午后南杂",
      //   desc: "Enjoy when you can, and endure when you must.",
      //   email: "1156743527@qq.com",
      //   link: "https://www.recoluan.com",
      // },
      // {
      //   title: "vuepress-theme-reco",
      //   desc: "A simple and beautiful vuepress Blog & Doc theme.",
      //   avatar:
      //     "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
      //   link: "https://vuepress-theme-reco.recoluan.com",
      // },
    ],
    logo: "/logo.png",
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    // 自动形成侧边导航
    // sidebar: 'auto',
    // 最后更新时间
    lastUpdated: "Last Updated",
    // 作者
    author: "lijun",
    // 作者头像
    authorAvatar: "/avatar.png",
    // 备案号
    record: "xxxx",
    // 项目开始时间
    startYear: "2023",
    /**
     * 密钥 (if your blog is private)
     */

    // keyPage: {
    //   keys: ['your password'],
    //   color: '#42b983',
    //   lineColor: '#42b983'
    // },

    /**
     * valine 设置 (if you need valine comment )
     */

    // valineConfig: {
    //   appId: '...',// your appId
    //   appKey: '...', // your appKey
    // }
    mdEnhance: {
      demo: true, //展示代码效果
    },
  },
  // 监听文件变化并重新构建
  extraWatchFiles: [".vuepress/config.js", "../blogs/*.md"],
  markdown: {
    lineNumbers: true,
  },
  head: [
    ['script', { src: 'https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js' }],
  ],
  plugins: [
    [
      "vuepress-plugin-code-copy",
      {
        align: "top",
        color: "#27b1ff",
        backgroundTransition: true,
        backgroundColor: "#0075b8",
        successText: "复制成功",
      },
    ],
    "demo-block"
  ],
};
