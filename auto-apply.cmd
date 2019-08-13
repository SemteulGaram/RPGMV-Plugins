:: Copy this file to script directory and edit [FILENAME], [USERNAME], [PROJECT_NAME] to valid name and run

SET "FN=[FILENAME].js"
SET "PJ=C:\Users\[USERNAME]\MV_Games\[PROJECT_NAME]\js\plugins\"

DEL "%PJ%%FN%"
COPY ".\%FN%" "%PJ%%FN%"
