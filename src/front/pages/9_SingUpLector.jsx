import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const SignUpLector = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [pais, setPais] = useState('');

  const { store, dispatch } = useGlobalReducer()

  if (store.auth_lector === true) {
    return <Navigate to="/pagina_lector" />;
  }

function sendData(e) {
    e.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "email": email,
        "username": username,
        "password": password,
        "nombre": nombre,
        "apellido": apellido,
        "pais": pais
      })
    };

    fetch(import.meta.env.VITE_BACKEND_URL + 'api/signup_lector', requestOptions, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al crear el lector");
        }
        return response.json();
      })
      
        .then(data => {
            alert("Lector creado con éxito");
            localStorage.setItem("token_lector", data.access_token);
            localStorage.setItem("lector_id", data.lector_id);
            localStorage.setItem("nombre_lector", data.nombre);

            dispatch({
                type: "set_auth_lector",
                payload: {
                    auth: true,
                    id: data.lector_id,
                    nombre: data.nombre
                }
            });
        })
      .catch(err => {
        console.error("Error:", err);
        alert("No se pudo completar el registro. Verifica los datos.");
      });
  }
  return (
<div className="container mt-5">
            <form className="w-50 mx-auto" onSubmit={sendData}>
                <h2 className="text-center mb-4">Sing Up</h2>
                
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input 
                        value={username} onChange={(e) => setUsername(e.target.value)} 
                        type="text" className="form-control" placeholder="Pon tu Username"
                        required 
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input 
                        value={nombre} onChange={(e) => setNombre(e.target.value)} 
                        type="text" className="form-control" placeholder="Pon tu nombre"
                        required 
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input 
                        value={apellido} onChange={(e) => setApellido(e.target.value)} 
                        type="text" className="form-control" placeholder="Pon tu apellido"
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

export default SignUpLector