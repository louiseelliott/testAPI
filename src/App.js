import "./App.scss";

import {
  Button,
  Dropdown,
  FileUploader,
  Form,
  ListItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextArea,
  TextInput,
  Toggle,
  UnorderedList,
} from "@carbon/react";
import React, { useEffect, useState } from "react";

import Add from "@carbon/icons-react/es/Add";

const items = [
  {
    id: "get",
    label: "GET",
    text: "GET",
  },
  {
    id: "post",
    label: "POST",
    text: "POST",
  },
  {
    id: "put",
    label: "PUT",
    text: "PUT",
  },
  {
    id: "delete",
    label: "DELETE",
    text: "DELETE",
  },
];

function App() {
  const [result, setResult] = useState(null);
  const [curl, setCurl] = useState(null);
  const [curlCommand, setCurlCommand] = useState(null);
  const [apiCall, setApiCall] = useState(null);
  const [method, setMethod] = useState(null);
  const [headers, setHeaders] = useState({});
  const [headerKey, setHeaderKey] = useState(null);
  const [headerValue, setHeaderValue] = useState(null);
  const [url, setUrl] = useState(null);
  const [body, setBody] = useState(null);
  const [fileBody, setFileBody] = useState(null);
  const [loadDataFromFile, setLoadDataFromFile] = useState(true);
  const [formUpdated, setFormUpdated] = useState(false);
  const [secure, setSecure] = useState(false);

  const clearGetOutput = (e) => {
    e.preventDefault();
    setResult(null);
  };

  async function callAPI(e) {
    setFormUpdated(true);
    e.preventDefault();
    
    try {
      const res = await fetch(url, apiCall);

      if (!res.ok) {
        const message = `An error has occured: ${res.status} - ${res.statusText}`;
        throw new Error(message);
      }
      const data = await res.text();
      const result = {
        status: res.status + "-" + res.statusText,
        data: data,
      };

      setResult(result);
    } catch (err) {
      setResult(err.message);
    }
  }

  function cleanString(str) {
    let cleanStr1 =
      str.startsWith("'") || str.startsWith('"')
        ? str.slice(1, str.length)
        : str;
    let cleanStr =
      cleanStr1.endsWith("'") || cleanStr1.endsWith('"')
        ? cleanStr1.slice(0, cleanStr1.length - 1)
        : cleanStr1;
    return cleanStr;
  }

  function addHeader() {
    let updatedHeader = Object.keys(headers).length > 0 ? headers : {};
    updatedHeader[cleanString(headerKey)] = cleanString(headerValue);
    setHeaders(updatedHeader);
    setHeaderKey(null);
    setHeaderValue(null);
  }

  function loadCurl() {
    let curlCmds = curlCommand.split("--data ");
    let curlData = curlCmds[1];
    let curl = curlCmds[0].split(" ");
    let kvPairs = {};
    if (curl.length > 0)
      curl.forEach((c, index) => {
        if (!c.startsWith("@"))
          switch (c.toLowerCase()) {
            case "-i":
              setUrl(cleanString(curl[index + 1]));
              break;
            case "--request":
            case "-x":
              let m = curl[index + 1];
              if (!url && curl[index + 2].toLowerCase() === "-k") {
                setSecure(true);
                setUrl(curl[index + 3]);
              } else {
                setUrl(curl[index + 2]);
              }
              setMethod(getMethodObj(m));
              break;
            case "-h":
            case "--header":
              let key = curl[index + 1].slice(1, curl[index + 1].length - 1);
              let val = curl[index + 2].slice(0, curl[index + 2].length - 1);
              kvPairs[key] = val;
              break;
            case "-k":
              setSecure(true);
              break;
            case "curl":
              break;
            default:
              break;
          }
      });

    setHeaders(kvPairs);
    if (!curlData.startsWith("@")) {
      setFileBody(null);
      setLoadDataFromFile(false);
      setBody(cleanString(curlData));
    }
  }

  useEffect(() => {
    let m = method ? method?.text : " [HTTP_METHOD]";
    let curlH = "";
    if (Object.keys(headers).length > 0) {
      Object.entries(headers).map(
        (header) =>
          (curlH += " --header '" + header[0] + ": " + header[1] + "'")
      );
    }
    let b =
      body && !loadDataFromFile
        ? " --data '" + body + "'"
        : body && fileBody?.name
        ? " --data @" + fileBody.name
        : "";
    let u = url ? " -i '" + url + "'" : " [URL]";
    let k = secure ? " -k" : "";
    let curl = "curl -X " + m + k + u + curlH + b;
    setCurl(curl);

    let api = {
      method: m,
    };
    if (headers && Object.keys(headers).length > 0) {
      api["headers"] = headers;
    }
    if (body) {
      api["body"] = body;
    }
    setApiCall(api);
  }, [
    method,
    url,
    body,
    headers,
    headerKey,
    headerValue,
    secure,
    fileBody,
    loadDataFromFile,
  ]);

  function getMethodObj(method) {
    return method
      ? {
          id: method.toLowerCase(),
          label: method.toUpperCase(),
          text: method.toUpperCase(),
        }
      : "";
  }

  return (
    <Form>
      <div className="display-flex">
        <div className="container my-3">
          <div className="m-3">
            <h3>REST API Client</h3>

            <div className="card mt-3">
              <div className="display-flex card-header">
                <TextArea
                  className="w-70"
                  id="curl"
                  type="text"
                  labelText="[Optional] Load from curl..."
                  placeholder="curl command"
                  onChange={(e) => {
                    setCurlCommand(e.target.value);
                  }}
                />
                <Button
                  className="btn btn-sm btn-warning ml-2 mt-3"
                  onClick={loadCurl}
                  renderIcon={Add}
                  iconDescription="Parse curl command"
                  hasIconOnly
                />
              </div>
              <div className="card-body mt-3">
                <div className="input-group input-group-sm">
                  <div className="m-3 w-20">
                    <Dropdown
                      titleText="Method*"
                      ariaLabel="Method"
                      label="Method"
                      placeholder="Select API..."
                      id="method"
                      items={items}
                      selectedItem={method}
                      itemToString={(item) => (item ? item.text : "")}
                      onChange={(e) => {
                        setMethod(getMethodObj(e.selectedItem.id));
                      }}
                      invalidText="Method Required"
                      invalid={formUpdated && !method}
                    />
                  </div>
                  <div className="m-3 w-65">
                    <TextInput
                      id="url"
                      type="text"
                      labelText="URL*"
                      placeholder="URL"
                      onChange={(e) => {
                        setUrl(e.target.value);
                      }}
                      invalidText="URL Required"
                      invalid={formUpdated && !url}
                      value={url ? url : ""}
                    />
                  </div>
                  <div className="m-3 w-100">
                    <Tabs>
                      <TabList aria-label="List of tabs">
                        <Tab>Headers</Tab>
                        <Tab
                          disabled={!method || (method && method?.id === "get")}
                        >
                          Body
                        </Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <UnorderedList className="m-3">
                            {Object.entries(headers).length > 0
                              ? Object.entries(headers).map((value, key) => (
                                  <ListItem
                                    className="some-class"
                                    type="blue"
                                    size="sm"
                                    disabled
                                    key={"header" + key}
                                    id={"header" + key}
                                  >
                                    {value[0]}: {value[1]}
                                  </ListItem>
                                ))
                              : ""}
                          </UnorderedList>
                          <div className="display-flex">
                            <div className="mr-3">
                              <TextInput
                                id="header_key"
                                type="text"
                                placeholder="Key"
                                labelText=""
                                onChange={(e) => setHeaderKey(e.target.value)}
                                value={headerKey ? headerKey : ""}
                              />
                            </div>
                            <TextInput
                              id="header_value"
                              type="text"
                              placeholder="Value"
                              labelText=""
                              onChange={(e) => setHeaderValue(e.target.value)}
                              value={headerValue ? headerValue : ""}
                            />
                            <Button
                              className="btn btn-sm btn-warning ml-2"
                              onClick={addHeader}
                              renderIcon={Add}
                              iconDescription="Add Header"
                              hasIconOnly
                              disabled={!headerKey || !headerValue}
                            />
                          </div>
                          <Toggle
                            className="mt-3"
                            labelText="Secure"
                            labelA="On"
                            labelB="Off"
                            toggled={secure}
                            id="secure"
                            onToggle={(e) => setSecure(e)}
                          />
                        </TabPanel>
                        {method && method?.id !== "get" ? (
                          <TabPanel>
                            <TextArea
                              cols={50}
                              rows={4}
                              id="body"
                              labelText="Enter data below or load data from file."
                              onChange={(e) => {
                                setBody(e.target.value);
                                setLoadDataFromFile(
                                  e.target.value.length === 0
                                );
                              }}
                              disabled={fileBody}
                              value={body ? body : ""}
                            />
                            <FileUploader
                              className="mt-3"
                              buttonLabel="Add file"
                              filenameStatus="edit"
                              iconDescription="Delete file"
                              labelDescription="Max file size is 500mb. "
                              labelTitle="Upload file"
                              multiple
                              name=""
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  const reader = new FileReader();
                                  reader.readAsText(e.target.files[0], "UTF-8");
                                  setFileBody(e.target.files[0]);
                                  reader.onloadend = function () {
                                    setBody(JSON.parse(reader.result));
                                  };
                                }
                              }}
                              onDelete={(e) => {
                                setFileBody(null);
                                setBody(null);
                              }}
                              role="button"
                              size="md"
                              id="fileInput"
                              disabled={!loadDataFromFile}
                            />
                          </TabPanel>
                        ) : (
                          ""
                        )}
                      </TabPanels>
                    </Tabs>
                  </div>
                </div>
                <div className="input-group-append m-3">
                  <Button
                    type="submit"
                    className="btn btn-sm btn-primary"
                    onClick={callAPI}
                  >
                    Send
                  </Button>
                </div>
              </div>
              <div className="card-header">
                <TextArea
                  cols={50}
                  rows={4}
                  id="body"
                  labelText="Generated curl command"
                  value={curl ? curl : ""}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="container my-3">
          <div className="m-3">
            <div className="card m-t3">
              <div className="card-header">Response</div>
              {result && (
                <div>
                  <div className="alert alert-secondary mt-2" role="alert">
                    Status: {result.status}
                    <pre className="mt-3">{result.data}</pre>
                  </div>

                  <Button
                    className="btn btn-sm btn-warning ml-2"
                    onClick={clearGetOutput}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default App;
