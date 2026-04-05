import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarReview = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    const [lectorId, setLectorId] = useState("");
    const [libroId, setLibroId] = useState("");

    const [lectores, setLectores] = useState([]);
    const [libros, setLibros] = useState([]);

    const [texto, setTexto] = useState("");
    const [puntuacion, setPuntuacion] = useState("");

    const [mensaje, setMensaje] = useState("");

    const { store, dispatch } = useGlobalReducer()

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/reviews/" + theId)
            .then(res => res.json())
            .then(data => {
                setLectorId(String(data.lector_id));
                setLibroId(String(data.libro.id));
                setTexto(data.texto);
                setPuntuacion(data.puntuacion)
            });

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector")
            .then(res => res.json())
            .then(data => setLectores(data));

        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro")
            .then(res => res.json())
            .then(data => setLibros(data));

    }, [theId]);


    const updateData = (e) => {
        e.preventDefault();

        if (!lectorId || !libroId) {
            alert("Debes seleccionar lector y libro");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "libro_id": parseInt(libroId),
                "texto": texto,
                "puntuacion": parseInt(puntuacion)
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/reviews/" + theId, requestOptions)
            .then(response => {
                if (response.ok) {
                    alert("¡Actualizado con éxito!");
                    navigate("/review");
                }
            });
    };

    return (
        <div className="container mt-5">
            <h2>Editar Review #{theId}</h2>

            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">

                <div className="mb-3">
                    <label className="form-label">Lector</label>
                    <select
                        className="form-control" value={lectorId} onChange={(e) => setLectorId(e.target.value)}>
                        <option value="">Selecciona un Lector</option>
                        {lectores.map(a => (<option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Libro</label>
                    <select className="form-control" value={libroId} onChange={(e) => setLibroId(e.target.value)}>
                        <option value="">Selecciona un Libro</option>
                        {libros.map(l => (<option key={l.id} value={l.id}>{l.nombre}</option>))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Texto</label>
                    <input type="text" className="form-control" value={texto} onChange={(e) => setTexto(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Puntuación 0 / 10</label>
                    <input type="number" className="form-control" min="0" max="10" value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Actualizar
                </button>
            </form>
        </div>
    );
};

export default EditarReview;
