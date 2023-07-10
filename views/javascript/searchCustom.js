const search = document.getElementById("search_form");

//     fetch(
//       `https://twitter135.p.rapidapi.com/Search/?q=${parameter}&count=20`,
//       options
//     )
//       .then((response) => response.json())
//       .then((response) => {
//         console.log(response);
//         // console.log(response);

//         var output = ``;
//         //   var arr = data.map(myFunction);
//         //   function myFunction() {}
//         var search_results = `${response.globalObjects.tweets.length} Search Results`;
//         var length = response.globalObjects.tweets.length;
//         console.log(search_results);
//         var tweets = response.globalObjects.tweets;
//         console.log(tweets);
//         var output = ``;
//         var data = [];
//         for (let result in tweets) {
//           console.log(result);
//           data.push({
//             length: length,
//             link: `https://twitter.com/${tweets[result].id_str}/status/${tweets[result].id_str}`,
//             caption: `${tweets[result].full_text}`,
//           });
//         }
//         console.log(data);
//         console.log(output);
//         localStorage.setItem("searchResults", `${JSON.stringify(data)}`);
//         location.href = "../html/results.html";
//       })
//       .catch((err) => console.error(err));
//   }

//   getDataPro();
// });

search.addEventListener("submit", (e) => {
  e.preventDefault();
  var searchText = document.getElementById("search").value;
  searchText = searchText.replace(/ /g, "%20");
  const url = `https://twitter241.p.rapidapi.com/search?query=${searchText}&count=20&type=Latest`;
  console.log(url);
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "6969c4e11emshfc28cc66a2370aep1d08ffjsna9873f04f367",
      "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
    },
  };

  var searchData = [];
  // fetch(url, options)
  //   .then((res) => {
  //     return res.json();
  //   })
  //   .then((data) => {
  //     var entries = data.result.timeline.instructions[0].entries;
  //     // console.log(entries);
  //     var length = entries.length;
  //     // console.log(length);

  //     for (i in entries) {
  //       var id =
  //         entries[i].content.itemContent.tweet_results.result.legacy.id_str;
  //       var text =
  //         entries[i].content.itemContent.tweet_results.result.legacy.full_text;

  //       var body = {
  //         length: `${length}`,
  //         link: `https://twitter.com/${id}/status/${id}`,
  //         caption: `${text}`,
  //       };
  //       console.log(body);
  //       searchData.push(body);
  //     }

  //     console.log(searchData);

  //     localStorage.setItem("searchResults", `${JSON.stringify(searchData)}`);
  //     location.href = "../html/results.html";
  //   });
  fetch(url, options)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data); // Inspect the response data

      var instructions = data.result.timeline.instructions;
      if (instructions && instructions.length > 0) {
        var entries = instructions[0].entries;
        console.log(entries); // Inspect the entries

        var length = entries.length;

        for (i in entries) {
          var content = entries[i].content;
          if (content && content.itemContent) {
            var id = content.itemContent.tweet_results.result.legacy.id_str;
            var text =
              content.itemContent.tweet_results.result.legacy.full_text;

            var body = {
              length: `${length}`,
              link: `https://twitter.com/${id}/status/${id}`,
              caption: `${text}`,
            };
            console.log(body);
            searchData.push(body);
          } else {
            console.log("Missing itemContent for entry:", entries[i]);
          }
        }

        console.log(searchData);

        localStorage.setItem("searchResults", `${JSON.stringify(searchData)}`);
        location.href = "../html/results.html";
      } else {
        console.log("No instructions found in the response data.");
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
});
