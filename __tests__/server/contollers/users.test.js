const chai = require("chai");
const faker = require("faker");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const rewire = require("rewire");
const { expect } = chai;

const User = require("../../../server/models/user-model");
const userController = rewire("../../../server/controllers/user-controller");

chai.use(sinonChai);

let sandbox = null;

describe("User controller", async () => {
  let req = {
    user: { id: faker.random.number() },
    value: {
      body: {
        email: faker.internet.email(),
        password: faker.internet.password()
      }
    }
  };
  let res = {
    json: function() {
      return this;
    },
    status: function() {
      return this;
    }
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("secret", () => {
    it("shoud return resource when called", async () => {
      sandbox.spy(console, "log");
      sandbox.spy(res, "json");

      try {
        await userController.secret(req, res);
        //expect(res.json.calledWith({ secret: "resoure" })).to.be.ok;
        //expect(res.json).to.have.been.calledWith({ secret: "resoure" });
      } catch (error) {
        throw new Error(error);
      }
    });
  });

  describe("signIn", () => {
    it("shoud return token when signIn called", async () => {
      sandbox.spy(res, "json");
      sandbox.spy(res, "status");

      try {
        await userController.signIn(req, res);
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json.callCount).to.equal(1);
      } catch (error) {
        throw new Error(error);
      }
    });

    it("shoud return fake token using rewire", async () => {
      sandbox.spy(res, "json");
      let signToken = userController.__set__("signToken", user => "fakeToken");

      try {
        await userController.signIn(req, res);
        expect(res.json).to.have.been.calledWith({ token: "fakeToken" });
        signToken(); // restore orignal signToken function
      } catch (error) {
        throw new Error(error);
      }
    });
  });

  describe("signUp", () => {
    it("shoud return 403 if the user is already in the db", async () => {
      sandbox.spy(res, "status");
      sandbox.spy(res, "json");
      sandbox
        .stub(User, "findOne")
        .returns(Promise.resolve({ id: faker.random.number() }));

      try {
        await userController.signUp(req, res);
        expect(res.status).to.have.been.calledWith(403);
        expect(res.json).to.have.been.calledWith({
          error: "Email is already used."
        });
      } catch (error) {
        throw new Error(error);
      }
    });

    it("shoud return 200 for a new user being added to the db", async () => {
      sandbox.spy(res, "status");
      sandbox.spy(res, "json");
      sandbox.stub(User, "findOne").returns(Promise.resolve(false));
      sandbox
        .stub(User.prototype, "save")
        .returns(Promise.resolve({ id: faker.random.number() }));

      try {
        await userController.signUp(req, res);
        expect(res.status).to.have.been.calledWith(200);
        expect(res.json.callCount).to.equal(1);
      } catch (error) {
        throw new Error(error);
      }
    });

    it("shoud return fake token in res.json", async () => {
      sandbox.spy(res, "status");
      sandbox.spy(res, "json");
      sandbox.stub(User, "findOne").returns(Promise.resolve(false));
      sandbox
        .stub(User.prototype, "save")
        .returns(Promise.resolve({ id: faker.random.number() }));
      let signToken = userController.__set__(
        "signToken",
        user => "fakeTokenTwo"
      );

      try {
        await userController.signUp(req, res);
        expect(res.json).to.have.been.calledWith({ token: "fakeTokenTwo" });
        expect(res.json.calledWith({ token: "fakeTokenTwo" })).to.be.ok;
        signToken(); // restore original handler
      } catch (error) {
        throw new Error(error);
      }
    });
  });
});
