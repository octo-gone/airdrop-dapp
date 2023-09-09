"use client";

import { useState } from "react";
import { BaseError } from "viem";
import {
  Address,
  useAccount,
  useNetwork,
  useWaitForTransaction,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";

import {
  useErc20Allowance,
  useErc20Approve,
  useErc20BalanceOf,
  useErc20Name,
  useErc20Symbol,
  useErc20TotalSupply,
  useErc20Transfer,
  usePrepareErc20Approve,
  usePrepareErc20Transfer,
} from "../generated";
import { airdropAbi } from "./abi";
import { ApolloClient, InMemoryCache, gql, ApolloProvider } from '@apollo/react-hooks';


const BIG_NUM = 1_000_000_000_000_000_000;


export function ERC20() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState<Address>(
    `0x${""}`
  )
  const [airdropAddress, setAirdropAddress] = useState<Address>(
    `0x${""}`
  )

  return (

      <div className="block items-center pt-2">
        <div>
          <label className="text-[#0A2540]">Airdrop Address: </label>
          <input
           className="ml-[30px] appearance-none mx-5 w-120 bg-white text-gray-700  py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white rounded-full"
            style={{ width: 400 }}
            value={airdropAddress}
            onChange={(e) => setAirdropAddress(e.target.value as Address)}
          />
        </div>
        <div>
          <label className="text-[#0A2540]">Token Address: </label>
          <input
            className="ml-[30px] appearance-none mx-5 w-120 bg-white text-gray-700  py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white rounded-full"
            style={{ width: 400 }}
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value as Address)}
          />
        </div>
        <>
          <h3></h3>
          <div className="stats my-5 bg-[#635AFF]">
            <div className="stat place-items-center">
              <div className="stat-title text-gray-200">Name</div>
              <Name tokenAddress={tokenAddress} />
              <div className="stat-desc"></div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title text-gray-200">Balance</div>
              <BalanceOf address={address} tokenAddress={tokenAddress} />
              <div className="stat-desc text-secondary"></div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title text-gray-200">Total Supply</div>
              <TotalSupply tokenAddress={tokenAddress} />
              <div className="stat-desc"></div>
            </div>
          </div>
          <h3></h3>
            <Allowance address={address} contractAddress={airdropAddress} tokenAddress={tokenAddress}/>
            <Airdrop profileAddress={address} contractAddress={airdropAddress} tokenAddress={tokenAddress}/>
        </>
      </div>

  );
}

function Name({ tokenAddress }: { tokenAddress: Address }) {
  const { data: name } = useErc20Name({
    address: tokenAddress
  })
  const { data: symbol } = useErc20Symbol({
    address: tokenAddress
  })
  return (
    <div className="text-white">
      {name} ({symbol})
    </div>
  );
}
function TotalSupply({ tokenAddress }: { tokenAddress: Address }) {
  const { data: totalSupply } = useErc20TotalSupply({
    address: tokenAddress,
  })
  let totalSupplyDecimal = 0
  if (totalSupply) {
    totalSupplyDecimal = Number(totalSupply) / BIG_NUM
  }
  return <div className="text-white">{totalSupplyDecimal?.toString()} units</div>;
}

function BalanceOf({
  address,
  tokenAddress,
}: {
  address?: Address;
  tokenAddress: Address;
}) {
  const { data: balance } = useErc20BalanceOf({
    address: tokenAddress,
    args: address ? [address] : undefined,
    watch: true,
  })
  let balanceDecimal = 0;
  if (balance) {
    balanceDecimal = Number(balance) / BIG_NUM
  }
  return <div className="text-white">{balanceDecimal?.toString()} units</div>;
}

function Airdrop({
  contractAddress, //airdrop
  tokenAddress, //token address
  profileAddress,
}: {
  contractAddress?: Address;
  tokenAddress: Address;
  profileAddress?: Address;
}) {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.SQUID_ENDPOINT ? process.env.SQUID_ENDPOINT : 'http://localhost:4350/graphql',
  })

  const GET_USERS_QUERY = gql`
    query getUsers {
      addresses {
        id
      }
    }
  `

  const [recipients, setRecipients] = useState([{ recipient: "", amount: "" }]);
  async function getUsers() {
    try {
      const { data } = await client.query({
        query: GET_USERS_QUERY,
      })
      const users = data.addresses;
      let recipientList = [];
      for (let i = 0; i < 10; i++) {
        recipientList.push({ recipient: users[i].id, amount: "1" })
      }
      setRecipients(recipientList);
    } catch (error) {
      console.error("Error while fetching data: ", error);
    }
  }

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: airdropAbi,
    functionName: "airdrop",
    args: [tokenAddress, profileAddress, recipients]
  })
  const { write } = useContractWrite(config);

  return (
    <ApolloProvider client={client}>
      <div>
        <button
          className="btn rounded-full bg-[#635AFF] border-[#635AFF] text-white mr-2 my-2 btn-xs sm:btn-sm md:btn-md lg:btn-md"
          onClick={() => getUsers()}
        >
          Get Addresses
        </button>
        <button
          className="btn rounded-full mr-2 border-[#635AFF] bg-[#635AFF] text-white  my-2 btn-xs sm:btn-sm md:btn-md lg:btn-md"
          onClick={() => write?.()}
          disabled={recipients.length === 0}
        >
          Airdrop
        </button>
      </div>
    </ApolloProvider>
  );
}

function Allowance({
  address,
  contractAddress,
  tokenAddress,
}: {
  address?: Address;
  contractAddress: Address;
  tokenAddress: Address;
}) {
  const [amount, setAmount] = useState("");
  const [spender, setSpender] = useState(contractAddress);

  const { config, error, isError} = usePrepareErc20Approve({
    address: tokenAddress,
    args: spender && amount ? [spender, BigInt(Number(amount)*BIG_NUM)] : undefined,
    enabled: Boolean(spender && amount)
  })
  const { data, write } = useErc20Approve(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  })
  const { data: balance } = useErc20Allowance({
    address: tokenAddress,
    args: address && spender ? [address, contractAddress]: undefined,
    watch: true,
  })
  let allowance = 0

  if (balance) {
    allowance = Number(balance) / BIG_NUM;
  }

  return (
    <div>

      <div className="text-[#0A2540]">
        Airdrop Allowance:{" "}
        <input
          disabled={isLoading}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="amount (units)"
          className="appearance-none mx-5 w-60 bg-white text-gray-700  py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white rounded-full"
        />
        <button
          disabled={isLoading && !write}
          className="btn text-white rounded-full bg-[#635AFF] border-[#635AFF] mr-2 my-2 btn-xs sm:btn-sm md:btn-md lg:btn-md"
          onClick={()=>write?.()}
        >
          set
        </button>
        {isLoading && <ProcessingMessage hash={data?.hash}/>}
        {isSuccess && <div>Success!</div>}
        {isError && <div>Error: {(error as BaseError)?.shortMessage}</div>}
      </div>
      <div className="text-[#0A2540]">Allowance: {allowance?.toString()}</div>
    </div>
  );
}

function ProcessingMessage({ hash }: { hash?: `0x${string}` }) {
  const { chain } = useNetwork();
  const etherscan = chain?.blockExplorers?.etherscan;
  return (
    <span>
      Processing transaction...{" "}
      {etherscan && (
        <a href={`${etherscan.url}/tx/${hash}`}>{etherscan.name}</a>
      )}
    </span>
  );
}
