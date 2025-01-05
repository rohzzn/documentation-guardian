#!/bin/bash
# Start the smee client in the background
npx smee-client -u https://smee.io/Mx79gKhWcCBmLME -P /webhook &
SMEE_PID=$!

# Start the app
npm start

# When npm start exits, kill the smee client
kill $SMEE_PID