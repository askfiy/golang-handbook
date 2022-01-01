var gitalk = new Gitalk({
  clientID: "5a91d7542359689ea77e",
  clientSecret: "eb389e4bd3b49ab48f5e542284ff0a06ec91fcd7",
  repo: "golang-handbook",
  owner: "askfiy",
  admin: ["askfiy"],
  id: location.pathname, // Ensure uniqueness and length less than 50
  distractionFreeMode: false, // Facebook-like distraction free mode
});

gitalk.render("gitalk-container");
