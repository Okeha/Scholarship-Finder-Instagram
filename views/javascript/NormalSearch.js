function getData() {
  fetch("http://localhost:3200/normalSearch")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    });
}

getData();
