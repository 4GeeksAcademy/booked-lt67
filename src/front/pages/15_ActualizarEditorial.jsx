import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SelectorUbicacion from "./24_Georreferenciacion";

const ActualizarEditorial = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    if (!store.auth_editorial) { return <Navigate to="/login_editorial" />; }

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fotoUrl, setFotoUrl] = useState(null);
    
    const [ubicacion, setUbicacion] = useState(null);
    const [cargando, setCargando] = useState(true);

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarEditorial = () => {
        fetch(`${baseUrl}/api/editorial/${theId}`)
            .then(response => response.json())
            .then(data => {
                const editorial = data.editorial || data;
                // Fallbacks || "" para evitar errores de inputs controlados
                setEmail(editorial.email || "");
                setPassword(editorial.password || "");
                setNombre(editorial.nombre || "");
                setFotoUrl(editorial.foto_url || null);

                if (editorial.latitud && editorial.longitud) {
                    setUbicacion({ lat: editorial.latitud, lng: editorial.longitud });
                } else {
                    setUbicacion({ lat: -33.4489, lng: -70.6693 }); 
                }
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
        const res = await fetch(`${baseUrl}/api/update_foto_editorial_cloudinary/${theId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foto_url: urlCloudinary }), 
        });

        if (res.ok) {
            setFotoUrl(urlCloudinary); 
            alert("Logo actualizado con éxito");
            cargarEditorial();
        }
    };

    const handleDeleteFoto = async () => {
        if (!confirm("¿Seguro que quieres quitar el logo?")) return;
        const res = await fetch(`${baseUrl}/api/delete_foto_editorial_cloudinary/${theId}`, {
            method: "DELETE"
        });
        if (res.ok) {
            setFotoUrl(null);
            cargarEditorial();
        }
    };

    const updateData = (e) => {
        e.preventDefault();

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "latitud": ubicacion.lat,
                "longitud": ubicacion.lng
            })
        };

        fetch(`${baseUrl}/api/editorial/${theId}`, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("El email ya está en uso");
                }
                if (response.ok) {
                    alert("¡Editorial actualizada!");
                    navigate("/pagina_editorial");
                }
            })
            .catch(err => alert(err.message));
    };

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}&background=random&size=150`;

    if (cargando) return <div className="container mt-5 text-center">Cargando datos...</div>;

    return (
        <div className="container mt-5 mb-5">
            <h2 className="text-center mb-4">Editar Perfil Editorial</h2>
            
            {/* LOGO */}
            <div className="col-md-8 mx-auto card mb-4 p-4 text-center shadow-sm border-0 bg-light">
                <img
                    key={fotoUrl}
                    src={imagenFinal}
                    className="rounded-circle mb-3 mx-auto shadow"
                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "4px solid white" }}
                    alt="Logo"
                />
                <div className="d-flex justify-content-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleOpenCloudinary}>
                        <i className="fas fa-camera me-1"></i> Cambiar Logo
                    </button>
                    {fotoUrl && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDeleteFoto}>
                            <i className="fas fa-trash me-1"></i> Eliminar
                        </button>
                    )}
                </div>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={updateData} className="col-md-8 mx-auto border p-4 shadow-sm bg-white rounded">
                
                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Email</label>
                    <input type="email" className="form-control bg-light" value={email} disabled />
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Password</label>
                    <input type="text" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Nombre de la Editorial</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>

                {/* MAPA (Sustituye al campo País) */}
                <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase">Ubicación de la Sede</label>
                    {!cargando && ubicacion && (
                        <SelectorUbicacion 
                            key={`${ubicacion.lat}-${ubicacion.lng}`} 
                            ubicacionInicial={ubicacion} 
                            onLocationSelect={setUbicacion} 
                        />
                    )}
                    <div className="form-text mt-2 text-primary">
                        <i className="fas fa-info-circle me-1"></i>
                        Mueve el marcador para actualizar la dirección exacta de la sede.
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Link to={"/pagina_editorial/"} className="btn btn-secondary">Cancelar</Link>
                    <button type="submit" className="btn btn-success px-4">Guardar Cambios</button>
                </div>
            </form>
        </div>
    );
};

export default ActualizarEditorial;