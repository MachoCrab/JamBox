var getDataButton = document.getElementById('get-data-button');

if (getDataButton) {
  getDataButton.addEventListener('click', function () {
    document.getElementById('loading-screen').style.display = "flex";
    authorizeSpotify();
  });
}

function authorizeSpotify() {
    // Replace with your Spotify API client ID and redirect URI
    var clientId = '97a45e5baf1640f0bd179cc0137fe054';
    
    var redirectUri = 'https://machocrab.github.io/JamBox/data.html';

    // Set up the authorization URL
    var authParams = new URLSearchParams({
        client_id: clientId,
        response_type: 'token',
        redirect_uri: redirectUri,
        scope: 'playlist-read-private user-read-recently-played playlist-modify-public playlist-modify-private user-top-read',
    });
    var authorizationUrl = 'https://accounts.spotify.com/authorize?' + authParams;

    // Redirect the user to Spotify for authorization
    window.location.href = authorizationUrl;
}

// Extract access token from URL (Assuming it's passed as a URL parameter named 'access_token')
function getAccessTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.hash.substr(1));
    return urlParams.get('access_token');
}
  
// After the user is redirected back from Spotify authorization, call fetchData
document.addEventListener('DOMContentLoaded', function () {
const accessToken = getAccessTokenFromURL();

if (accessToken) {
    //var loadingScreen = document.querySelector('.loading-screen');
    //loadingScreen.classList.add('active');
    fetchData(accessToken);
}
});

function getTerm() {
    const term = document.getElementById("term");
    return term;
}

function getTopTracks(term) {
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };

    Promise.all([
        fetch('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50', { headers }),
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        var topTracks = data[0].items.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            image_url: track.album.images[0].url,
            track_id: track.id,
            access_token: accessToken
        }));

        renderTopTrack(topTracks);
    })
    .catch(error => console.error('Failed to fetch data:', error));

    
}
  
// This function will be called after the user is redirected back from Spotify authorization
function fetchData(accessToken) {
    console.log("access token: " + accessToken);
    // Use the access token to fetch data from Spotify API
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };


    Promise.all([
        fetch('https://api.spotify.com/v1/me/player/recently-played', { headers }),
        fetch('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50', { headers }),
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        var recentTracks = data[0].items.map(track => ({
            name: track.track.name,
            artist: track.track.artists[0].name,
            album: track.track.album.name,
            image_url: track.track.album.images[0].url,
            track_id: track.track.id,
            access_token: accessToken
        }));

        var topTracks = data[1].items.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            image_url: track.album.images[0].url,
            track_id: track.id,
            access_token: accessToken
        }));

        getAllUserPlaylists(headers).then(playlists => {
            console.log(playlists);
            var allPlaylists = playlists.map(playlist => ({
                url: playlist.external_urls['spotify'],
                name: playlist.name
            }));
            renderData(allPlaylists, recentTracks, topTracks);
        })
            
        
    })
    .catch(error => console.error('Failed to fetch data:', error));

    document.getElementById("loading-screen").display = "none";
}



selectElement = document.getElementById('term');
selectElement.addEventListener('change', onDropdownChange);


function renderTopTracks(topTracks) {
    console.log("rendering topTracks");
    // Check if the ol element with id 'topTracksList' already exists
    var topTracksList = document.getElementById('topTracksList');
    if (!topTracksList) {
        // If it doesn't exist, create a new ol element
        topTracksList = document.createElement('ol');
        topTracksList.id = 'topTracksList'; // Set the id attribute
        document.body.appendChild(topTracksList);
    } else {
        // If it exists, clear its content to update with new data
        topTracksList.innerHTML = '';
    }  

    topTracks.forEach(function(track) {
        var trackItem = document.createElement('li');
        var trackImage = document.createElement('img');
        trackImage.src = track.image_url;
        trackImage.alt = track.album;
        trackImage.width = '50';
        trackImage.height = '50';
        var trackInfo = document.createTextNode(`${track.name} - ${track.artist} (${track.album})`);
        var analyzeLink = document.createElement('a');
        analyzeLink.href = `/analyze/${track.track_id}/${track.access_token}`;
        analyzeLink.textContent = 'Analyze';
        trackItem.appendChild(trackImage);
        trackItem.appendChild(trackInfo);
        trackItem.appendChild(analyzeLink);
        topTracksList.appendChild(trackItem);
    });
    document.body.appendChild(topTracksList);
    console.log("Top tracks printed")    
}

// inital load of the website
function renderData(playlists, recentTracks, topTracks) {
    console.log("attempting to render data");
    console.log(topTracks)
    console.log(playlists)
    
    // Render top tracks
    renderTopTracks(topTracks);
    const selectElement = document.getElementById("term")
    selectElement.addEventListener('change', renderTopTracks(getTopTracks(getTerm())));
     
    // Render playlists
     var playlistsElement = document.createElement('h1');
     playlistsElement.textContent = 'My Playlists';
     document.body.appendChild(playlistsElement);
 
     var playlistsList = document.createElement('ul');
     playlists.forEach(function(playlist) {
         var playlistItem = document.createElement('li');
         var playlistLink = document.createElement('a');
         playlistLink.href = playlist.url;
         playlistLink.textContent = playlist.name;
         playlistItem.appendChild(playlistLink);
         playlistsList.appendChild(playlistItem);
     });
     document.body.appendChild(playlistsList);


    // Render recent tracks
    var recentTracksElement = document.createElement('h1');
    recentTracksElement.textContent = 'My Recent Tracks';
    document.body.appendChild(recentTracksElement);

    var recentTracksList = document.createElement('ul');
    recentTracks.forEach(function(track) {
        var trackItem = document.createElement('li');
        var trackImage = document.createElement('img');
        trackImage.src = track.image_url;
        trackImage.alt = track.album;
        trackImage.width = '50';
        trackImage.height = '50';
        var trackInfo = document.createTextNode(`${track.name} - ${track.artist} (${track.album})`);
        var analyzeLink = document.createElement('a');
        analyzeLink.href = `/analyze/${track.track_id}/${track.access_token}`;
        analyzeLink.textContent = 'Analyze';
        trackItem.appendChild(trackImage);
        trackItem.appendChild(trackInfo);
        trackItem.appendChild(analyzeLink);
        recentTracksList.appendChild(trackItem);
    });
    document.body.appendChild(recentTracksList);

    // Remove the loading screen
    //var loadingScreen = document.querySelector('.loading-screen');
    //loadingScreen.classList.remove('active');
}

function getAllUserPlaylists(headers) {
    const playlistsUrl = 'https://api.spotify.com/v1/me/playlists';
    const limit = 50; // Maximum number of playlists to retrieve per request
    let offset = 0;
    const allPlaylists = [];

    function fetchPlaylists() {
        const params = new URLSearchParams({
            limit: limit,
            offset: offset
        });

        return fetch(`${playlistsUrl}?${params}`, { headers })
            .then(response => response.json())
            .then(data => data.items)
            .catch(error => {
                console.error('Failed to fetch playlists:', error);
                return [];
            });
    }

    function fetchAllPlaylists() {
        return fetchPlaylists().then(playlists => {
            if (playlists.length === 0) {
                // No more playlists, return the accumulated results
                return allPlaylists;
            } else {
                // Add the fetched playlists to the accumulated results
                allPlaylists.push(...playlists);

                // Increment the offset and fetch the next set of playlists
                offset += limit;
                return fetchAllPlaylists();
            }
        });
    }

    return fetchAllPlaylists();
}
//Function to update the playlist with new tracks
function updatePlaylist() {
    // Fetch the access token from the URL (same as before)
    const accessToken = getAccessTokenFromURL();

    // Use the access token to make requests to the Spotify API
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };

    // Get all the user's playlists
    getAllUserPlaylists(headers)
        .then(playlists => {
            // Find the playlist named "EVERYTHING DUMP !@#$%^&*("
            const playlist = playlists.find(item => item.name === 'EVERYTHING DUMP !@#$%^&*(');

            if (!playlist) {
                // If the playlist doesn't exist, create it
                createNewPlaylist(headers);
            } 
            // If the playlist exists, get all its tracks and the tracks from other playlists
            const playlistId = playlist.id;
            getAllTracksFromPlaylist(playlistId, headers)
                .then(dumpTracks => {
                    getAllOtherTracks(playlists, playlistId, headers)
                        .then(otherTracks => {
                            const uniqueTracks = getUniqueTracks(otherTracks, dumpTracks);
                            if (uniqueTracks.length > 0) {
                                console.log("adding songs to playlist")
                                // Add the unique tracks to the playlist
                                addAllTracksToPlaylist(uniqueTracks, playlistId, headers);
                            }
                            // Redirect back to the main page after updating the playlist
                            //window.location.href = '/';
                        })
                        .catch(error => console.error('Failed to fetch other tracks:', error));
                })
                .catch(error => console.error('Failed to fetch dump tracks:', error));
        })
        .catch(error => console.error('Failed to fetch playlists:', error));
}

// Function to create a new playlist named "EVERYTHING DUMP !@#$%^&*("
function createNewPlaylist(headers) {
    const createPlaylistUrl = 'https://api.spotify.com/v1/me/playlists';
    const request_data = {
        name: 'EVERYTHING DUMP !@#$%^&*(',
        public: false,
        description: 'A playlist containing every song from all other playlists'
    };
    fetch(createPlaylistUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(request_data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                console.log('Playlist created successfully:', data.name);
            } else {
                console.error('Failed to create playlist');
            }
            // Redirect back to the main page after creating the playlist
            window.location.href = '/';
        })
        .catch(error => console.error('Failed to create playlist:', error));
}



// Function to get all tracks from a playlist
async function getAllTracksFromPlaylist(playlistId, headers) {
    const limit = 50;
    let offset = 0;
    const allTracks = [];

    while (true) {
        const params = {
            offset: offset,
            limit: limit
        };

        const playlistTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?${new URLSearchParams(params)}`;

        try {
            const response = await fetch(playlistTracksUrl, { headers });
            const playlistTracksData = await response.json();
            const tracks = playlistTracksData.items;

            if (!tracks || tracks.length === 0) {
                break;
            }

            allTracks.push(...tracks);
            offset += limit;
        } catch (error) {
            console.error('Failed to fetch playlist tracks:', error);
            break;
        }
    }
    console.log(allTracks);
    return allTracks;
}


// Function to get all tracks from other playlists except the "EVERYTHING DUMP !@#$%^&*(" playlist
function getAllOtherTracks(playlists, dumpPlaylistId, headers) {
    const allOtherTracks = [];
    const promises = [];
    for (const playlist of playlists) {
        if (playlist.id !== dumpPlaylistId) {
            const promise = getAllTracksFromPlaylist(playlist.id, headers);
            promises.push(promise);
        }
    }
    return Promise.all(promises)
        .then(results => {
            for (const tracks of results) {
                allOtherTracks.push(...tracks);
            }
            return allOtherTracks;
        })
        .catch(error => {
            console.error('Failed to fetch other tracks:', error);
            return [];
        });
}

// Function to get unique tracks by comparing dump tracks with other tracks
function getUniqueTracks(otherTracks, dumpTracks) {
    const uniqueTracks = [];
    const dumpTrackURIs = dumpTracks.map(track => track.track.uri);
    var errorCount = 0;
    console.log("attempting to find unique tracks");
    for (const track of otherTracks) {
        console.log(track.track);
        try {
            const trackURI = track.track.uri;
            if (!dumpTrackURIs.includes(trackURI)) {
                uniqueTracks.push(trackURI);
            }
        } 
        catch(error) {
            errorCount = errorCount + 1;
            console.log("error number: " + errorCount + ". " + error.message);
        }
        
    }
    console.log(" unique tracks: " + (uniqueTracks));
    return uniqueTracks;
}

// Function to add all tracks to the playlist
function addAllTracksToPlaylist(trackURIs, playlistId, headers) {
    const addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const batchSize = 100;

    for (let i = 0; i < trackURIs.length; i += batchSize) {
        const batchURIs = trackURIs.slice(i, i + batchSize);
        const request_data = {
            uris: batchURIs
        };

        fetch(addTracksUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(request_data)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Tracks added to the playlist:', data);
            })
            .catch(error => console.error('Failed to add tracks to the playlist:', error));
    }
}


