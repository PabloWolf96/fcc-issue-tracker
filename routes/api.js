"use strict";
const Project = require("../models/project");
const Issue = require("../models/issue");
module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      let open = req.query.open;
      let assigned_to = req.query.assigned_to;
      const projectInDb = await Project.findOne({ name: project });
      if (!projectInDb) {
        return res.json([]);
      }
      const query = Issue.find({ project: projectInDb._id }).select("-__v");
      if (open == "true") {
        query.where("open").equals(true);
      }
      if (open == "false") {
        query.where("open").equals(false);
      }
      if (assigned_to) {
        query.where("assigned_to").equals(assigned_to);
      }
      const issues = await query.exec();
      res.json(issues);
    })

    .post(async function (req, res) {
      let project = req.params.project;
      const { assigned_to, status_text, issue_title, issue_text, created_by } =
        req.body;
      let errors = [];
      if (!issue_title) {
        errors.push("issue_title");
      }
      if (!issue_text) {
        errors.push("issue_text");
      }
      if (!created_by) {
        errors.push("created_by");
      }
      if (errors.length) {
        let errorMessage = "";
        for (let i = 0; i < errors.length; i++) {
          errorMessage = i === 0 ? errors[0] : `, ${errors[0]}`;
        }
        errorMessage += " missing";
        return res.status(400).json({ error: errorMessage });
      }

      let projectInDb = await Project.findOne({ name: project });
      if (!projectInDb) {
        projectInDb = await Project.create({ name: project });
      }
      const newIssue = new Issue({
        assigned_to,
        status_text,
        issue_title,
        issue_text,
        created_by,
        project: projectInDb._id,
      });
      await newIssue.save();
      projectInDb.issues.push(newIssue._id);
      await projectInDb.save();
      res.json(newIssue);
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const projectInDb = await Project.findOne({ name: project });
      if (!projectInDb) {
        return res.status(404).end();
      }
      const { _id, ...updateFields } = req.body;
      if (!_id) {
        return res.status(400).json({ error: "missing _id" });
      }
      if (!Object.keys(updateFields).length) {
        return res.status(400).json({ error: "no update field(s) sent", _id });
      }
      const validId = projectInDb.issues.some((issue) => issue._id == _id);
      if (!validId) {
        return res.status(400).json({ error: "could not update", _id });
      }
      await Issue.findOneAndUpdate({ _id }, updateFields, { new: true });
      return res.json({ result: "successfully updated", _id });
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      const projectInDb = await Project.findOne({ name: project });
      const { _id } = req.body;
      if (!_id) {
        console.log("missing");
        return res.status(400).json({ error: "missing _id" });
      }
      const validId = projectInDb.issues.some((issue) => issue._id == _id);
      if (!validId) {
        return res.status(400).json({ error: "could not delete", _id });
      }
      await Issue.findByIdAndRemove(_id);
      projectInDb.issues = projectInDb.issues.filter((issue) => issue != _id);
      await projectInDb.save();
      return res.status(200).json({ result: "successfully deleted", _id });
    });
};
