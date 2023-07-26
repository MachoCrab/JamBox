# Spotify App README
## Introduction
This is a web application that interacts with the Spotify API to retrieve and display various data related to a user's account and playlists. The application allows users to authorize the app with their Spotify account, and then fetches data like top tracks, recently played tracks, and playlists from the user's Spotify account.

## Setup and Authorization
To use the app, follow these steps:

Run the App: Open 'https://emma-nipperess.github.io/JamBox/' in a web browser.

Request access to the site. As noted on the webpage, for legal reasons this app cannot be moved out of development stage and I will have to accept any user access. To avoid this you can register your own spotify app and set the redirect URI to: 'https://emma-nipperess.github.io/JamBox/data.html'

Once obtained access, click "Get Data" Button: Once the app is running, click on the "Get Data" button. This will initiate the Spotify authorization process.

Authorization: The app will redirect you to the Spotify login page. After you log in and grant the necessary permissions, you will be redirected back to the app.

Data Display: The app will then display information about your playlists, top tracks, and recently played tracks.

## Code Structure
The JavaScript code is structured as follows:

Authorization and Access Token Retrieval: The app starts by requesting authorization from the user to access their Spotify account. The access token is extracted from the URL after authorization.

Fetching User Data: The app then fetches data about the user's top tracks and recently played tracks using the Spotify API.

Fetching Playlists: The app fetches all the user's playlists using the getAllUserPlaylists function, which recursively retrieves playlists in batches.

Rendering Data: The fetched data is then rendered on the web page, displaying the user's top tracks, recently played tracks, and playlists.

Updating Playlist: The app can update an existing playlist named "EVERYTHING DUMP !@#$%^&*(" by finding unique tracks from other playlists and adding them to the target playlist.

## Functions Overview
Here's a brief overview of the main functions used in the app:

authorizeSpotify(): Initiates the Spotify authorization process.

getAccessTokenFromURL(): Extracts the access token from the URL after successful authorization.

getAllUserPlaylists(headers): Fetches all the user's playlists in batches.

getTopTracks(term): Fetches the user's top tracks for a given term (short_term, medium_term, long_term).

getRecentlyPlayed(): Fetches the user's recently played tracks.

getAllTracksFromPlaylist(playlistId, headers): Fetches all tracks from a given playlist in batches.

getAllOtherTracks(playlists, dumpPlaylistId, headers): Fetches all tracks from other playlists (except the "EVERYTHING DUMP !@#$%^&*(" playlist).

getUniqueTracks(otherTracks, dumpTracks): Finds unique tracks from other playlists that are not present in the "EVERYTHING DUMP !@#$%^&*(" playlist.

addAllTracksToPlaylist(trackURIs, playlistId, headers): Adds all tracks to the target playlist.

createNewPlaylist(headers): Creates a new playlist named "EVERYTHING DUMP !@#$%^&*(".

fetchData(accessToken): Fetches and renders all the user's data after successful authorization.

updatePlaylist(): Updates the "EVERYTHING DUMP !@#$%^&*(" playlist with unique tracks from other playlists.

## Note
The app uses promises and asynchronous functions to handle API requests and data retrieval, ensuring a smooth and responsive user experience. Make sure to replace the client ID with your own and set up the Redirect URI as mentioned in the Setup section. If you encounter any issues, check the console for error messages that might provide insights into the problem. Feel free to modify and extend the app to suit your needs!