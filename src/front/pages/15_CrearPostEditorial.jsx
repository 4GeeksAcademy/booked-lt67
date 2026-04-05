import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const CrearPostEditorial = () => {

    const navigate = useNavigate()

    const [editorialId, setEditorialId] = useState("")
    const [editoriales, setEditoriales] = useState([])
    const [texto, setTexto] = useState([""])

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial")
            .then(response => response.json())
            .then(data => setEditoriales(data))

    }, [])

    function sendData(e) {
        e.preventDefault()

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "editorial_id": parseInt(editorialId),
                "texto": texto,
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/posteditorial", requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                navigate("/editorial")
            })
    }

    return (
        <div className="container mt-5">
            <h2>Crear Post</h2>
            <form onSubmit={sendData} className="col-md-6">

                <div className="mb-3">
                    <label className="form-label">Editorial</label>
                    <select className="form-control" value={editorialId} onChange={(e) => setEditorialId(e.target.value)}>
                        <option value="">Selecciona una Editorial</option>
                        {editoriales.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.nombre}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="mb-3">
                    <label className="form-label">Texto</label>
                    <textarea type="text" className="form-control" value={texto} onChange={(e) => setTexto(e.target.value)} required />
                </div>


                <button type="submit" className="btn btn-primary">Crear Post</button>
            </form>
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_editorial/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default CrearPostEditorial;