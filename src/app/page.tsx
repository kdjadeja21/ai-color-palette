"use client";

import React, { useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import ApiButton from "./components/ApiButton";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [companyName, setCompanyName] = useState("Twitter");
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState([
    "#1DA1F2",
    "#14171A",
    "#657786",
    "#AAB8C2",
    "#E1E8ED",
    "#F5F8FA",
  ]); // Twitter default

  const callChatGPT = async () => {
    setLoading(true);
    const config = new Configuration({
      apiKey: apiKey,
    });
    const openapi = new OpenAIApi(config);
    try {
      const response = await openapi.createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "user",
            content: `What are the hex color codes for ${companyName}'s logo in just a single-line JavaScript array with no other explanations or variable name?`,
          },
        ],
      });

      const unparsedColors =
        response.data.choices[0].message?.content?.replaceAll(`'`, `"`);
      const parsedColors = JSON.parse(unparsedColors ?? "");
      // remove duplicates
      setColors(Array.from(new Set(parsedColors)));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Unable to parse that company response");
    }
  };

  const copyToClipboard = (color: string): void => {
    navigator.clipboard.writeText(color).then(
      function () {
        enqueueSnackbar("Copying to clipboard was successful!");
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };

  return (
    <div>
      <SnackbarProvider
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
      />
      <ApiButton
        apiKey={apiKey}
        onApiKeyUpdate={(key: string) => setApiKey(key)}
      />
      <div className="fixed top-20 lg:top-10 left-1/2 -translate-x-1/2">
        <div className="h-12 w-full rounded-md bg-gradient-to-r from-[#C6FFDD] via-[#FBD786] to-[#f7797d] p-1">
          <div className="relative">
            <input
              type="text"
              onChange={(e) => setCompanyName(e.target.value)}
              value={companyName}
              className="py-2 px-4 pr-[4.5rem] w-80 lg:w-96 focus:outline-none rounded"
              placeholder="Company name (e.g. Twitter)"
              onKeyDown={(e) => (e.key === "Enter" ? callChatGPT() : null)}
            />
            <kbd
              className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg"
              onClick={() => callChatGPT()}
            >
              Enter
            </kbd>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Loading...
        </div>
      ) : (
        <div
          className="grid justify-between w-screen h-screen"
          style={{
            gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))`,
          }}
        >
          {colors.map((color) => (
            <div
              className="h-screen flex justify-center items-center"
              style={{ backgroundColor: color }}
              key={color}
            >
              <div
                className="flex items-center px-4 py-2 bg-slate-800 bg-opacity-50 cursor-pointer rotate-90 md:rotate-0"
                onClick={() => copyToClipboard(color)}
              >
                {/* <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
                <svg
                  className="mr-3 fill-gray-100"
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 384 512"
                >
                  <path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM112 192H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                </svg>
                <span className="text-white">{color}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
