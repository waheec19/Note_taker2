const express = require("express");
const path = require("path");
const util = require("util");
const fs = require("fs");


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);



const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));



app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});



app.get("/api/notes", async function (req, res) {
    const noteData = await getNotes();
    return res.status(200).json(noteData);
});



app.post("/api/notes", async function (req, res) {
    let newNote = req.body;
    const noteData = await getNotes();

    noteData.push({
        ...newNote,
        id: noteData.length + 1
    });
    await writeNotes(noteData);
    return res.sendStatus(201);
});


app.delete("/api/notes/:id", async function (req, res) {
    let noteID = Number(req.params.id);
    const noteData = await getNotes();

    const newNotes = noteData.reduce((acc, curr) => {
        if (curr.id !== noteID) acc.push(curr);
        return acc;
    }, []);

    await writeNotes(newNotes);
    return res.sendStatus(200);
});


const getNotes = async () => {
    try {
        const data = await readFile(path.join(__dirname, './db/db.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
        return err;
    }
};

const writeNotes = async (data) => {
    try {
        const update = await writeFile(
            path.join(__dirname, './db/db.json'),
            JSON.stringify(data)
        );
        return update;
    } catch (err) {
        console.error(err);
        return err;
    }
};


app.listen(PORT, function () {
    console.log("App listening on PORT: " + PORT);
});