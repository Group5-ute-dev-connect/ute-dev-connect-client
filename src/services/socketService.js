import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL;
let SOCKET_URL = 'http://localhost:5000';

if (apiUrl) {
  try {
    const url = new URL(apiUrl);
    SOCKET_URL = `${url.protocol}//${url.host}`;
  } catch (e) {
    console.error("Invalid URL in VITE_API_URL for socket connection");
  }
}

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false, // Wait until we explicitly connect and setup
    });
  }
  return socket;
};
