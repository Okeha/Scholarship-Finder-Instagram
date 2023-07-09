const signup = document.getElementById("signup-form");

signup.addEventListener("submit", (e) => {
  e.preventDefault();

  var first_name = signup.first_name.value;
  var last_name = signup.last_name.value;
  var email = signup.email.value;
  var password = signup.password.value;
  var confirm_password = signup.confirm_password.value;

  fetch("http://localhost:3200/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      firstname: `${first_name}`,
      lastname: `${last_name}`,
      email: `${email}`,
      password: `${password}`,
      confirm_password: `${confirm_password}`,
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
