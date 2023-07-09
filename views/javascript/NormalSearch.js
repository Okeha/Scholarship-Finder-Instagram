// function getData() {
//   fetch("https://scholarshipfinderapi.herokuapp.com/")
//     .then((res) => {
//       return res.json();
//     })
//     .then((data) => {
//       //   console.log(data);
//       var data = data.media.data;
//       console.log(data);
//       var output = ``;
//       //   var arr = data.map(myFunction);
//       //   function myFunction() {}
//       var search_results = `${data[0].length} Search Results`;
//       data.forEach((result) => {
//         output += ` <a href="${result.link}">
//         <p style ="margin-top:50px;">
//             Follow Up this Scholarship Opportunity.
//         </p>
//       </a>
//       <h6>${result.caption}</h6>`;
//       });
//       document.getElementById("searchResults").innerHTML = search_results;
//       document.getElementById("results").innerHTML = output;
//     });
// }

// getData();

function getDataPro() {
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "6969c4e11emshfc28cc66a2370aep1d08ffjsna9873f04f367",
      "X-RapidAPI-Host": "twitter135.p.rapidapi.com",
    },
  };

  fetch(
    "https://twitter135.p.rapidapi.com/Search/?q=internationalscholarships&count=20",
    options
  )
    .then((response) => response.json())
    .then((response) => {
      // console.log(response);
      var output = ``;
      //   var arr = data.map(myFunction);
      //   function myFunction() {}
      var search_results = `${response.globalObjects.tweets.length} Search Results`;
      console.log(search_results);
      var tweets = response.globalObjects.tweets;
      console.log(tweets);
      var output = ``;
      for (let result in tweets) {
        console.log(result);
        output += `<a href="https://twitter.com/${tweets[result].id_str}/status/${tweets[result].id_str}">
        <p style ="margin-top:50px;">
            Follow Up this Scholarship Opportunity.
        </p>
      </a>
      <h6>${tweets[result].full_text}</h6>`;
      }

      console.log(output);
      //       var length = tweets.length;
      //       console.log(tweets.length);
      //       var data;
      document.getElementById("searchResults").innerHTML = search_results;
      document.getElementById("results").innerHTML = output;
    })
    .catch((err) => console.error(err));
}

getDataPro();
