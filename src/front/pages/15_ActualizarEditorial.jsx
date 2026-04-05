import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const ActualizarEditorial = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pais, setPais] = useState("");

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => {

                setEmail(data.email);
                setPassword(data.password);
                setNombre(data.nombre);
                setPais(data.pais);
            })
    }, [theId]);


    const updateData = (e) => {
        e.preventDefault();

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "pais": pais,

            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese username o email ya está en uso por otra editorial");
                }
                if (response.ok) {
                    alert("¡Editorial actualizado con éxito!");
                    navigate("/pagina_editorial");
                }
            })
    };

    return (
        <div className="container mt-5">
            <h2>Editar Editorial {nombre}</h2>
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="text" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">País</label>
                    <input type="text" className="form-control" value={pais} onChange={(e) => setPais(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-success me-2">Actualizar Editorial</button>
            </form>
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_editorial/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default ActualizarEditorial;