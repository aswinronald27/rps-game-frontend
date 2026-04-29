import './App.css';
import { useReducer } from 'react';
import axios from 'axios';

const API = "https://rps-game-547022134864.asia-south1.run.app";


const initialState = {
  mode: null,
  started: false,
  player1: "",
  player2: "",
  round: 1,
  score: { p1: 0, p2: 0 },
  turn: "P1",
  p1Choice: null,
  p2Choice: null,
  lastResult: "",
  gameOver: false,
  games: [],
  showHistory: false,
};


function reducer(state, action) {
  switch (action.type) {

    case "SET_MODE":
      return {
        ...state,
        mode: action.payload,
        
        player2: action.payload === "pvc" ? "Computer" : state.player2,
      };

    case "SET_PLAYER1":
      return { ...state, player1: action.payload };

    case "SET_PLAYER2":
      return { ...state, player2: action.payload };

    case "START_GAME":
      return { ...state, started: true };

    case "SET_HISTORY":
      return { ...state, games: action.payload, showHistory: true };

    case "HIDE_HISTORY":
      return { ...state, showHistory: false };

    case "PLAY_ROUND":
      
      const { p1Move, p2Move, winner, resultText, isLastRound } = action.payload;

      const newScore = {
        p1: winner === "p1" ? state.score.p1 + 1 : state.score.p1,
        p2: winner === "p2" ? state.score.p2 + 1 : state.score.p2,
      };

      return {
        ...state,
        score: newScore,
        p1Choice: p1Move,
        p2Choice: p2Move,
        lastResult: resultText,
        round: isLastRound ? state.round : state.round + 1,
        gameOver: isLastRound,
        turn: "P1",       
      };

    case "SET_TURN":
      
      return { ...state, turn: "P2", p1Choice: action.payload };

    case "RESTART_GAME":
      return {
        ...state,
        round: 1,
        score: { p1: 0, p2: 0 },
        turn: "P1",
        p1Choice: null,
        p2Choice: null,
        lastResult: "",
        gameOver: false,
      };

    case "RESET_ALL":
      return initialState;

    default:
      return state;
  }
}


const choices = ["stone", "paper", "scissors"];

function getComputerChoice() {
  return choices[Math.floor(Math.random() * 3)];
}

function getWinner(p1, p2) {
  if (p1 === p2) return "tie";
  if (
    (p1 === "stone"    && p2 === "scissors") ||
    (p1 === "scissors" && p2 === "paper")    ||
    (p1 === "paper"    && p2 === "stone")
  ) return "p1";
  return "p2";
}

function buildResultText(p1Name, p2Name, p1Move, p2Move, winner) {
  if (winner === "tie")
    return `${p1Name} chose ${p1Move} | ${p2Name} chose ${p2Move} → Tie`;
  if (winner === "p1")
    return `${p1Name} chose ${p1Move} | ${p2Name} chose ${p2Move} → ${p1Name} wins`;
  return `${p1Name} chose ${p1Move} | ${p2Name} chose ${p2Move} → ${p2Name} wins`;
}

// ─── Component ────────────────────────────────────────────────────────────
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    mode, started, player1, player2,
    round, score, turn,
    p1Choice, lastResult, gameOver,
    games, showHistory,
  } = state;


  const saveGame = async (finalScore) => {
    try {
      const winner =
        finalScore.p1 === finalScore.p2 ? "TIE"
        : finalScore.p1 > finalScore.p2 ? player1
        : player2;

      await axios.post(`${API}/games`, {
        player1,
        player2,
        scoreP1: finalScore.p1,
        scoreP2: finalScore.p2,
        winner,
      });
      console.log("Game saved");
    } catch (err) {
      console.error("Error saving game", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/games`);
      dispatch({ type: "SET_HISTORY", payload: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  
  const handleChoice = (choice) => {

    
    if (mode === "pvp") {
      if (turn === "P1") {
        
        dispatch({ type: "SET_TURN", payload: choice });
        return;
      }

      const p1Move = p1Choice;
      const p2Move = choice;
      const winner = getWinner(p1Move, p2Move);
      const isLastRound = round === 6;

      const newScore = {
        p1: winner === "p1" ? score.p1 + 1 : score.p1,
        p2: winner === "p2" ? score.p2 + 1 : score.p2,
      };

      dispatch({
        type: "PLAY_ROUND",
        payload: {
          p1Move,
          p2Move,
          winner,
          resultText: buildResultText(player1, player2, p1Move, p2Move, winner),
          isLastRound,
        },
      });

      if (isLastRound) saveGame(newScore);
      return;
    }

    
    if (mode === "pvc") {
      const p1Move = choice;
      const p2Move = getComputerChoice();
      const winner = getWinner(p1Move, p2Move);
      const isLastRound = round === 6;

      const newScore = {
        p1: winner === "p1" ? score.p1 + 1 : score.p1,
        p2: winner === "p2" ? score.p2 + 1 : score.p2,
      };

      dispatch({
        type: "PLAY_ROUND",
        payload: {
          p1Move,
          p2Move,
          winner,
          resultText: buildResultText(player1, player2, p1Move, p2Move, winner),
          isLastRound,
        },
      });

      if (isLastRound) saveGame(newScore);
    }
  };

  if (showHistory) {
    return (
      <div className="history-container">
        <h2 className="history-title">Game History</h2>
        <button className="history-back-btn" onClick={() => dispatch({ type: "HIDE_HISTORY" })}>Back</button>
        {games.map((g) => (
          <div key={g.id} className="history-card">
            {g.player1} vs {g.player2} → {g.scoreP1} - {g.scoreP2} → {g.winner}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app">
      <h2 className="title">Rock Paper Scissors</h2>

      <button className="home-btn" onClick={() => dispatch({ type: "RESET_ALL" })}>
        Home
      </button>

      
      {mode === null && (
        <>
          <button onClick={() => dispatch({ type: "SET_MODE", payload: "pvp" })}>
            Player vs Player
          </button>
          <button onClick={() => dispatch({ type: "SET_MODE", payload: "pvc" })}>
            Player vs Computer
          </button>
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
            onChange={(e) => dispatch({ type: "SET_PLAYER1", payload: e.target.value })}
          />

          {mode === "pvp" && (
            <>
              <label>Player 2</label>
              <input
                placeholder="Name"
                value={player2}
                onChange={(e) => dispatch({ type: "SET_PLAYER2", payload: e.target.value })}
              />
            </>
          )}

          {mode === "pvc" && <p>Player 2: {player2}</p>}

          <button onClick={() => {
            if (!player1.trim()) { alert("Enter Player 1 name"); return; }
            if (mode === "pvp" && !player2.trim()) { alert("Enter Player 2 name"); return; }
            dispatch({ type: "START_GAME" });
          }}>
            Start Game
          </button>
        </div>
      )}

      
      {started && (
        <div className="score-board fade-in">
          <h3>Game Started</h3>
          <p>Round: {round}/6</p>
          <p>{player1} vs {player2}</p>
          {mode === "pvp" && <p>Turn: {turn === "P1" ? player1 : player2}</p>}
          <p>Score: {score.p1} - {score.p2}</p>

          <div>
            <p>Select your move:</p>
            {choices.map((c) => (
              <button key={c} onClick={() => handleChoice(c)} disabled={gameOver}>
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
            {score.p1 === score.p2 ? "It's a Tie!"
              : score.p1 > score.p2 ? `${player1} Wins the Game!`
              : `${player2} Wins the Game!`}
          </p>
          <button onClick={() => dispatch({ type: "RESTART_GAME" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
