window.$docsify = {
  name: "Golang 学习手册",
  repo: "https://github.com/askfiy/golang-handbook.git",
  loadSidebar: true,
  alias: {
    "/.*/_sidebar.md": "/_sidebar.md",
  },
  subMaxLevel: 6,
  coverpage: true,
  // onlyCover: true,
  // 全文搜索
  search: {
    paths: "auto",
    // 缓存配置时间
    maxAge: 100,
    placeholder: {
      "/zh-cn/": "搜索",
      "/": "Type to search",
    },
    noData: {
      "/zh-cn/": "暂无结果",
      "/": "No Results!",
    },
    depth: 6,
  },
  // 计数统计
  count: {
    countable: true,
    fontsize: "0.9em",
    color: "rgb(90,90,90)",
    language: "chinese",
  },
  // 阅读进度
  progress: {
    position: "top",
    color: "var(--theme-color,#42b983)",
    height: "3px",
  },
  // 上下章节
  pagination: {
    previousText: "上一章节",
    nextText: "下一章节",
    crossChapter: true,
    crossChapterText: true,
  },
  // 自定义插件
  plugins: [
    function (hook, vm) {
      hook.beforeEach(function (content) {
        // 内容中如果有多个h1，那么左侧菜单栏中不会显示第一个h1
        // 这里会在第一个h1前面加上一个空的h1
        let reg = /^# /m;
        content = content.replace(reg, "# \n # ");
        return content;
      });
      hook.afterEach(function (html, next) {
        // 对于文章排版而言，用h2代替h1进行会更加漂亮
        // 所以这里会将 h1 - 5 整体向下降一个等级
        let reg = /<h([\d^6])(.*?)>/gm;
        html = html.replace(reg, function (_, level, attribute) {
          return `<h${parseInt(level) + 1}${attribute}>`;
        });
        next(html);
      });
    },
  ],
};
