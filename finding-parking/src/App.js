import React from 'react';
import Login from './login';
import FindingParking from './finding_parking';

function App() {
  return (
    <div>
    <div className="container">
        <h1>Finding Parking Spot</h1>
        <div className="form-group">
            <label for="username">Username</label>
            <input type="text" id="id" required placeholder="Enter your username"/>
        </div>
        <div className="form-group">
            <label for="password">Password</label>
            <input type="password" id="pw" required placeholder="Enter your password"/>
        </div>
        <div className="form-group">
            <button className="btn btn-primary" onclick="login()">Login</button>
        </div>
    </div>
    <footer>
        <a href="https://github.com/hanseulLee1127/startup">My github</a>
    </footer>
</div>
  );
}

export default App;