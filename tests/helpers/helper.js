const Issue = require("../../models/issue");
const Project = require("../../models/project");
const projectData = [{ name: "My-first-Project" }, { name: "Airbnb-clone" }];
const issueData = [
  {
    issue_title: "Fix error in posting data",
    issue_text: "When we post data it has an error.",
    created_on: "2017-01-08T06:35:14.240Z",
    updated_on: "2017-01-08T06:35:14.240Z",
    created_by: "Joe",
    assigned_to: "Joe",
    open: true,
    status_text: "In QA",
  },
  {
    issue_title: "Fix useState error",
    issue_text: "State is mutated",
    created_on: "2022-01-07T06:35:12.240Z",
    updated_on: "2022-01-07T06:35:12.240Z",
    created_by: "pablo",
    open: true,
  },
];
module.exports.projectData = projectData;
module.exports.issueData = issueData;
module.exports.clearDb = async () => {
  await Project.deleteMany({});
  await Issue.deleteMany({});
};
module.exports.fillDb = async () => {
  for (let i = 0; i < projectData.length; i++) {
    const project = new Project(projectData[i]);
    for (let j = 0; j < issueData.length; j++) {
      const issue = new Issue({ ...issueData[j], project: project._id });
      project.issues.push(issue._id);
      await issue.save();
    }
    await project.save();
  }
};
