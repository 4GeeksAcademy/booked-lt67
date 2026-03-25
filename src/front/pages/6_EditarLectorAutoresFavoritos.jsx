import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditarLectorAutoresFavoritos = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    const [lectorId, setLectorId] = useState("");
    const [autorId, setAutorId] = useState("");

    const [lectores, setLectores] = useState([]);
    const [autores, setAutores] = useState([]);

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector_autores_favoritos/" + theId)
            .then(res => res.json())
            .then(data => {
                setAutorId(data.autor_id);
                setLectorId(data.lector_id);
            });

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector")
            .then(res => res.json())
            .then(data => setLectores(data));

        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor")
            .then(res => res.json())
            .then(data => setAutores(data));

    }, [theId]);

    
    const updateData = (e) => {
        e.preventDefault();

        if (!lectorId || !autorId) {
            alert("Debes seleccionar lector y autor");
            return;
        }
        
        const requestOptions = {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "autor_id": parseInt(autorId),
                "lector_id": parseInt(lectorId),
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector_autores_favoritos/" + theId, requestOptions)
            .then(response => {
                if (response.ok) {
                    alert("¡Actualizado con éxito!");
                    navigate("/lector_autores_favoritos"); 
                }
            });
    };

    return (
        <div className="container mt-5">
            <h2>Editar LectorAutorFavorito #{theId}</h2>

            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">

                <div className="mb-3">
                    <label className="form-label">Autor</label>
                    <select
                        className="form-control"
                        value={autorId}
                        onChange={(e) => setAutorId(e.target.value)}
                    >
                        <option value="">Selecciona un autor</option>
                        {autores.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.nombre} {a.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Lector</label>
                    <select className="form-control" value={lectorId} onChange={(e) => setLectorId(e.target.value)}>
                        <option value="">Selecciona un lector</option>
                        {lectores.map(l => (<option key={l.id} value={l.id}>{l.nombre} {l.apellido}</option>))}
                    </select>
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Actualizar
                </button>
            </form>
        </div>
    );
};

export default EditarLectorAutoresFavoritos;
