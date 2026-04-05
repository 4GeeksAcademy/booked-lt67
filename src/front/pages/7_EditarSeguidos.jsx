import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarSeguidos = () => {

    const navigate = useNavigate();
    const { segId } = useParams();

    const [lectores, setLectores] = useState([]);
    const [nuevoSeguidoId, setNuevoSeguidoId] = useState("");
    const [mensaje, setMensaje] = useState("");

    const { store, dispatch } = useGlobalReducer()
        
            if (!store.auth_admin) {
                return <Navigate to="/login_admin" />;
            }

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/lector`)
            .then(res => res.json())
            .then(data => setLectores(data))
    }, []);


    const actualizarLectorSeguido = (e) => {
        e.preventDefault();

        if (!nuevoSeguidoId) {
            setMensaje("Por favor, selecciona al nuevo usuario seguido");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "nuevo_seguido_id": parseInt(nuevoSeguidoId)
            })
        };

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/seguidores/${segId}`, requestOptions)
            .then(response => {
                return response.json();
            })
            .then(() => {
                alert("Cambio de lector seguido completado");
                navigate(`/ver_seguidores`);
            });
    };

    return (
        <div className="container mt-5">
            <h2>Editar Usuario Seguido</h2>
            <div className="card p-4 shadow-sm col-md-6">
                {mensaje && <div className="alert alert-danger">{mensaje}</div>}
                <form onSubmit={actualizarLectorSeguido}>
                    <label className="form-label">Selecciona el nuevo usuario a seguir:</label>
                    <select className="form-select mb-3"value={nuevoSeguidoId}onChange={(e) => setNuevoSeguidoId(e.target.value)}>
                        <option value="">-- Seguidos --</option>
                        {lectores.map(l => (<option key={l.id} value={l.id}>{l.nombre} (@{l.username})</option>))}
                    </select>
                    <button type="submit" className="btn btn-warning me-2">Actualizar</button>
                    <Link to={`/ver_seguidores`} className="btn btn-secondary">Cancelar</Link>
                </form>
            </div>
        </div>
    )
}


export default EditarSeguidos;