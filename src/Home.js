import React, { useState, useEffect, useContext } from 'react';
import { auth, db } from './firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, IconButton, Box, TextField, InputAdornment, InputLabel, Grid, Card, CardContent, CardActions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { ColorModeContext } from './ColorModeContext';

const Home = () => {
    const [postText, setPostText] = useState('');
    const [postDescription, setPostDescription] = useState('');
    const [postPrice, setPostPrice] = useState('');
    const [posts, setPosts] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editedPostText, setEditedPostText] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const navigate = useNavigate();
    const colorMode = useContext(ColorModeContext);

    useEffect(() => {
        const q = query(collection(db, 'posts'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        if (postText.trim() === '' || postDescription.trim() === '' || postPrice === '') {
            setError('All fields are required.');
            return;
        }

        const newPost = {
            text: postText,
            description: postDescription,
            price: postPrice,
            user: auth.currentUser.email,
            userId: auth.currentUser.uid,
            imageUrl
        };

        await addDoc(collection(db, 'posts'), newPost);
        setPostText('');
        setPostDescription('');
        setPostPrice('');
        setImageUrl(null);
        setError('');
    };

    const handleEditPost = async (postId, updatedText) => {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, { text: updatedText });
        setEditingPostId(null);
        setEditedPostText('');
    };

    const handleCancelEdit = () => {
        setEditingPostId(null);
        setEditedPostText('');
    };

    const handleDeletePost = async (postId) => {
        const postRef = doc(db, 'posts', postId);
        await deleteDoc(postRef);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    const handleRequest = (post) => {
        setSelectedPost(post);
        setOpenDialog(true);
    };

    const handleConfirmRequest = async () => {
        if (selectedPost) {
            const request = {
                postId: selectedPost.id,
                postTitle: selectedPost.text,
                ownerId: selectedPost.userId,
                requesterName: auth.currentUser.email,
                message: `User ${auth.currentUser.email} has requested your post "${selectedPost.text}".`,
                responded: false
            };

            await addDoc(collection(db, 'requests'), request);
        }

        setOpenDialog(false);
        setSelectedPost(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPost(null);
    };

    const filteredPosts = posts.filter(post => post.text.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Container maxWidth="md">
            <AppBar position="static" color="transparent" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Little Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ marginRight: 2 }}>
                        Logged in as: {auth.currentUser.email}
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/suggestions')}>View Suggestions</Button>
                    <Button color="inherit" onClick={() => navigate('/user-requests')}>My Requests</Button>
                    <IconButton edge="end" color="inherit" onClick={handleLogout}>
                        <ExitToAppIcon />
                    </IconButton>
                    <Button onClick={colorMode.toggleColorMode} sx={{ color: 'primary.main', fontFamily: 'fantasy' }}>
                        {colorMode.mode === 'dark' ? '🌞' : '🌙'}
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" fontFamily="fantasy">
                    Home
                </Typography>
                <form onSubmit={handlePost} style={{ width: '70%', margin: 'auto' }}>
                    <TextField
                        label="Write a post..."
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        margin="normal"
                        InputProps={{ style: { fontFamily: 'fantasy' } }}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={postDescription}
                        onChange={(e) => setPostDescription(e.target.value)}
                        margin="normal"
                        InputProps={{ style: { fontFamily: 'fantasy' } }}
                    />
                    <TextField
                        label="Price (In Dollar)"
                        variant="outlined"
                        type="number"
                        fullWidth
                        value={postPrice}
                        onChange={(e) => {
                            const price = parseInt(e.target.value);
                            if (!isNaN(price) && price >= 0 && price <= 100) {
                                setPostPrice(price);
                            }
                        }}
                        inputProps={{ min: 0, max: 100 }}
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <InputLabel>Only numbers between 0 to 100</InputLabel>
                                </InputAdornment>
                            ),
                        }}
                        InputLabelProps={{ style: { fontFamily: 'fantasy' } }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<AddAPhotoIcon />}
                            sx={{ minWidth: 'auto', padding: '6px 16px' }}
                            fontFamily="fantasy"
                        >
                            Upload Image
                            <input type="file" hidden onChange={handleImageChange} />
                        </Button>
                    </Box>
                    {imageUrl && (
                        <Box component="img" src={imageUrl} alt="Uploaded" sx={{ width: '100%', height: 'auto', mt: 2 }} />
                    )}
                    {error && <Typography color="error" sx={{ mt: 2, fontFamily: 'fantasy' }}>{error}</Typography>}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ padding: '8px 24px', fontFamily: 'fantasy' }}
                        >
                            Post
                        </Button>
                    </Box>
                </form>
                <Box sx={{ mt: 4 }}>
                    <TextField
                        label="Search Posts"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        margin="normal"
                        InputProps={{ style: { fontFamily: 'fantasy' } }}
                    />
                    <Typography variant="h5" component="h2" gutterBottom align="center" fontFamily="fantasy">
                        Posts
                    </Typography>
                    <Grid container spacing={2}>
                        {filteredPosts.map((post) => (
                            <Grid item xs={12} sm={6} md={4} key={post.id}>
                                <Card sx={{ backgroundColor: 'background.paper' }}>
                                    <CardContent>
                                        {editingPostId === post.id ? (
                                            <>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    value={editedPostText}
                                                    onChange={(e) => setEditedPostText(e.target.value)}
                                                    sx={{ mb: 2 }}
                                                />
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                                    <Button
                                                        onClick={() => handleEditPost(post.id, editedPostText)}
                                                        color="primary"
                                                        size="small"
                                                        sx={{ padding: '4px 8px', fontFamily: 'fantasy' }}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        onClick={handleCancelEdit}
                                                        size="small"
                                                        sx={{ padding: '4px 8px', fontFamily: 'fantasy' }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="h6" fontFamily="fantasy">{post.text}</Typography>
                                                <Typography variant="body1" fontFamily="fantasy">{post.description}</Typography>
                                                <Typography variant="body1" fontFamily="fantasy">Price: ${post.price}</Typography>
                                                {post.imageUrl && (
                                                    <Box component="img" src={post.imageUrl} alt="Uploaded" sx={{ width: '100%', height: 'auto', mt: 2 }} />
                                                )}
                                            </>
                                        )}
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, fontFamily: 'fantasy' }}>
                                            Posted by: {post.user}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        {post.userId === auth.currentUser.uid ? (
                                            <>
                                                <Button
                                                    onClick={() => { setEditingPostId(post.id); setEditedPostText(post.text); }}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ padding: '4px 8px', fontFamily: 'fantasy' }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    color="secondary"
                                                    size="small"
                                                    sx={{ padding: '4px 8px', fontFamily: 'fantasy' }}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={() => handleRequest(post)}
                                                color="primary"
                                                size="small"
                                                sx={{ padding: '4px 8px', fontFamily: 'fantasy' }}
                                            >
                                                Request
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Request"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to request this post?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" sx={{ fontFamily: 'fantasy' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmRequest} color="primary" autoFocus sx={{ fontFamily: 'fantasy' }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Home;

