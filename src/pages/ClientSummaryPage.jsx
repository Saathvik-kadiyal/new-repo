import { useEffect, useState } from "react";
const backendApi = import.meta.env.VITE_BACKEND_API;


const ClientSummaryPage = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${backendApi}/summary/client-shift-summary`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch summary data");
        }

        const apiData = await response.json();
        const data = apiData.summary

        if (!Array.isArray(data) || data.length === 0) {
          setSummaryData([]);
        } else {
          setSummaryData(data);
        }
      } catch (err) {
        setError("Unable to fetch summary data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const headers = summaryData.length > 0 ? Object.keys(summaryData[0]) : [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Client Summary</h2>

      {loading ? (
        <p>Loading summary data...</p>
      ) : (
        <table className="border-collapse border border-gray-300 w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100">
              {headers.length > 0 ? (
                headers.map((key) => (
                  <th
                    key={key}
                    className="border px-2 py-1 capitalize text-left"
                  >
                    {key.replace(/_/g, " ")}
                  </th>
                ))
              ) : (
                <th className="border px-2 py-1 text-center">No Headers</th>
              )}
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td
                  colSpan={headers.length || 1}
                  className="text-center text-red-500 py-6 font-medium"
                >
                  {error}
                </td>
              </tr>
            ) : summaryData.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length || 1}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No summary data available.
                </td>
              </tr>
            ) : (
              summaryData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {headers.map((key) => (
                    <td key={key} className="border px-2 py-1">
                      {item[key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientSummaryPage;
