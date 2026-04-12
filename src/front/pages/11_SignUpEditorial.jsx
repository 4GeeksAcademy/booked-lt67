import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import logoBookedUrl from "../assets/img/logo_booked.png"; // Asegúrate de que esta ruta sea correcta

const SignUpEditorial = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [pais, setPais] = useState('');
    const [imageUrl, setImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sugerencia, setSugerencia] = useState(null);
    const [reclamarId, setReclamarId] = useState(null);

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

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

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/upload_image");
            const data = await response.json();

            const widget = window.cloudinary.createUploadWidget({
                cloudName: data.cloudName,
                apiKey: data.apiKey,
                uploadSignatureTimestamp: data.timestamp,
                uploadSignature: data.signature,
                folder: "libros_portadas",
                cropping: true,
                multiple: false
            }, (error, result) => {
                if (!error && result && result.event === "success") {
                    setImageUrl(result.info.secure_url);
                }
            });
            widget.open();
        } catch (error) {
            console.error("Error al iniciar el widget de Cloudinary", error);
        }
    };

    const buscarEditorialExistente = async (valor) => {
        if (valor.length < 3) {
            setSugerencia(null);
            return;
        }
        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/buscar_editorial?nombre=${valor}`);
            if (resp.ok) {
                const data = await resp.json(); 
                const huerfanas = data.filter(e => !e.is_verified && (e.email === null || e.email === ""));
                if (huerfanas.length > 0) {
                    setSugerencia(huerfanas[0]);
                } else {
                    setSugerencia(null);
                }
            }
        } catch (err) { 
            console.error("Error buscando editorial:", err); 
        }
    };

    const sendData = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

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

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + 'api/signup_editorial', requestOptions);
            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Error en el registro");

            localStorage.setItem("token_editorial", data.access_token);
            localStorage.setItem("editorial_id", data.editorial_id);
            localStorage.setItem("horaLoginEditorial", new Date().getTime());

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

        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (store.auth_editorial === true) return <Navigate to="/pagina_editorial" />;

    return (
        <div className="container-fluid min-vh-100 bg-light py-5 d-flex align-items-center">
            <div className="container">
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "850px" }}>
                    <div className="row g-0">
                        {/* Panel Izquierdo: Bienvenida Editorial */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center"
                            style={{ backgroundColor: "#f0f7ff" }} // Un tono azul muy leve
                        >
                            <img 
                                src={logoBookedUrl} 
                                alt="Booked Logo" 
                                style={{ height: "100px", width: "auto" }} 
                                className="mb-4" 
                            />
                            <h3 className="fw-bold text-primary">Portal para Editoriales</h3>
                            <p className="small text-muted">Muestra tus libros al mundo y conecta con miles de lectores apasionados.</p>
                        </div>

                        {/* Panel Derecho: Formulario */}
                        <div className="col-lg-8 bg-white p-4 p-md-5">
                            <h2 className="fw-bold text-dark mb-4 h3">Registro de Editorial</h2>
                            
                            <form onSubmit={sendData}>
                                <div className="row">
                                    {/* Upload Logo de Editorial */}
                                    <div className="col-md-12 mb-4 text-center">
                                        <div className="mx-auto mb-3 shadow-sm border d-flex align-items-center justify-content-center"
                                            style={{ width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <i className="fas fa-building text-muted fa-2x"></i>
                                            )}
                                        </div>
                                        <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={handleUpload}>
                                            <i className="fas fa-camera me-2"></i>
                                            {imageUrl ? "Cambiar Logo" : "Subir Logo"}
                                        </button>
                                    </div>

                                    {/* Nombre de la Editorial */}
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Nombre de la Editorial</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-0 rounded-start-pill"><i className="fas fa-building"></i></span>
                                            <input 
                                                value={nombre} 
                                                onChange={(e) => {
                                                    setNombre(e.target.value);
                                                    buscarEditorialExistente(e.target.value);
                                                }} 
                                                type="text" className="form-control bg-light border-0 rounded-end-pill py-2" 
                                                placeholder="Nombre comercial" required 
                                            />
                                        </div>
                                        {sugerencia && (
                                            <div className="alert alert-info mt-2 p-2 border-0 rounded-3 shadow-sm" style={{ fontSize: "0.8rem" }}>
                                                <p className="mb-1">¿Eres <strong>{sugerencia.nombre}</strong>? Tenemos libros asociados.</p>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-primary rounded-pill py-0 px-2"
                                                    onClick={() => {
                                                        setNombre(sugerencia.nombre);
                                                        setSugerencia(null);
                                                        setReclamarId(sugerencia.id);
                                                    }}
                                                >
                                                    Sí, reclamar perfil
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-12 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Correo Corporativo</label>
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="contacto@editorial.com" required />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">País de Origen</label>
                                        <input value={pais} onChange={(e) => setPais(e.target.value)} type="text" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="Ej: España" required />
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Contraseña</label>
                                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control form-control-sm bg-light border-0 rounded-pill py-2 px-3" placeholder="••••••••" required />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm mb-3"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "PROCESANDO..." : "REGISTRAR EDITORIAL"}
                                </button>

                                <div className="text-center">
                                    <span className="text-muted small">¿Ya gestionas una cuenta? </span>
                                    <Link to="/login_editorial" className="text-primary fw-bold text-decoration-none small">Inicia Sesión</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpEditorial;