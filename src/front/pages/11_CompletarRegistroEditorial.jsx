import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SelectorUbicacion from "../pages/24_Georreferenciacion"; // Ajusta la ruta si es necesario

const CompletarRegistroEditorial = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { store, dispatch } = useGlobalReducer();

    // Recuperamos los datos del Paso 1
    const { nombre, email, password, reclamarId } = location.state || {};

    // Estados nuevos
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null });
    const [imageUrl, setImageUrl] = useState("");
    const [cargando, setCargando] = useState(false);

    // Cargar script de Cloudinary
    useEffect(() => {
        const scriptId = "cloudinary-upload-widget-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Protección de ruta
    useEffect(() => {
        if (!email || !nombre || !password) {
            navigate("/signup_editorial");
        }
    }, [email, nombre, password, navigate]);

    if (store.auth_editorial === true) {
        return <Navigate to="/pagina_editorial" />;
    }

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/api/upload_image`);
            const data = await response.json();

            const widget = window.cloudinary.createUploadWidget({
                cloudName: data.cloudName,
                apiKey: data.apiKey,
                uploadSignatureTimestamp: data.timestamp,
                uploadSignature: data.signature,
                folder: "editoriales_logos",
                cropping: true,
                multiple: false
            }, (error, result) => {
                if (!error && result && result.event === "success") {
                    setImageUrl(result.info.secure_url);
                }
            });
            widget.open();
        } catch (error) {
            console.error("Error con Cloudinary:", error);
            alert("No se pudo cargar el gestor de imágenes.");
        }
    };

    function sendData(e) {
        if (e) e.preventDefault();
        setCargando(true);
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "latitud": ubicacion.lat,  // Enviamos coordenadas
                "longitud": ubicacion.lng,
                "image_url": imageUrl,
                "reclamar_id": reclamarId
            })
        };

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        fetch(`${baseUrl}/api/signup_editorial`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error en el registro");
                return response.json();
            })
            .then(data => {
                localStorage.setItem("token_editorial", data.access_token);
                localStorage.setItem("editorial_id", data.editorial_id || data.id);
                localStorage.setItem("horaLoginEditorial", new Date().getTime());

                dispatch({
                    type: "set_auth_editorial",
                    payload: {
                        auth: true,
                        id: data.editorial_id || data.id,
                        nombre: data.nombre
                    }
                });

                alert(reclamarId ? "¡Sede editorial vinculada con éxito!" : "¡Cuenta de editorial creada con éxito!");
                navigate("/pagina_editorial");
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Hubo un error al procesar el registro.");
                setCargando(false);
            });
    }

    if (!email) return null; 

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "1000px" }}>
                    <div className="row g-0">
                        
                        {/* PANEL IZQUIERDO */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#1e99bd" }} 
                        >
                            <i className="fas fa-city position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                    <i className="fas fa-map-marker-alt fa-2x"></i>
                                </div>
                                <h3 className="fw-bold mb-3">Sede Central</h3>
                                <p className="small opacity-75 mb-4">
                                    Ubica tus oficinas o almacén principal en el mapa para mejorar tu logística y visibilidad regional.
                                </p>
                            </div>
                        </div>

                        {/* PANEL DERECHO */}
                        <div className="col-lg-8 bg-white p-4 p-md-5">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-end flex-wrap gap-2">
                                <div>
                                    <h2 className="fw-bold text-dark h4 mb-1">Configuración de {nombre}</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Perfil Profesional</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Link to="/signup_editorial" className="btn btn-sm btn-light border rounded-pill px-3 text-muted">
                                        <i className="fas fa-arrow-left me-1"></i>
                                    </Link>
                                    <span className="badge bg-success border rounded-pill px-3 py-2">Paso 2 de 2</span>
                                </div>
                            </div>
                            
                            <form onSubmit={sendData}>
                                <div className="row">
                                    {/* Logo arriba a la izquierda/centro */}
                                    <div className="col-md-4 mb-4 text-center border-end">
                                        <label className="form-label small fw-bold text-muted text-uppercase d-block mb-3">Logo Corporativo</label>
                                        <div className="mx-auto shadow-sm border d-flex align-items-center justify-content-center"
                                            style={{ width: "100px", height: "100px", borderRadius: "20px", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                            ) : (
                                                <i className="fas fa-building text-muted fa-2x opacity-50"></i>
                                            )}
                                        </div>
                                        <button type="button" className="btn btn-sm btn-outline-info rounded-pill mt-3 w-100" onClick={handleUpload}>
                                            <i className="fas fa-upload me-1"></i> {imageUrl ? "Cambiar" : "Subir"}
                                        </button>
                                    </div>

                                    {/* Mapa a la derecha del logo */}
                                    <div className="col-md-8 mb-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">Ubicación de la Sede</label>
                                        <div className="rounded-4 overflow-hidden border shadow-sm bg-light p-1" style={{ height: "220px" }}>
                                            <SelectorUbicacion onLocationSelect={setUbicacion} />
                                        </div>
                                        <p className="text-muted small mt-2 mb-0">
                                            <i className="fas fa-info-circle me-1"></i> Haz clic para marcar tu oficina principal.
                                        </p>
                                    </div>
                                </div>

                                <div className="d-grid mt-2">
                                    <button 
                                        type="submit" 
                                        className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm py-3"
                                        disabled={cargando}
                                    >
                                        {cargando ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> Creando Portal...</>
                                        ) : (
                                            "FINALIZAR REGISTRO"
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => sendData()} 
                                        className="btn btn-link text-muted btn-sm mt-2 text-decoration-none"
                                        disabled={cargando}
                                    >
                                        Configurar ubicación más tarde
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletarRegistroEditorial;