import React, { useState } from "react";

export const BookSummary = ({ title }) => {
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerateSummary = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.VITE_BACKEND_URL}/api/ai-summary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title })
            });
            const data = await response.json();
            setSummary(data.summary);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-summary-container p-3 border rounded shadow-sm">
            <h5>Resumen con IA</h5>
            {summary ? (
                <p className="fst-italic">"{summary}"</p>
            ) : (
                <p>¿Quieres un resumen rápido de este libro?</p>
            )}
            
            <button 
                className="btn btn-primary" 
                onClick={handleGenerateSummary}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Analizando...
                    </>
                ) : "Generar Resumen"}
            </button>
        </div>
    );
};