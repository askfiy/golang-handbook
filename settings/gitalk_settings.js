var gitalk = new Gitalk({
  clientID: "1b09b883decb1685c577",
  clientSecret: "9b02e2bf236abc4ee60aa376ad6d4a5be465bf81",
  repo: "golang-handbook",
  owner: "askfiy",
  admin: ["askfiy"],
  id: location.pathname, // Ensure uniqueness and length less than 50
  distractionFreeMode: false, // Facebook-like distraction free mode
});

gitalk.render("gitalk-container");
