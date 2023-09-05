const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;

const startDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB:error ${error.message}`);
    process.exit(1);
  }
};
startDbAndServer();

const returnMovieArray = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};
const returnMovieWithId = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  };
};
app.get("/movies/", async (request, response) => {
  const listROfMovies = `SELECT * FROM movie`;
  const movieArray = await db.all(listROfMovies);
  response.send(
    movieArray.map((eachMovie) => {
      return returnMovieArray(eachMovie);
    })
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postingMovieQuery = `INSERT INTO 
    movie
    (director_id,movie_name,lead_actor)
    VALUES
    ('${directorId}','${movieName}','${leadActor}')`;
  await db.run(postingMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieWithId = `SELECT * FROM movie
    WHERE movie_id=${movieId}`;
  const getMovie = await db.get(getMovieWithId);
  response.send(returnMovieWithId(getMovie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id='${directorId}',
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

const directorsList = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const movieDirectorsQuery = `SELECT * FROM director`;
  const movieDirectorsArray = await db.all(movieDirectorsQuery);
  response.send(
    movieDirectorsArray.map((eachDirector) => {
      return directorsList(eachDirector);
    })
  );
});

const listOfDirectorMovies = (directorSpl) => {
  return {
    movieName: directorSpl.movie_name,
  };
};
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const specificDirectorQuery = `
    SELECT movie_name FROM director
    INNER JOIN movie on movie.director_id=director.director_id
    WHERE director.director_id=${directorId}`;
  const directorMovie = await db.all(specificDirectorQuery);
  response.send(
    directorMovie.map((directorSpl) => {
      return listOfDirectorMovies(directorSpl);
    })
  );
});

module.exports = app;
