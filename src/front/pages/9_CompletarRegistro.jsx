import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SelectorUbicacion from "../pages/24_Georreferenciacion"; // Ajusta la ruta si es necesario

const CompletarRegistroLector = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { store, dispatch } = useGlobalReducer();

    // Recuperamos los datos del Paso 1
    const { email, username, password } = location.state || {};

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [pais, setPais] = useState('');
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null });
    const [cargando, setCargando] = useState(false);

    // Protección: Si alguien entra a esta ruta sin pasar por el Paso 1, lo devolvemos
    useEffect(() => {
        if (!email || !username || !password) {
            navigate("/signup_lector");
        }
    }, [email, username, password, navigate]);

    if (store.auth_lector === true) {
        return <Navigate to="/pagina_lector" />;
    }

    function sendData(e) {
        e.preventDefault();
        setCargando(true);
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "username": username,
                "password": password,
                "nombre": nombre,
                "apellido": apellido,
                "pais": pais,
                "latitud": ubicacion.lat,
                "longitud": ubicacion.lng
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + '/api/signup_lector', requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error al crear el lector");
                return response.json();
            })
            .then(data => {
                alert("¡Bienvenido a Booked! Cuenta creada con éxito.");
                localStorage.setItem("token_lector", data.access_token);
                localStorage.setItem("lector_id", data.lector_id);
                dispatch({
                    type: "set_auth_lector",
                    payload: { auth: true, id: data.lector_id, nombre: data.nombre }
                });
            })
            .catch(err => {
                console.error("Error:", err);
                alert("No se pudo completar el registro.");
                setCargando(false);
            });
    }

    // Retorno de seguridad mientras redirige si no hay datos
    if (!email) return null; 

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">
                        
                        {/* PANEL IZQUIERDO: Paso 2 */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#1e99bd" }} // Un azul un poquito más oscuro para denotar avance
                        >
                            <i className="fas fa-user-check position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                    <i className="fas fa-check-double fa-2x"></i>
                                </div>
                                <h3 className="fw-bold mb-3">¡Casi listos!</h3>
                                <p className="small opacity-75 mb-4">
                                    Necesitamos un par de detalles más para personalizar tu experiencia en Booked.
                                </p>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario Paso 2 */}
                        <div className="col-lg-8 bg-white p-4 p-md-5">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-end flex-wrap gap-2">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Completa tu perfil</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Paso final</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Link to="/signup_lector" className="btn btn-sm btn-light border rounded-pill px-3 shadow-sm text-muted">
                                        <i className="fas fa-arrow-left me-1"></i> Volver
                                    </Link>
                                    <span className="badge bg-success border rounded-pill px-3 py-2">Paso 2 de 2</span>
                                </div>
                            </div>
                            
                            <form onSubmit={sendData}>
                                <div className="row g-3">
                                    {/* Nombre */}
                                    <div className="col-md-6 mb-1">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Nombre</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-3"><i className="fas fa-user"></i></span>
                                            <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" className="form-control bg-light border-0 py-2 ps-2" placeholder="Juan" required />
                                        </div>
                                    </div>

                                    {/* Apellido */}
                                    <div className="col-md-6 mb-1">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Apellido</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <input value={apellido} onChange={(e) => setApellido(e.target.value)} type="text" className="form-control bg-light border-0 py-2 px-4" placeholder="Pérez" required />
                                        </div>
                                    </div>

                                    {/* País */}
                                    <div className="col-md-12 mb-1 mt-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">País de Residencia</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-4"><i className="fas fa-globe-americas"></i></span>
                                            <input value={pais} onChange={(e) => setPais(e.target.value)} type="text" className="form-control bg-light border-0 py-2 ps-2" placeholder="Ej. Chile" required />
                                        </div>
                                    </div>

                                    {/* Mapa de Ubicación */}
                                    <div className="col-12 mt-3 mb-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-2 d-flex align-items-center">
                                            <i className="fas fa-map-marker-alt text-info-booked me-2"></i>
                                            Tu Ubicación <span className="badge bg-secondary ms-2 fw-normal" style={{ fontSize: '0.65rem' }}>Opcional pero recomendado</span>
                                        </label>
                                        <p className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>Ayuda a autores y editoriales a saber desde dónde los lees marcando un punto en el mapa.</p>
                                        <div className="rounded-4 overflow-hidden border shadow-sm bg-light p-1" style={{ height: "250px" }}>
                                            <SelectorUbicacion onLocationSelect={setUbicacion} />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid mt-2">
                                    <button 
                                        type="submit" 
                                        className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm"
                                        disabled={cargando}
                                    >
                                        {cargando ? (
                                            <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span> Creando cuenta...</>
                                        ) : (
                                            <>FINALIZAR Y CREAR CUENTA</>
                                        )}
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