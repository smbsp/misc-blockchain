/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signer } from "@ethersproject/abstract-signer";
import hre = require("hardhat");
// import { buildSafeTransaction, executeTx, safeApproveHash } from "../src/utils";
const { ethers, deployments } = hre;
import { TestAvatar, UnicornToken, SafeWithdrawal } from "../typechain";
import { getAccounts, createSignature } from "./utils";

describe("SafeWithdrawalModule tests", function () {
  let user: Signer;
  let userAddress: string;
  let avatar: TestAvatar;
  let safeWithdrawal: SafeWithdrawal;
  let unicornToken: UnicornToken;

  const CALL = 0;
  const BN = ethers.BigNumber;
  const ONE_DEC18 = BN.from(10).pow(BN.from(18));

  let accounts, owner;

  before(async function () {
    await deployments.fixture();

    [, user] = await ethers.getSigners();
    userAddress = await user.getAddress();
    accounts = await getAccounts();
    owner = accounts[0];

    avatar = await ethers.getContract("TestAvatar", user);
    safeWithdrawal = await ethers.getContract("SafeWithdrawal");
    unicornToken = await ethers.getContract("UnicornToken");

    await avatar.enableModule(safeWithdrawal.address);

    const isModuleEnabled = await avatar.isModuleEnabled(
      safeWithdrawal.address
    );
    console.log(`Is Safe Module enabled? ${isModuleEnabled}`);
  });

  it("Add addresses", async () => {
    await safeWithdrawal.setAddresses(avatar.address, unicornToken.address);
  });

  it("Token withdrawal", async () => {
    await safeWithdrawal.setAddresses(avatar.address, unicornToken.address);
    let signature = await createSignature(
      accounts[1],
      ONE_DEC18,
      safeWithdrawal.address,
      accounts[0]
    );
    await safeWithdrawal.unicornTokenWithdrawal(
      ONE_DEC18,
      accounts[1],
      signature
    );
  });
});
