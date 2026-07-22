import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ActualizarEditorial = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    if (!store.auth_editorial && !localStorage.getItem("token_editorial")) { 
        return <Navigate to="/login_editorial" />; 
    }

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fotoUrl, setFotoUrl] = useState(null);
    const [pais, setPais] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [sitioWeb, setSitioWeb] = useState("");
    const [cargando, setCargando] = useState(true);

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarEditorial = () => {
        fetch(`${baseUrl}/api/editorial/${theId}`)
            .then(response => response.json())
            .then(data => {
                const editorial = data.editorial || data;
                setEmail(editorial.email || "");
                setPassword(editorial.password || "");
                setNombre(editorial.nombre || "");
                setFotoUrl(editorial.image_url || null); 
                setPais(editorial.pais || "");
                setDescripcion(editorial.descripcion || "");
                setSitioWeb(editorial.sitio_web || "");
                setCargando(false);
            })
            .catch(err => {
                console.error("Error al cargar editorial:", err);
                setCargando(false);
            });
    }

    useEffect(() => {
        cargarEditorial();
    }, [theId]);

    const handleOpenCloudinary = () => {
        if (!window.cloudinary) {
            alert("Error: No se pudo cargar el script de Cloudinary.");
            return;
        }

        const myWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: "dklriashm",
                uploadPreset: "lectores_preset", 
                sources: ["local", "url", "camera"],
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1,
                showSkipCropButton: false
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    actualizarFotoEnDB(result.info.secure_url);
                }
            }
        );
        myWidget.open();
    };

    const actualizarFotoEnDB = async (urlCloudinary) => {
        try {
            const token = localStorage.getItem("token_editorial");
            const res = await fetch(`${baseUrl}/api/editorial/${theId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ image_url: urlCloudinary }),
            });

            if (res.ok) {
                setFotoUrl(urlCloudinary); 
                alert("¡Logo actualizado!");
                cargarEditorial();
            } else {
                alert("Error al guardar logo en BD");
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    const handleDeleteFoto = async () => {
        if (!confirm("¿Seguro que quieres quitar el logo?")) return;
        
        try {
            const token = localStorage.getItem("token_editorial");
            const res = await fetch(`${baseUrl}/api/editorial/${theId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ image_url: null }) // Simplemente limpiamos la URL
            });
            if (res.ok) {
                setFotoUrl(null);
                alert("Logo eliminado");
                cargarEditorial();
            }
        } catch (error) {
            console.error("Error al eliminar foto:", error);
        }
    };

    const updateData = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token_editorial");

        // IMPORTANTE: Eliminamos 'mode' y 'credentials' para evitar el bloqueo de GitHub Spaces
        const requestOptions = {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "pais": pais,
                "descripcion": descripcion,
                "sitio_web": sitioWeb
            })
        };

        fetch(`${baseUrl}/api/editorial/${theId}`, requestOptions)
            .then(response => {
                if (response.ok) {
                    alert("¡Editorial actualizada con éxito!");
                    navigate("/pagina_editorial");
                } else {
                    alert("Error al actualizar datos.");
                }
            })
            .catch(err => console.error("Error:", err));
    };

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}&background=24b0d9&color=fff&size=150`;

    if (cargando) return <div className="container mt-5 text-center"><div className="spinner-border text-info"></div><p>Cargando datos...</p></div>;

    return (
        <div className="container mt-5 mb-5">
            <h2 className="text-center fw-bold mb-4">Editar Perfil Editorial</h2>
            
            <div className="col-md-8 mx-auto card mb-4 p-4 text-center shadow-sm border-0 bg-light rounded-4">
                <div className="position-relative d-inline-block mx-auto">
                    <img
                        key={fotoUrl}
                        src={imagenFinal}
                        className="rounded-circle mb-3 shadow border border-4 border-white"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                        alt="Logo"
                    />
                </div>
                <div className="d-flex justify-content-center gap-2">
                    <button type="button" className="btn btn-sm btn-primary rounded-pill px-3" onClick={handleOpenCloudinary}>
                        <i className="fas fa-camera me-1"></i> Cambiar Logo
                    </button>
                    {fotoUrl && (
                        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={handleDeleteFoto}>
                            <i className="fas fa-trash me-1"></i> Quitar
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={updateData} className="col-md-8 mx-auto border-0 p-4 shadow bg-white rounded-4">
                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Email de contacto</label>
                    <input type="email" className="form-control bg-light border-0 py-2" value={email} disabled />
                </div>

                {/* <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Contraseña</label>
                    <input type="text" className="form-control border-0 bg-light py-2" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div> */}

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Nombre Público</label>
                    <input type="text" className="form-control border-0 bg-light py-2" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>

                <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase">País Sede</label>
                    <div className="input-group shadow-sm rounded-3 overflow-hidden">
                        <span className="input-group-text bg-light border-0 text-muted"><i className="fas fa-globe"></i></span>
                        <input 
                            value={pais} 
                            onChange={(e) => setPais(e.target.value)} 
                            type="text" 
                            className="form-control bg-light border-0 py-2" 
                            placeholder="Ej. Argentina" 
                            required 
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Descripción</label>
                    <textarea
                        className="form-control border-0 bg-light"
                        rows={3}
                        placeholder="Describe tu editorial, su historia y especialidades..."
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        maxLength={500}
                    />
                    <small className="text-muted">{descripcion.length}/500</small>
                </div>

                <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase">Sitio Web</label>
                    <input
                        type="url"
                        className="form-control border-0 bg-light py-2"
                        placeholder="https://www.tueditorial.com"
                        value={sitioWeb}
                        onChange={e => setSitioWeb(e.target.value)}
                    />
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <Link to="/pagina_editorial" className="btn btn-link text-muted text-decoration-none">Regresar</Link>
                    <button type="submit" className="btn btn-success rounded-pill px-5 shadow-sm">
                        <i className="fas fa-save me-2"></i>Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ActualizarEditorial;