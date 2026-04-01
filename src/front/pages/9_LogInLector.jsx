// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const LogInLector = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { store, dispatch } = useGlobalReducer()

  if (store.auth_lector === true) {
    return <Navigate to="/pagina_lector" />;
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

    fetch(import.meta.env.VITE_BACKEND_URL + 'api/login_lector', requestOptions)
    .then(response => {
        if (!response.ok) {
            // Manejar error de credenciales
            alert("Email o contraseña incorrectos");
            throw new Error("Login failed");
        }
        return response.json();
    })
    .then(data => {
        // Guardar en localStorage
        localStorage.setItem("token_lector", data.access_token);
        localStorage.setItem("lector_id", data.lector_id);
        
        // Despachar al reducer
        dispatch({
            type: "set_auth_lector",
            payload: {
                auth: true,
                id: data.lector_id,
                nombre: data.nombre
            }
        });
    })
    .catch(error => console.error("Error:", error));
  }
  return (
<div className="container mt-5">
  <h1 className="text-center mt-5">Log In Lector</h1>
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
                <Link to="/signup_lector" className="ms-2">
                  Regístrate aquí
                </Link>
            </form>
        </div>
  )
}

export default LogInLector