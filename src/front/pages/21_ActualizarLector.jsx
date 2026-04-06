import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


const ActualizarLector = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer()



    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [paisdondereside, setPaisDondeReside] = useState("");
    const [fotoUrl, setFotoUrl] = useState(null)

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    if (!store.auth_lector) { return <Navigate to="/login_lector" />; }


    const cargarLector = () => {
        fetch(`${baseUrl}/api/lector/${theId}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                const lector = data.lector || data;
                setEmail(lector.email || "");
                setNombre(lector.nombre || "");
                setApellido(lector.apellido || "");
                setPaisDondeReside(lector.paisdondereside || "");
                setFotoUrl(lector.foto_url || null);
            })
    }


    useEffect(() => {
        cargarLector();
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
        alert("Foto actualizada con Cloudinary");
        cargarLector(); 
    }
};

    const handleUpdateFoto = async (nuevaFoto) => {
        const formData = new FormData();
        formData.append("foto", nuevaFoto);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/update_foto_lector/${theId}`, {
            method: "PUT",
            body: formData,
        });

        if (response.ok) {
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
        if (!confirm("¿Estás seguro?")) return;

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/delete_foto_lector/${theId}`, {
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
                "username": username,
                "nombre": nombre,
                "apellido": apellido,
                "pais donde reside": paisdondereside,

            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese username o email ya está en uso por otra lector");
                }
                if (response.ok) {
                    alert("¡Lector actualizado con éxito!");
                    navigate("/pagina_lector");
                }
            });


    };

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`;


    return (
        <div className="container mt-5">
            <h2>Editar Lector {nombre} {apellido}</h2>
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
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
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
                    <label className="form-label">País donde reside</label>
                    <input type="text" className="form-control" value={paisdondereside} onChange={(e) => setPaisDondeReside(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-success me-2">Actualizar Lector</button>
            </form>
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_lector/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default ActualizarLector;