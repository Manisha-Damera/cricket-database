const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
  SELECT * FROM
  cricket_team;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) => {
      return convertDbObjectToResponseObject(eachPlayer);
    })
  );
});

//app add players
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const postPlayerQuery = `
    INSERT INTO
    cricket_team(player_name,jersey_number, role)
    VALUES(
    '${playerName}',
    ${jerseyNumber},
   '${role}');`;
  const addPlayerData = await db.run(postPlayerQuery);

  response.send("Player Added to Team");
});

//app get players
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM
    cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//app update players
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `  
    UPDATE
    cricket_team
    SET
    player_name="${playerName}",
    jersey_number=${jerseyNumber},
    role="${role}"
    WHERE
    player_id=${playerId};`;

  const addPlayerId = await db.run(updatePlayerQuery);
  const latestPlayerId = addPlayerId.lastID;

  response.send("Player Details Updated");
});

//app delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE
    player_id=${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
