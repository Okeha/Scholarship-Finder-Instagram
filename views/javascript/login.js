const loginButton = document.getElementById("button");
const login = document.getElementById("login-form");

loginButton.addEventListener("click", (e) => {
  e.preventDefault();

  var email = login.email.value;
  var password = login.password.value;
  fetch("https://scholarship-finder-9po5.onrender.com/api/v1/auth/login", {
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
      if (res.status === 422) {
        return "Invalid Details";
      } else {
        return res.json();
      }
    })
    .then((data) => {
      // console.log(data);
      if (data === "Invalid Details") {
        alert("Fill in all sections");
      } else if (!data.successful) {
        alert(`${data.body.message}`);
      } else {
        var token = data.body.token;
        localStorage.setItem("token", token);
        location.href = "../template/index.html";
      }
    });
});
