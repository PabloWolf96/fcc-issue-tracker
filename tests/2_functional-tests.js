const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const helper = require("./helpers/helper");
chai.use(chaiHttp);
chai.use(require("chai-datetime"));
suite("Functional Tests", function () {
  before((done) => {
    helper.fillDb();
    done();
  });
  after((done) => {
    helper.clearDb();
    done();
  });
  this.timeout(5000);
  suite("tests for POST request to /api/issues/{project} issues", () => {
    test("Create an issue with every field", (done) => {
      chai
        .request(server)
        .post("/api/issues/randomIssue")
        .send({
          issue_title: "fix error in description",
          issue_text: "There is an error in the project description",
          created_by: "Owen",
          assigned_to: "Pablo",
          status_text: "In documentation",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "fix error in description");
          assert.equal(
            res.body.issue_text,
            "There is an error in the project description"
          );
          assert.equal(res.body.created_by, "Owen");
          assert.equal(res.body.assigned_to, "Pablo");
          assert.equal(res.body.status_text, "In documentation");
          assert.beforeTime(new Date(res.body.created_on), new Date());
          assert.beforeTime(new Date(res.body.updated_on), new Date());
          assert.isBoolean(res.body.open);
          done();
        });
    });
    test("Create an issue with only required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/randomIssue2")
        .send({
          issue_title: "Fix bug in creating new user",
          issue_text: "Fix the bug where new user is not saved to the database",
          created_by: "Owen",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Fix bug in creating new user");
          assert.equal(
            res.body.issue_text,
            "Fix the bug where new user is not saved to the database"
          );
          assert.equal(res.body.created_by, "Owen");
          assert.beforeTime(new Date(res.body.created_on), new Date());
          assert.beforeTime(new Date(res.body.updated_on), new Date());
          assert.isBoolean(res.body.open);
          done();
        });
    });
    test("Create an issue with missing required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/randomIssue3")
        .send({ created_by: "Owen" })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.property(res.body, "error");
          done();
        });
    });
  });
  suite("GET request to /api/issues/{projectName}", () => {
    const { name } = helper.projectData[0];
    test("View issues on a project", (done) => {
      chai
        .request(server)
        .get(`/api/issues/${name}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 2);
          done();
        });
    });
    test("View issues on a project with one filter", (done) => {
      chai
        .request(server)
        .get(`/api/issues/${name}?open=true`)
        .end((err, res) => {
          assert.equal(res.body.length, 2);
          done();
        });
    });
    test("View issues on a project with multiple filter", (done) => {
      chai
        .request(server)
        .get(`/api/issues/${name}?open=true&assigned_to=Joe`)
        .end((err, res) => {
          assert.equal(res.body.length, 1);
          done();
        });
    });
  });
  suite("PUT request to /api/issues/{project}", () => {
    let _id;
    beforeEach(async () => {
      const response = await chai
        .request(server)
        .post("/api/issues/myApi")
        .send(helper.issueData[0]);
      _id = response.body._id;
    });
    after((done) => {
      helper.clearDb();
      done();
    });

    test("Update one field on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/myApi")
        .send({ _id, issue_title: "new title" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            _id,
            result: "successfully updated",
          });
          done();
        });
    });
    test("Update multiple fields on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/myApi")
        .send({
          _id,
          issue_title: "new title",
          open: false,
          assigned_to: "Rubi",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);

          assert.deepEqual(res.body, {
            _id,
            result: "successfully updated",
          });
          done();
        });
    });
    test("Update an issue with missing _id", (done) => {
      chai
        .request(server)
        .put("/api/issues/myApi")
        .send({ issue_title: "new title" })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.deepEqual(res.body, { error: "missing _id" });
          done();
        });
    });

    test("Update an issue with no fields to update", (done) => {
      chai
        .request(server)
        .put("/api/issues/myApi")
        .send({ _id })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.deepEqual(res.body, { error: "no update field(s) sent", _id });

          done();
        });
    });
    test("Update an issue with an invalid _id", (done) => {
      chai
        .request(server)
        .put("/api/issues/myApi")
        .send({ _id: "invalid id", issue_title: "new title" })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.deepEqual(res.body, {
            error: "could not update",
            _id: "invalid id",
          });
          done();
        });
    });
  });
  suite("DELETE request to /api/issues/{project}", () => {
    let _id;
    beforeEach(async () => {
      const response = await chai
        .request(server)
        .post("/api/issues/myApi")
        .send(helper.issueData[0]);

      _id = response.body._id;
    });
    test("Delete an issue", (done) => {
      console.log(_id);
      chai
        .request(server)
        .delete("/api/issues/myApi")
        .send({ _id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: "successfully deleted", _id });
          done();
        });
    });
    test("Delete an issue with an invalid", (done) => {
      chai
        .request(server)
        .delete("/api/issues/myApi")
        .send({ _id: "invalid id" })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.deepEqual(res.body, {
            error: "could not delete",
            _id: "invalid id",
          });
          done();
        });
    });
    test("Delete an issue with missing _id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/myApi")
        .send()
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.deepEqual(res.body, { error: "missing _id" });
          done();
        });
    });
  });
});
