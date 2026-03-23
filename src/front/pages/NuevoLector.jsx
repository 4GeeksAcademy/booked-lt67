import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NuevoLector = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [paisdondereside, setPaisDondeReside] = useState("")
    const [password, setPassword] = useState("")

    function sendData(e){
        e.preventDefault()
        console.log("send data")
        console.log(email, username, nombre, apellido, paisdondereside, password)

        const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "apellido": apellido,
            "email": email,
            "nombre": nombre,
            "pais donde reside": paisdondereside,
            "username": username,
            "password": password
        })
    };
    fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            navigate("/lector") 
        ;}) 
    }
    

    
return (
    <>
        <div className="container mt-5">
            <h2>Registro de Lector Nuevo</h2>
            <form onSubmit={sendData} className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" name="username" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input type="text" name="apellido" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">País donde reside</label>
                    <input type="text" name="pais donde reside" className="form-control" value={paisdondereside} onChange={(e) => setPaisDondeReside(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>

                <button type="submit" className="btn btn-primary">Crear Lector</button>
            </form>
        </div>
        </>
    );  
};

export default NuevoLector