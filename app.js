const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertToObject = (object) => {
  return {
    movieName: object.movie_name,
  };
};

//ApI 1

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
       select 
       movie_name
       from movie
    `;
  const getMovieResponse = await db.all(getMovieQuery);
  response.send(getMovieResponse.map((movie) => convertToObject(movie)));
});

// API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieDataQuery = `
       insert into
          movie(director_id,movie_name,lead_actor)
          values(${directorId},'${movieName}','${leadActor}');`;

  await db.run(addMovieDataQuery);
  response.send("Movie Successfully Added");
});

// API 3

const convertToObject3 = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieWithIdQuery = `
    
    select *
    from 
    movie
    where movie_id = ${movieId}`;

  const movieResponse = await db.get(getMovieWithIdQuery);
  response.send(convertToObject3(movieResponse));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
      update 
      movie
      set director_id = ${directorId},
          movie_name = '${movieName}',
          lead_actor = '${leadActor}'
      where movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieWithIdQuery = `
    
    delete  
    from 
    movie
    where movie_id = ${movieId}`;

  await db.run(deleteMovieWithIdQuery);
  response.send("Movie Removed");
});

// API 6

const convertDirectorDb6 = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
       select 
       *
       from director;
    `;
  const getDirectorResponse = await db.all(getDirectorQuery);
  response.send(getDirectorResponse.map((item) => convertDirectorDb6(item)));
});

// API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieWithDirectorId = `
    SELECT
      movie_name as movieName
    FROM
     movie
    WHERE
      director_id = ${directorId};`;
  const getMovieDirectorResponse = await db.all(getMovieWithDirectorId);
  response.send(getMovieDirectorResponse);
});

module.exports = app;
