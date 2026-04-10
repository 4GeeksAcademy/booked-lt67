
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const SignUpAutor = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [pais, setPais] = useState('');
    const [perfilesEncontrados, setPerfilesEncontrados] = useState([]);
    const [autorIdSeleccionado, setAutorIdSeleccionado] = useState(null);

    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate();

    if (store.auth_autor === true) {
        return <Navigate to="/pagina_autor" />;
    }

    const buscarAutorExistente = async () => {
        if (nombre.trim() && apellido.trim()) {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/autor?nombre=${nombre}&apellido=${apellido}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Datos recibidos:", data);
                    
                    const huérfanos = data.filter(a => !a.is_verified);
                    setPerfilesEncontrados(huérfanos);
        }
    }};

    function sendData(e) {
        e.preventDefault()

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    "email": email,
                    "password": password,
                    "nombre": nombre,
                    "apellido": apellido,
                    "pais": pais,
                    "reclamar_id": autorIdSeleccionado
                }
            )
        };

        fetch(import.meta.env.VITE_BACKEND_URL + 'api/signup_autor', requestOptions)
        .then(response => {
            if (!response.ok) throw new Error("Error en el registro");
            return response.json();
        })
        .then(data => {
            localStorage.setItem("autor_id", data.autor_id);
            localStorage.setItem("token_autor", data.access_token);
            localStorage.setItem("nombre_autor", data.nombre);
            localStorage.setItem("horaLoginAutor", new Date().getTime());

            dispatch({ type: "set_auth_autor", payload: true }); 
            
            console.log("Registro exitoso, redirigiendo...");
            navigate("/pagina_autor");
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Hubo un error al procesar el registro");
        });
    }

    
    return (
        <div className="container mt-5">
            <form className="w-50 mx-auto" onSubmit={sendData}>
                <h2 className="text-center mb-4">Sing Up</h2>

                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        value={nombre} onChange={(e) => setNombre(e.target.value)}
                        type="text" className="form-control" placeholder="Pon tu nombre"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input
                        value={apellido} 
                        onChange={(e) => setApellido(e.target.value)}
                        onBlur={buscarAutorExistente} 
                        type="text" className="form-control" placeholder="Pon tu apellido"
                        required
                    />
                </div>

                {perfilesEncontrados.length > 0 && !autorIdSeleccionado && (
                    <div className="alert alert-info border-primary animate__animated animate__fadeIn">
                        <p className="mb-2"><strong>¿Eres tú?</strong> Hemos encontrado estos perfiles:</p>
                        {perfilesEncontrados.map(a => (
                            <div key={a.id} className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small">{a.nombre} {a.apellido}</span>
                                <button 
                                    type="button" 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setAutorIdSeleccionado(a.id)}
                                >
                                    Es mi perfil
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {autorIdSeleccionado && (
                    <div className="alert alert-success d-flex justify-content-between align-items-center">
                        <span>Perfil seleccionado (ID: {autorIdSeleccionado})</span>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-link text-danger" 
                            onClick={() => {
                                setAutorIdSeleccionado(null);
                                setPerfilesEncontrados([]); // Limpiamos para que pueda buscar de nuevo si se equivocó
                            }}
                        >
                            Cambiar
                        </button>
                    </div>
                )}


                <div className="mb-3">
                    <label className="form-label">Pais</label>
                    <input
                        value={pais} onChange={(e) => setPais(e.target.value)}
                        type="text" className="form-control" placeholder="Pon tu pais"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        type="email" className="form-control" placeholder="email"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        type="password" className="form-control" placeholder="password"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Ingresar
                </button>
            </form>
        </div>
    )
}

export default SignUpAutor