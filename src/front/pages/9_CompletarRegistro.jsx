import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SelectorUbicacion from "../pages/24_Georreferenciacion"; 

const CompletarRegistroLector = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { store, dispatch } = useGlobalReducer();

    // Datos del Paso 1 (Signup inicial)
    const { email, username, password } = location.state || {};

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null });
    const [cargando, setCargando] = useState(false);

    // Protección de ruta: Si no hay datos del Paso 1, regresamos al inicio
    useEffect(() => {
        if (!email || !username || !password) {
            navigate("/signup_lector");
        }
    }, [email, username, password, navigate]);

    if (store.auth_lector === true) {
        return <Navigate to="/pagina_lector" />;
    }

    // Función para procesar el registro final
    const sendData = (e) => {
        if (e) e.preventDefault(); 
        setCargando(true);
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "username": username,
                "password": password,
                "nombre": nombre || null,
                "apellido": apellido || null,
                "latitud": ubicacion.lat,
                "longitud": ubicacion.lng
                // Se eliminó 'pais_donde_reside' para usar solo la locación del mapa
            })
        };

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        fetch(`${baseUrl}/api/signup_lector`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error al finalizar el registro");
                return response.json();
            })
            .then(data => {
                alert("¡Perfil completado! Bienvenido a Booked.");
                
                // Guardamos credenciales para persistencia
                localStorage.setItem("token_lector", data.access_token);
                localStorage.setItem("lector_id", data.lector_id);
                localStorage.setItem("horaLoginLector", new Date().getTime());

                dispatch({
                    type: "set_auth_lector",
                    payload: { 
                        auth: true, 
                        id: data.lector_id, 
                        nombre: data.nombre || username 
                    }
                });
                
                navigate("/pagina_lector");
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Hubo un problema al crear tu cuenta.");
                setCargando(false);
            });
    }

    if (!email) return null; 

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "900px" }}>
                    <div className="row g-0">
                        
                        {/* Panel Lateral Informativo */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative"
                            style={{ backgroundColor: "#1e99bd" }}
                        >
                            <div className="position-relative z-index-1">
                                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '70px', height: '70px' }}>
                                    <i className="fas fa-map-marked-alt fa-2x"></i>
                                </div>
                                <h3 className="fw-bold mb-3">Tu ubicación</h3>
                                <p className="small opacity-75">
                                    Usa el mapa para decirnos desde dónde lees. Esto ayuda a conectar con autores de tu región.
                                </p>
                            </div>
                        </div>

                        {/* Formulario de Perfil */}
                        <div className="col-lg-8 bg-white p-4 p-md-5">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="fw-bold text-dark h4 mb-0">Personaliza tu perfil</h2>
                                    <p className="text-muted small mb-0">Paso opcional antes de entrar</p>
                                </div>
                                <span className="badge bg-success rounded-pill px-3 py-2">Paso 2 de 2</span>
                            </div>
                            
                            <form onSubmit={sendData}>
                                <div className="row g-3">
                                    {/* Nombre */}
                                    <div className="col-md-6 mb-1">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Nombre</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-3"><i className="fas fa-user"></i></span>
                                            <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" className="form-control bg-light border-0 py-2 ps-2" placeholder="Opcional" />
                                        </div>
                                    </div>

                                    {/* Apellido */}
                                    <div className="col-md-6 mb-1">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Apellido</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <input value={apellido} onChange={(e) => setApellido(e.target.value)} type="text" className="form-control bg-light border-0 py-2 px-4" placeholder="Opcional" />
                                        </div>
                                    </div>

                                    {/* Selector de Ubicación */}
                                    <div className="col-12 mt-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-2 d-flex align-items-center">
                                            <i className="fas fa-crosshairs text-info-booked me-2"></i>
                                            Marca tu punto en el mapa
                                        </label>
                                        <div className="rounded-4 overflow-hidden border shadow-sm bg-light p-1" style={{ height: "250px" }}>
                                            <SelectorUbicacion onLocationSelect={setUbicacion} />
                                        </div>
                                        <p className="text-muted text-center mt-2" style={{ fontSize: '0.75rem' }}>
                                            Tu privacidad es importante. Solo guardamos coordenadas generales.
                                        </p>
                                    </div>
                                </div>

                                <div className="d-grid gap-3 mt-4">
                                    <button 
                                        type="submit" 
                                        className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm py-3"
                                        disabled={cargando}
                                    >
                                        {cargando ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> Creando Perfil...</>
                                        ) : "LISTO, ¡EMPECEMOS!"}
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={() => sendData()} 
                                        className="btn btn-link text-muted btn-sm"
                                        disabled={cargando}
                                    >
                                        Prefiero hacerlo más tarde
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletarRegistroLector;