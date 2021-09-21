import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function Navbar() {

  // Setting Initial Query Params 
  const get_recent_method = 'flickr.photos.getRecent';
  const get_search_method = 'flickr.photos.search';
  const recentPublicApi = '0f30150685ef597435f1288b78b1a642';
  const searchPublicApi = '6dd4915e93ae72b0aaf42ffb4f49f234';
  const imgSize = 'url_s';
  const imgPerPage = 15;
  const defaultPage = 1;

  const [page, setPage] = useState(defaultPage);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState([]);
  
  const abortController = useRef();
  const loader = useRef(null);
  const activateScroll = useRef(false);

  useEffect(() => {
      const url = `https://www.flickr.com/services/rest/?method=${get_recent_method}&api_key=${recentPublicApi}&extras=${imgSize}&per_page=${imgPerPage}&page=${defaultPage}&format=json&nojsoncallback=1`;
      fetch(url)
      .then(res => res.json())
      .then(res => {
          if (res.stat === 'ok') {
            const { photos : { photo } } = res;
            setSearchResults(photo);
          }
      })
  }, []);

  useEffect(() => {
    if (search) {
      fetchResults(constructURL('getAny', 1, search));
    }
  }, [search]);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      console.log('CHangae');
      setPage((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver]);

  useEffect(() => {
    activateScroll.current = true;
    console.log(page);
    if (!search) {
      fetchResults(constructURL('getRecent', page, search))
    } else {
      fetchResults(constructURL('getAny', page, search));
    }
  }, [page]);

  const constructURL = (urlId, page, query) => {
    let url = '';
    console.log(urlId);
    if (urlId === 'getRecent') {
      console.log('Lalalalalla');
      url = `https://www.flickr.com/services/rest/?method=${get_recent_method}&api_key=${recentPublicApi}&extras=${imgSize}&per_page=${imgPerPage}&page=${page}&format=json&nojsoncallback=1`;
    } else {
      url = `https://www.flickr.com/services/rest/?method=${get_search_method}&api_key=${searchPublicApi}&text=${query}&extras=${imgSize}&per_page=${imgPerPage}&page=${page}&format=json&nojsoncallback=1`;
    }
    return url;
  }

  const fetchResults = (url) => {
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    const { signal } = abortController.current;
    
    fetch(url, { signal })
    .then(res => res.json())
    .then(res => {
      if (res.stat === 'ok') {
        const { photos : { photo } } = res;
        let newList = [];
        if (activateScroll.current) {
          newList = [...searchResults, ...photo];
        } else {
          newList = [...photo];
        }
        setSearchResults(newList);
        activateScroll.current = false;
      }
    })
    .catch(err => {
      console.log('This is bad ', err.message);
    })

  }

  const handleQuery = (e) => {
    const query = e.target.value;
    setSearch(query);
    if (!query) {
      fetchResults(constructURL('getRecent', 1, null));
    }
  }


  return (
      <div>
        <div className="header-main">
          <div className="search">
            <input
              className="search-box"
              placeholder='Search Flickr...'
              type="text"
              value={search}
              onChange={handleQuery}
            />
          </div>
        </div>
        <div>
          <div>
            { 
              !loading && searchResults
              && searchResults.map( photo => (
                <div key={photo.id}>
                  <div>
                    <img src={photo.url_s} alt={photo.title} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div ref={loader}>
          LOL
        </div>
        <div>
          Loading
        </div>
      </div>
  )
}
