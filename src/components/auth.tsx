"use client";
import { type FC, useState } from "react";
import { createSignerFromKey } from "@nillion/client-payments";
import { useNillionAuth, UserCredentials } from "@nillion/client-react-hooks";

export const Auth: FC = () => {
  const { login, logout } = useNillionAuth();
  const [seed, setUserSeed] = useState("example-secret-seed");
  const [secretKey, setSecretKey] = useState(
    "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5"
  );

  const handleLogin = async () => {
    try {
      const credentials: UserCredentials = {
        userSeed: seed,
        signer: () => createSignerFromKey(secretKey)
      };
      await login(credentials);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-b-lg shadow-md">
      <h5 className="text-2xl font-bold mb-4 text-gray-800">Login</h5>
      <p className="mb-4 text-gray-600">
        You must login before using the client.
      </p>
      <input
        required
        name="seed"
        placeholder="User seed"
        autoFocus
        value={seed}
        onChange={(e) => {
          setUserSeed(e.target.value);
        }}
        className="w-full px-3 py-2 mb-4 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
      />
      <input
        required
        name="secretKey"
        type="password"
        placeholder="Wallet secret key"
        value={secretKey}
        onChange={(e) => {
          setSecretKey(e.target.value);
        }}
        className="w-full px-3 py-2 mb-6 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
      />
      <div className="flex justify-between">
        <button
          onClick={handleLogin}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Log in
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
