const signup = document.getElementById("signup-form");

signup.addEventListener("submit", (e) => {
  e.preventDefault();

  var first_name = signup.first_name.value;
  var last_name = signup.last_name.value;
  var email = signup.email.value;
  var password = signup.password.value;
  var confirm_password = signup.confirm_password.value;

  fetch("http://localhost:3200/register", {
    method: "POST",
    body: JSON.stringify({
      first_name: `${first_name}`,
      last_name: `${last_name}`,
      email: `${email}`,
      password: `${password}`,
      password2: `${confirm_password}`,
    }),
    headers: {
      "Content-Type": "application/json; charset = UTF-8",
    },
  })
    .then((res) => {
      console.log(res);
      if (res.status === 400) {
        return "Invalid Details";
      } else {
        return res.json();
      }
    })
    .then((data) => {
      console.log(data);
      if (data === "Invalid Details") {
        alert("Oops Invalid Details. Please enter valid details!");
      } else {
        console.log(data);
      }
    });
});
