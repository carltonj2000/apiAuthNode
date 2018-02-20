const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");
const { expect } = chai;

const server = require("../../../server/app");

chai.use(chaiHttp);

let token;

describe("Users routes", () => {
  const signup = "/users/signup";
  const signin = "/users/signin";
  const secret = "/users/secret";
  const user = {
    email: faker.internet.email(),
    password: faker.internet.password()
  };
  const preSave = {
    email: "mr.sometest@gmail.com",
    password: faker.internet.password()
  };

  before(async () => {
    const res = await chai
      .request(server)
      .post(signup)
      .send(preSave);
    expect(res.status).to.equal(200);
    token = res.body.token;
  });

  after("dropping test db", async () => {
    await mongoose.connection.dropDatabase(() => {
      console.log("\n Test database dropped");
    });
    await mongoose.connection.close();
    // newer versions of mocha waits for pending async to finish before exiting
    // below needed because mongoose keeps the connection open after close
    // can also use --exit cli option to force exit after test are run
    process.exit();
  });

  describe("signup", () => {
    it("should create new user if email not found", async () => {
      const res = await chai
        .request(server)
        .post(signup)
        .send(user);
      expect(res.status).to.equal(200);
      expect(res.body).not.to.be.empty;
      expect(res.body).to.have.property("token");
    });

    it("should return 403 if email was in already", async () => {
      try {
        await chai
          .request(server)
          .post(signup)
          .send(preSave);
      } catch (error) {
        expect(error.status).to.equal(403);
        expect(error.response.text).to.be.equal(
          '{"error":"Email is already used."}'
        );
      }
    });
  });

  describe("secret", () => {
    it("should return status 401 for no token", async () => {
      try {
        await chai.request(server).get(secret);
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.response.text).to.equal("Unauthorized");
      }
    });

    it("should return 200 with correct token", async () => {
      try {
        const res = await chai
          .request(server)
          .get(secret)
          .set("Authorization", token);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.deep.equal({ secret: "resource" });
      } catch (error) {
        throw new Error(error);
      }
    });
  });

  describe("signin", () => {
    it("should return status 400 for empty email and password", async () => {
      try {
        const res = chai
          .request(server)
          .post(signin)
          .send();
      } catch (error) {
        expect(error.status).to.be.equal(400);
      }
    });

    it("should return 200 and token", async () => {
      try {
        const res = await chai
          .request(server)
          .post(signin)
          .send(preSave);
        expect(res.status).to.equal(200);
        expect(res.body).not.to.be.empty;
        expect(res.body).to.have.property("token");
      } catch (err) {
        throw new Error(error);
      }
    });
  });
});
