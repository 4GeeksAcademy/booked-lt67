import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CrearPostAutor = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [texto, setTexto] = useState("");
    
    const autorId = store.autor_id || localStorage.getItem("autor_id");

    const sendData = (e) => {
        e.preventDefault();

        if (!autorId) {
            alert("Error: No se detectó sesión de autor");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "autor_id": parseInt(autorId),
                "texto": texto,
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/postautor", requestOptions)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error("Error al crear el post");
            })
            .then(data => {
                console.log("Post creado:", data);
                navigate("/pagina_autor");
            })
            .catch(error => console.error(error));
    };

    return (
        <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body">
                <h5 className="card-title fw-bold text-primary mb-3">Nuevo Post</h5>
                <form onSubmit={sendData}>
                    <div className="mb-3">
                        <textarea 
                            className="form-control border-0 shadow-sm" 
                            rows="3" 
                            placeholder="¿En qué piensas?" 
                            value={texto} 
                            onChange={(e) => setTexto(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate("/pagina_autor")}>
                            Volver al panel
                        </button>
                                                <button type="submit" className="btn btn-dark px-4 shadow-sm">
                            Publicar en mi Mural
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearPostAutor;