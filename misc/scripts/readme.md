# smToDodo

Script needs Python with Simfile and Pydub as extra libraries (versions I have are python=3.11.5, simfile=2.1.1 and pydub=0.25.1) <br>
Also either way you need ffmpeg, ideally in the Path variable

Before using it the first time, you have to set the SongsPath in the config file to where your Dodo Re Mi song folder is ([PP10Location]/games/NopusOpus/songs) <br>
Then you can just run python smToDodo.py -h to see all relevant options

Config also includes FfmpegPath, if it doesn't auto detect it automatically (leave it blank unless it doesn't work) <br>
The instrument category set instrument, along with midi note value and sample length for hitsounding <br>
There are two sets based on if the difficulty converted is an edit or not