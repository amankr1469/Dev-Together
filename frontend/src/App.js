import './Styles/App.css';
import Login from './Components/Login';
import DataContextProvider from './Components/DataContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Room from './Room/Room';

function App() {
  return (
    <DataContextProvider>
      <div className="App">
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
