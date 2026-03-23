import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NuevaEditorial = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nombre, setNombre] = useState("")
    const [pais, setPais] = useState("")
    
    function sendData(e){
        e.preventDefault()
        console.log("send data")
        console.log(email, password, nombre, pais)

        const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "email": email,
            "password": password,            
            "nombre": nombre,
            "pais": pais,
        })
    };
    fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            navigate("/editorial") 
        ;}) 
    }
    
return (
    <>
        <div className="container mt-5">
            <h2>Registro de Editorial Nueva</h2>
            <form onSubmit={sendData} className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>                

                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">País</label>
                    <input type="text" name="pais donde reside" className="form-control" value={pais} onChange={(e) => setPais(e.target.value)}/>
                </div>

                <button type="submit" className="btn btn-primary">Crear Editorial</button>
            </form>
        </div>
        </>
    );  
};

export default NuevaEditorial