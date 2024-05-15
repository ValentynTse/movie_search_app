const { fromEvent, from, of } = rxjs;
const { map, filter, distinctUntilChanged, debounceTime, tap, switchMap, catchError } = rxjs.operators;

const searchInput = document.querySelector('#search');
// console.log(searchInput);
const searchCheckbox = document.querySelector('#checkbox');
//console.log(searchCheckbox);
const moviesListElement = document.querySelector('#movies-list');
// console.log(moviesListElement);

const searchMoviesStream$ = fromEvent(searchInput, 'input').pipe(
   map(e => e.target.value.trim()),
   filter(value => value.length > 3),
   debounceTime(2000),
   distinctUntilChanged(),
   tap(() => !searchCheckbox.checked && (moviesListElement.innerHTML = '')),
   switchMap(searchValue => getMovies(searchValue)),
   tap(movies => movies.forEach(addMoviesToList)),
)
searchMoviesStream$.subscribe()

const addMoviesToList = (movie) => {
   const item = document.createElement('div')
   const image = document.createElement('img')
   item.classList.add('movie')
   image.classList.add('movie__image')
   image.src = /^http|https:\/\//i.test(movie.Poster) ? movie.Poster : './img/no-image.jpg'
   // image.src = movie.Poster
   image.alt = `${movie.Title} ${movie.Year}`
   image.title = `${movie.Title} ${movie.Year}`
   item.append(image)
   moviesListElement.prepend(item)
}

const fetchData = url => fetch(url)
   .then(response => response.json())
   .then(data => {
      if (!data || !data.Search) throw Error('Data returned by the server is incorrect!')
      return data.Search
   })

const getMovies = searchValue => from(
   fetchData(`https://www.omdbapi.com/?apikey=18b8609f&S=${searchValue}`)).pipe(
      catchError(err => {
         console.error('Error downloading movies:', err.message)
         return of([])
      })
   )
