import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const EditarLector = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [paisdondereside, setPaisDondeReside] = useState("");
    //const [password, setPassword] = useState(""); 

    
    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => {
                
                setEmail(data.email);
                setUsername(data.username);
                setNombre(data.nombre);
                setApellido(data.apellido);
                setPaisDondeReside(data.pais_donde_reside);
            })
    }, [theId]);

    
    const updateData = (e) => {
        e.preventDefault();
        
        const requestOptions = {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "username": username,
                "nombre": nombre,
                "apellido": apellido,
                "pais donde reside": paisdondereside,
                
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                throw new Error("Ese username o email ya está en uso por otro lector");
            }
                if (response.ok) {
                    alert("¡Lector actualizado con éxito!");
                    navigate("/lector"); 
                }
            })
    };

    return (
        <div className="container mt-5">
            <h2>Editar Lector #{theId}</h2>
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">País donde reside</label>
                    <input type="text" className="form-control" value={paisdondereside} onChange={(e) => setPaisDondeReside(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-success me-2">Actualizar Lector</button>
            </form>
        </div>
    );
};

export default EditarLector;