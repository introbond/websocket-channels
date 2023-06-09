import { tokens } from "../theme";
import React, { useState, useEffect } from 'react';
import { Box, useTheme, Toolbar, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";

const Room = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [endpoint, setEndpoint] = useState('wss://aot-dev.sitearound.com/ws/airport/BKK/');

    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                console.log('WebSocket connection opened');
                setIsConnected(true);
                setIsConnecting(false);
            };

            socket.onmessage = (event) => {
                console.log('Received message:', event.data);
                setMessages(prevMessages => [JSON.parse(event.data), ...prevMessages]);
            };

            socket.onclose = () => {
                console.log('WebSocket connection closed');
                setIsConnected(false);
                setIsConnecting(false);
            };
        }
    }, [socket, messages]);

    const handleToggleClick = () => {
        if (!isConnected) {
            const isValidURL = (() => {
                try {
                    new URL(endpoint);
                    return true;
                } catch (error) {
                    console.error(error)
                    return false;
                }
            })();

            if (!isValidURL) {
                console.log('Invalid endpoint:', endpoint);
                return;
            }

            setIsConnecting(true);
            const newSocket = new WebSocket(endpoint);
            setSocket(newSocket);
        } else {
            socket.close();
            setSocket(null);
            setIsConnected(false);
            setMessages([])
        }
    };

    const handleClearClick = () => {
        setMessages([]);
    };

    const connectedStyle = {
        backgroundColor: isConnected ? 'green' : 'red',
        display: 'inline-block',
        borderRadius: '50%',
        width: '12px',
        height: '12px',
        marginRight: '5px',
        animation: isConnected ? 'blinking 1s infinite' : 'none'
    };

    const renderMessages = () => {
        return (
            <Box className='messages' style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px' }}>
                <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    {messages.map((m, index) => (
                        <li key={index}
                            style={{
                                padding: '10px', marginBottom: '5px', borderRadius: '5px',
                                backgroundColor: index % 2 === 0 ? colors.primary[400] : colors.grey[700]
                            }}
                        >
                            <div className="message-info">
                                <span className="message-time">{new Date().toLocaleString()}</span>
                            </div>
                            <pre>{JSON.stringify(m, null, 2)}</pre>
                        </li>
                    ))}
                </ul>
            </Box>
        )
    };

    const endpointOptions = [
        { value: "wss://aot-dev.sitearound.com/ws/rest-room/fmonrwp0uujqtnh5/", label: "rest-room" },
        { value: "wss://aot-dev.sitearound.com/ws/airport/BKK/", label: "airport" },
        { value: "wss://aot-dev.sitearound.com/ws/airport-device/BKK/", label: "airport-device" },
    ];

    const handleEndpointChange = (option) => {
        setEndpoint(option.props.value);
    };

    return (
        <Box>
            <Box className='Room' style={{ width: '100%', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box className='status-panel' style={{ margin: '30px', width: '60%', display: 'flex', alignItems: 'center', }}>
                    <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        disabled={isConnected}
                        placeholder="Enter your websocket URL, wss://yoursite/yourendpoint/"
                        style={{
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            marginRight: '10px',
                            fontSize: '1.2em',
                            width: '80%',
                            backgroundColor: "white",
                        }}
                    />
                    <Toolbar className="projectToolbar">
                        <FormControl fullWidth>
                            <InputLabel>Select Endpoint</InputLabel>
                            <Select
                                label="Select your endpoint"
                                variant="outlined"
                                value={endpoint}
                                onChange={(event, value) => handleEndpointChange(value)}
                                sx={{ minWidth: '150px' }}
                            >
                                {endpointOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Toolbar>
                    <Box>
                        <div style={connectedStyle}></div>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </Box>
                </Box>
                <Box className='messages'
                    style={{
                        padding: '16px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        display: 'block',
                        width: '80%',
                        height: '650px',
                        overflowY: 'scroll',
                    }}
                >
                    <ul style={{
                        listStyle: 'none',
                        padding: '0',
                        margin: '0',
                    }}>
                        {renderMessages()}
                    </ul>
                </Box>
                <Box className='control-panel'>
                    <button onClick={handleToggleClick} disabled={isConnecting}>{isConnecting ? 'Connecting...' : (isConnected ? 'Disconnect' : 'Connect')}</button>
                    <button onClick={handleClearClick}>Clear Data</button>
                </Box>

            </Box>
        </Box>
    );
};

export default Room;
