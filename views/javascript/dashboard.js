// const generate = document.getElementById("generate");

function getData() {
  fetch("https://scholarshipfinderapi.herokuapp.com/getQuotes")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      var quote = data.data.quote;
      var author = data.data.author;

      console.log(data.data.quote);
      console.log(data.data.author);
      document.getElementById("quote").innerHTML = `${quote}`;
      document.getElementById("author").innerHTML = `-${author}`;
    });
}
getData();

var name = localStorage.getItem("first_name");
document.getElementById("output").innerHTML = `Welcome ${name}`;
