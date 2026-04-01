import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Libro from "./4_Libro";

const EditarLibroEditorial = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [autorId, setAutorId] = useState("");
    const [editorialId, setEditorialId] = useState("");

    const [autores, setAutores] = useState([]); 
    const [editoriales, setEditoriales] = useState([]);


    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => {

                setNombre(data.nombre);
                setGenero(data.genero);
                setAutorId(data.autor?.id || "");
                setEditorialId(data.editorial?.id || "");
            })

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/autor`)
            .then(res => res.json())
            .then(data => setAutores(data));

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/editorial`)
            .then(res => res.json())
            .then(data => setEditoriales(data));

    }, [theId]);


    const updateData = (e) => {
        e.preventDefault();

        const idAutor = parseInt(autorId);
        const idEditorial = parseInt(editorialId);

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "nombre": nombre,
                "genero": genero,
                "autor_id": idAutor,
                "editorial_id": idEditorial
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese nombre o genero ya está en uso por otro lector");
                }
                if (response.ok) {
                    alert("¡Libro actualizado con éxito!");
                    navigate("/pagina_editorial");
                }
            })
    };

    return (
        <div className="container mt-5">
            <h2>Editar libro: {nombre}</h2>
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Genero</label>
                    <input type="text" className="form-control" value={genero} onChange={(e) => setGenero(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Autor</label>
                    <select className="form-select" value={autorId} onChange={(e) => setAutorId(e.target.value)}>
                        <option value="">Selecciona un autor</option>
                        {autores.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                    </select>
                </div>

                <button type="submit" className="btn btn-success me-2">Actualizar Libro</button>
            </form>
        </div>
    );
};

export default EditarLibroEditorial;