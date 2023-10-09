# v0.5
import simfile, mutagen
import json, re, itertools, argparse
from simfile.timing import Beat, TimingData
from simfile.notes import NoteData, NoteType
from simfile.notes.group import group_notes, NoteWithTail, Note
from simfile.timing.engine import TimingEngine
from pathlib import Path
from shutil import rmtree, copyfile

parser = argparse.ArgumentParser()
parser.add_argument("chart_path", help = "the path of the stepmania file you want to convert", type = Path)
parser.add_argument("songs_path", help = "the path of the songs folder for Dodo Re Mi (should be [PACK10FOLDER]/games/NopusOpus/songs)", type = Path)
args = parser.parse_args()

if not (args.songs_path.is_dir()):
    print("ERROR: Song folder doesn't seem to exist!")
    raise SystemExit

categories = ["AuxPercussion", "Bass", "CounterMelody", "Drums", "Harmony", "Melody", "Signature"]

def mapTemplate():
    beatmap = {}
    beatmap["slug"] = ""
    beatmap["type"] = "Discrete"
    beatmap["category"] = ""
    beatmap["difficulty"] = 0
    beatmap["instruments"] = []
    beatmap["instrumentRequirements"] = []
    beatmap["events"] = []
    beatmap["inputs"] = []
    beatmap["laneCount"] = 0

    return beatmap

def diffToNum(diff):
    if diff == "Beginner":
        return 1
    elif diff == "Easy":
        return 2
    elif diff == "Medium":
        return 3
    elif diff == "Hard":
        return 4
    elif diff in ("Challenge", "Edit"):
        return 5

def t(b): # beat to time
    return int(str(engine.time_at(Beat(b))).replace(".",""))

def r(s): # apply regex on string
    return re.sub(r"\W+", "", s, flags = re.A)

output = {}

output["slug"] = ""
output["composer"] = ""
output["duration"] = 0
output["bucket"] = "Original"
output["scaleKey"] = "a"
output["scaleType"] = "minor"
output["guideStartOffset"] = 0
output["guide"] = []
output["hasLocalizedBackingTrack"] = False
output["beatmaps"] = []
output["preferredAssignments"] = []


thefile = simfile.open(args.chart_path)
engine = TimingEngine(TimingData(thefile))
output["slug"] = f"{r(thefile.titletranslit if thefile.titletranslit else thefile.title)}-{r(thefile.artisttranslit if thefile.artisttranslit else thefile.artist)}".lower()
output["composer"] = thefile.artisttranslit if thefile.artisttranslit else thefile.artist

music = mutagen.File(args.chart_path.parent.joinpath(thefile.music))
output["duration"] = int(music.info.length * 1000)

### Guide section ###
for s in itertools.count(start = 0):
    if t(s) > 0:
        break
output["guide"].append([0, t(s), t(s+1), t(s+2)])
for i in itertools.count(start=0):
    a = s + 3 + i*4
    if t(a) > output["duration"]:
        break
    output["guide"].append([t(a), t(a+1), t(a+2), t(a+3)])
for b in list(output["guide"][-1]):
    if b > output["duration"]:
        output["guide"][-1].remove(b)
### Guide section ###

slugs = []
dups = 0
early_flag = False
for slot, chart in enumerate(thefile.charts):
    slot = slot - dups
    if slot > 6:
        print("WARNING: Your file has more than 7 charts! Dodo Re Mi only supports 7 charts per song. A folder will still be generated, but some of the charts might be missing.")
        print(f"Here are the IDs of the generated charts: {slugs}")
        break

    slug = f"{r(chart.stepstype)}-{chart.difficulty}{chart.meter}-{r(chart.description)}".lower()

    if slug in slugs:
        print("WARNING: Your file has two charts that generated the same ID! This means they are equal in steps type, difficulty, meter and description. The duplicate will be skipped.")
        print(f"Here is the ID of the duplicate: {slug}")
        dups += 1
        continue

    slugs.append(slug)

    beatmap = mapTemplate()
    beatmap["slug"] = slug
    beatmap["category"] = categories[slot] 
    beatmap["difficulty"] = diffToNum(chart.difficulty)

    instrument = "pieces-of-wood" if chart.difficulty == "Edit" else "wood-block"
    beatmap["instruments"].append(instrument)

    maxcolumn = 0
    notedata = group_notes(NoteData(chart), join_heads_to_tails=True)
    for n in notedata:
        n = n[0]
        if type(n) == Note:
            if n.note_type != NoteType.TAP:
                continue
        if n.column > 5:
            maxcolumn = 6
            continue

        input = {"start": t(n.beat), "lanes": [n.column], "notes":[]}
        if type(n) == NoteWithTail:
            input["duration"] = t(n.tail_beat) - t(n.beat)

        if input["start"] < 3000:
            if not early_flag:
                print("WARNING: At least one of your charts has at least one note in the first 3 seconds! Due to some reason I don't know yet, notes before 3 seconds do not work correctly. They will be discarded from the chart.")
                print(f"Here is the ID of the chart that triggered this warning (there might be more charts with the same issue): {slug}")
                early_flag = True
            continue
        
        beatmap["inputs"].append(input)

        maxcolumn = max(maxcolumn, n.column)

    if maxcolumn > 5:
        print("WARNING: Your file has a chart that has more than 6 columns! Dodo Re Mi only supports 6 lanes per chart. The chart will still be added, but notes in lanes above the sixth have been discarded.")
        print(f"Here is the ID of the relevant chart: {slug}")
        maxcolumn = 5
    beatmap["laneCount"] = maxcolumn + 1

    output["beatmaps"].append(beatmap)
    output["preferredAssignments"].append([beatmap["slug"], instrument])

if Path(args.songs_path.joinpath(output["slug"])).exists():
    rmtree(args.songs_path.joinpath(output["slug"]))
Path(args.songs_path.joinpath(output["slug"])).mkdir()

if thefile.music.endswith(".ogg"):
    copyfile(args.chart_path.parent.joinpath(thefile.music), args.songs_path.joinpath(f"{output['slug']}/backing.ogg"))
else:
    print("WARNING: The file has a music track that is not in .ogg format! Formats other than .ogg will probably not work. You will have to convert the song yourself.")
    print("Specifically, the file has to be called \"backing.ogg\" after you have converted it.")
    copyfile(args.chart_path.parent.joinpath(thefile.music), args.songs_path.joinpath(f"{output['slug']}/{thefile.music}"))

with open(args.songs_path.joinpath(f"{output['slug']}/config.json"), "w", encoding='utf8') as file:
        json.dump(output, file, indent = 4, ensure_ascii = False)

title = {"TITLE": thefile.titletranslit if thefile.titletranslit else thefile.title}
for lang in ["de","en","es","es-XL","fr","it"]:
    with open(args.songs_path.joinpath(f"{output['slug']}/{lang}.json"), "w", encoding='utf8') as file:
        json.dump(title, file, indent = 4, ensure_ascii = False)

print(f"INFO: The folder has been generated! Here is the ID: {output['slug']}")
print(f"In order to add the song to the game, you still need to add that ID in the songs.json file of the game.")