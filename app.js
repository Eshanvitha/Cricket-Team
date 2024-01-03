const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//Get playersList API

app.get('/players/', async (request, response) => {
  const getAllPlayersList = `
  SELECT * FROM cricket_team;`
  const playersList = await db.all(getAllPlayersList)
  response.send(
    playersList.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayer = `INSERT INTO 
  cricket_team (player_name,jersey_number,role)
  VALUES ('${playerName},${jerseyNumber},${role});`
  const dbResponse = await db.run(addPlayer)
  response.send('Player Added to team')
})

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `SELECT * FROM cricket_team WHERE player_id='${playerId};'`
  const player = await db.get(getPlayer)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayer = `UPDATE cricket_team SET 
  player_name='${playerName}',
  jersey_number='${jerseyNumber}',
  role:'${role}'
  WHERE player_id='${playerId}';`
  await db.run(updatePlayer)
  response.send('Player Details Updated')
})

app.delete('players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id='${playerId}';`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
