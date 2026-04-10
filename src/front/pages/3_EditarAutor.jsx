import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarAutor = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pais, setPais] = useState("");
    const [fotoUrl, setFotoUrl] = useState(null);

    const { store, dispatch } = useGlobalReducer()
        
            if (!store.auth_admin) {
                            return <Navigate to="/login_admin" />;
                        }

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");


    const cargarAutor = useCallback(() => {
        fetch(`${baseUrl}/api/autor/${theId}`)
            .then(res => res.json())
            .then(data => {
                const autor = data.autor || data;

                setEmail(autor.email || "");
                setPassword(autor.password || "");
                setNombre(autor.nombre || "");
                setApellido(autor.apellido || "");
                setPais(autor.pais || "");
                setFotoUrl(autor.foto || null);
            })
            .catch(err => console.error("Error:", err));
    }, [theId, baseUrl]);

    useEffect(() => {
        cargarAutor();
    }, [cargarAutor]);

    const handleOpenCloudinary = () => {
        if (!window.cloudinary) {
            alert("Error: No se pudo cargar el script de Cloudinary.");
            return;
        }

        const myWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: "dklriashm",
                uploadPreset: "autores_preset",
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
        const res = await fetch(`${baseUrl}/api/update_foto_cloudinary/${theId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foto: urlCloudinary }),
        });

        if (res.ok) {
            alert("Foto actualizada con Cloudinary");
            cargarAutor();
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
            cargarAutor();
        }
    };

    const handleDeleteFoto = async () => {
        if (!confirm("¿Seguro que quieres quitar la foto de perfil?")) return;
        const res = await fetch(`${baseUrl}/api/delete_foto_cloudinary/${theId}`, {
            method: "DELETE"
        });
        if (res.ok) {
            setFotoUrl(null);
            cargarAutor();
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
            body: JSON.stringify({ email, password, nombre, apellido, pais })
        };

        fetch(`${baseUrl}/api/autor/${theId}`, requestOptions)
            .then(response => {
                if (response.ok) {
                    alert("¡Autor actualizado!");
                    navigate("/pagina_autor");
                }
            });
    };

    /* const imagenSrc = fotoUrl 
        ? (fotoUrl.startsWith("http") ? fotoUrl : `${baseUrl}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`)
        : `https://ui-avatars.com/api/?name=${nombre}+${apellido}`; */

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`;


    return (
        <div className="container mt-5">
            <h2>Editar autor: {nombre} {apellido}</h2>
            <div className="card mb-4 p-3 text-center border-0 shadow-sm">

                <img
                    src={imagenFinal}
                    className="rounded-circle mb-3 mx-auto border"
                    style={{ width: "180px", height: "180px", objectFit: "cover" }}
                    alt="Perfil"
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

            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="text" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">País</label>
                    <input type="text" className="form-control" value={pais} onChange={(e) => setPais(e.target.value)} />
                </div>
                <button type="button" className="btn btn-light" onClick={() => navigate(-1)}>Cancelar</button>
                <button type="submit" className="btn btn-success me-2">Actualizar autor</button>
            </form>
        </div>
    );
};

export default EditarAutor;