import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CompletarRegistroEditorial = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { store, dispatch } = useGlobalReducer();

    // Recuperamos los datos del Paso 1
    const { nombre, email, password, reclamarId } = location.state || {};

    const [pais, setPais] = useState('');
    const [imageUrl, setImageUrl] = useState("");
    const [cargando, setCargando] = useState(false);

    // Inicializar script de Cloudinary
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

    // NUEVA LÓGICA: Subida directa con Preset (Igual que en Lector)
    const handleUpload = (e) => {
        e.preventDefault();

        if (!window.cloudinary) {
            alert("El servicio de imágenes aún se está cargando. Por favor, espera un segundo.");
            return;
        }

        const widget = window.cloudinary.createUploadWidget({
            cloudName: "dklriashm", // Tu Cloud Name verificado
            uploadPreset: "lectores_preset", // El preset que funciona en tu cuenta
            sources: ["local", "url", "camera"],
            folder: "editoriales_logos",
            cropping: true,
            croppingAspectRatio: 1,
            multiple: false,
            showSkipCropButton: false
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log("Logo subido con éxito:", result.info.secure_url);
                setImageUrl(result.info.secure_url);
            }
        });

        widget.open();
    };

    function sendData(e) {
        e.preventDefault();
        setCargando(true);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "pais": pais,
                "image_url": imageUrl,
                "reclamar_id": reclamarId
            })
        };

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        fetch(`${baseUrl}/api/signup_editorial`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error en el registro de editorial");
                return response.json();
            })
            .then(data => {
                localStorage.setItem("token_editorial", data.access_token);
                localStorage.setItem("editorial_id", data.editorial_id || data.id);
                localStorage.setItem("horaLogineditorial", new Date().getTime());

                dispatch({
                    type: "set_auth_editorial",
                    payload: {
                        auth: true,
                        id: data.editorial_id || data.id,
                        nombre: data.nombre
                    }
                });

                alert("¡Cuenta de editorial creada exitosamente!");
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
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">

                        {/* PANEL IZQUIERDO */}
                        <div
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#1e99bd" }}
                        >
                            <i className="fas fa-image position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                    <i className="fas fa-palette fa-2x"></i>
                                </div>
                                <h3 className="fw-bold mb-3">Identidad Visual</h3>
                                <p className="small opacity-75 mb-4">
                                    Añade el logotipo de tu editorial para que los lectores te reconozcan fácilmente en el catálogo.
                                </p>
                            </div>
                        </div>

                        {/* PANEL DERECHO */}
                        <div className="col-lg-8 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-end flex-wrap gap-2">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Completa tu perfil</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Sede de {nombre}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Link to="/signup_editorial" className="btn btn-sm btn-light border rounded-pill px-3 shadow-sm text-muted">
                                        <i className="fas fa-arrow-left me-1"></i> Volver
                                    </Link>
                                    <span className="badge bg-success border rounded-pill px-3 py-2">Paso 2 de 2</span>
                                </div>
                            </div>

                            <form onSubmit={sendData}>
                                <div className="row g-3">

                                    {/* SECCIÓN IMAGEN */}
                                    <div className="col-md-12 mb-4 d-flex flex-column align-items-center">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-3">Logotipo de la Editorial</label>
                                        <div className="shadow-sm border d-flex align-items-center justify-content-center position-relative"
                                            style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="Logo Editorial" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <i className="fas fa-building text-muted fa-3x opacity-50"></i>
                                            )}
                                        </div>
                                        <button type="button" className="btn btn-outline-info rounded-pill px-4 mt-3 shadow-sm" onClick={handleUpload}>
                                            <i className="fas fa-camera me-2"></i> {imageUrl ? "Cambiar Imagen" : "Subir Logo"}
                                        </button>
                                    </div>

                                    {/* PAÍS */}
                                    <div className="col-md-12 mb-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">País Sede de la Editorial</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-4"><i className="fas fa-globe"></i></span>
                                            <input
                                                value={pais}
                                                onChange={(e) => setPais(e.target.value)}
                                                type="text"
                                                className="form-control bg-light border-0 py-3 ps-2"
                                                placeholder="Ej. España, México, Argentina..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm py-3"
                                        disabled={cargando}
                                    >
                                        {cargando ? (
                                            <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span> Configurando portal...</>
                                        ) : (
                                            <>FINALIZAR Y CREAR CUENTA</>
                                        )}
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