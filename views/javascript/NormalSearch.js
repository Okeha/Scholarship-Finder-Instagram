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
  const url = `https://twitter241.p.rapidapi.com/search?query=scholarships%20for%20international%20students&count=20&type=Latest`;
  console.log(url);
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "6969c4e11emshfc28cc66a2370aep1d08ffjsna9873f04f367",
      "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
    },
  };

  var searchData = [];
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
        location.href = "../../html/results.html";
      } else {
        console.log("No instructions found in the response data.");
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

getDataPro();
