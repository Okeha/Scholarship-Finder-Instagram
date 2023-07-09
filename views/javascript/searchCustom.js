const search = document.getElementById("search_form");

search.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = document.getElementById("search").value;
  var parameter = value;

  console.log(parameter);

  function getDataPro() {
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "6969c4e11emshfc28cc66a2370aep1d08ffjsna9873f04f367",
        "X-RapidAPI-Host": "twitter135.p.rapidapi.com",
      },
    };

    fetch(
      `https://twitter135.p.rapidapi.com/Search/?q=${parameter}&count=20`,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        // console.log(response);
        var output = ``;
        //   var arr = data.map(myFunction);
        //   function myFunction() {}
        var search_results = `${response.globalObjects.tweets.length} Search Results`;
        var length = response.globalObjects.tweets.length;
        console.log(search_results);
        var tweets = response.globalObjects.tweets;
        console.log(tweets);
        var output = ``;
        var data = [];
        for (let result in tweets) {
          console.log(result);
          data.push({
            length: length,
            link: `https://twitter.com/${tweets[result].id_str}/status/${tweets[result].id_str}`,
            caption: `${tweets[result].full_text}`,
          });
        }
        console.log(data);
        console.log(output);
        localStorage.setItem("searchResults", `${JSON.stringify(data)}`);
        location.href = "../html/results.html";
      })
      .catch((err) => console.error(err));
  }

  getDataPro();
});
