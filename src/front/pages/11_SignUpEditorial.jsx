import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

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
                folder: "libros_portadas", // Mantener consistencia con tus otros componentes
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

            const targetId = data.editorial_id || data.id;


            localStorage.setItem("token_editorial", data.access_token);
            localStorage.setItem("editorial_id", data.editorial_id);
            localStorage.setItem("horaLoginEditorial", new Date().getTime());

            dispatch({
                type: "set_auth_editorial",
                payload: {
                    auth: true,
                    id: targetId, // El reducer lo guarda en store.editorial_id
                    nombre: data.nombre
                }
            });

            alert("¡Cuenta creada exitosamente!");
            navigate("/pagina_editorial");

        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (store.auth_editorial === true) return <Navigate to="/pagina_editorial" />;

    return (
        <div className="container mt-5">
            <div className="card shadow mx-auto" style={{ maxWidth: "500px" }}>
                <div className="card-body p-4">
                    <h2 className="text-center mb-4">Registro de Editorial</h2>

                    <form onSubmit={sendData}>
                        <div className="mb-4 text-center">
                            <div className="mx-auto mb-2 shadow-sm border d-flex align-items-center justify-content-center"
                                style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <i className="fas fa-building text-muted fa-3x"></i>
                                )}
                            </div>
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleUpload}>
                                {imageUrl ? "Cambiar Logo" : "Subir Logo de Editorial"}
                            </button>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Nombre</label>
                            <input
                                value={nombre}
                                onChange={(e) => {
                                    setNombre(e.target.value);
                                    buscarEditorialExistente(e.target.value);
                                }} type="text" className="form-control" placeholder="Nombre de la editorial" required />
                        </div>

                        {sugerencia && (
                            <div className="alert alert-info mt-2 p-2" style={{ fontSize: "0.8rem" }}>
                                <p className="mb-1">¿Eres <strong>{sugerencia.nombre}</strong>? Tenemos libros asociados a este nombre.</p>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                        setNombre(sugerencia.nombre);
                                        setSugerencia(null);
                                        setReclamarId(sugerencia.id);
                                    }}
                                >
                                    Sí, soy yo
                                </button>
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-bold">País</label>
                            <input value={pais} onChange={(e) => setPais(e.target.value)} type="text" className="form-control" placeholder="Ej: Argentina" required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control" required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Contraseña</label>
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control" required />
                        </div>

                        <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={isSubmitting}>
                            {isSubmitting ? "Procesando..." : "Crear Cuenta de Editorial"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUpEditorial;