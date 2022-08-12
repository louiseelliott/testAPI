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
  const [getResult, setGetResult] = useState(null);
  const [curl, setCurl] = useState(null);
  const [method, setMethod] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [headerKey, setHeaderKey] = useState(null);
  const [headerValue, setHeaderValue] = useState(null);
  const [url, setUrl] = useState(null);
  const [body, setBody] = useState(null);
  const [fileBody, setFileBody] = useState(null);
  const [loadDataFromFile, setLoadDataFromFile] = useState(true);
  const [formUpdated, setFormUpdated] = useState(false);
  const [secure, setSecure] = useState(false);

  const fortmatResponse = (res) => {
    return JSON.stringify(res, null, 2);
  };

  const clearGetOutput = (e) => {
    e.preventDefault();
    setGetResult(null);
  };

  function callAPI(e) {
    setFormUpdated(true);
    e.preventDefault();
    if (method) {
      switch (method.toLowerCase()) {
        case "get":
          callGET();
          break;
        case "post":
          callGET();
          break;
        default:
          break;
      }
    }
  }

  async function callGET() {
    try {
      const res =
        method.toLowerCase() === "get"
          ? await fetch(url)
          : await fetch(url, {
              method: method,
              headers: headers,
              body: JSON.stringify(body),
            });

      if (!res.ok) {
        const message = `An error has occured: ${res.status} - ${res.statusText}`;
        throw new Error(message);
      }

      const data = await res.json();

      const result = {
        status: res.status + "-" + res.statusText,
        headers: {
          "Content-Type": res.headers.get("Content-Type"),
          "Content-Length": res.headers.get("Content-Length"),
        },
        length: res.headers.get("Content-Length"),
        data: data,
      };

      setGetResult(fortmatResponse(result));
    } catch (err) {
      setGetResult(err.message);
    }
  }

  function addHeader() {
    let updatedHeader = headers.length > 0 ? headers : [];
    let cleanKey =
      headerKey.startsWith("'") || headerKey.startsWith('"')
        ? headerKey.slice(1, headerKey.length - 1)
        : headerKey;
    let cleanValue =
      headerValue.startsWith("'") || headerValue.startsWith('"')
        ? headerValue.slice(1, headerValue.length - 1)
        : headerValue;
    updatedHeader.push(cleanKey + ": " + cleanValue);
    setHeaders(updatedHeader);
    setHeaderKey(null);
    setHeaderValue(null);
  }

  useEffect(() => {
    let m = method ? method.toUpperCase() : " [HTTP_METHOD]";
    let buildH = "";
    if (headers.length > 0)
      headers.map((header) => (buildH += " --header '" + header + "' "));

    let b = body ? " --data '" + body + "'" : "";
    let u = url ? url : " [URL]";
    let k = secure ? "-k " : "";
    let curl = "curl -X " + k + m + buildH + b + " " + u;
    setCurl(curl);
  }, [method, url, body, headers, headerKey, headerValue, secure]);

  return (
    <Form>
      <div className="display-flex">
        <div className="container my-3">
          <div className="m-3">
            <h3>REST API Client</h3>

            <div className="card mt-3">
              <div className="card-header">{curl}</div>
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
                      itemToString={(item) => (item ? item.text : "")}
                      onChange={(e) => {
                        setMethod(e.selectedItem.id);
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
                    />
                  </div>
                  <div className="m-3 w-100">
                    <Tabs>
                      <TabList aria-label="List of tabs">
                        <Tab>Headers</Tab>
                        <Tab
                          disabled={
                            !method ||
                            (method && method.toLowerCase() === "get")
                          }
                        >
                          Body
                        </Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <UnorderedList className="m-3">
                            {headers.length > 0
                              ? headers.map((header, index) => (
                                  <ListItem
                                    className="some-class"
                                    type="blue"
                                    size="sm"
                                    disabled
                                    key={"header" + index}
                                    id={"header" + index}
                                  >
                                    {header}
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
                        {method && method.toLowerCase() !== "get" ? (
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
                                  reader.onloadend = function () {
                                    setFileBody(JSON.parse(reader.result));
                                  };
                                }
                              }}
                              onDelete={(e) => {
                                setFileBody(null);
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
            </div>
          </div>
        </div>
        <div className="container my-3">
          <div className="m-3">
            <div className="card m-t3">
              <div className="card-header">Response</div>
              {getResult && (
                <div>
                  <div className="alert alert-secondary mt-2" role="alert">
                    <pre>{getResult}</pre>
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
