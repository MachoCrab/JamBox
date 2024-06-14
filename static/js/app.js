var getDataButton = document.getElementById('get-data-button');

if (getDataButton) {
    getDataButton.addEventListener('click', function () {
        document.getElementById('loading-screen').style.display = "flex";
        authorizeSpotify();
    });
}

function authorizeSpotify() {
    var clientId = '97a45e5baf1640f0bd179cc0137fe054';
    var redirectUri = 'https://emma-nipperess.github.io/JamBox/data.html';

    var authParams = new URLSearchParams({
        client_id: clientId,
        response_type: 'token',
        redirect_uri: redirectUri,
        scope: 'playlist-read-private user-read-recently-played playlist-modify-public playlist-modify-private user-top-read',
    });
    var authorizationUrl = 'https://accounts.spotify.com/authorize?' + authParams;

    window.location.href = authorizationUrl;
}

function getAccessTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.hash.substr(1));
    return urlParams.get('access_token');
}

document.addEventListener('DOMContentLoaded', function () {
    const accessToken = getAccessTokenFromURL();
    if (accessToken) {
        fetchData(accessToken);
    }
});

function getTopTracks(term) {
    const accessToken = getAccessTokenFromURL();
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };

    return fetch('https://api.spotify.com/v1/me/top/tracks?time_range=' + term + '&limit=50', { headers })
        .then(response => response.json())
        .then(data => {
            var topTracks = data.items.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                image_url: track.album.images[0].url,
                track_id: track.id
            }));
            return topTracks;
        })
        .catch(error => {
            console.error('Failed to fetch top tracks:', error);
            return [];
        });
}

function getRecentlyPlayed() {
    const accessToken = getAccessTokenFromURL();
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };

    return fetch('https://api.spotify.com/v1/me/player/recently-played', { headers })
        .then(response => response.json())
        .then(data => {
            var recentTracks = data.items.map(track => ({
                name: track.track.name,
                artist: track.track.artists[0].name,
                album: track.track.album.name,
                image_url: track.track.album.images[0].url,
                track_id: track.track.id
            }));
            return recentTracks;
        })
        .catch(error => {
            console.error('Failed to fetch recently played tracks:', error);
            return [];
        });
}

function fetchData(accessToken) {
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };

    Promise.all([
        getRecentlyPlayed(),
        getTopTracks('medium_term')
    ])
    .then(data => {
        var recentTracks = data[0];
        var topTracks = data[1];

        getAllUserPlaylists(headers).then(playlists => {
            var allPlaylists = playlists.map(playlist => ({
                url: playlist.external_urls['spotify'],
                name: playlist.name
            }));
            renderData(allPlaylists, recentTracks, topTracks);
        });
    })
    .catch(error => console.error('Failed to fetch data:', error));

    document.getElementById("loading-screen").display = "none";
}

function updateTopTracks(term) {
    getTopTracks(term).then(data => {
        renderTopTracks(data);
    });
}

function renderTopTracks(topTracks) {
    var topTracksList = document.getElementById('topTracksList');
    if (!topTracksList) {
        topTracksList = document.createElement('ol');
        topTracksList.id = 'topTracksList';
        document.getElementById("main").appendChild(topTracksList);
    } else {
        topTracksList.innerHTML = '';
    }
    topTracks.forEach(function (track) {
        var trackItem = document.createElement('li');
        var trackImage = document.createElement('img');
        trackImage.src = track.image_url;
        trackImage.alt = track.album;
        trackImage.width = '50';
        trackImage.height = '50';
        var trackInfo = document.createTextNode(`${track.name} - ${track.artist} (${track.album})`);
        var analyzeLink = document.createElement('a');
        analyzeLink.href = `/analyze/${track.track_id}`;
        analyzeLink.textContent = 'Analyze';
        trackItem.appendChild(trackImage);
        trackItem.appendChild(trackInfo);
        trackItem.appendChild(analyzeLink);
        topTracksList.appendChild(trackItem);
    });
}

function renderData(playlists, recentTracks, topTracks) {
    renderTopTracks(topTracks);

    var playlistsElement = document.createElement('h1');
    playlistsElement.textContent = 'Your Playlists';
    document.getElementById("main").appendChild(playlistsElement);

    var playlistsList = document.createElement('ul');
    playlists.forEach(function (playlist) {
        var playlistItem = document.createElement('li');
        var playlistLink = document.createElement('a');
        playlistLink.href = playlist.url;
        playlistLink.textContent = playlist.name;
        playlistItem.appendChild(playlistLink);
        playlistsList.appendChild(playlistItem);
    });
    document.getElementById("main").appendChild(playlistsList);

    var recentTracksElement = document.createElement('h1');
    recentTracksElement.textContent = 'Your Recent Tracks';
    document.getElementById("main").appendChild(recentTracksElement);

    var recentTracksList = document.createElement('ul');
    recentTracks.forEach(function (track) {
        var trackItem = document.createElement('li');
        var trackImage = document.createElement('img');
        trackImage.src = track.image_url;
        trackImage.alt = track.album;
        trackImage.width = '50';
        trackImage.height = '50';
        var trackInfo = document.createTextNode(`${track.name} - ${track.artist} (${track.album})`);
        var analyzeLink = document.createElement('a');
        analyzeLink.href = `/analyze/${track.track_id}`;
        analyzeLink.textContent = 'Analyze';
        trackItem.appendChild(trackImage);
        trackItem.appendChild(trackInfo);
        trackItem.appendChild(analyzeLink);
        recentTracksList.appendChild(trackItem);
    });
}

function getAllUserPlaylists(headers) {
    const playlistsUrl = 'https://api.spotify.com/v1/me/playlists';
    const limit = 50;
    let offset = 0;
    const allPlaylists = [];

    async function fetchPlaylists() {
        showLoadingScreen("Fetching your playlists at offset: " + offset);
        const params = new URLSearchParams({
            limit: limit,
            offset: offset
        });

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to prevent rate limiting

        return fetch(`${playlistsUrl}?${params}`, { headers })
            .then(response => response.json())
            .then(data => data.items)
            .catch(error => {
                console.error('Failed to fetch playlists:', error);
                return [];
            });
    }

    async function fetchAllPlaylists() {
        const playlists = await fetchPlaylists();
        if (playlists.length === 0) {
            return allPlaylists;
        } else {
            allPlaylists.push(...playlists);
            offset += limit;
            return fetchAllPlaylists();
        }
    }

    showLoadingScreen("Fetching your playlists...");

    return fetchAllPlaylists();
}

async function getAllTracksFromPlaylist(playlistId, headers) {

    const limit = 50;
    let offset = 0;
    const allTracks = [];

    while (true) {
        const params = {
            offset: offset,
            limit: limit
        };
        showLoadingScreen("Getting songs from playlistId:" + playlistId + ". Currently at offset: " + offset);

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to prevent rate limiting

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
    return allTracks;
}

async function getAllOtherTracks(playlists, headers) {
    const allOtherTracks = [];
    for (const playlist of playlists) {
        const tracks = await getAllTracksFromPlaylist(playlist.id, headers);
        allOtherTracks.push(...tracks);
    }
    return allOtherTracks;
}

function getUniqueTracks(otherTracks) {
    console.log("getting unique tracks");
    
    const uniqueTrackSet = new Set();
    const uniqueTracks = [];

    // Add all other tracks to the set
    otherTracks.forEach(track => {
        try {
            const trackURI = track.track.uri;
            if (!uniqueTrackSet.has(trackURI)) {
                uniqueTrackSet.add(trackURI);
                uniqueTracks.push(trackURI);
            }
        } catch (error) {
            console.log("Error: " + error.message);
        }
    });

    return uniqueTracks;
}


async function addAllTracksToPlaylist(trackURIs, playlistId, headers) {
    console.log("adding all the tracks to playlist- woo");
    
    const addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const batchSize = 100;

    for (let i = 0; i < trackURIs.length; i += batchSize) {
        const batchURIs = trackURIs.slice(i, i + batchSize);
        const request_data = {
            uris: batchURIs
        };

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to prevent rate limiting

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

function getTerm() {
    const term = document.getElementById("term").value;
    console.log("Term" + term);
    return term;
}

document.getElementById('update-playlist-button').addEventListener('click', () => {
    const playlistName = document.getElementById('playlist-name').value;
    if (playlistName) {
        updatePlaylist(playlistName);
    } else {
        alert('Please enter a playlist name.');
    }
});

function createNewPlaylist(headers, playlistName) {
    showLoadingScreen("Creating new playlist...");
    const createPlaylistUrl = 'https://api.spotify.com/v1/me/playlists';
    const request_data = {
        name: playlistName,
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
                hideLoadingScreen();
                console.error('Failed to create playlist');
            }
        })
        .catch(error => console.error('Failed to create playlist:', error));
}

async function updatePlaylist(playlistName) {
    const accessToken = getAccessTokenFromURL();
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };

    showLoadingScreen("Fetching your playlists...");

    const playlists = await getAllUserPlaylists(headers);
    const playlist = playlists.find(item => item.name === playlistName);

    if (!playlist) {
        
        await createNewPlaylist(headers, playlistName);
        const newPlaylists = await getAllUserPlaylists(headers); // Fetch playlists again to get the new playlist ID
        const newPlaylist = newPlaylists.find(item => item.name === playlistName);
        await processPlaylist(newPlaylist.id, headers, playlists);
    } else {
        alert("use a playlist name that doesn't exist. This function is lowkey dangerous and would otherwise pollute whatever playlist you pass with alot of songs.")
    }

    hideLoadingScreen();
}

async function processPlaylist(playlistId, headers, playlists) {
    showLoadingScreen("Fetching tracks from your playlists...");

    const otherTracks = await getAllOtherTracks(playlists, headers);

    showLoadingScreen("Filtering unique tracks...");

    const uniqueTracks = getUniqueTracks(otherTracks);
    if (uniqueTracks.length > 0) {
        showLoadingScreen("Adding unique tracks to your playlist...");
        await addAllTracksToPlaylist(uniqueTracks, playlistId, headers);
    }
}

function showLoadingScreen(message) {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingMessage = document.getElementById('loading-message');
    const progress = document.getElementById('progress');
    loadingMessage.textContent = message;
    loadingScreen.style.display = "flex";
    progress.style.width = `${Math.min(parseInt(progress.style.width) + 20, 100)}%`;
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const progress = document.getElementById('progress');
    loadingScreen.style.display = "none";
    progress.style.width = "0%";
}
