import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Quitamos useParams porque ya no dependemos del ID en la URL

const CrearPostEditorialbyId = () => {
    const navigate = useNavigate();
    const [texto, setTexto] = useState("");

    const handlePublish = async (e) => {
        e.preventDefault();
        
        // Recuperamos el token específico de editorial
        const token = localStorage.getItem("token_editorial");

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posteditorial`, {
            method: "POST",
            body: JSON.stringify({
                texto: texto
                // editorial_id eliminado: el backend usa el token para saber quién eres
            }),
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Inyectamos la seguridad
            }
        });

        if (response.ok) {
            navigate(`/pagina_editorial/`);
        } else {
            console.error("Error al publicar: el token podría haber expirado");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 p-4">
                <h2 className="text-primary mb-4">Crear Post Editorial</h2>
                <form onSubmit={handlePublish}>
                    <textarea
                        className="form-control mb-3 border-0 bg-light"
                        rows="4"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="Anuncia un nuevo lanzamiento o noticia..."
                        required
                    />
                    <div className="d-flex justify-content-between align-items-center">
                        <Link to={"/pagina_editorial/"} className="btn btn-link text-decoration-none">
                            <i className="fas fa-arrow-left me-2"></i>Volver al Dashboard
                        </Link>
                        <button type="submit" className="btn btn-primary px-5 shadow-sm">
                            Publicar Noticia
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearPostEditorialbyId;