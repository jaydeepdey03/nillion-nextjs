import * as React from "react";
import {Auth} from "@/components/auth";
import {useState, useEffect} from "react";
import {
  useNilCompute,
  useNilComputeOutput,
  useNillion,
  useNilStoreProgram,
  useNilStoreValue
} from "@nillion/client-react-hooks";
import {NadaValues, PartyName, ProgramBindings, ProgramId, StoreAcl} from "@nillion/client-core";
import {transformNadaProgramToUint8Array} from "@/utils/nadaTransform";

export default function Compute() {
  const {client} = useNillion()

  const nilStoreProgram = useNilStoreProgram()
  const [selectedProgramCode, setSelectedProgramCode] = useState("");

  const nilStoreValue1 = useNilStoreValue({ttl: 30}) // 30 days
  const nilStoreValue2 = useNilStoreValue({ttl: 30}) // 30 days
  const [secretValue1, setSecretValue1] = useState<number>(0);
  const [secretValue2, setSecretValue2] = useState<number>(0);

  const nilCompute = useNilCompute();
  const nilComputeOutput = useNilComputeOutput()

  // Other CONSTS
  const PARTY_NAME = PartyName.parse("Party1");
  const PROGRAM_NAME = "secret_addition";

  // Fetch Nada Program Code.
  useEffect(() => {
    const fetchProgramCode = async () => {
      const response = await fetch(`/programs/secret_addition.py`);
      const text = await response.text();
      setSelectedProgramCode(text);
    };
    void fetchProgramCode();
  }, [selectedProgramCode]);

  // Action to store Program with Nada
  const handleStoreProgram = async () => {
    try {
      const programBinary = await transformNadaProgramToUint8Array(
        `/programs/${PROGRAM_NAME}.nada.bin`
      );
      nilStoreProgram.execute({
        name: PROGRAM_NAME,
        program: programBinary,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  // Action to handle storing secret integer 1
  const handleStoreSecretInteger1 = async () => {
    if (!nilStoreProgram.isSuccess) throw new Error("nilStoreProgram failed")

    const acl = StoreAcl.create().allowCompute(
      client.userId,
      ProgramId.parse(nilStoreProgram.data)
    ); // TODO(tim) accept acl as execute parameter

    nilStoreValue1.execute(secretValue1)
  };

  // Action to handle storing secret integer 2
  const handleStoreSecretInteger2 = async () => {
    if (!nilStoreProgram.isSuccess) throw new Error("nilStoreProgram failed")

    const acl = StoreAcl.create().allowCompute(
      client.userId,
      ProgramId.parse(nilStoreProgram.data)
    ); // TODO(tim) accept acl as execute parameter

    nilStoreValue2.execute(secretValue2)
  };

  // Handle using the secret_addition Program
  const handleUseProgram = async () => {
    if (!nilStoreProgram.isSuccess || !nilStoreValue1.isSuccess || !nilStoreValue2.isSuccess)
      throw new Error("nilStoreProgram failed")

    // Bindings
    const bindings = ProgramBindings.create(nilStoreProgram.data);
    bindings.addInputParty(
      PARTY_NAME,
      client.partyId
    );

    bindings.addOutputParty(
      PARTY_NAME,
      client.partyId
    );

    nilCompute.execute({
      bindings,
      values: NadaValues.create(),
      storeIds: [nilStoreValue1.data, nilStoreValue2.data],
    });
  };

  const handleFetchComputeResult = async () => {
    if (!nilCompute.isSuccess) throw new Error("nilCompute failed or hasn't run")
    nilComputeOutput.execute(nilCompute.data)
  }

  let computeResult = ""
  if(nilComputeOutput.isSuccess) {
    computeResult = JSON.stringify(nilComputeOutput.data, (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    });
  }

  return (
    <div className="flex flex-col justify-center min-h-screen p-8 bg-white text-black">
      <Auth/>
      {/* Store Programs Section */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Program Code:</h3>
        <div className="border-2 border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-black text-white">
          <pre className="whitespace-pre-wrap break-words">
            <code>{selectedProgramCode}</code>
          </pre>
        </div>
        <button
          onClick={() => handleStoreProgram()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2 inline-block"
        >
          Store Program
        </button>
      </div>

      {nilStoreProgram.isSuccess && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Program ID: {nilStoreProgram.data}</p>
        </div>
      )}

      <div className="border-t border-gray-300 my-4"></div>

      {/* Store Secrets Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-left">Store Secret:</h3>
        <p> Store your int_1</p>
        <input
          placeholder="Enter your secret value"
          value={secretValue1}
          onChange={(e) => setSecretValue1(Number(e.target.value))}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => handleStoreSecretInteger1()}
          className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
        >
          Store Secret
        </button>

        {nilStoreValue1.isSuccess && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Secret Value 1 ID: {nilStoreValue1.data}
            </p>
          </div>
        )}

        <p> Store your int_2</p>
        <input
          placeholder="Enter your secret value"
          value={secretValue2}
          onChange={(e) => setSecretValue2(Number(e.target.value))}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => handleStoreSecretInteger2()}
          className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
        >
          Store Secret
        </button>

        {nilStoreValue2.isSuccess && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Secret Value 2 ID: {nilStoreValue2.data}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Compute Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-left">Compute:</h3>
        <button
          onClick={handleUseProgram}
          className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
        >
          Compute
        </button>
        {nilCompute.isSuccess && (
          <>
            <h3 className="text-lg font-semibold mb-2 text-left">Fetch result:</h3>
            <button
              onClick={handleFetchComputeResult}
              className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
            >
              Fetch Compute Result
            </button>
            {nilComputeOutput.isSuccess && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Result: {computeResult}
                </p>
              </div>
            )}
          </>)
        }
      </div>
    </div>
  )
}
