var results = localStorage.getItem("searchResults");

var searchResults = JSON.parse(results);

// console.log(searchResults);

var data = searchResults;
console.log(searchResults);
var output = ``;
//   var arr = data.map(myFunction);
//   function myFunction() {}
var search_results = `${data[0].length} Search Results`;
data.forEach((result) => {
  output += ` <a href="${result.link}">
  <p style ="margin-top:50px;">
      Follow Up this Scholarship Opportunity.
  </p>
</a>
<h6>${result.caption}</h6>`;
});
document.getElementById("searchResults").innerHTML = search_results;
document.getElementById("results").innerHTML = output;
