from flask import Flask, redirect, request, render_template
import requests
import json
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from urllib.parse import urlencode

class SpotifyPlaylistManager:
    def __init__(self):
        self.url = "http://192.168.0.219:5000"
        self.url_cal = "http://192.168.0.219:5000/callback"
        self.headers = None
        self.app = Flask(__name__)
        self.access_token = None
        self.client_id = '97a45e5baf1640f0bd179cc0137fe054'
        self.client_secret = 'abe2b6432ef743b98a107eddb7dcb138'

    def run(self):
        self.app.run(host='0.0.0.0')

    def index(self):
        return render_template('index.html')
    def authorize(self):
        # Generate a unique state value for each user session
        #state = generate_unique_state()

        # Store the state value in session or a database for later verification

        # Construct the authorization URL with the unique state value
        params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'redirect_uri': self.url_cal,
            'scope': 'playlist-read-private user-read-recently-played playlist-modify-public playlist-modify-private user-top-read',
            #'state': state
        }
        authorization_url = 'https://accounts.spotify.com/authorize?' + urlencode(params)

        return redirect(authorization_url)

    def callback(self):
        # Extract the authorization code and state from the query parameters
        authorization_code = request.args.get('code')
        #state = request.args.get('state')

        # Verify the state value to prevent CSRF attacks
        #if not verify_state(state):
        #    return 'Invalid state value'

        # Use the authorization code to obtain the access token
        token_url = 'https://accounts.spotify.com/api/token'
        data = {
            'grant_type': 'authorization_code',
            'code': authorization_code,
            'redirect_uri': self.url_cal,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        response = requests.post(token_url, data=data)
        response_data = response.json()

        if 'access_token' in response_data:
            self.access_token = response_data['access_token']
            print(f"access token: {self.access_token}")
        else:
            return 'Failed to obtain access token'

        # Use the access token to make requests to the Spotify API
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        playlists_data = self.get_user_playlists()

        # Extract the relevant information from the playlists_data
        playlists = []
        for playlist in playlists_data:
            playlists.append({
                'name': playlist['name'],
                'url': playlist['external_urls']['spotify']
            })
        recent_tracks = self.get_user_recent_tracks()
        top_tracks = self.get_top_tracks("medium_term")

        #self.generate_bar_graph(top_tracks)

         # Encode the graph image as base64
        #graph_image_base64 = self.encode_graph_image()
        #, graph_image_base64=graph_image_base64
        return render_template('data.html', playlists=playlists, recent_tracks=recent_tracks, top_tracks=top_tracks)

    def get_user_recent_tracks(self):
        # Get the user's most recent tracks
        recent_tracks_url = 'https://api.spotify.com/v1/me/player/recently-played'
        response = requests.get(recent_tracks_url, headers=self.headers)
        recent_tracks_data = response.json()

        # Extract the relevant information from the recent_tracks_data
        recent_tracks = []
        for track in recent_tracks_data['items']:
            track_info = track['track']
            recent_tracks.append({
                'name': track_info['name'],
                'artist': track_info['artists'][0]['name'],
                'album': track_info['album']['name'],
                'image_url': track_info['album']['images'][0]['url'],
                'track_id': track_info['id'],
                'access_token': self.access_token
            })
        return recent_tracks
    
    def get_top_tracks(self, term):
        # Get the user's most recent tracks
        top_tracks_url = 'https://api.spotify.com/v1/me/top/tracks'
        params = {
            'time_range': term,
            'limit': 50
        }
        response = requests.get(top_tracks_url, headers=self.headers, params=params)
        print(response)
        top_tracks_data = response.json()

        # Extract the relevant information from the recent_tracks_data
        top_tracks = []
        for track_info in top_tracks_data['items']:
            top_tracks.append({
                'name': track_info['name'],
                'artist': track_info['artists'][0]['name'],
                'album': track_info['album']['name'],
                'image_url': track_info['album']['images'][0]['url'],
                'track_id': track_info['id'],
                'access_token': self.access_token
            })
        return top_tracks

    def get_user_playlists2(self):
        # Use the access token to make requests to the Spotify API
        playlists_url = 'https://api.spotify.com/v1/me/playlists'
        response = requests.get(playlists_url, headers=self.headers)
        playlists_data = response.json()
        return playlists_data

    def get_user_playlists(self):
        playlists_url = 'https://api.spotify.com/v1/me/playlists'
        limit = 50  # Maximum number of playlists to retrieve per request
        offset = 0
        all_playlists = []

        while True:
            params = {
                'limit': limit,
                'offset': offset
            }
            response = requests.get(playlists_url, headers=self.headers, params=params)
            print(response.text)
            playlists_data = response.json()
            playlists = playlists_data.get('items', [])

            if not playlists:
                break

            all_playlists.extend(playlists)
            offset += limit
        return all_playlists

    def analyze(self, track_id):
        # Spotify API endpoint URL for retrieving audio features of a track
        audio_features_url = f'https://api.spotify.com/v1/audio-features/{track_id}'

        # Send a GET request to retrieve the audio features of the track
        response = requests.get(audio_features_url, headers=self.headers)
        audio_features_data = response.json()

        return audio_features_data

    def get_playlist(self, playlist_name, playlists_data):
        playlist_id = None
        for playlist in playlists_data:
            if playlist['name'] == playlist_name:
                playlist_id = playlist['id']
                return playlist_id
                break

    def create_new_playlist(self, playlist_name):
        # Create the "EVERYTHING DUMP !@#$%^&*(" playlist
        create_playlist_url = 'https://api.spotify.com/v1/me/playlists'
        request_data = {
            "name": playlist_name,
            "public": False,
            "description": "A playlist containing every song from all other playlists"
        }
        response = requests.post(create_playlist_url, headers=self.headers, json=request_data)
        if response.status_code == 201:
            playlist_id = response.json().get('id')
        else:
            return "Playlist could not be created"

    def update_playlist(self):
        # Get the user's playlists
        print("YOOO ITS AN ACCESS TOKEN: " + self.access_token)
        all_playlists_data = self.get_user_playlists()

        # Find the playlist named "EVERYTHING DUMP !@#$%^&*("
        playlist_id = self.get_playlist('EVERYTHING DUMP !@#$%^&*(', all_playlists_data)

        if not playlist_id:
            playlist_id = self.create_new_playlist('EVERYTHING DUMP !@#$%^&*(')

        dump_tracks_data = self.get_all_playlist_tracks(playlist_id)

        print("getting dump track data")

        print("EVERYTHING LIST LENGTH " + str(len(dump_tracks_data)))
        dump_tracks_uris = self.get_uris(dump_tracks_data)
        error_count = 0
        passed_count = 0
        track_uris = []

        print("getting all song uris")
        for playlist in all_playlists_data:
            if playlist['id'] != playlist_id:
                playlist_tracks_data = self.get_all_playlist_tracks(playlist['id'])

                for track in playlist_tracks_data:
                    try:
                        track_uri = track['track']['uri']
                        if track_uri not in track_uris:
                            track_uris.append(track_uri)
                            passed_count += 1
                    except:
                        print(f"ERROR OCCURRED WITH {track_uri}")
                        print(f"{str(track)} and this is the {error_count} failed track /n /n /n ")
                        error_count += 1

        add_tracks_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
        unique_tracks = self.get_unique_tracks(track_uris, dump_tracks_uris)

        print(f" the length of the unique tracks is: {len(unique_tracks)}")

        if len(unique_tracks) > 0:
            self.add_all_tracks(unique_tracks, add_tracks_url)

        playlist_tracks_data = self.get_all_playlist_tracks(playlist_id)
        print(f"Everything playlist length: {len(playlist_tracks_data)}")

        return redirect(self.url)

    def get_uris(self, playlist_data):
        uris = []
        for track in playlist_data:
            try:
                track_uri = track['track']['uri']
                uris.append(track_uri)
            except:
                print(f"ERROR OCCURRED WITH {track_uri}")

        return uris

    def get_all_playlist_tracks(self, playlist_id):

        playlist_tracks_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
        offset = 0
        limit = 50
        all_tracks = []

        while True:
            params = {
                "offset": offset,
                "limit": limit
            }
            response = requests.get(playlist_tracks_url, headers=self.headers, params=params)
            playlist_tracks_data = response.json()
            tracks = playlist_tracks_data.get("items", [])

            if not tracks:
                break

            all_tracks.extend(tracks)
            offset += limit

        return all_tracks


    def get_tracks_to_delete(self, songs_dict):
        duplicate_tracks = []
        for song in list(songs_dict.keys()):
            while songs_dict[song] > 0:
                duplicate_tracks.append(song)
                songs_dict[song] -= 1

        return duplicate_tracks

    def delete_all_tracks(self, track_uris, delete_track_url):
        print(f'Length of duplicate tracks: {len(track_uris)}')
        if len(track_uris) <= 100:
            request_data = {
                "uris": track_uris,
            }
            response = requests.delete(delete_track_url, headers=self.headers, json=request_data)

        else:
            print("MORE deletion")
            request_data = {
                "uris": track_uris[0:100]
            }
            response = requests.delete(delete_track_url, headers=self.headers, json=request_data)
            self.delete_all_tracks(track_uris[100:len(track_uris) - 1], delete_track_url)

    def get_unique_tracks(self, track_uris, dump_tracks_data):
        unique_tracks = []
        for track in track_uris:
            if dump_tracks_data.count(track) < 1 and track not in unique_tracks:
                unique_tracks.append(track)
        
        return unique_tracks

    def add_all_tracks(self, track_uris, add_tracks_url):
        if len(track_uris) <= 100:
            request_data = {
                "uris": track_uris,
            }
            response = requests.post(add_tracks_url, headers=self.headers, json=request_data)
        else:
            print("MORE")
            request_data = {
                "uris": track_uris[0:100]
            }
            response = requests.post(add_tracks_url, headers=self.headers, json=request_data)
            self.add_all_tracks(track_uris[100:len(track_uris) - 1], add_tracks_url)

    def generate_bar_graph(self, recent_tracks):
        danceability_list = []
        energy_list = []
        instrumentalness_list = []

        for track in recent_tracks:
            track_id = track['track_id']
            audio_features_data = self.analyze(track_id)

            danceability_list.append(audio_features_data['danceability'])
            energy_list.append(audio_features_data['energy'])
            instrumentalness_list.append(audio_features_data['instrumentalness'])

        average_danceability = sum(danceability_list) / len(danceability_list)
        average_energy = sum(energy_list) / len(energy_list)
        average_instrumentalness = sum(instrumentalness_list) / len(instrumentalness_list)

        labels = ['Danceability', 'Energy', 'Instrumentalness']
        values = [average_danceability, average_energy, average_instrumentalness]

        plt.bar(labels, values)

        plt.xlabel('Audio Features')
        plt.ylabel('Average Value')
        plt.title('Average Audio Features of Tracks')

    def encode_graph_image(self):
        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        graph_image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        return graph_image_base64

    def route(self, path):
        return self.app.route(path)

playlist_manager = SpotifyPlaylistManager()

@playlist_manager.route('/')
def index():
    return playlist_manager.index()

@playlist_manager.route('/authorize')
def authorize():
    return playlist_manager.authorize()

@playlist_manager.route('/callback')
def callback():
    return playlist_manager.callback()

@playlist_manager.route('/update_playlist')
def update_playlist():
    return playlist_manager.update_playlist()

@playlist_manager.route('/analyze/<track_id>/<access_token>')
def analyze():
    return playlist_manager.analyze()

if __name__ == '__main__':
    playlist_manager.run()
