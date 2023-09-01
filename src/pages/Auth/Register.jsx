import React, { useState } from "react";
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [Msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const currentUser = auth.currentUser;
        console.log(currentUser);
        navigate("/login");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        setMsg(errorMessage);
      });
    await updateProfile(auth.currentUser, {
      displayName: fullName,
    })
      .then(() => {
        console.log("updated successfully");
      })
      .catch((error) => {
        console.log("error updating name");
        console.log(error);
      });
  };
  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <div className="row">
        <div className="col">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">FullName</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                id="fullName"
                aria-describedby="fullName"
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="Emailaddress">Email address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Enter email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="Password">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                id="exampleInputPassword1"
                placeholder="Password"
              />
            </div>
            <Link to="/login">Login</Link>

            <button type="submit " className="btn btn-primary">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
