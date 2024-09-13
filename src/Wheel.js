import React, { useState, useEffect, useRef } from 'react';
import rouletteSound from './roulette_spin.mp3';
import winnerSound from './winner.mp3';

const Wheel = () => {
    const [items, setItems] = useState(['Option 1', 'Option 2', 'Option 3']);
    const [newOptions, setNewOptions] = useState('');
    const [winner, setWinner] = useState('NONE');
    const [showWinner, setShowWinner] = useState(false);
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const winnerAudioRef = useRef(null);
    const animationRef = useRef();
    const [currentDeg, setCurrentDeg] = useState(0);
    const [speed, setSpeed] = useState(0);
    //Constante para decidir un ganador
    const desiredWinner = '';

    useEffect(() => {
        const drawWheel = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = width / 2;

            ctx.clearRect(0, 0, width, height);

            items.forEach((item, i) => {
                const colors = ['#ff6347', '#ffd700', '#20b2aa', '#9370db', '#ff7f50', '#7fff00', '#40e0d0', '#f0e68c', '#87ceeb'];
                let startDeg = (360 / items.length) * i + currentDeg;
                let endDeg = startDeg + (360 / items.length);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, (Math.PI / 180) * startDeg, (Math.PI / 180) * endDeg);
                ctx.closePath();
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((Math.PI / 180) * ((startDeg + endDeg) / 2));
                ctx.textAlign = "right";
                ctx.fillStyle = "#fff";
                ctx.font = '16px Arial';
                ctx.fillText(item, radius - 10, 0);
                ctx.restore();
            });
        };

        drawWheel();
    }, [currentDeg, items]);

    useEffect(() => {
        if (speed <= 0) {
            if (showWinner) {
                winnerAudioRef.current.volume = 0.1;
                winnerAudioRef.current.play();
                setTimeout(() => setShowWinner(false), 4000);
                
            }
            audioRef.current.load();
            
            return;
        }

        const frame = () => {
            setCurrentDeg(prev => (prev + speed) % 360);
            setSpeed(prev => prev * 0.99);
            if (speed < 0.05) {
                setSpeed(0);
                const winningIndex = Math.floor(((360 - currentDeg) / (360 / items.length)) % items.length);
                setWinner(items[winningIndex]);
                setShowWinner(true);
                cancelAnimationFrame(animationRef.current);
            } else {
                animationRef.current = requestAnimationFrame(frame);
            }
        };

        animationRef.current = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(animationRef.current);
    }, [speed, showWinner, currentDeg, items]);

    const spin = () => {
        if (!speed) {
            setShowWinner(false);
            setSpeed(Math.random() * 10 + 20); // Establece una velocidad inicial para la animación de giro
            audioRef.current.volume = 0.1;
            audioRef.current.play();
    
            setTimeout(() => {
                if (items.includes(desiredWinner)) {
                    const desiredIndex = items.indexOf(desiredWinner);
                    const degreesPerItem = 360 / items.length;
    
                    // Calcular la rotación necesaria para que el valor deseado esté en la parte superior
                    const rotation = 90 - (desiredIndex * degreesPerItem + degreesPerItem / 2);
    
                    setCurrentDeg(rotation);
                    setSpeed(10); // Reduce la velocidad para detenerse en el ganador deseado
                }
            }, 1000); // Espera a que la rueda haya girado un poco antes de ajustar
        }
    };
    

    const updateOptions = () => {
        const optionsArray = newOptions.split('\n').filter(option => option.trim() !== '');
        setItems(optionsArray);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#333' }}>
            <div className="wheel" style={{ position: 'relative', marginRight: '20px' }}>
                <canvas ref={canvasRef} width="500" height="500"></canvas>
                <div className="center-circle" onClick={spin} style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}>
                    <div className="triangle" style={{ width: '0', height: '0', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '20px solid white', position: 'absolute', right: '-210px', top: '50%', transform: 'translateY(-50%) rotate(180deg)' }}></div>
                </div>
            </div>
            <div>
                <textarea value={newOptions} onChange={(e) => setNewOptions(e.target.value)} rows="10" cols="30" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#333', marginBottom: '10px', marginLeft: '200px' }}/>
                <br />
                <button onClick={updateOptions} style={{ padding: '10px 20px', marginLeft: '240px' }}>Actualizar Opciones</button>
            </div>
            {showWinner && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    transition: 'opacity 1s ease, transform 1s ease',
                }}>
                    <h1>EL GANADOR ES: {winner}</h1>
                </div>
            )}
            <audio ref={audioRef} src={rouletteSound}/>
            <audio ref={winnerAudioRef} src={winnerSound}/>
            
        </div>
    );
};

export default Wheel;










