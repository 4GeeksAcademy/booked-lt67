import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

import SelectorUbicacion from "./24_Georreferenciacion"; 

const ActualizarLector = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    if (!store.auth_lector) { return <Navigate to="/login_lector" />; }

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [paisdondereside, setPaisDondeReside] = useState("");
    const [biografia, setBiografia] = useState("");
    const [generosFavoritos, setGenerosFavoritos] = useState("");
    const [fotoUrl, setFotoUrl] = useState(null);

    // ESTADOS PARA EL MAPA
    const [ubicacion, setUbicacion] = useState(null);
    const [cargando, setCargando] = useState(true);

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarLector = () => {
        fetch(`${baseUrl}/api/lector/${theId}`)
            .then(response => response.json())
            .then(data => {
                const lector = data.lector || data;
                setEmail(lector.email || "");
                setUsername(lector.username || ""); // Corregido: antes no se llenaba en el GET
                setNombre(lector.nombre || "");
                setApellido(lector.apellido || "");
                setPaisDondeReside(lector.pais_donde_reside || lector.paisdondereside || "");
                setFotoUrl(lector.foto_url || null);
                setBiografia(lector.biografia || "");
                setGenerosFavoritos(lector.generos_favoritos || "");

                // Cargamos las coordenadas actuales del usuario para el mapa
                if (lector.latitud && lector.longitud) {
                    setUbicacion({ lat: lector.latitud, lng: lector.longitud });
                } else {
                    setUbicacion({ lat: -33.4489, lng: -70.6693 }); // Santiago por defecto
                }
                
                setCargando(false);
            })
            .catch(err => {
                console.error("Error al cargar lector:", err);
                setCargando(false);
            });
    }

    useEffect(() => {
        cargarLector();
    }, [theId]);

    // ---- LÓGICA DE CLOUDINARY (SIN CAMBIOS) ----
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
                    console.log("Imagen subida:", result.info.secure_url);
                    actualizarFotoEnDB(result.info.secure_url);
                }
            }
        );
        myWidget.open();
    };

    const actualizarFotoEnDB = async (urlCloudinary) => {
        const res = await fetch(`${baseUrl}/api/update_foto_lector_cloudinary/${theId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foto_url: urlCloudinary }), 
        });

        if (res.ok) {
            setFotoUrl(urlCloudinary); 
            alert("Foto actualizada con éxito");
            cargarLector();
        }
    };

    const handleDeleteFoto = async () => {
        if (!confirm("¿Seguro que quieres quitar la foto de perfil?")) return;
        const res = await fetch(`${baseUrl}/api/delete_foto_lector_cloudinary/${theId}`, {
            method: "DELETE"
        });
        if (res.ok) {
            setFotoUrl(null);
            cargarLector();
        }
    };
    // ---------------------------------------------

    const updateData = (e) => {
        e.preventDefault();

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // NO enviamos email para que no se sobreescriba accidentalmente
                "username": username,
                "nombre": nombre,
                "apellido": apellido,
                "pais donde reside": paisdondereside,
                "biografia": biografia,
                "generos_favoritos": generosFavoritos,
                "latitud": ubicacion.lat,
                "longitud": ubicacion.lng
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese username ya está en uso por otro lector");
                }
                if (response.ok) {
                    alert("¡Lector actualizado con éxito!");
                    navigate("/pagina_lector");
                }
            })
            .catch(err => alert(err.message));
    };

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`;

    if (cargando) return <div className="container mt-5 text-center">Cargando datos del lector...</div>;

    return (
        <div className="container mt-5 mb-5">
            <h2 className="text-center mb-4">Editar Perfil de {nombre} {apellido}</h2>
            
            {/* SECCIÓN DE FOTO DE PERFIL */}
            <div className="col-md-8 mx-auto card mb-4 p-4 text-center shadow-sm border-0 bg-light">
                <img
                    src={imagenFinal}
                    className="rounded-circle mb-3 mx-auto shadow"
                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "4px solid white" }}
                />
                <div className="d-flex justify-content-center gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleOpenCloudinary}
                    >
                        <i className="fas fa-camera me-1"></i>
                        {fotoUrl ? "Cambiar Foto" : "Agregar Foto"}
                    </button>

                    {fotoUrl && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleDeleteFoto}
                        >
                            <i className="fas fa-trash me-1"></i> Eliminar Foto
                        </button>
                    )}
                </div>
            </div>

            {/* FORMULARIO DE DATOS Y MAPA */}
            <form onSubmit={updateData} className="col-md-8 mx-auto border p-4 shadow-sm bg-white rounded">
                
                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Email</label>
                    {/* INPUT DE EMAIL BLOQUEADO */}
                    <input type="email" className="form-control bg-light" value={email} disabled title="No puedes cambiar tu correo electrónico"/>
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Username</label>
                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small fw-bold text-uppercase">Nombre</label>
                        <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required/>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small fw-bold text-uppercase">Apellido</label>
                        <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} required/>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">País donde reside</label>
                    <input type="text" className="form-control" value={paisdondereside} onChange={(e) => setPaisDondeReside(e.target.value)} required/>
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Biografía</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Cuéntale a la comunidad quién eres como lector..."
                        value={biografia}
                        onChange={e => setBiografia(e.target.value)}
                        maxLength={500}
                    />
                    <small className="text-muted">{biografia.length}/500</small>
                </div>

                <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase">Géneros favoritos</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Fantasía, Terror, Romance (separados por coma)"
                        value={generosFavoritos}
                        onChange={e => setGenerosFavoritos(e.target.value)}
                    />
                    <small className="text-muted">Separa los géneros con comas</small>
                </div>

                {/* INTEGRACIÓN DEL MAPA */}
                {!cargando && ubicacion && (
                    <div className="mb-4">
                        <label className="form-label text-muted small fw-bold text-uppercase">Mi Ubicación</label>
                        <SelectorUbicacion 
                            key={`${ubicacion.lat}-${ubicacion.lng}`} // TRUCO CLAVE: Forzar re-renderizado si cambian las coordenadas base
                            ubicacionInicial={ubicacion} 
                            onLocationSelect={setUbicacion} 
                        />
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Link to={"/pagina_lector/"} className="btn btn-secondary">Cancelar</Link>
                    <button type="submit" className="btn btn-success">Actualizar Mis Datos</button>
                </div>
            </form>
        </div>
    );
};

export default ActualizarLector;