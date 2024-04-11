import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userslice";
import { useDispatch, useSelector } from "react-redux";
//import OAuth from '../components/OAuth';

export default function Employee_Signin() {
  const [formData, setFormData] = useState({});

  const { loading, error: errorMessage } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure("please fill out all the fields"));
    }
    try {
      dispatch(signInStart());
      const res = await fetch("http://localhost:8070/Employee/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }

      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/Dashboard");
      }
    } catch (error) {
      dispatch(signInFailure(data.message));
    }
  };
  return (
    <div
      className="min-h-screen "
      style={{
        backgroundImage: "url('https://i.gifer.com/EIG1.gif')",
        backgroundSize: "cover",
        backgroundPosition: "fill",
        width: "auto",
        height: "auto",
      }}
    >
      <div className="flex p-3 max-w-sm mx-auto flex-col md:flex-row md:items-center gap-2 ">
        <div className="flex-1 mt-40 ">
          <Link to="/Dashboard" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white ">
              Uber Delivery
            </span>
            Login
          </Link>
          <p className="text-sm mt-7 mb-3  ">
            "Enter Your Username And Password"
          </p>
          <form className="flex flex-col gap-2 " onSubmit={handleSubmit}>
            <div>
              <Label value="Employee email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              />
            </div>

            <div>
              <Label value="Password" />
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              />
            </div>

            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              //disabled={loading}
              className="w-40 h-10 mx-auto"
            >
              Login
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Don't have an account yet?</span>
            <Link to="/Employee_Registration" className="text-orange-500">
              Register
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}