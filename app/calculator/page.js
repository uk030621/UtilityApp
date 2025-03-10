"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Calculator() {
  const [year, setYear] = useState("");
  const [income, setIncome] = useState("");
  const [result, setResult] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [error, setError] = useState(""); // For validation errors
  const [isMonthly, setIsMonthly] = useState(false); // Toggle state for Annual/Monthly

  // Fetch available years from the backend
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch("/api/getYears");
        const data = await res.json();
        setAvailableYears(data);
      } catch (error) {
        console.error("Failed to fetch years:", error);
      }
    };
    fetchYears();
  }, []);

  const calculate = async () => {
    // Validation
    if (!year) {
      setError("Please select a year.");
      return;
    }
    if (!income || isNaN(income)) {
      setError("Please enter a valid numerical income.");
      return;
    }

    // Reset error message
    setError("");

    // Perform calculation
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, income }),
    });
    const data = await res.json();
    setResult(data);
  };

  const handleRefresh = () => {
    setYear("");
    setIncome("");
    setResult(null);
    setError(""); // Clear errors
    setIsMonthly("");
  };

  const formatValue = (value) => {
    return isMonthly ? (value / 12).toFixed(2) : value.toFixed(2);
  };

  return (
    <div className="pt-4 px-4 min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-300 ">
      {/* Header */}
      <div className="">
        <div className="flex justify-center"></div>
      </div>

      {/* Calculator Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-left">
          <Link
            className="bg-slate-900 rounded-md text-sm text-white py-2 px-2 hover:bg-slate-700 "
            href="/taxparameters"
          >
            ◀ Tax & NI Parameters
          </Link>
          <Link
            className="bg-slate-900 rounded-md ml-6 text-sm text-white py-2 px-2 hover:bg-slate-700 "
            href="/"
          >
            ◀ Menu
          </Link>
        </div>
        <h1 className="text-lg font-bold flex justify-center mt-4">
          Basic Tax & NI Calculator
        </h1>
        <p className="text-xs flex justify-center">
          Excludes Scotland & Special Allowances
        </p>
        {/*<div className="flex justify-center mt-2">
          <Link
            href="/taxparameters"
            className="mt-3 bg-slate-500 px-4 py-2 mb-5 text-white rounded-md flex items-center justify-center gap-2 w-fit"
          >
            <span className="text-xs">
              <span className="flex justify-center">Add or Update</span>
              Tax & NI Parameters
            </span>
          </Link>
        </div>*/}

        {/* Year Dropdown and Income Input */}
        <div className="flex flex-wrap gap-2 mb-4 mt-4">
          <select
            className="flex-1 border p-2 pr-6 rounded-md appearance-none"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <input
            className="flex-1 border p-2 rounded-md"
            placeholder="Annual Income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Toggle and Buttons */}
        <div className="flex items-center gap-4 mb-4">
          {/*<label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isMonthly}
              onChange={() => setIsMonthly(!isMonthly)}
              className="form-checkbox text-blue-500"
            />
            Show Monthly Data
          </label>*/}

          <div className="flex gap-2 w-full">
            <button
              className={`px-4 py-2 rounded-md w-full md:w-auto ${
                year && income && !isNaN(income)
                  ? "bg-slate-500 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={calculate}
              disabled={!year || !income || isNaN(income)} // Disable if invalid
            >
              Calculate
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md w-full md:w-auto"
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isMonthly}
            onChange={() => setIsMonthly(!isMonthly)}
            className="form-checkbox text-blue-500"
          />
          Display Monthly
        </label>

        {/* Results Section */}
        {result && (
          <div className="grid gap-4 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Net Income Box */}
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow">
              <p className="font-bold text-slate-700">
                Net Income per {isMonthly ? "month" : "year"}
              </p>
              <p>
                Employed: £
                {formatValue(
                  result.income - result.incomeTax - result.nationalInsurance
                )}
              </p>
              <p>
                Self-Employed: £
                {formatValue(
                  result.income - result.incomeTax - result.senationalInsurance
                )}
              </p>
              <p>Pensioner: £{formatValue(result.income - result.incomeTax)}</p>
            </div>

            {/* Tax Box */}
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow">
              <p className="font-bold text-slate-700">
                {isMonthly ? "Monthly" : "Annual"} Income Tax
              </p>
              <p>@ 20% = £{formatValue(result.tax20)}</p>
              <p>@ 40% = £{formatValue(result.tax40)}</p>
              <p>@ 45% = £{formatValue(result.tax45)}</p>
              <p className="mt-1">Total = £{formatValue(result.incomeTax)}</p>
            </div>

            {/* National Insurance Box */}
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow">
              <p className="font-bold text-slate-700">
                {isMonthly ? "Monthly" : "Annual"} National Insurance
              </p>
              <p>Employed: £{formatValue(result.nationalInsurance)}</p>
              <p>Self Employed: £{formatValue(result.senationalInsurance)}</p>
              <p>Pensioner: £0</p>
            </div>

            {/* Deductions Box */}
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow">
              <p className="font-bold text-slate-700">
                {isMonthly ? "Monthly" : "Annual"} Deductions
              </p>
              <p>
                Employed: £
                {formatValue(result.incomeTax + result.nationalInsurance)}
              </p>
              <p>
                Self-Employed: £
                {formatValue(result.incomeTax + result.senationalInsurance)}
              </p>
              <p>Pensioner: £{formatValue(result.incomeTax)}</p>
            </div>

            {/* Effective Tax Rate Box */}
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow">
              <p className="font-bold text-slate-700">Effective Tax Rate</p>
              <p>
                Employed:{" "}
                {(
                  ((result.incomeTax + result.nationalInsurance) / income) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p>
                Self-Employed:{" "}
                {(
                  ((result.incomeTax + result.senationalInsurance) / income) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p>
                Pensioner: {((result.incomeTax / income) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
