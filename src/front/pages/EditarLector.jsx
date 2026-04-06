import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarLector = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    // Estados individuales para el formulario
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [paisdondereside, setPaisDondeReside] = useState("");
    const [fotoUrl, setFotoUrl] = useState(null);

    // Protección de ruta para Admin
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    // Cargar datos del lector
    const cargarLector = useCallback(() => {
        fetch(`${baseUrl}/api/lector/${theId}`)
            .then(res => res.json())
            .then(data => {
                const lector = data.lector || data;
                setEmail(lector.email || "");
                setUsername(lector.username || "");
                setNombre(lector.nombre || "");
                setApellido(lector.apellido || "");
                // Manejamos las dos posibles variantes del nombre del campo en el JSON
                setPaisDondeReside(lector.pais_donde_reside || lector["pais donde reside"] || "");
                setFotoUrl(lector.foto_url || null);
            })
            .catch(err => console.error("Error cargando lector:", err));
    }, [theId, baseUrl]);

    useEffect(() => {
        cargarLector();
    }, [cargarLector]);

    // Lógica de Cloudinary (Widget)
    const handleOpenCloudinary = () => {
        if (!window.cloudinary) {
            alert("Error: No se pudo cargar el script de Cloudinary.");
            return;
        }

        const myWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: "dklriashm",
                uploadPreset: "lectores_preset", // Preset específico para lectores
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
            body: JSON.stringify({ foto_url: urlCloudinary }), // Usamos foto_url como espera el backend
        });

        if (res.ok) {
            alert("Foto del lector actualizada con éxito");
            cargarLector();
        }
    };

    const handleUpdateFoto = async (nuevaFoto) => {
        if (!nuevaFoto) return;
        const formData = new FormData();
        formData.append("foto", nuevaFoto);

        const res = await fetch(`${baseUrl}/api/update_foto/${theId}`, {
            method: "PUT",
            body: formData,
        });

        if (res.ok) {
            alert("Foto actualizada");
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

    const handleDeleteFotoDB = async () => {
        if (!confirm("¿Borrar foto?")) return;
        const res = await fetch(`${baseUrl}/api/delete_foto/${theId}`, { method: "DELETE" });
        if (res.ok) {
            alert("Foto borrada");
            setFotoUrl(null);
        }
    };


    const updateData = (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                username, 
                nombre, 
                apellido, 
                "pais donde reside": paisdondereside 
            })
        };

        fetch(`${baseUrl}/api/lector/${theId}`, requestOptions)
            .then(response => {
                if (response.ok) {
                    alert("¡Lector actualizado!");
                    navigate("/lector");
                }
            });
    };
    /* const imagenSrc = fotoUrl 
        ? (fotoUrl.startsWith("http") ? fotoUrl : `${baseUrl}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`)
        : `https://ui-avatars.com/api/?name=${nombre}+${apellido}`; */

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`;

    return (
        <div className="container mt-5">
            <h2>Editar lector: {nombre} {apellido}</h2>
            
            
            <div className="card mb-4 p-3 text-center border-0 shadow-sm">
                <img
                    src={imagenFinal}
                    className="rounded-circle mb-3 mx-auto border"
                    style={{ width: "180px", height: "180px", objectFit: "cover" }}
                    alt="Perfil Lector"
                />
                <div className="d-flex justify-content-center gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleOpenCloudinary}
                    >
                        {fotoUrl ? "Cambiar Foto" : "Agregar Foto"} 
                    </button>

                    {fotoUrl && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleDeleteFoto}
                        >
                            Eliminar Foto
                        </button>
                    )}
                </div>
            {/* <div className="d-flex justify-content-center gap-2 m-2">
                    <label className="btn btn-sm btn-outline-primary">
                        Cambiar Foto
                        <input type="file" hidden onChange={(e) => handleUpdateFoto(e.target.files[0])} />
                    </label>
                    {fotoUrl && (
                        <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteFotoDB}>
                            Borrar Foto
                        </button>
                    )}
                </div> */}

            </div>

            {/* Formulario de Datos */}
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm bg-white rounded">
                <div className="mb-3">
                    <label className="form-label fw-bold small">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold small">Username</label>
                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold small">Nombre</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold small">Apellido</label>
                    <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold small">País donde reside</label>
                    <input type="text" className="form-control" value={paisdondereside} onChange={(e) => setPaisDondeReside(e.target.value)} />
                </div>
                
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success flex-grow-1">Actualizar Lector</button>
                    <button type="button" className="btn btn-light border" onClick={() => navigate("/lector")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default EditarLector;