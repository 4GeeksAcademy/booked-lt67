import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NuevoAutor = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [pais, setPais] = useState("")
    const [foto, setFoto] = useState(null);

    function sendData(e) {
        e.preventDefault()
        console.log("send data")
        console.log(email, password, nombre, apellido, pais)

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "apellido": apellido,
                "pais": pais,
            })
        };
        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor/", requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (foto && data.autor && data.autor.id) {
                    subirFoto(data.autor.id);
                } else {
                    navigate("/autor");
                }
            })
    }

    const subirFoto = (autorId) => {
        const formData = new FormData();
        formData.append("foto", foto);

        fetch(import.meta.env.VITE_BACKEND_URL + "api/upload_foto/" + autorId, {
            method: "POST",
            body: formData,
        })
            .then(response => {
                if (response.ok) {
                    console.log("Foto subida");
                    navigate("/autor");
                }
            })
            .catch(err => console.error("Error al subir foto:", err));
    };
;


return (
    <>
        <div className="container mt-5">
            <h2>Registro de autor Nueva</h2>
            <form onSubmit={sendData} className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input type="text" name="apellido" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">País</label>
                    <input type="text" name="pais donde reside" className="form-control" value={pais} onChange={(e) => setPais(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Sube una foto</label>
                    <input type="file" className="form-control" onChange={(e) => setFoto(e.target.files[0])} />
                </div>

                <button type="submit" className="btn btn-primary">Crear autor</button>
            </form>
        </div>
    </>
);
};

export default NuevoAutor