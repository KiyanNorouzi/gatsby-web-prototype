import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Suggestions from './Suggestions';
import UserRequests from './UserRequests'; // Import UserRequests component
import PrivateRoute from './PrivateRoute';
import { ThemeContextProvider } from './ThemeContext';
import { ColorModeProvider } from './ColorModeContext'; // Import ColorModeProvider

const App = () => {
    return (
        <ThemeContextProvider>
            <ColorModeProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Home />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/suggestions"
                            element={
                                <PrivateRoute>
                                    <Suggestions />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/user-requests"
                            element={
                                <PrivateRoute>
                                    <UserRequests />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </Router>
            </ColorModeProvider>
        </ThemeContextProvider>
    );
};

export default App;
