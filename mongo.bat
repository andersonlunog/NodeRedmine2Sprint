start "" cmd /c "mongod --dbpath .\mongoDB"
cd src
start "" cmd /c "grunt coffee"
timeout 3
start "" cmd /c "grunt watch"
cd compiled
start "" cmd /c "node server.js"
