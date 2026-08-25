const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("LandRegistry", function () {
  let LandRegistry, landRegistry;
  let authority, ownerA, buyerB, unauthorized, otherWallet;

  const DUMMY_HASH_001 = "a3f5c9e1b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6";
  const DUMMY_HASH_001_MODIFIED = "9f1e3d5c7b9a1f3e5d7c9b1a3f5e7d9c1b3a5f7e9d1c3b5a7f9e1d3c5b7a9f1e";

  beforeEach(async function () {
    [authority, ownerA, buyerB, unauthorized, otherWallet] = await ethers.getSigners();

    const LandRegistryFactory = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistryFactory.deploy();
    await landRegistry.waitForDeployment();
  });

  // -------------------------------------------------------------------
  // DEPLOYMENT
  // -------------------------------------------------------------------
  describe("Deployment", function () {
    it("sets the deployer as the authority", async function () {
      expect(await landRegistry.authority()).to.equal(authority.address);
    });

    it("starts with zero total properties", async function () {
      expect(await landRegistry.totalProperties()).to.equal(0);
    });
  });

  // -------------------------------------------------------------------
  // REGISTRATION
  // -------------------------------------------------------------------
  describe("Property Registration", function () {
    it("allows the authority to register a property", async function () {
      await expect(
        landRegistry.registerProperty(
          "P001",
          "Sector 12, Dummy City",
          1200,
          "Residential",
          ownerA.address,
          DUMMY_HASH_001
        )
      )
        .to.emit(landRegistry, "PropertyRegistered")
        .withArgs(1, "P001", ownerA.address, DUMMY_HASH_001, anyValue);

      const property = await landRegistry.getProperty(1);
      expect(property.currentOwner).to.equal(ownerA.address);
      expect(property.propertyNumber).to.equal("P001");
      expect(property.verified).to.equal(false);
    });

    it("rejects duplicate property numbers", async function () {
      await landRegistry.registerProperty(
        "P001", "Sector 12", 1200, "Residential", ownerA.address, DUMMY_HASH_001
      );
      await expect(
        landRegistry.registerProperty(
          "P001", "Different Location", 500, "Commercial", buyerB.address, DUMMY_HASH_001
        )
      ).to.be.revertedWith("LandRegistry: propertyNumber already used");
    });

    it("rejects zero address as initial owner", async function () {
      await expect(
        landRegistry.registerProperty(
          "P002", "Sector 14", 800, "Agricultural", ethers.ZeroAddress, DUMMY_HASH_001
        )
      ).to.be.revertedWith("LandRegistry: owner cannot be zero address");
    });

    it("rejects zero area", async function () {
      await expect(
        landRegistry.registerProperty(
          "P003", "Sector 15", 0, "Residential", ownerA.address, DUMMY_HASH_001
        )
      ).to.be.revertedWith("LandRegistry: area must be greater than zero");
    });

    it("rejects registration by a non-authority account", async function () {
      await expect(
        landRegistry.connect(unauthorized).registerProperty(
          "P004", "Sector 16", 900, "Residential", ownerA.address, DUMMY_HASH_001
        )
      ).to.be.revertedWith("LandRegistry: caller is not the authority");
    });

    it("rejects an empty document hash", async function () {
      await expect(
        landRegistry.registerProperty(
          "P005", "Sector 17", 900, "Residential", ownerA.address, ""
        )
      ).to.be.revertedWith("LandRegistry: document hash required");
    });
  });

  // -------------------------------------------------------------------
  // VERIFICATION
  // -------------------------------------------------------------------
  describe("Property Verification", function () {
    beforeEach(async function () {
      await landRegistry.registerProperty(
        "P001", "Sector 12", 1200, "Residential", ownerA.address, DUMMY_HASH_001
      );
    });

    it("allows the authority to verify a property", async function () {
      await expect(landRegistry.verifyProperty(1))
        .to.emit(landRegistry, "PropertyVerified")
        .withArgs(1, authority.address, anyValue);

      const property = await landRegistry.getProperty(1);
      expect(property.verified).to.equal(true);
    });

    it("rejects verification by an unauthorized account", async function () {
      await expect(
        landRegistry.connect(unauthorized).verifyProperty(1)
      ).to.be.revertedWith("LandRegistry: caller is not authorized to verify");
    });

    it("allows an appointed verifier to verify a property", async function () {
      await landRegistry.addVerifier(otherWallet.address);
      await expect(landRegistry.connect(otherWallet).verifyProperty(1)).to.not.be.reverted;
    });

    it("rejects verifying an already-verified property", async function () {
      await landRegistry.verifyProperty(1);
      await expect(landRegistry.verifyProperty(1)).to.be.revertedWith(
        "LandRegistry: property already verified"
      );
    });

    it("rejects verifying a non-existent property", async function () {
      await expect(landRegistry.verifyProperty(999)).to.be.revertedWith(
        "LandRegistry: property does not exist"
      );
    });
  });

  // -------------------------------------------------------------------
  // OWNERSHIP TRANSFER
  // -------------------------------------------------------------------
  describe("Ownership Transfer", function () {
    beforeEach(async function () {
      await landRegistry.registerProperty(
        "P001", "Sector 12", 1200, "Residential", ownerA.address, DUMMY_HASH_001
      );
      await landRegistry.verifyProperty(1);
    });

    it("allows the current owner to transfer ownership", async function () {
      await expect(
        landRegistry.connect(ownerA).transferOwnership(1, buyerB.address)
      )
        .to.emit(landRegistry, "OwnershipTransferred")
        .withArgs(1, ownerA.address, buyerB.address, anyValue);

      const property = await landRegistry.getProperty(1);
      expect(property.currentOwner).to.equal(buyerB.address);
      expect(property.previousOwner).to.equal(ownerA.address);
    });

    it("rejects transfer by a non-owner", async function () {
      await expect(
        landRegistry.connect(unauthorized).transferOwnership(1, buyerB.address)
      ).to.be.revertedWith("LandRegistry: caller is not the current owner");
    });

    it("rejects transfer to the zero address", async function () {
      await expect(
        landRegistry.connect(ownerA).transferOwnership(1, ethers.ZeroAddress)
      ).to.be.revertedWith("LandRegistry: new owner cannot be zero address");
    });

    it("rejects transfer of an unverified property", async function () {
      await landRegistry.registerProperty(
        "P002", "Sector 13", 700, "Residential", ownerA.address, DUMMY_HASH_001
      );
      await expect(
        landRegistry.connect(ownerA).transferOwnership(2, buyerB.address)
      ).to.be.revertedWith("LandRegistry: property must be verified before transfer");
    });

    it("prevents the old owner from transferring again after a completed transfer", async function () {
      await landRegistry.connect(ownerA).transferOwnership(1, buyerB.address);
      await expect(
        landRegistry.connect(ownerA).transferOwnership(1, unauthorized.address)
      ).to.be.revertedWith("LandRegistry: caller is not the current owner");
    });

    it("rejects transfer on a non-existent property", async function
