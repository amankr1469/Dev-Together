import './Styles/App.css';
import Login from './Components/Login';
import DataContextProvider from './Components/DataContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Room from './Room/Room';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.querySelector("#change-theme").addEventListener('click', () => {
      document.querySelector("#root").classList.toggle("dark");
      if (document.querySelector("#root").classList.contains("dark")) {
        const colors = document.querySelectorAll(".colors .color");
        if (colors) colors[0].style.setProperty('--color', '#fff');
      } else {
        const colors = document.querySelectorAll(".colors .color");
        if (colors) colors[0].style.setProperty('--color', '#000');
      }
    });
  }, [])
  return (
    <DataContextProvider>
      <div className="App">
        <div id="change-theme">
          <button id="change-theme-button">
            <i className="fas fa-moon"></i>
            <i className="fas fa-sun"></i>
          </button>
        </div>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/room" element={<Room />} />
          </Routes>
        </Router>
      </div>
    </DataContextProvider >
  );
}

export default App;
