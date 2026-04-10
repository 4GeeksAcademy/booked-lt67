import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ActualizarAutor = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pais, setPais] = useState("");
    const [fotoUrl, setFotoUrl] = useState(null)

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    const { store, dispatch } = useGlobalReducer()

    if (!store.auth_autor) {
        return <Navigate to="/login_autor" />;
    }

    const cargarAutor = () => {
        fetch(`${baseUrl}/api/autor/${theId}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                const autor = data.autor || data;
                setEmail(autor.email || "");
                setPassword(autor.password || "");
                setNombre(autor.nombre || "");
                setApellido(autor.apellido || "");
                setPais(autor.pais || "");
                setFotoUrl(autor.foto || null);
            })
    }



    useEffect(() => {
        cargarAutor();
    }, [theId]);

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
        const formData = new FormData();
        formData.append("foto", nuevaFoto);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/update_foto/${theId}`, {
            method: "PUT",
            body: formData,
        });

        if (response.ok) {
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
        if (!confirm("¿Estás seguro?")) return;

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/delete_foto/${theId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Foto eliminada");
            setFotoUrl(null);
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
                "apellido": apellido,
                "pais": pais,

            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese username o email ya está en uso por otra autor");
                }
                if (response.ok) {
                    alert("¡Autor actualizado con éxito!");
                    navigate("/pagina_autor");
                }
            });


    };

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`;

    return (
        <div className="container mt-5">
            <h2>Editar Autor {nombre} {apellido}</h2>
            <div className="card mb-4 p-3 text-center">
                <img
                    src={imagenFinal}
                    className="rounded-circle mb-3 mx-auto"
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
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

                {/* <div className="d-flex justify-content-center gap-2 m-3">
                    <label className="btn btn-sm btn-outline-primary">
                        Cambiar Foto
                        <input type="file" hidden onChange={(e) => handleUpdateFoto(e.target.files[0])} />
                    </label>
                    {fotoUrl && (
                        <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteFoto}>
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

                <button type="submit" className="btn btn-success me-2">Actualizar Autor</button>
            </form>
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_autor/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default ActualizarAutor;