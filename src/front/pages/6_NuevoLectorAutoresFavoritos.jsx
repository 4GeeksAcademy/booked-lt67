import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";


const NuevoLectorAutoresFavoritos = () => {

    const navigate = useNavigate()

    const [lectorId, setLectorId] = useState("")
    const [autorId, setAutorId] = useState("")

    const [lectores, setLectores] = useState([])
    const [autores, setAutores] = useState([])
    
    const { store, dispatch } = useGlobalReducer()
    
        if (!store.auth_admin) {
            return <Navigate to="/login_admin" />;
        }

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector")
            .then(response => response.json())
            .then(data => setLectores(data))

        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor")
            .then(response => response.json())
            .then(data => setAutores(data))
    }, [])
    
    function sendData(e){
        e.preventDefault()

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "autor_id": parseInt(autorId),
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector_autores_favoritos", requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                navigate("/lector_autores_favoritos") 
            }) 
    }
    
    return (
        <div className="container mt-5">
            <h2>Agregar Autor Favorito a Lector</h2>
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
                    <label className="form-label">Autor</label>
                    <select className="form-control" value={autorId} onChange={(e) => setAutorId(e.target.value)}>
                        <option value="">Selecciona un autor</option>
                        {autores.map(a => (<option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">Crear Favorito</button>
            </form>
        </div>
    );  
};

export default NuevoLectorAutoresFavoritos;
