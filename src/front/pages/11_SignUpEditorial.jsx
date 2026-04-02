
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";

const SignUpEditorial = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState('');

  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate();

  if (store.auth_editorial === true) {
    return <Navigate to="/pagina_editorial" />;
  }

  function sendData(e){
    e.preventDefault()

    const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
        {
            "email": email,
            "password": password,
            "nombre": nombre,
            "pais": pais
            }
        )
    };

    fetch(import.meta.env.VITE_BACKEND_URL + 'api/signup_editorial', requestOptions)
        .then(response => {
          if(response.ok){
            alert("Usuario creado")
            dispatch({ type : "set_auth_editorial", payload: true })
          }
          return response.json()
        })
        .then(data => {
          localStorage.setItem("token_editorial", data.access_token);
          navigate("/pagina_editorial")
        })
        .catch(err => console.error("Error:", err));
  }
  return (
<div className="container mt-5">
            <form className="w-50 mx-auto" onSubmit={sendData}>
                <h2 className="text-center mb-4">Sing Up</h2>
                
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input 
                        value={nombre} onChange={(e) => setNombre(e.target.value)} 
                        type="text" className="form-control" placeholder="Pon tu nombre"
                        required 
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Pais</label>
                    <input 
                        value={pais} onChange={(e) => setPais(e.target.value)} 
                        type="text" className="form-control" placeholder="Pon tu pais"
                        required 
                    />
                </div>

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
            </form>
        </div>
  )
}

export default SignUpEditorial