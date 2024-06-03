import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const RequestConfirmationDialog = ({ open, handleClose, handleConfirmRequest, post }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Confirm Request</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to send your request?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => handleConfirmRequest(post)} color="primary">Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RequestConfirmationDialog;
