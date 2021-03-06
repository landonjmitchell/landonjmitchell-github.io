const base_url = "https://api.themoviedb.org/3/search/movie?api_key=";
const credits_base = "https://api.themoviedb.org/3/movie/"
const tmdb_api_key = "bde024f3eb43f597aafe01ed9c9098c6";

document.addEventListener("DOMContentLoaded", documentReady);

let app = {};

function documentReady() {
  $('#movieForm').on("submit", retrieveMovies);
  $("#recentlist").on("click", ".recent", searchAgain);
}


function retrieveMovies(event) {
  event.preventDefault();

  $('#movies').html(""); // clear any previous results
  $('#resultlist').html("");

  let search = $('#search').val();
  $('#search').val('');
  addToRecents(search);
  let query = search.split(' ').join('+');
  $.get(`${base_url}${tmdb_api_key}&query=${query}`, handleMovies).fail(function() {
    alert('Oops! Failed to connect to API server. Please Try again.');
  });
}


function addToRecents(search) {
  $('#recentlist').prepend(`<a class="recent" href="#"><li>${search}</li></a>`)
}

function searchAgain(event) {
  event.preventDefault();
  let prior_search = event.target.innerText;
  event.target.remove(); // remove from recent searches (will be re-added at top)
  $('#search').val(prior_search);
  $('#search').submit();
}


function handleMovies(data) {
  if (data.results.length == 0) {
    $('#movies').html("<h3 class='noresults'>No movies found matching that title.</h3>");
    // $('#navbar').hide()
    return;
  }

  for (let movie of data.results) {
    if (movie.poster_path  != null) {
      $.get(`${credits_base}${movie.id}/credits?api_key=${tmdb_api_key}`, function(data) {
            app[`${movie.id}_credits`] = data;
            getCreditInfo(movie);
          })
    }
  }
  $('#sidebar').show();
}


function getCreditInfo(movie) {
  let directors = [];
  let i = 0;
  for (crew of app[`${movie.id}_credits`].crew) {
    if (crew.job == "Director") {
      directors.push(crew.name);
      i +=1;
      if (directors.length == 5) {
        break;
      }
    }
  }
  if (directors.length == 0) {
    directors.push("N/A");
  }

  let producers = [];
  i = 0;
  for (crew of app[`${movie.id}_credits`].crew) {
    if (crew.job.includes("Producer")) {
      producers.push(crew.name);
      i += 1;
      if (producers.length == 5) {
        break;
      }
    }
  }
  if (producers.length == 0) {
    producers.push("N/A");
  }

  let castList = [];
  i = 0;
  for (cast of app[`${movie.id}_credits`].cast) {
    if (i < 5) {
      castList.push(cast.name)
      i += 1
    } else { break }
  }
  if (castList.length == 0) {
    castList.push("N/A")
  }

  addHtml(movie, directors, producers, castList)
}


function addHtml(movie, directors, producers, castList) {

  $('#movies').append(
  `
    <div class="row movie" id="${movie.id}">

      <div class="postwrap">
        <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
          <div class="col poster" id="${movie.id}_poster">
            <img src="https://image.tmdb.org/t/p/w200/${movie.poster_path}">
          </div></a>
      </div>


      <div class="col info">

        <h2>
          <a href="https://www.themoviedb.org/movie/${movie.id}" targe="_blank">
          ${movie.title} <span class="year">(${movie.release_date.substr(0,4)})
          </a>
        </h2>

        <img class="logo" src="imdb_logo.png">
        <h3> (${movie.vote_average})&nbsp;&nbsp;<span class="stars">${'★'.repeat(movie.vote_average)}</span></h3>
        <p class="plot"><strong>Synopsis: </strong>${movie.overview}</p>
      </div>
      
      <div class="col credits">
        <div>
          <p class="director"><strong>Directed By:</strong> ${directors.join(', ')}</p>
          <p class="director"><strong>Produced By:</strong> ${producers.join(', ')}</p>
          <p class="cast"><strong>Cast:</strong> ${castList.join(', ')}</p>
        </div>
        <div class="return">
          <p class="backtotop mb-1"><a href="#top">Back to top <i class="fas fa-arrow-up"></i></a></p>
        </div>
      </div>
    </div>`
  )

  $('#resultlist').append(
    `<a href="#${movie.id}"><li>${movie.title} (${movie.release_date.substr(0,4)})</li></a>`)

}
