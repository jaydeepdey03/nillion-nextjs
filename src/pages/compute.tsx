import * as React from "react";
import {
  useRunProgram,
  useStoreValue,
  useStoreProgram,
  useNillion,
  useFetchProgramOutput,
} from "@nillion/client-react-hooks";
import {useEffect, useState} from "react";
import {
  ProgramId,
  PartyName,
  Permissions,
  PartyId,
  StoreId,
  ProgramBindings,
  NadaValues,
  NadaValue,
  NamedValue,
} from "@nillion/client-core";
import {transformNadaProgramToUint8Array} from "@/utils/nadaTransform";

export default function Compute() {
  // UseStates
  const [selectedProgramCode, setSelectedProgramCode] = useState("");
  const [secretValue1, setSecretValue1] = useState<number>(0);
  const [secretValue2, setSecretValue2] = useState<number>(0);
  const [programID, setProgramID] = useState<ProgramId>();
  const [secretValue1ID, setSecretValue1ID] = useState<StoreId>();
  const [secretValue2ID, setSecretValue2ID] = useState<StoreId>();
  const [computeResult, setComputeResult] = useState<any | null>(null);
  const [computeID, setComputeID] = useState<any | null>(null);

  // Use of Nillion Hooks
  const client = useNillion();
  const storeProgram = useStoreProgram();
  const storeValue = useStoreValue();
  const runProgram = useRunProgram();
  const fetchProgram = useFetchProgramOutput({
    id: computeID,
  });

  // Other CONSTS
  const PARTY_NAME = "Party1" as PartyName;
  const PROGRAM_NAME = "secret_addition";

  // Fetch Nada Program Code.
  useEffect(() => {
    const fetchProgramCode = async () => {
      const response = await fetch(`/programs/secret_addition.py`);
      const text = await response.text();
      setSelectedProgramCode(text);
    };
    fetchProgramCode();
  }, [selectedProgramCode]);

  // Action to store Program with Nada
  const handleStoreProgram = async () => {
    try {
      const programBinary = await transformNadaProgramToUint8Array(
        `/programs/${PROGRAM_NAME}.nada.bin`
      );
      const result = await storeProgram.mutateAsync({
        name: PROGRAM_NAME,
        program: programBinary,
      });
      setProgramID(result!);
    } catch (error) {
      console.log("error", error);
    }
  };

  // Action to handle storing secret integer 1
  const handleStoreSecretInteger1 = async () => {
    try {
      const permissions = Permissions.create().allowCompute(
        client.vm.userId,
        programID as ProgramId
      );

      const result = await storeValue.mutateAsync({
        values: {
          mySecretInt: secretValue1,
        },
        ttl: 3600,
        permissions,
      });
      setSecretValue1ID(result);
    } catch (error) {
      console.error("Error storing SecretInteger:", error);
    }
  };

  // Action to handle storing secret integer 2
  const handleStoreSecretInteger2 = async () => {
    try {
      const permissions = Permissions.create().allowCompute(
        client.vm.userId,
        programID as ProgramId
      );
      const result = await storeValue.mutateAsync({
        values: {
          mySecretInt: secretValue2,
        },
        ttl: 3600,
        permissions,
      });
      console.log("Stored SecretInteger2:", result);
      setSecretValue2ID(result);
    } catch (error) {
      console.error("Error storing SecretInteger2:", error);
    }
  };

  // Handle using the secret_addition Program
  const handleUseProgram = async () => {
    try {
      // Bindings
      const bindings = ProgramBindings.create(programID!);
      bindings.addInputParty(
        PARTY_NAME as PartyName,
        client.vm.partyId as PartyId
      );
      bindings.addOutputParty(
        PARTY_NAME as PartyName,
        client.vm.partyId as PartyId
      );

      const values = NadaValues.create()
        .insert(
          NamedValue.parse("my_int1"),
          NadaValue.createSecretInteger(secretValue1)
        )
        .insert(
          NamedValue.parse("my_int2"),
          NadaValue.createSecretInteger(secretValue2)
        );

      const res = await runProgram.mutateAsync({
        bindings: bindings,
        values,
        storeIds: [],
      });

      console.log(res, "computeID");

      setComputeID(res);
    } catch (error) {
      console.error("Error executing program:", error);
      throw error;
    }
  };

  // Fetch the new compute result
  useEffect(() => {
    if (fetchProgram.data) {
      // @ts-ignore
      setComputeResult(fetchProgram.data.my_output.toString());
    }
  }, [fetchProgram.data]);

  console.log(computeResult, "computeResult");

  return (
    <div className="flex flex-col justify-center min-h-screen p-8 bg-white text-black">
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

      {programID && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Program ID: {programID}</p>
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

        {secretValue1ID && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Secret Value 1 ID: {secretValue1ID}
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

        {secretValue2ID && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Secret Value 2 ID: {secretValue2ID}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Compute Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-left">Compute:</h3>
        <button
          onClick={() => handleUseProgram()}
          className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
        >
          Compute
        </button>
        {computeResult && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Compute Result: {computeResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
