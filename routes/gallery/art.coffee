default_description = "No description provided" # TODO: hire a writer (i suck at writing)
default_context = "Nobody knows anything about this"
# default_year = "#{new Date().getFullYear()}"

all_art = [
    filename: "10000ms.png"
    name: "10000ms"
,
    filename: "a_dream.png"
    name: "A Dream"
,
    filename: "absent.png"
    name: "Absent"
,
    filename: "afterglow.png"
    name: "Afterglow"
,
    filename: "alien fractal.png"
    name: "Alien Fractal"
,
    filename: "ASITD.png"
    name: "ASITD"
,
    filename: "boats.png"
    name: "Boats"
,
    filename: "burnt dream.png"
    name: "Burnt Dream"
,
    filename: "Butterfly.png"
    name: "Butterfly"
,
    filename: "call.png"
    name: "Call"
,
    filename: "clone.png"
    name: "A Dream"
,
    filename: "coding.png"
    name: "Coding"
,
    filename: "complains.png"
    name: "Complains"
,
    filename: "crystalsky.png"
    name: "Crystal Sky"
,
    filename: "daidai.png"
    name: "DaiDai"
,
    filename: "desync.png"
    name: "Desync"
,
    filename: "determination.png"
    name: "Determination"
,
    filename: "discussion.png"
    name: "Discussion"
,
    filename: "DMSR.png"
    name: "DMSR"
,
    filename: "download.png"
    name: "Download"
,
    filename: "dream.png"
    name: "Dream"
,
    filename: "evolution.png"
    name: "Evolution"
,
    filename: "extern.png"
    name: "Extern"
,
    filename: "fantascene.png"
    name: "Fantascene"
,
    filename: "first-studio.png"
    name: "First Studio"
,
    filename: "flop.png"
    name: "Flop"
,
    filename: "flow.png"
    name: "Flow"
,
    filename: "galaxy collapsed.png"
    name: "Galaxy Collapsed"
,
    filename: "giddy-up.png"
    name: "Giddy Up"
,
    filename: "golira.png"
    name: "Golira"
,
    filename: "guardia-spagnola.png"
    name: "Guardia Spagnola"
,
    filename: "headaxe.png"
    name: "Headaxe"
,
    filename: "heaven portal.png"
    name: "Heaven Portal"
,
# TODO: ADD ART
    filename: "water.png"
    name: "Water"
]
.map (art) ->
    art.description ?= default_description
    art.context ?= default_context
    # art.year ?= default_year
    art

module.exports =
    all_art: all_art
