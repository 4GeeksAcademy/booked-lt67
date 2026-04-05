import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const CrearPostEditorialbyId = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const [texto, setTexto] = useState("");

    const handlePublish = async (e) => {
        e.preventDefault();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/posteditorial`, {
            method: "POST",
            body: JSON.stringify({
                texto: texto,
                editorial_id: theId
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            navigate(`/pagina_editorial/`);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Crear Post</h2>
            <form onSubmit={handlePublish}>
                <textarea
                    className="form-control mb-3"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe aquí..."
                />
                <button type="submit" className="btn btn-primary">Publicar</button>
            </form>
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_editorial/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default CrearPostEditorialbyId