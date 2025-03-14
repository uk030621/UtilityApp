// app/taxparameters/page.js
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function TaxParameters() {
  const [params, setParams] = useState([]);
  const [errors, setErrors] = useState({});
  const [fetched, setFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- Added for loading state
  const [isTaxDropdownOpen, setIsTaxDropdownOpen] = useState(false);
  const [isAnotherDropdownOpen, setIsAnotherDropdownOpen] = useState(false);
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
    <div className="bg-gradient-to-b from-slate-100 to-slate-500 p-2 min-h-screen">
      {/* Explanatory Dropdown */}
      <div className="mt-2">
        <button
          onClick={() => setIsTaxDropdownOpen(!isTaxDropdownOpen)}
          className=" bg-slate-900 hover:bg-slate-700 px-4 py-2 text-white rounded-md  mb-4 flex-1 text-center"
        >
          {isTaxDropdownOpen
            ? "Hide User Guide: Tax Rates & Allowances Page"
            : "User Guide: Tax Tax Rates & Allowances Page"}
        </button>

        {isTaxDropdownOpen && (
          <div className="mt-4 text-left text-sm bg-gray-50 border rounded-lg p-4">
            <h2 className=" text-lg font-semibold text-gray-800 mb-2">
              User Guide: Tax Rates & Allowances Page
            </h2>

            {/* Overview */}
            <h3 className="font-bold text-gray-800">Overview</h3>
            <p className="text-gray-700 mb-3">
              This page allows you to manage tax and National Insurance (NI)
              rates & allowances for calculating your basic tax and NI
              liabilities. You can add, edit, and delete tax years and related
              rates & allowances. These factors are then used in the Basic Tax
              Calculator to estimate tax and NI obligations for different
              employment statuses in the UK (excluding Scotland).
            </p>

            {/* Key Features */}
            <h3 className="font-bold text-gray-800">Key Features</h3>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
              <li>
                <strong>Default Tax & NI Rates & Allowances Table:</strong> The
                page displays a pre-set table containing all tax and NI rates &
                allowances required for calculations.
              </li>

              <li>
                <strong>Adding Extra Tax Years, Rates & Allowances:</strong>{" "}
                Users can add additional tax years along with custom tax and NI
                rates & allowances. - Click the{" "}
                <strong>`&quot;`Show Add / Edit Tax & NI Form`&quot;`</strong>{" "}
                dropdown. - A form will appear where users can enter all
                required rates & allowances. -{" "}
                <strong>All fields are mandatory</strong> before submission.
              </li>

              <li>
                <strong>
                  Editing & Deleting Tax Rates & Allowances Tables:
                </strong>{" "}
                Once added, tax years can be edited to update values. If a tax
                year is no longer needed, it can be deleted.
              </li>

              <li>
                <strong>Navigating to the Basic Tax Calculator:</strong> After
                setting up tax parameters, users can go to the Basic Tax
                Calculator to:
                <ul className="list-disc list-inside pl-4">
                  <li>
                    Select a tax year from the available tax and NI parameter
                    tables.
                  </li>
                  <li>Enter their annual gross income.</li>
                  <li>
                    Click <strong>`&quot;`Calculate`&quot;`</strong> to generate
                    tax and NI results.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Viewing Tax Results:</strong>- By default, tax results
                are displayed <strong>annually</strong>. - A{" "}
                <strong>checkbox</strong> is available to switch between annual
                and monthly views. - Results include tax and NI calculations
                for:
                <ul className="list-disc list-inside pl-4">
                  <li>Employed individuals</li>
                  <li>Self-employed individuals</li>
                  <li>Pensioners</li>
                </ul>
              </li>
            </ul>

            {/* HMRC Tax & NI Link */}
            <h3 className="mt-3 font-bold text-gray-800">
              Finding Up-to-Date HMRC Tax & NI Factors
            </h3>
            <p className="text-gray-700">
              For the latest tax and NI rates used in the calculations, visit
              the official HMRC website:
              <a
                href="https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                🔗 Check HMRC Tax & NI Rates
              </a>
            </p>
          </div>
        )}
      </div>
      {/* Dropdown Section */}
      <div className="mb-8">
        <button
          className="bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-md w-full text-left flex justify-between items-center"
          onClick={() => setIsAnotherDropdownOpen(!isAnotherDropdownOpen)}
        >
          {isAnotherDropdownOpen
            ? "Hide Add / Edit Tax & NI Form ▲"
            : "Show Add / Edit Tax & NI Form ▼"}
        </button>

        {isAnotherDropdownOpen && (
          <div className="mt-4">
            {/* Link to Tax Calculator */}
            {/*<Link
              href="/calculator"
              className=" px-4 py-2 text-black rounded-md text-sm flex-1 text-center"
            >
              Go To Basic Tax Calculator ▶
            </Link>*/}
            <h2 className="font-bold mb-4 mt-4">
              {newParam._id
                ? "Edit Tax & NI Rates & Allowances"
                : "Add New Tax & NI Rates & Allowances"}
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
                          [key]: e.target.value === "" ? "" : +e.target.value, // Keeps empty string as ""
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
                          [key]: e.target.value === "" ? "" : +e.target.value, // Keeps empty string
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
        className="bg-slate-900 hover:bg-slate-700 px-4 py-2 text-white rounded-md  flex-1 text-center"
      >
        Go To Tax & NI Calculator ▶
      </Link>

      {/* Table Section */}
      <div className="overflow-x-auto max-h-[calc(100vh-200px)] mt-4 rounded-md">
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
                              setIsAnotherDropdownOpen(true);
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
