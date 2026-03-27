// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const LogInAutor = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { store, dispatch } = useGlobalReducer()

  if (store.auth === true) {
    return <Navigate to="/demo" />;
  }

  function sendData(e){
    e.preventDefault()

    const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
        {
            "email": email,
            "password": password
            }
        )
    };

    fetch(import.meta.env.VITE_BACKEND_URL + 'api/login_autor', requestOptions)
        .then(response => {
          if(response.status == 200){
            dispatch({ type : "set_auth", payload: true})
          }
          return response.json()
        })
        .then(data => {
          console.log(data.access_token)
          localStorage.setItem("token", data.access_token)
        });
  }
  return (
<div className="container mt-5">
  <h1 className="text-center mt-5">Log In Autor</h1>
            <form className="w-50 mx-auto" onSubmit={sendData}>
                <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input 
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                        type="email" className="form-control" placeholder="email"
                        required 
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input 
                        value={password} onChange={(e) => setPassword(e.target.value)} 
                        type="password" className="form-control" placeholder="password"
                        required 
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Ingresar
                </button>
                <Link to="/signup_autor" className="ms-2">
                  Regístrate aquí
                </Link>
            </form>
        </div>
  )
}

export default LogInAutor