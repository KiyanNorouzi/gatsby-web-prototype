import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // Import 'auth' and 'db' from your Firebase configuration file
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Import necessary Firestore functions
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';

const Suggestions = () => {
    const [requests, setRequests] = useState([]);
    const [statusMessage, setStatusMessage] = useState({}); // To store status messages for each request

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'requests'), (querySnapshot) => {
            const requestsData = [];
            querySnapshot.forEach((doc) => {
                requestsData.push({ ...doc.data(), id: doc.id });
            });
            setRequests(requestsData);
        });
        return () => unsubscribe();
    }, []);

    const handleAcceptRequest = async (requestId) => {
        try {
            await updateDoc(doc(db, 'requests', requestId), { responded: true });
            setStatusMessage((prev) => ({
                ...prev,
                [requestId]: 'You have been sent an invitation.'
            }));
        } catch (error) {
            console.error('Error accepting request: ', error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await deleteDoc(doc(db, 'requests', requestId));
            setStatusMessage((prev) => ({
                ...prev,
                [requestId]: 'Your request was rejected.'
            }));
        } catch (error) {
            console.error('Error rejecting request: ', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>Suggestions</Typography>
                {requests.map((request) => (
                    // Only display the request if the current user is the owner of the post
                    (auth.currentUser && request.ownerId === auth.currentUser.uid) && (
                        <Card key={request.id} sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="body1">{request.postTitle}</Typography>
                                <Typography variant="body2" color="textSecondary">Requested by: {request.requesterName}</Typography>
                                <Typography variant="body2" color="textSecondary">Message: {request.message}</Typography>
                                {statusMessage[request.id] && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        {statusMessage[request.id]}
                                    </Typography>
                                )}
                            </CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                                <Button onClick={() => handleAcceptRequest(request.id)} color="primary">Accept</Button>
                                <Button onClick={() => handleRejectRequest(request.id)} color="secondary">Reject</Button>
                            </Box>
                        </Card>
                    )
                ))}
            </Box>
        </Container>
    );
};

export default Suggestions;
