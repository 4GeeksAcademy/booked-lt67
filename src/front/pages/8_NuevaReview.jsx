import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate  } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const NuevaReview = () => {

    const navigate = useNavigate()

    const [lectorId, setLectorId] = useState("")
    const [libroId, setLibroId] = useState("")

    const [libros, setLibros] = useState([])
    const [lectores, setLectores] = useState([])

    const [texto, setTexto] = useState([""])
    const [puntuacion, setPuntuacion] = useState([])

    const [mensaje, setMensaje] = useState("");

    const { store, dispatch } = useGlobalReducer()

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector")
            .then(response => response.json())
            .then(data => setLectores(data))

        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro")
            .then(response => response.json())
            .then(data => setLibros(data))
    }, [])

    function sendData(e) {
        e.preventDefault()

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "libro_id": parseInt(libroId),
                "texto": texto,
                "puntuacion": parseInt(puntuacion)
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/reviews", requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                navigate("/review")
            })
    }

    return (
        <div className="container mt-5">
            <h2>Agregar Review</h2>
            <form onSubmit={sendData} className="col-md-6">

                <div className="mb-3">
                    <label className="form-label">Lector</label>
                    <select className="form-control" value={lectorId} onChange={(e) => setLectorId(e.target.value)}>
                        <option value="">Selecciona un lector</option>
                        {lectores.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.nombre} {l.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Libro</label>
                    <select className="form-control" value={libroId} onChange={(e) => setLibroId(e.target.value)}>
                        <option value="">Selecciona un libro</option>
                        {libros.map(a => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Texto</label>
                    <input type="text" className="form-control" value={texto} onChange={(e) => setTexto(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Puntuacion 0 / 10</label>
                    <input type="int" className="form-control" min="0" max="10" value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary">Crear Review</button>
            </form>
        </div>
    );
};

export default NuevaReview;
