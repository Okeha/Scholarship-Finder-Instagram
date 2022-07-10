const search = document.getElementById("search_form");

search.addEventListener("submit", (e) => {
  e.preventDefault();
  var parameter = search.search.value;
  console.log(parameter);
  fetch("https://scholarshipfinderapi.herokuapp.com/getByTag", {
    method: "POST",
    body: JSON.stringify({
      parameter: `${parameter}`,
    }),
    headers: {
      "Content-Type": "application/json; charset = UTF-8",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      localStorage.setItem("searchResults", `${JSON.stringify(data)}`);
      location.href = "../html/results.html";
    });
});
