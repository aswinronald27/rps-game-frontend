import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import axios from 'axios';
const API = "https://rps-game-547022134864.asia-south1.run.app";

function App() {
    const [mode,setMode]=useState(null);
    const [started,setStarted]=useState(false);
    const [player1,setPlayer1]=useState("");
    const [player2,setPlayer2]=useState("");
    const restartGame =()=>{
      setRound(1);
      setScore({ p1: 0, p2: 0 });
      setTurn("P1");
      setP1Choice(null);
      setP2Choice(null);

      setLastResult("");
      setGameOver(false);
    }
    const resetGame = () => {
          setMode(null);
          setStarted(false);
          setPlayer1("");
          setPlayer2("");

          setRound(1);
          setScore({ p1: 0, p2: 0 });
          setTurn("P1");
          setP1Choice(null);
          setP2Choice(null);

          setLastResult("");
          setGameOver(false);
      };
      const [games, setGames] = useState([]);
      const [showHistory, setShowHistory] = useState(false);
      const [round, setRound] = useState(1);
      const [score, setScore] = useState({ p1: 0, p2: 0 });
      const [turn, setTurn] = useState("P1");
      const [p1Choice, setP1Choice] = useState(null);
      const [p2Choice, setP2Choice] = useState(null);

      const [lastResult, setLastResult] = useState("");
      const [gameOver, setGameOver] = useState(false);

      const choices = ["stone", "paper", "scissors"]
      const getComputerChoice = () => {
        return choices[Math.floor(Math.random() * 3)];
      };
      const getWinner = (p1, p2) => {
        if (p1 === p2) return "tie";

        if (
          (p1 === "stone" && p2 === "scissors") ||
          (p1 === "scissors" && p2 === "paper") ||
          (p1 === "paper" && p2 === "stone")
        ) return "p1";

        return "p2";
      };
      const handleChoice = (choice) => {
      // PVP MODE
      if (mode === "pvp") {
        if (turn === "P1") {
          setP1Choice(choice);
          setTurn("P2");
        } else {
          setP2Choice(choice);

          const p1Move = p1Choice;
          const p2Move = choice;

          const winner = getWinner(p1Move, p2Move);

          if (winner === "p1") {
            setScore(prev => ({ ...prev, p1: prev.p1 + 1 }));
          } else if (winner === "p2") {
            setScore(prev => ({ ...prev, p2: prev.p2 + 1 }));
          }

          const resultText =
            winner === "tie"
              ? `${player1} chose ${p1Move} | ${player2} chose ${p2Move} → Tie`
              : winner === "p1"
              ? `${player1} chose ${p1Move} | ${player2} chose ${p2Move} → ${player1} wins`
              : `${player1} chose ${p1Move} | ${player2} chose ${p2Move} → ${player2} wins`;

          setLastResult(resultText);

          // stop at 6 rounds
          if (round === 6) {
            setGameOver(true);
            setTimeout(saveGame, 0);
          } else {
            setRound(prev => prev + 1);
          }
          setTurn("P1");
          setP1Choice(null);
          setP2Choice(null);
        }
      }

      // PVC MODE
      if (mode === "pvc") {
        const compChoice = getComputerChoice();

        setP1Choice(choice);
        setP2Choice(compChoice);

        
        const p1Move = choice;
        const p2Move = compChoice;

        const winner = getWinner(p1Move, p2Move);

        if (winner === "p1") {
          setScore(prev => ({ ...prev, p1: prev.p1 + 1 }));
        } else if (winner === "p2") {
          setScore(prev => ({ ...prev, p2: prev.p2 + 1 }));
        }


        const resultText =
          winner === "tie"
            ? `${player1} chose ${p1Move} | ${player2} chose ${p2Move} → Tie`
            : winner === "p1"
            ? `${player1} chose ${p1Move} | ${player2} chose ${p2Move} → ${player1} wins`
            : `${player1} chose ${p1Move} | ${player2} chose ${p2Move} → ${player2} wins`;

        setLastResult(resultText);

          // stop at 6 rounds
          if (round === 6) {
            setGameOver(true);
            setTimeout(saveGame, 0);
          } else {
            setRound(prev => prev + 1);
          }
      }
    };
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API}/games`);
        setGames(res.data);
        setShowHistory(true);
      } catch (err) {
        console.error(err);
      }
    };

    const saveGame = async () => {
      try {
        const winner =
          score.p1 === score.p2
            ? "TIE"
            : score.p1 > score.p2
            ? player1
            : player2;

        await axios.post(`${API}/games`, {
          player1: player1,
          player2: player2,
          scoreP1: score.p1,
          scoreP2: score.p2,
          winner: winner
        });

        console.log("Game saved");
      } catch (error) {
        console.error("Error saving game", error);
      }
    };
    if (showHistory) {
      return (
        <div>
          <h2>Game History</h2>
          <button onClick={() => setShowHistory(false)}>Back</button>

          {games.map((g) => (
            <div key={g.id}>
              {g.player1} vs {g.player2} → {g.scoreP1} - {g.scoreP2} → {g.winner}
            </div>
          ))}
        </div>
      );
    }    
  return (
    <div className='app'>

      <h2 className="title">Rock Paper Scissor</h2>

      <button className="home-btn" onClick={resetGame}>Home</button>
    
      {mode=== null && (
        <>
          <button onClick={()=>setMode("pvp")}>Player vs Player</button>
          <button onClick={()=>{setMode("pvc");setPlayer2("Computer")}}>Player vs Computer</button>
          <button onClick={fetchHistory}>View History</button>
        </>
      )}
      {mode !== null && !started && (
        <div className="input-section slide-up">
          <p className="mode-text">{mode === "pvp" ? "PvP Selected" : "PvC Selected"}</p>

          <label>Player 1</label>
          <input
            placeholder="Name"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            required
          />

          {mode === "pvp" && (
            <>
              <label>Player 2</label>
              <input
                placeholder="Name"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)
                } 
                required
              />
            </>
          )}

          {mode === "pvc" && <p>Player 2: {player2}</p>}

          <button onClick={() => {
            if (!player1.trim()) {
              alert("Enter Player 1 name");
              return;
            }

            if (mode === "pvp" && !player2.trim()) {
              alert("Enter Player 2 name");
              return;
            }setStarted(true);
          }}>Start Game </button>

        </div>
      )}

      {started && (
        <div className="score-board fade-in">
          <h3>Game Started</h3>
          <p>Round: {round}/6</p>
          <p>{player1} vs {player2}</p>

          {mode === "pvp" && (<p>Turn: {turn === "P1" ? player1 : player2}</p>)}

          <p>Score: {score.p1} - {score.p2}</p>
          <div>
            <p>Select your move:</p>

          {choices.map((c) => (
            <button
              key={c}
              onClick={() => handleChoice(c)}
              disabled={gameOver}
            >
              {c}
            </button>
          ))}
          </div>

        </div>
      )}
      {lastResult && <p>Last Round: {lastResult}</p>}

        {gameOver && (
          <div>
            <h3>Game Over</h3>
            <p>
              {score.p1 === score.p2? "It's a Tie!": score.p1 > score.p2 ? `${player1} Wins the Game!`: `${player2} Wins the Game!`}
            </p>
            <button onClick={restartGame}>Play Again</button>
          </div>
          
        )}
      
    </div>
  );
}

export default App;
