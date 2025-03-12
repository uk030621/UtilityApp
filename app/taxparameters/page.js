// app/taxparameters/page.js
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function TaxParameters() {
  const [params, setParams] = useState([]);
  const [errors, setErrors] = useState({});
  const [fetched, setFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- Added for loading state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newParam, setNewParam] = useState({
    year: "",
    incomeTax: {
      personalAllowance: "",
      basicRate: "",
      higherRate: "",
      additionalRate: "",
      basicThreshold: "",
      higherThreshold: "",
      taperThreshold: "",
    },
    nationalInsurance: {
      primaryThreshold: "",
      upperEarningsLimit: "",
      primaryRate: "",
      upperRate: "",
      selfPrimaryRate: "",
      selfUpperRate: "",
    },
  });

  const unitMapping = {
    personalAllowance: "£",
    basicRate: "%",
    higherRate: "%",
    additionalRate: "%",
    basicThreshold: "£",
    higherThreshold: "£",
    taperThreshold: "£",
    primaryThreshold: "£",
    upperEarningsLimit: "£",
    primaryRate: "%",
    upperRate: "%",
    selfPrimaryRate: "%",
    selfUpperRate: "%",
  };

  useEffect(() => {
    if (!fetched) {
      fetch("/api/tax-parameters")
        .then((res) => res.json())
        .then((data) => {
          setParams(data);
          setFetched(true);
          setIsLoading(false); // <-- Stop loading once data is fetched
          if (data.length === 0) {
            autoPostDefaultParameters();
          }
        })
        .catch((err) => {
          console.error("Error loading parameters:", err);
          setIsLoading(false); // <-- Stop loading on error
        });
    }
  }, [fetched]);

  const autoPostDefaultParameters = async () => {
    const defaultParam = {
      year: new Date().getFullYear(),
      incomeTax: {
        personalAllowance: 12570,
        basicRate: 20,
        higherRate: 40,
        additionalRate: 45,
        basicThreshold: 50270,
        higherThreshold: 125140,
        taperThreshold: 100000,
      },
      nationalInsurance: {
        primaryThreshold: 12570,
        upperEarningsLimit: 50270,
        primaryRate: 8,
        upperRate: 2,
        selfPrimaryRate: 6,
        selfUpperRate: 2,
      },
    };
    try {
      const response = await fetch("/api/tax-parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultParam),
      });
      if (!response.ok) {
        throw new Error("Failed to auto-post default parameters");
      }
      const createdParam = await response.json();
      setParams([createdParam]);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleAddOrUpdate = async () => {
    const validateFields = () => {
      let validationErrors = {};
      for (const key in newParam.incomeTax) {
        if (!newParam.incomeTax[key]) {
          validationErrors[`incomeTax.${key}`] = `${key} is required`;
        }
      }
      for (const key in newParam.nationalInsurance) {
        if (!newParam.nationalInsurance[key]) {
          validationErrors[`nationalInsurance.${key}`] = `${key} is required`;
        }
      }
      if (!newParam.year) {
        validationErrors.year = "Year is required";
      }
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    };

    if (!validateFields()) {
      console.error("Validation failed");
      return;
    }

    const method = newParam._id ? "PUT" : "POST";
    const url = newParam._id
      ? `/api/tax-parameters/${newParam._id}`
      : "/api/tax-parameters";

    const payload = {
      year: +newParam.year,
      incomeTax: Object.fromEntries(
        Object.entries(newParam.incomeTax).map(([key, value]) => [
          key,
          +value || 0,
        ])
      ),
      nationalInsurance: Object.fromEntries(
        Object.entries(newParam.nationalInsurance).map(([key, value]) => [
          key,
          +value || 0,
        ])
      ),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${method}`);
      }
      const updatedParam = await response.json();
      setParams((prev) =>
        method === "PUT"
          ? prev.map((param) =>
              param._id === updatedParam._id ? updatedParam : param
            )
          : [...prev, updatedParam]
      );
      handleReload();
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/tax-parameters/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete parameter");
      }
      setParams((prev) => prev.filter((param) => param._id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleReload = () => {
    setNewParam({
      year: "",
      incomeTax: Object.fromEntries(
        Object.keys(newParam.incomeTax).map((key) => [key, ""])
      ),
      nationalInsurance: Object.fromEntries(
        Object.keys(newParam.nationalInsurance).map((key) => [key, ""])
      ),
    });
    setErrors({});
  };

  return (
    <div className="bg-black p-2 min-h-screen">
      {/* Dropdown Section */}
      <div className="bg-gray-100 p-4 mb-8 mt-2 rounded">
        <button
          className="bg-black text-white px-4 py-2 rounded-md w-full text-left flex justify-between items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {isDropdownOpen
            ? "Hide Tax & NI Form ▲"
            : "Show Add / Edit Tax & NI Form ▼"}
        </button>

        {isDropdownOpen && (
          <div className="mt-4">
            {/* Link to Tax Calculator */}
            <Link
              href="/calculator"
              className=" px-4 py-2 text-black rounded-md text-sm flex-1 text-center"
            >
              Go To Basic Tax Calculator ▶
            </Link>
            <h2 className="font-bold mb-4 mt-4">
              {newParam._id
                ? "Edit Tax & NI Parameters"
                : "Add New Tax & NI Parameters"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Year */}
              <div>
                <label className="block font-bold mb-1 text-sm">Tax Year</label>
                <input
                  className="border p-2 w-full text-base"
                  type="number"
                  placeholder="Year"
                  value={newParam.year}
                  onChange={(e) =>
                    setNewParam({ ...newParam, year: +e.target.value })
                  }
                />
              </div>

              {/* Income Tax Fields */}
              {Object.keys(newParam.incomeTax).map((key) => (
                <div key={key}>
                  <label className="block font-bold mb-1 text-sm">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
                  </label>
                  <input
                    className={`border p-2 w-full text-base ${
                      errors[`incomeTax.${key}`] ? "border-red-500" : ""
                    }`}
                    type="number"
                    placeholder={key
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                    value={newParam.incomeTax[key]}
                    onChange={(e) =>
                      setNewParam({
                        ...newParam,
                        incomeTax: {
                          ...newParam.incomeTax,
                          [key]: +e.target.value,
                        },
                      })
                    }
                  />
                  {errors[`incomeTax.${key}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`incomeTax.${key}`]}
                    </p>
                  )}
                </div>
              ))}

              {/* National Insurance Fields */}
              {Object.keys(newParam.nationalInsurance).map((key) => (
                <div key={key}>
                  <label className="block font-bold mb-1 text-sm">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
                  </label>
                  <input
                    className={`border p-2 w-full text-base ${
                      errors[`nationalInsurance.${key}`] ? "border-red-500" : ""
                    }`}
                    type="number"
                    placeholder={key
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                    value={newParam.nationalInsurance[key]}
                    onChange={(e) =>
                      setNewParam({
                        ...newParam,
                        nationalInsurance: {
                          ...newParam.nationalInsurance,
                          [key]: +e.target.value,
                        },
                      })
                    }
                  />
                  {errors[`nationalInsurance.${key}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`nationalInsurance.${key}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-center items-center mt-4">
              {/* Add/Update Button */}
              <button
                className="bg-slate-500 text-white px-4 py-2 rounded-md text-sm flex-1 text-center"
                onClick={handleAddOrUpdate}
              >
                {newParam._id ? "Update" : "Add"}
              </button>

              {/* Refresh/Reload Button */}
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm flex-1 text-center"
                onClick={handleReload}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      <Link
        href="/calculator"
        className="bg-black px-4 py-2 text-white rounded-md text-sm flex-1 text-center"
      >
        Go To Basic Tax Calculator ▶
      </Link>

      {/* Table Section */}
      <div className="overflow-x-auto max-h-[calc(100vh-200px)] mt-2 rounded-md">
        {/* Loading message */}
        {isLoading ? (
          <div className="text-left p-4 text-white bg-green-800 rounded-md">
            <p>Loading tax parameters... Please wait.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full border-collapse">
              <thead className="text-left text-sm sticky top-0 bg-white z-10">
                <tr>
                  <th className="border px-4 py-2 bg-gray-100">Tax Year</th>
                  <th className="border px-4 py-2 bg-gray-100">Income Tax</th>
                  <th className="border px-4 py-2 bg-gray-100">
                    National Insurance
                  </th>
                  <th className="border px-4 py-2 bg-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {params
                  .sort((a, b) => a.year - b.year)
                  .map((p) => (
                    <tr key={p._id} className="even:bg-gray-100 odd:bg-white">
                      <td className="border px-4 py-2">
                        {p.year} / {+p.year + 1}
                      </td>
                      <td className="border px-4 py-2">
                        <ul>
                          {Object.entries(p.incomeTax).map(([key, value]) => (
                            <li className="mb-3" key={key}>
                              <strong>
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (char) =>
                                    char.toUpperCase()
                                  )}
                                :
                              </strong>{" "}
                              {unitMapping[key] === "£"
                                ? `£${value}`
                                : unitMapping[key] === "%"
                                ? `${value}%`
                                : value}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="border px-4 py-2">
                        <ul>
                          {Object.entries(p.nationalInsurance).map(
                            ([key, value]) => (
                              <li className="mb-3" key={key}>
                                <strong>
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase()
                                    )}
                                  :
                                </strong>{" "}
                                {unitMapping[key] === "£"
                                  ? `£${value}`
                                  : unitMapping[key] === "%"
                                  ? `${value}%`
                                  : value}
                              </li>
                            )
                          )}
                        </ul>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="flex flex-col">
                          <button
                            className="text-left mb-10"
                            onClick={() => {
                              setNewParam(p);
                              setIsDropdownOpen(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="text-left"
                            onClick={() => handleDelete(p._id)}
                          >
                            🗑️ Trash
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
