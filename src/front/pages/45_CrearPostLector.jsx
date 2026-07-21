import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CrearPostLector = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [texto, setTexto] = useState("");

    // El token ahora vive en el sessionStorage (o donde lo guardes al hacer login)
    const token = localStorage.getItem("token_lector");

    const sendData = (e) => {
        e.preventDefault();

        if (!token) {
            alert("Inicia sesión para publicar");
            return;
        }

        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const urlFinal = `${base}/api/post-lector`; // <-- Nuestra nueva ruta

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <-- Mandamos el token inteligente
            },
            body: JSON.stringify({
                "texto": texto,
                // Nota: Ya no mandamos lector_id en el body porque el backend 
                // lo saca del token que actualizamos hoy. ¡Más seguro!
            })
        };

        fetch(urlFinal, requestOptions)
            .then(async response => {
                // SI DA ERROR (como el 422), CAPTURAMOS EL BODY ANTES DE QUE TRUENE
                if (!response.ok) {
                    const errorEnBackend = await response.json().catch(() => ({}));
                    console.error("🚨 DETALLE EXACTO DEL ERROR 422 DESDE FLASK:", errorEnBackend);
                    throw new Error("Error al publicar post de lector");
                }
                return response.json();
            })
            .then(data => {
                console.log("¡Post de Lector creado!", data);
                navigate("/pagina_lector");
            })
            .catch(error => {
                console.error("Error en post-lector:", error);
            });
    };


    return (
        <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="card-body">
                <h5 className="card-title fw-bold text-success mb-3">Compartir con la comunidad</h5>
                <form onSubmit={sendData}>
                    <div className="mb-3">
                        <textarea
                            className="form-control border-0 shadow-sm"
                            rows="3"
                            placeholder="¿Qué libro estás leyendo hoy?"
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            required
                        />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-success px-4 shadow-sm">
                            Publicar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearPostLector;