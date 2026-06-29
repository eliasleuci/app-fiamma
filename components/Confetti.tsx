"use client";

import { useEffect, useState } from "react";

export default function Confetti() {
  const [show, setShow] = useState(true);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generar 120 papelitos con posiciones y tiempos aleatorios
    const newParticles = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Posición horizontal (0 a 100vw)
      animationDuration: Math.random() * 3 + 2, // Caen entre 2 y 5 segundos
      animationDelay: Math.random() * 4, // Retraso de 0 a 4 segundos (para flujo constante)
      color: Math.random() > 0.5 ? "#75AADB" : "#FFFFFF", // Celeste o Blanco
      size: Math.random() * 6 + 6, // Tamaño entre 6px y 12px
      rotation: Math.random() * 360, // Rotación inicial
    }));
    
    setParticles(newParticles);

    // Ocultar todo después de 9 segundos
    const timer = setTimeout(() => {
      setShow(false);
    }, 9000); 

    return () => clearTimeout(timer);
  }, []);

  if (!show || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left + "vw",
            top: "-10vh",
            width: p.size + "px",
            height: (p.size * 1.5) + "px",
            backgroundColor: p.color,
            opacity: 0.9,
            transform: "rotate(" + p.rotation + "deg)",
            animation: "confetti-fall " + p.animationDuration + "s linear " + p.animationDelay + "s forwards",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)", 
            borderRadius: "1px"
          }}
        />
      ))}
    </div>
  );
}
