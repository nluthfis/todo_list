import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "../../store/reducers/authSlice";
import { getCurrentUser } from "../../store/reducers/authSlice";

function Index() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user.values !== null) {
      setIsAuthenticated(true);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(reset());
    window.location.href = "/login";
  };

  return (
    <div className="ms-3 me-3">
      <div className="align-item-center mt-0">
        <nav className="navbar navbar-expand-lg navbar-light">
          <div>
            <h6 className="fw-bold"> Todo List </h6>
          </div>
          <button
            type="button"
            className="navbar-toggler"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-2">
              <Link to="/" className="nav-item nav-link active">
                <h6> Home </h6>
              </Link>

              {/* <Link to="/AddTask" className="nav-item nav-link">
                  <h6>Create List</h6>
                </Link> */}
            </div>
            <div className="navbar-nav ms-auto">
              {isAuthenticated ? (
                <>
                  <div className="navbar-nav">
                    <Link
                      to="/"
                      className="nav-item nav-link active "
                      onClick={handleLogout}
                    >
                      Logout
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link to={"/login"} className="nav-item nav-link">
                    Login
                  </Link>
                  <Link to="/Register" className="nav-item nav-link">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Index;
