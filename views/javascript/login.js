const loginButton = document.getElementById("button");
const login = document.getElementById("login-form");

loginButton.addEventListener("click", (e) => {
  e.preventDefault();

  var email = login.email.value;
  var password = login.password.value;
  fetch("http://localhost:3200/login", {
    method: "POST",
    body: JSON.stringify({
      email: `${email}`,
      password: `${password}`,
    }),
    headers: {
      "Content-Type": "application/json; charset = UTF-8",
    },
  })
    .then((res) => {
      console.log(res);
      if (res.status === 400 && res.statusText === "Bad Request") {
        return "Invalid Details";
      } else if (res.status === 400 && res.statusText === "Not Found") {
        return "Email Not Found";
      } else {
        return res.json();
      }
    })
    .then((data) => {
      if (data === "Invalid Details") {
        alert(
          "Oops Invalid Login Details. Please enter valid Email and Password!"
        );
      } else {
        console.log(data);
        localStorage.setItem("first_name", `${data.first_name}`);
        localStorage.setItem("last_name", `${data.last_name}`);
        localStorage.setItem("email", `${data.email}`);
        location.href = "../template/index.html";
      }
    });
});
