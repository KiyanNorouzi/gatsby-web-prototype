import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // Import 'auth' and 'db' from your Firebase configuration file
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'; // Import necessary Firestore functions
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';

const UserRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (auth.currentUser) {
            const q = query(
                collection(db, 'requests'),
                where('requesterName', '==', auth.currentUser.email)
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const requestsData = [];
                querySnapshot.forEach((doc) => {
                    requestsData.push({ ...doc.data(), id: doc.id });
                });
                setRequests(requestsData);
            });
            return () => unsubscribe();
        }
    }, [auth.currentUser]);

    const handleCancelRequest = async (requestId) => {
        try {
            await deleteDoc(doc(db, 'requests', requestId));
        } catch (error) {
            console.error('Error cancelling request: ', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>User Requests</Typography>
                {requests.length === 0 ? (
                    <Typography variant="body1">No requests sent yet.</Typography>
                ) : (
                    requests.map((request) => (
                        <Card key={request.id} sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="body1">Post: {request.postTitle}</Typography>
                                <Typography variant="body2" color="textSecondary">Owner: {request.ownerId}</Typography>
                                <Typography variant="body2" color="textSecondary">Message: {request.message}</Typography>
                            </CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                                {!request.responded && (
                                    <Button onClick={() => handleCancelRequest(request.id)} color="secondary">Cancel Request</Button>
                                )}
                            </Box>
                        </Card>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default UserRequests;
