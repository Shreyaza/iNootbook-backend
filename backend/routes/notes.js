const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
var fetchuser = require("../middleware/fetchuser");

//Route 1: Get all the notes using: GET "localhost:5000/api/notes/fetchallnotes".(end point) login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 2: To Add a new Notes: POST "localhost:5000/api/notes/addnote".(end point) login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a Valid title").isLength({ min: 3 }),
    body("description", "description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // If there are errors,return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNotes = await note.save();

      res.json(savedNotes);
   
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route 3: Update  an Existing Note: PUT "localhost:5000/api/notes/updatenote".(end point) login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    //Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find The Note to be Updated
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note Found");
    }

    //Allow Updation only if user own's it
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 4: Delete an Existing Note: Delete "localhost:5000/api/notes/deletenote".(end point) login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
try {
    //Find The Note to be deleted
    let note = await Note.findById(req.params.id);
    if (!note) {
       return res.status(404).send("Note Found");
    }
    //Allow deletion only if user own's it
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ "Success": "Note has been deleted", note: note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }

});

module.exports = router;
