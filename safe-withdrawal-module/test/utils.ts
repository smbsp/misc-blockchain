const { ethers } = require("hardhat");

import { keccak256 } from "ethereumjs-util";
import { BigNumberish } from "ethers";
const abi = require("ethereumjs-abi");

export async function getAccounts(): Promise<any[]> {
  const accounts = await ethers.getSigners();
  const users: any = [];
  accounts.forEach((element: any) => {
    users.push(element.address);
  });
  return accounts;
}

export async function createSignature(
  beneficiary: string,
  amount: object,
  contractAddress: string,
  signer: object
) {
  let currentChainId = (await ethers.provider.getNetwork()).chainId;
  const DOMAIN_TYPEHASH = keccak256(
    Buffer.from(
      "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
    )
  );
  console.log(typeof currentChainId);
  console.log(currentChainId);
  let domainSeparator = keccak256(
    abi.rawEncode(
      ["bytes32", "uint256", "address"],
      [DOMAIN_TYPEHASH, currentChainId, contractAddress]
    )
  );
  const TRANSFER_TYPEHASH = keccak256(
    Buffer.from("Transfer(address beneficiary,uint256 amount)")
  );
  console.log(typeof amount);
  console.log(amount);
  let structHash = keccak256(
    abi.rawEncode(
      ["bytes32", "address", "uint256"],
      [TRANSFER_TYPEHASH, beneficiary, amount]
    )
  );
  let digest = keccak256(
    abi.rawEncode(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [0x19, 0x01, domainSeparator, structHash]
    )
  );
  return signer.signMessage(digest);
}
